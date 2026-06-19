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

export function createAdminQuestion(quizId, payload) {
  return apiClient.post(`/api/admin/quizzes/${encodeURIComponent(quizId)}/questions`, payload);
}

export function updateAdminQuestion(questionId, payload) {
  return apiClient.put(`/api/admin/questions/${encodeURIComponent(questionId)}`, payload);
}

export function deleteAdminQuestion(questionId) {
  return apiClient.delete(`/api/admin/questions/${encodeURIComponent(questionId)}`);
}

export function publishAdminQuiz(quizId) {
  return apiClient.patch(`/api/admin/quizzes/${encodeURIComponent(quizId)}/publish`);
}

export function unpublishAdminQuiz(quizId) {
  return apiClient.patch(`/api/admin/quizzes/${encodeURIComponent(quizId)}/unpublish`);
}
