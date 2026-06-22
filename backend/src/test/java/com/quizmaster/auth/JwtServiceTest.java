package com.quizmaster.auth;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class JwtServiceTest {

    private static final long TOKEN_EXPIRATION_MS = 86_400_000L;

    @Test
    void rejectsNullSecret() {
        assertThatThrownBy(() -> new JwtService(null, TOKEN_EXPIRATION_MS))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("JWT secret must not be blank");
    }

    @Test
    void rejectsBlankSecret() {
        assertThatThrownBy(() -> new JwtService("   ", TOKEN_EXPIRATION_MS))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("JWT secret must not be blank");
    }

    @Test
    void rejectsSecretShorterThanMinimumLength() {
        assertThatThrownBy(() -> new JwtService("too-short", TOKEN_EXPIRATION_MS))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("JWT secret must be at least 32 characters");
    }
}
