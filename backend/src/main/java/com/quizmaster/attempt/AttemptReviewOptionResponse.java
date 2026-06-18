package com.quizmaster.attempt;

import com.quizmaster.quiz.Option;

public record AttemptReviewOptionResponse(
        Long id,
        String content,
        boolean selected,
        boolean correct
) {
    public static AttemptReviewOptionResponse from(Option option, Long selectedOptionId) {
        return new AttemptReviewOptionResponse(
                option.getId(),
                option.getContent(),
                option.getId().equals(selectedOptionId),
                Boolean.TRUE.equals(option.getCorrect())
        );
    }
}
