import api from './api';

const reviewService = {
  async getCourseReviews(courseId, params = {}) {
    const response = await api.get(`/courses/${courseId}/reviews`, { params });
    return response.data;
  },

  async addReview(courseId, reviewData) {
    const response = await api.post(`/courses/${courseId}/reviews`, reviewData);
    return response.data;
  },

  async updateReview(courseId, reviewId, reviewData) {
    const response = await api.put(`/courses/${courseId}/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  async deleteReview(courseId, reviewId) {
    const response = await api.delete(`/courses/${courseId}/reviews/${reviewId}`);
    return response.data;
  },

  async checkUserReview(courseId) {
    const response = await api.get(`/courses/${courseId}/reviews/my-review`);
    return response.data;
  },
};

export default reviewService;