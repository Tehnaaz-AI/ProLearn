import { useState } from 'react';
import { formatCurrency, getDiscountPercentage } from '../../utils/helpers';
import PaymentModal from './PaymentModal';

const PaymentButton = ({ course, onEnrollmentSuccess }) => {
  const [showPayment, setShowPayment] = useState(false);
  const { _id, title, price, originalPrice, isPaid, thumbnail } = course || {};
  if (!isPaid || price === 0) return null;
  const discount = getDiscountPercentage(originalPrice, price);

  return (
    <>
      <button onClick={() => setShowPayment(true)} className="w-full flex flex-col items-center gap-1 py-4 px-6 bg-indigo-500 hover:bg-indigo-600 text-white border-none rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/40">
        <span className="text-2xl font-bold">{formatCurrency(price)}</span>
        {discount > 0 && <span className="text-sm line-through opacity-70">{formatCurrency(originalPrice)}</span>}
        <span className="text-sm font-medium opacity-90">Buy Now</span>
      </button>
      {showPayment && <PaymentModal isOpen={showPayment} onClose={() => setShowPayment(false)} course={{ _id, title, price, originalPrice, isPaid, thumbnail }} onPaymentSuccess={onEnrollmentSuccess} />}
    </>
  );
};

export default PaymentButton;