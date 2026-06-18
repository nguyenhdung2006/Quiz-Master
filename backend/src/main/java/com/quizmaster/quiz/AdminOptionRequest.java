package com.quizmaster.quiz;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AdminOptionRequest(
        @NotBlank String content,
        @NotNull Boolean correct,
        @NotNull @Positive Integer displayOrder
) {
}
