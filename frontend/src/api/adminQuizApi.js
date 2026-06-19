import { apiClient } from "./client.js";

export function getAdminQuizzes() {
  return apiClient.get("/api/admin/quizzes");
}
