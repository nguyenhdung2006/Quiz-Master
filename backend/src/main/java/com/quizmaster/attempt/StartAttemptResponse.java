package com.quizmaster.attempt;

import java.util.List;

public record StartAttemptResponse(
        Long attemptId,
        Long quizId,
        String quizTitle,
        Integer timeLimitMinutes,
        List<StartAttemptQuestionResponse> questions
) {
}
