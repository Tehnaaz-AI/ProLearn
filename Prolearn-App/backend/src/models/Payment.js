import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    amount: { type: Number, required: true },
    adminAmount: { type: Number, required: true },
    instructorAmount: { type: Number, required: true },
    status: { type: String, enum: ["created", "paid"], default: "created" },
    providerOrderId: String,
    providerPaymentId: String,
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
