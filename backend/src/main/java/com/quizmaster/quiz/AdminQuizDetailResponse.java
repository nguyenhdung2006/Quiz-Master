package com.quizmaster.quiz;

import com.quizmaster.category.CategoryResponse;
import java.util.List;

public record AdminQuizDetailResponse(
        Long id,
        String title,
        String description,
        CategoryResponse category,
        long questionCount,
        Integer timeLimitMinutes,
        boolean published,
        List<AdminQuestionResponse> questions
) {
    public static AdminQuizDetailResponse from(Quiz quiz, List<AdminQuestionResponse> questions) {
        return new AdminQuizDetailResponse(
                quiz.getId(),
                quiz.getTitle(),
                quiz.getDescription(),
                CategoryResponse.from(quiz.getCategory()),
                questions.size(),
                quiz.getTimeLimitMinutes(),
                quiz.isPublished(),
                questions
        );
    }
}
