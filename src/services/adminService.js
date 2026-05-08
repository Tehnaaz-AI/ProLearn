import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:4000/admin", withCredentials: true });

export const getInstructorRequests = () => API.get("/instructors");
export const approveInstructor = (id) => API.post(`/instructors/${id}/approve`);
export const rejectInstructor = (id) => API.post(`/instructors/${id}/reject`);

export const getUsers = () => API.get("/users");
export const blockUser = (id) => API.post(`/users/${id}/block`);

export const getPayments = () => API.get("/payments");
