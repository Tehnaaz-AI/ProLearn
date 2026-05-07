import { useState, useEffect } from 'react';
import paymentService from '../../services/paymentService';
import Loader from '../../components/common/Loader';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const data = await paymentService.getPaymentHistory({ page, limit: 10 });
        setPayments(data.payments || data);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [page]);

  const getStatusBadgeStyles = (status) => {
    const styles = {
      completed: 'bg-green-50 text-green-600',
      pending: 'bg-yellow-50 text-yellow-600',
      failed: 'bg-red-50 text-red-600',
      refunded: 'bg-gray-100 text-gray-600',
    };
    return styles[status] || styles.pending;
  };

  const handleDownloadInvoice = async (paymentId) => {
    try {
      const blob = await paymentService.getInvoice(paymentId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Failed to download invoice:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 m-0 mb-1">Payment History</h1>
        <p className="text-gray-500 m-0">View all your past transactions and download invoices</p>
      </div>

      {loading && <Loader text="Loading payments..." />}
      {error && <div className="p-4 bg-red-50 text-red-500 rounded-xl text-sm">{error}</div>}

      {!loading && !error && (
        <>
          {payments.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <span className="text-6xl block mb-4">💳</span>
              <h3 className="text-xl font-semibold text-gray-900 m-0 mb-2">No payments yet</h3>
              <p className="text-gray-500 m-0">Your payment history will appear here after your first purchase.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Transaction ID</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Course</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Amount</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Status</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Date</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment._id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono font-medium text-gray-900">
                            #{payment.transactionId || payment._id?.substring(0, 8)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700 line-clamp-1 max-w-[250px] block">
                            {payment.course?.title || 'Course Unavailable'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-gray-900">{formatCurrency(payment.amount)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${getStatusBadgeStyles(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">{formatDateTime(payment.createdAt)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {payment.status === 'completed' && (
                            <button 
                              onClick={() => handleDownloadInvoice(payment._id)}
                              className="text-sm text-indigo-500 font-medium hover:underline bg-transparent border-none cursor-pointer p-0"
                            >
                              Download
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-100">
                {payments.map((payment) => (
                  <div key={payment._id} className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-mono font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        #{payment.transactionId || payment._id?.substring(0, 8)}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${getStatusBadgeStyles(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1 m-0">
                      {payment.course?.title || 'Course Unavailable'}
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-gray-500">{formatDateTime(payment.createdAt)}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-gray-900">{formatCurrency(payment.amount)}</span>
                        {payment.status === 'completed' && (
                          <button 
                            onClick={() => handleDownloadInvoice(payment._id)}
                            className="text-xs text-indigo-500 font-semibold bg-transparent border-none cursor-pointer p-0"
                          >
                            PDF
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1} 
                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 font-medium">
                    Page {page} of {totalPages}
                  </span>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                    disabled={page === totalPages} 
                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentHistory;