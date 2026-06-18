package com.quizmaster.attempt;

import java.time.LocalDateTime;
import java.util.List;

public record AttemptResultResponse(
        Long attemptId,
        Long quizId,
        String quizTitle,
        Integer correctCount,
        Integer totalQuestions,
        Integer scorePercentage,
        LocalDateTime startedAt,
        LocalDateTime submittedAt,
        List<AttemptReviewQuestionResponse> questions
) {
}
