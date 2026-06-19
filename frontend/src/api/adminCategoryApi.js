import { apiClient } from "./client.js";

export function getCategories() {
  return apiClient.get("/api/categories");
}

export function createCategory(payload) {
  return apiClient.post("/api/admin/categories", payload);
}

export function updateCategory(id, payload) {
  return apiClient.put(`/api/admin/categories/${encodeURIComponent(id)}`, payload);
}

export function deleteCategory(id) {
  return apiClient.delete(`/api/admin/categories/${encodeURIComponent(id)}`);
}
