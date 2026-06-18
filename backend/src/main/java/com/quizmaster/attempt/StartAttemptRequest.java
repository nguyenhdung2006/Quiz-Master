package com.quizmaster.attempt;

import jakarta.validation.constraints.NotNull;

public record StartAttemptRequest(
        @NotNull Long quizId
) {
}
