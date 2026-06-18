package com.quizmaster.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AdminCategoryRequest(
        @NotBlank String name,
        @NotBlank
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "must use lowercase letters, numbers, and hyphens")
        String slug
) {
}
