package com.quizmaster.quiz;

import com.quizmaster.category.CategoryResponse;

public record QuizDetailResponse(
        Long id,
        String title,
        String description,
        CategoryResponse category,
        long questionCount,
        Integer timeLimitMinutes,
        boolean published
) {
    public static QuizDetailResponse from(Quiz quiz, long questionCount) {
        return new QuizDetailResponse(
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
