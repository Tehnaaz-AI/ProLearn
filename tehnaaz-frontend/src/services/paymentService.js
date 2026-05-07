import api from './api';

const paymentService = {
  async createPaymentOrder(courseId) {
    const response = await api.post('/payments/create-order', { courseId });
    return response.data;
  },

  async verifyPayment(paymentData) {
    const response = await api.post('/payments/verify', paymentData);
    return response.data;
  },

  async getPaymentHistory(params = {}) {
    const response = await api.get('/payments/history', { params });
    return response.data;
  },

  async getPaymentDetails(paymentId) {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  },

  async getInvoice(paymentId) {
    const response = await api.get(`/payments/${paymentId}/invoice`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async requestRefund(paymentId, reason) {
    const response = await api.post(`/payments/${paymentId}/refund`, { reason });
    return response.data;
  },

  async applyCoupon(courseId, couponCode) {
    const response = await api.post('/payments/apply-coupon', { 
      courseId, 
      couponCode 
    });
    return response.data;
  },
};

export default paymentService;