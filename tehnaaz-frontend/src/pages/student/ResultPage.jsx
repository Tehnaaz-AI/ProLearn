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

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-50 text-green-600',
      pending: 'bg-yellow-50 text-yellow-600',
      failed: 'bg-red-50 text-red-600',
      refunded: 'bg-gray-100 text-gray-600',
    };
    return styles[status] || styles.pending;
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 m-0 mb-1">Payment History</h1>
        <p className="text-gray-500 m-0">View all your past transactions</p>
      </div>

      {loading && <Loader text="Loading payments..." />}
      {error && <div className="p-4 bg-red-50 text-red-500 rounded-xl text-sm">{error}</div>}

      {!loading && !error && (
        <>
          {payments.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <span className="text-6xl block mb-4">💳</span>
              <h3 className="text-xl font-semibold text-gray-900 m-0 mb-2">No payments yet</h3>
              <p className="text-gray-500 m-0">Your payment history will appear here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Transaction</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Course</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Amount</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Status</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Date</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(payment => (
                      <tr key={payment._id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">#{payment.transactionId || payment._id?.substring(0, 8)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">{payment.course?.title || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-gray-900">{formatCurrency(payment.amount)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${getStatusBadge(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">{formatDateTime(payment.createdAt)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-sm text-indigo-500 font-medium hover:underline bg-transparent border-none cursor-pointer p-0">Download</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {payments.map(payment => (
                  <div key={payment._id} className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-900">#{payment.transactionId || payment._id?.substring(0, 8)}</span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${getStatusBadge(payment.status)}`}>{payment.status}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1 m-0">{payment.course?.title || 'N/A'}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">{formatDateTime(payment.createdAt)}</span>
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(payment.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-gray-100 text-gray-700 border-none rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                  <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 bg-gray-100 text-gray-700 border-none rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
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