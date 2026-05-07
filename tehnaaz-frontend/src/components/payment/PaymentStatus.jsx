const PaymentStatus = ({ status, error, paymentResult, course, onRetry, onClose }) => {
    if (status === 'processing') {
      return (
        <div className="text-center py-5">
          <div className="w-12 h-12 border-[3px] border-gray-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 m-0 mb-2">Processing Payment</h3>
          <p className="text-sm text-gray-500 m-0">Please wait while we process your payment. Do not close this window.</p>
        </div>
      );
    }
  
    if (status === 'success') {
      return (
        <div className="text-center py-5">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 m-0 mb-2">Payment Successful!</h3>
          <p className="text-sm text-gray-500 m-0 mb-6">You have been enrolled in the course successfully.</p>
          {paymentResult?.transactionId && <div className="text-[13px] text-gray-500 p-3 bg-gray-50 rounded-lg mb-6">Transaction ID: {paymentResult.transactionId}</div>}
          <div className="flex gap-3 justify-center">
            <button onClick={() => window.location.href = `/courses/${course._id}/learn`} className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white border-none rounded-xl text-sm font-medium cursor-pointer transition-colors">Start Learning</button>
            <button onClick={onClose} className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors">Back to Course</button>
          </div>
        </div>
      );
    }
  
    if (status === 'error') {
      return (
        <div className="text-center py-5">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 m-0 mb-2">Payment Failed</h3>
          <p className="text-sm text-gray-500 m-0 mb-6">{error || 'Something went wrong. Please try again.'}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={onRetry} className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white border-none rounded-xl text-sm font-medium cursor-pointer transition-colors">Try Again</button>
            <button onClick={onClose} className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors">Cancel</button>
          </div>
        </div>
      );
    }
    return null;
  };
  
  export default PaymentStatus;