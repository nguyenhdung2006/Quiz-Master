package com.quizmaster.attempt;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record SubmitAttemptRequest(
        @NotNull List<@Valid SubmitAnswerRequest> answers
) {
}
