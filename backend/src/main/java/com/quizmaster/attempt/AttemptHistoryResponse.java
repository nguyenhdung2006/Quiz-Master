package com.quizmaster.attempt;

import java.time.LocalDateTime;

public record AttemptHistoryResponse(
        Long attemptId,
        Long quizId,
        String quizTitle,
        Integer correctCount,
        Integer totalQuestions,
        Integer scorePercentage,
        LocalDateTime startedAt,
        LocalDateTime submittedAt
) {
    public static AttemptHistoryResponse from(Attempt attempt) {
        return new AttemptHistoryResponse(
                attempt.getId(),
                attempt.getQuiz().getId(),
                attempt.getQuiz().getTitle(),
                attempt.getCorrectCount(),
                attempt.getTotalQuestions(),
                attempt.getScorePercentage(),
                attempt.getStartedAt(),
                attempt.getSubmittedAt()
        );
    }
}
