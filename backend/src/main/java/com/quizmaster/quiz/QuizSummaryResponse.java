package com.quizmaster.quiz;

import com.quizmaster.category.CategoryResponse;

public record QuizSummaryResponse(
        Long id,
        String title,
        String description,
        CategoryResponse category,
        long questionCount,
        Integer timeLimitMinutes,
        boolean published
) {
    public static QuizSummaryResponse from(Quiz quiz, long questionCount) {
        return new QuizSummaryResponse(
                quiz.getId(),
                quiz.getTitle(),
                quiz.getDescription(),
                CategoryResponse.from(quiz.getCategory()),
                questionCount,
                quiz.getTimeLimitMinutes(),
                quiz.isPublished()
        );
    }
}
