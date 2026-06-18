package com.quizmaster.quiz;

import java.util.List;

public record AdminQuestionResponse(
        Long id,
        String content,
        String explanation,
        Integer displayOrder,
        List<AdminOptionResponse> options
) {
    public static AdminQuestionResponse from(Question question, List<Option> options) {
        return new AdminQuestionResponse(
                question.getId(),
                question.getContent(),
                question.getExplanation(),
                question.getDisplayOrder(),
                options.stream()
                        .map(AdminOptionResponse::from)
                        .toList()
        );
    }
}
