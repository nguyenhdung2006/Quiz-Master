package com.quizmaster.quiz;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AdminQuizRequest(
        @NotNull Long categoryId,
        @NotBlank String title,
        String description,
        @Positive Integer timeLimitMinutes
) {
}
