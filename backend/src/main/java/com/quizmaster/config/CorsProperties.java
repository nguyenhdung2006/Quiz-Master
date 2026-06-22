package com.quizmaster.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.cors")
public record CorsProperties(List<String> allowedOrigins) {

    public CorsProperties {
        if (allowedOrigins == null || allowedOrigins.isEmpty()) {
            throw new IllegalArgumentException("At least one CORS allowed origin is required");
        }

        allowedOrigins = allowedOrigins.stream()
                .map(origin -> origin == null ? "" : origin.trim())
                .toList();

        if (allowedOrigins.stream().anyMatch(String::isBlank)) {
            throw new IllegalArgumentException("CORS allowed origins must not be blank");
        }
        if (allowedOrigins.stream().anyMatch(origin -> origin.contains("${"))) {
            throw new IllegalArgumentException("CORS allowed origins contain an unresolved placeholder");
        }
        if (allowedOrigins.stream().anyMatch(origin -> origin.contains("*"))) {
            throw new IllegalArgumentException("Wildcard CORS origins are not allowed");
        }

        allowedOrigins = allowedOrigins.stream().distinct().toList();
    }
}
