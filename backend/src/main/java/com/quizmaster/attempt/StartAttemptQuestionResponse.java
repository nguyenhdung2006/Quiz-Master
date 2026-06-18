package com.quizmaster.attempt;

import com.quizmaster.quiz.Question;
import java.util.List;

public record StartAttemptQuestionResponse(
        Long id,
        String content,
        Integer displayOrder,
        List<StartAttemptOptionResponse> options
) {
    public static StartAttemptQuestionResponse from(
            Question question,
            List<StartAttemptOptionResponse> options
    ) {
        return new StartAttemptQuestionResponse(
                question.getId(),
                question.getContent(),
                question.getDisplayOrder(),
                options
        );
    }
}
