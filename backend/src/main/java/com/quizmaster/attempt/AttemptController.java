package com.quizmaster.attempt;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/attempts")
@RequiredArgsConstructor
public class AttemptController {

    private final AttemptService attemptService;

    @PostMapping
    public StartAttemptResponse startAttempt(
            @Valid @RequestBody StartAttemptRequest request,
            Authentication authentication
    ) {
        return attemptService.startAttempt(request, authentication.getName());
    }

    @PostMapping("/{id}/submit")
    public SubmitAttemptResponse submitAttempt(
            @PathVariable Long id,
            @Valid @RequestBody SubmitAttemptRequest request,
            Authentication authentication
    ) {
        return attemptService.submitAttempt(id, request, authentication.getName());
    }

    @GetMapping("/{id}/result")
    public AttemptResultResponse getResult(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return attemptService.getResult(id, authentication.getName());
    }

    @GetMapping("/me")
    public List<AttemptHistoryResponse> getMyAttempts(Authentication authentication) {
        return attemptService.getMyAttempts(authentication.getName());
    }
}
