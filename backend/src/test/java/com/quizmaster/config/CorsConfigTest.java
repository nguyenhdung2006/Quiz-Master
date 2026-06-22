package com.quizmaster.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

class CorsConfigTest {

    @Test
    void appliesConfiguredOriginsAndRequiredApiAccess() {
        CorsProperties properties = new CorsProperties(List.of(
                "http://localhost:5173",
                "https://quizmaster.example"
        ));
        CorsConfigurationSource source = new CorsConfig(properties).corsConfigurationSource();
        MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/api/categories");

        CorsConfiguration configuration = source.getCorsConfiguration(request);

        assertThat(configuration).isNotNull();
        assertThat(configuration.getAllowedOrigins()).containsExactly(
                "http://localhost:5173",
                "https://quizmaster.example"
        );
        assertThat(configuration.getAllowedMethods())
                .containsExactly("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");
        assertThat(configuration.getAllowedHeaders()).containsExactly("Authorization", "Content-Type");
        assertThat(configuration.getAllowCredentials()).isFalse();
    }

    @Test
    void rejectsMissingOrigins() {
        assertThatThrownBy(() -> new CorsProperties(List.of()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("At least one CORS allowed origin is required");
    }

    @Test
    void rejectsBlankOrigins() {
        assertThatThrownBy(() -> new CorsProperties(List.of("   ")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("CORS allowed origins must not be blank");
    }

    @Test
    void rejectsUnresolvedPlaceholders() {
        assertThatThrownBy(() -> new CorsProperties(List.of("${CORS_ALLOWED_ORIGINS}")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("CORS allowed origins contain an unresolved placeholder");
    }

    @Test
    void rejectsWildcardOrigins() {
        assertThatThrownBy(() -> new CorsProperties(List.of("https://*.example.com")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Wildcard CORS origins are not allowed");
    }
}
