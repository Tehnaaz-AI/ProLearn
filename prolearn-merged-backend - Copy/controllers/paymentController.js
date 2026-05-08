const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/order
exports.createOrder = async (req, res) => {
  try {
    //console.log(req.body);
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    //console.log(course);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.isFree) return res.status(400).json({ message: 'Course is free, enroll directly' });
    if (!course.isPublished) return res.status(403).json({ message: "Course is not published yet" });

    const alreadyEnrolled = await Enrollment.findOne({ student: req.user.id, course: courseId });
    if (alreadyEnrolled) return res.status(400).json({ message: 'Already enrolled' });

    // Amount in paise (₹1 = 100 paise)
    const amountInPaise = course.price * 100;
    
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${courseId.toString().slice(-10)}_${req.user.id.toString().slice(-10)}`,
    });


    // Save payment record with status 'created'
    await Payment.create({
      user: req.user.id,
      course: courseId,
      razorpayOrderId: order.id,
      amount: amountInPaise,
    });

    res.json({
      orderId: order.id,
      amount: amountInPaise,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    //console.error('Payment Order Error:', err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

// POST /api/payment/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, courseId } = req.body;

    // ── Verify signature (IMPORTANT: never skip this) ──
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSig !== razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Update payment record
    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      { razorpayPaymentId, razorpaySignature, status: 'paid' }
    );

    // Create enrollment (only after verified payment)
    const existing = await Enrollment.findOne({ student: req.user.id, course: courseId });
    if (!existing) {
      await Enrollment.create({ student: req.user.id, course: courseId, paymentId: razorpayPaymentId });

      // Also update User model (for progress tracking compatibility)
      await User.findByIdAndUpdate(req.user.id, {
        $addToSet: {
          enrolledCourses: {
            course: courseId,
            progressPercent: 0,
            completedLectures: []
          }
        }
      });
    }

    res.json({ message: 'Payment verified. Enrolled successfully!' });
  } catch (err) {
    console.error('Payment Verify Error:', err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

// GET /api/payment/history
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate('course', 'title price')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    console.error('Payment History Error:', err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};