import { apiClient } from "./client.js";

export function getAdminQuizzes() {
  return apiClient.get("/api/admin/quizzes");
}

export function getAdminQuiz(id) {
  return apiClient.get(`/api/admin/quizzes/${encodeURIComponent(id)}`);
}

export function createAdminQuiz(payload) {
  return apiClient.post("/api/admin/quizzes", payload);
}

export function updateAdminQuiz(id, payload) {
  return apiClient.put(`/api/admin/quizzes/${encodeURIComponent(id)}`, payload);
}
