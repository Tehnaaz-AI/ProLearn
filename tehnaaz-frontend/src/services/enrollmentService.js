import api from './api';

const enrollmentService = {
  async enrollInFreeCourse(courseId) {
    const response = await api.post(`/students/courses/${courseId}/enroll`);
    return response.data;
  },

  async checkEnrollment(courseId) {
    const response = await api.get(`/students/courses/${courseId}/enrollment-status`);
    return response.data;
  },

  async getEnrollmentDetails(courseId) {
    const response = await api.get(`/students/courses/${courseId}/enrollment`);
    return response.data;
  },

  async getEnrolledCourses() {
    const response = await api.get('/students/enrollments');
    return response.data;
  },

  async unenroll(courseId) {
    const response = await api.delete(`/students/courses/${courseId}/unenroll`);
    return response.data;
  },
};

export default enrollmentService;