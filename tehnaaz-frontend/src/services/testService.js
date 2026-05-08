import api from './api';

const testService = {
  async getTestsByCourse(courseId) {
    const response = await api.get(`/courses/${courseId}/tests`);
    return response.data;
  },

  async getTestById(testId) {
    const response = await api.get(`/tests/${testId}`);
    return response.data;
  },

  async startTest(testId) {
    const response = await api.post(`/tests/${testId}/start`);
    return response.data;
  },

  async submitTest(testId, answers) {
    const response = await api.post(`/tests/${testId}/submit`, { answers });
    return response.data;
  },

  async getTestAttempt(attemptId) {
    const response = await api.get(`/attempts/${attemptId}`);
    return response.data;
  },

  async getTestResults(testId) {
    const response = await api.get(`/tests/${testId}/results`);
    return response.data;
  },

  async getAllResults() {
    const response = await api.get('/students/results');
    return response.data;
  },
};

export default testService;