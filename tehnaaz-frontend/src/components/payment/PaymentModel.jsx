import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import paymentService from '../../services/paymentService';
import { formatCurrency, getDiscountPercentage } from '../../utils/helpers';
import PaymentStatus from './PaymentStatus';

const PaymentModal = ({ isOpen, onClose, course, onPaymentSuccess }) => {
  const { user } = useAuth();
  const [step, setStep] = useState('preview');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentResult, setPaymentResult] = useState(null);

  if (!isOpen) return null;
  const discount = getDiscountPercentage(course.originalPrice, course.price);
  const finalPrice = couponApplied ? couponApplied.discountedPrice : course.price;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try { setCouponError(''); setLoading(true); const res = await paymentService.applyCoupon(course._id, couponCode.trim()); setCouponApplied(res); }
    catch (err) { setCouponError(err.message); } finally { setLoading(false); }
  };

  const handlePayment = async () => {
    try {
      setStep('processing'); setError(''); setLoading(true);
      const order = await paymentService.createPaymentOrder(course._id);
      const paymentResponse = await new Promise((resolve) => setTimeout(() => resolve({ orderId: order.orderId, paymentId: `pay_${Date.now()}`, signature: `sig_${Math.random().toString(36).substring(7)}`, amount: finalPrice * 100 }), 2000));
      const result = await paymentService.verifyPayment(paymentResponse);
      setPaymentResult(result); setStep('success'); onPaymentSuccess?.(result);
    } catch (err) { setError(err.message); setStep('error'); } finally { setLoading(false); }
  };

  const handleClose = () => { if (step !== 'processing') onClose(); };

  return (
    <div onClick={handleClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-5 animate-[fadeIn_0.2s_ease]">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto relative animate-[slideUp_0.3s_ease] shadow-2xl">
        {step !== 'processing' && (
          <button onClick={handleClose} className="absolute top-4 right-4 p-2 border-none bg-gray-100 rounded-lg cursor-pointer text-gray-600 flex items-center hover:bg-gray-200 transition-colors" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        )}

        {step === 'preview' && (
          <>
            <h2 className="text-2xl font-semibold text-gray-900 m-0 mb-6">Complete Your Purchase</h2>
            <div className="flex gap-4 p-4 bg-gray-50 rounded-xl mb-6">
              {course.thumbnail && <img src={course.thumbnail} alt={course.title} className="w-24 h-16 object-cover rounded-lg" />}
              <div className="flex-1">
                <h4 className="text-sm font-semibold m-0 mb-2 line-clamp-2 leading-snug">{course.title}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(finalPrice)}</span>
                  {course.originalPrice > course.price && <span className="text-[13px] text-gray-500 line-through">{formatCurrency(course.originalPrice)}</span>}
                  {discount > 0 && <span className="text-xs text-green-500 font-semibold">{discount}% off</span>}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-600 m-0 mb-2">Have a coupon code?</h5>
              <div className="flex gap-2">
                <input type="text" placeholder="Enter coupon code" value={couponCode} onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); if(couponApplied) setCouponApplied(null); }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" disabled={loading} />
                <button onClick={handleApplyCoupon} disabled={!couponCode.trim() || loading} className="px-4 py-2.5 bg-gray-100 border-none rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">{loading ? 'Applying...' : 'Apply'}</button>
              </div>
              {couponError && <p className="text-[13px] text-red-500 mt-2 mb-0">{couponError}</p>}
              {couponApplied && <p className="text-[13px] text-green-500 mt-2 mb-0">Coupon applied! You save {formatCurrency(couponApplied.discount)}</p>}
            </div>

            <div className="bg-gray-50 rounded-xl p-5 mb-6">
              <h5 className="text-sm font-medium text-gray-600 m-0 mb-4">Order Summary</h5>
              <div className="flex justify-between mb-2 text-sm text-gray-600"><span>Course Price</span><span>{formatCurrency(course.originalPrice)}</span></div>
              {discount > 0 && <div className="flex justify-between mb-2 text-sm text-green-500"><span>Discount</span><span>-{formatCurrency(course.originalPrice - course.price)}</span></div>}
              {couponApplied && <div className="flex justify-between mb-2 text-sm text-green-500"><span>Coupon ({couponApplied.code})</span><span>-{formatCurrency(couponApplied.discount)}</span></div>}
              <div className="h-px bg-gray-200 my-3" />
              <div className="flex justify-between text-base font-semibold text-gray-900"><span>Total</span><span>{formatCurrency(finalPrice)}</span></div>
            </div>

            <button onClick={handlePayment} disabled={loading} className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 text-white border-none rounded-xl text-base font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/40 disabled:opacity-70 disabled:cursor-not-allowed">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
              Pay {formatCurrency(finalPrice)}
            </button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mt-4 mb-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              Secure payment powered by SSL encryption
            </p>
          </>
        )}

        {(step === 'processing' || step === 'success' || step === 'error') && (
          <PaymentStatus status={step} error={error} paymentResult={paymentResult} course={course} onRetry={() => { setError(''); setStep('preview'); }} onClose={handleClose} />
        )}
      </div>
      
      {/* Inline keyframes for modal animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default PaymentModal;