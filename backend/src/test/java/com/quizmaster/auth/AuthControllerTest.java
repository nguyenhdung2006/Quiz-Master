package com.quizmaster.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizmaster.user.User;
import com.quizmaster.user.UserRepository;
import com.quizmaster.user.UserRole;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    private String testEmail;

    @AfterEach
    void cleanup() {
        if (testEmail == null) {
            return;
        }

        Optional<User> user = userRepository.findByEmail(testEmail);
        user.ifPresent(userRepository::delete);
    }

    @Test
    void loginWithWrongPasswordReturnsUnauthorized() throws Exception {
        testEmail = uniqueEmail();
        register(testEmail, "password123").andExpect(status().isOk());

        LoginRequest loginRequest = new LoginRequest(testEmail, "wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Invalid email or password"))
                .andExpect(jsonPath("$.path").value("/api/auth/login"));
    }

    @Test
    void duplicateRegisterReturnsBadRequest() throws Exception {
        testEmail = uniqueEmail();
        register(testEmail, "password123").andExpect(status().isOk());

        register(testEmail, "password123")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Email already exists"))
                .andExpect(jsonPath("$.path").value("/api/auth/register"));
    }

    @Test
    void loginWithLegacyPlainTextPasswordReturnsUnauthorized() throws Exception {
        testEmail = uniqueEmail();
        User user = new User();
        user.setEmail(testEmail);
        user.setPassword("password123");
        user.setRole(UserRole.USER);
        userRepository.save(user);

        LoginRequest loginRequest = new LoginRequest(testEmail, "wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Invalid email or password"))
                .andExpect(jsonPath("$.path").value("/api/auth/login"));
    }

    @Test
    void malformedJsonReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"broken@example.com\",\"password\":"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Malformed JSON request"))
                .andExpect(jsonPath("$.path").value("/api/auth/login"));
    }

    @Test
    void validationErrorReturnsBadRequest() throws Exception {
        RegisterRequest request = new RegisterRequest("", "short");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.path").value("/api/auth/register"));
    }

    private org.springframework.test.web.servlet.ResultActions register(
            String email,
            String password
    ) throws Exception {
        RegisterRequest request = new RegisterRequest(email, password);

        return mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));
    }

    private String uniqueEmail() {
        return "auth-test-" + System.nanoTime() + "@example.com";
    }
}
