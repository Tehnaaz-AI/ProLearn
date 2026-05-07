import api from './api';

const lectureService = {
  async getLectureById(lectureId) {
    const response = await api.get(`/lectures/${lectureId}`);
    return response.data;
  },

  async getLectureVideoUrl(lectureId) {
    const response = await api.get(`/lectures/${lectureId}/video`);
    return response.data;
  },

  async markLectureComplete(lectureId) {
    const response = await api.post(`/students/lectures/${lectureId}/complete`);
    return response.data;
  },

  async getLectureNotes(lectureId) {
    const response = await api.get(`/lectures/${lectureId}/notes`);
    return response.data;
  },

  async getLectureResources(lectureId) {
    const response = await api.get(`/lectures/${lectureId}/resources`);
    return response.data;
  },
};

export default lectureService;