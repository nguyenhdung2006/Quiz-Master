package com.quizmaster.quiz;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;

public record AdminQuestionRequest(
        @NotBlank String content,
        String explanation,
        @NotNull @Positive Integer displayOrder,
        @NotNull @Size(min = 2) List<@Valid AdminOptionRequest> options
) {
}
