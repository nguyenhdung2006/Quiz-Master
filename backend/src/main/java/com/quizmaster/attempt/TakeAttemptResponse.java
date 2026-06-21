package com.quizmaster.attempt;

import java.time.LocalDateTime;
import java.util.List;

public record TakeAttemptResponse(
        Long attemptId,
        Long quizId,
        String quizTitle,
        Integer timeLimitMinutes,
        boolean submitted,
        LocalDateTime submittedAt,
        List<StartAttemptQuestionResponse> questions
) {
}
