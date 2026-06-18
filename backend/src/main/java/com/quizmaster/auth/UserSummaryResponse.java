package com.quizmaster.auth;

import com.quizmaster.user.User;

public record UserSummaryResponse(
        Long id,
        String email,
        String role
) {
    public static UserSummaryResponse from(User user) {
        return new UserSummaryResponse(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}
