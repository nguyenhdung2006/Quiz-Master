package com.quizmaster.auth;

public record AuthResponse(
        String accessToken,
        UserSummaryResponse user
) {
}
