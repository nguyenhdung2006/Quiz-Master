package com.quizmaster.auth;

import com.quizmaster.user.User;

public record CurrentUserResponse(
        Long id,
        String email,
        String role
) {
    public static CurrentUserResponse from(User user) {
        return new CurrentUserResponse(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}
