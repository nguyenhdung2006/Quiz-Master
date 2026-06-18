package com.quizmaster.attempt;

import com.quizmaster.quiz.Option;

public record StartAttemptOptionResponse(
        Long id,
        String content,
        Integer displayOrder
) {
    public static StartAttemptOptionResponse from(Option option) {
        return new StartAttemptOptionResponse(
                option.getId(),
                option.getContent(),
                option.getDisplayOrder()
        );
    }
}
