package com.quizmaster.quiz;

import com.quizmaster.category.CategoryResponse;
import java.time.LocalDateTime;

public record AdminQuizResponse(
        Long id,
        String title,
        String description,
        CategoryResponse category,
        long questionCount,
        Integer timeLimitMinutes,
        boolean published,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static AdminQuizResponse from(Quiz quiz, long questionCount) {
        return new AdminQuizResponse(
                quiz.getId(),
                quiz.getTitle(),
                quiz.getDescription(),
                CategoryResponse.from(quiz.getCategory()),
                questionCount,
                quiz.getTimeLimitMinutes(),
                quiz.isPublished(),
                quiz.getCreatedAt(),
                quiz.getUpdatedAt()
        );
    }
}
