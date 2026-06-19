import { apiClient } from "./client.js";

export function startAttempt(quizId) {
  return apiClient.post("/api/attempts", { quizId });
}

export function submitAttempt(attemptId, answers) {
  return apiClient.post(`/api/attempts/${encodeURIComponent(attemptId)}/submit`, {
    answers,
  });
}

export function getAttemptResult(attemptId) {
  return apiClient.get(`/api/attempts/${encodeURIComponent(attemptId)}/result`);
}
