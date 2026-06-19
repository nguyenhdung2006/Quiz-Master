import { apiClient } from "./client.js";

export function getCategories() {
  return apiClient.get("/api/categories");
}

export function getQuizzes(categoryId) {
  const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : "";
  return apiClient.get(`/api/quizzes${query}`);
}

export function getQuizDetail(id) {
  return apiClient.get(`/api/quizzes/${encodeURIComponent(id)}`);
}
