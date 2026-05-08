import api from './api';

const userService = {
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  },

  async updateProfile(updateData) {
    const response = await api.put('/users/profile', updateData);
    return response.data;
  },

  async uploadAvatar(formData) {
    const response = await api.patch('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getEnrolledCourses() {
    const response = await api.get('/students/enrollments');
    return response.data;
  },

  async getWishlist() {
    const response = await api.get('/students/wishlist');
    return response.data;
  },

  async addToWishlist(courseId) {
    const response = await api.post(`/students/wishlist/${courseId}`);
    return response.data;
  },

  async removeFromWishlist(courseId) {
    const response = await api.delete(`/students/wishlist/${courseId}`);
    return response.data;
  },

  async applyAsInstructor(applicationData) {
    const response = await api.post('/common/instructor-apply', applicationData);
    return response.data;
  },
};

export default userService;