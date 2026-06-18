package com.quizmaster.quiz;

public record AdminOptionResponse(
        Long id,
        String content,
        Boolean correct,
        Integer displayOrder
) {
    public static AdminOptionResponse from(Option option) {
        return new AdminOptionResponse(
                option.getId(),
                option.getContent(),
                option.getCorrect(),
                option.getDisplayOrder()
        );
    }
}
