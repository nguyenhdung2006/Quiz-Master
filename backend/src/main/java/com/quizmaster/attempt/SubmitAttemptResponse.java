package com.quizmaster.attempt;

import java.time.LocalDateTime;

public record SubmitAttemptResponse(
        Long attemptId,
        Long quizId,
        String quizTitle,
        Integer correctCount,
        Integer totalQuestions,
        Integer scorePercentage,
        LocalDateTime startedAt,
        LocalDateTime submittedAt
) {
    public static SubmitAttemptResponse from(Attempt attempt) {
        return new SubmitAttemptResponse(
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
