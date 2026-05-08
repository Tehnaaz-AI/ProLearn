import api from './api';

const courseService = {
  async getAllCourses(params = {}) {
    const response = await api.get('/courses', { params });
    return response.data;
  },

  async getCourseById(courseId) {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  },

  async getCoursesByCategory(category) {
    const response = await api.get('/courses', { params: { category } });
    return response.data;
  },

  async searchCourses(query) {
    const response = await api.get('/courses/search', { params: { q: query } });
    return response.data;
  },

  async getPopularCourses() {
    const response = await api.get('/courses/popular');
    return response.data;
  },

  async getNewCourses() {
    const response = await api.get('/courses/new');
    return response.data;
  },

  async getFreeCourses() {
    const response = await api.get('/courses/free');
    return response.data;
  },

  async getCategories() {
    const response = await api.get('/courses/categories');
    return response.data;
  },

  async getInstructorCourses(instructorId) {
    const response = await api.get(`/instructor/courses`);
    return response.data;
  },
};

export default courseService;