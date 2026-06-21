package com.quizmaster.category;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizmaster.auth.JwtService;
import com.quizmaster.quiz.Quiz;
import com.quizmaster.quiz.QuizRepository;
import com.quizmaster.user.User;
import com.quizmaster.user.UserRepository;
import com.quizmaster.user.UserRole;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminCategoryApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private QuizRepository quizRepository;

    private final List<User> createdUsers = new ArrayList<>();
    private final List<Quiz> createdQuizzes = new ArrayList<>();
    private final List<Category> createdCategories = new ArrayList<>();

    @AfterEach
    void cleanup() {
        for (Quiz quiz : createdQuizzes) {
            quizRepository.findById(quiz.getId()).ifPresent(quizRepository::delete);
        }
        for (Category category : createdCategories) {
            categoryRepository.findById(category.getId()).ifPresent(categoryRepository::delete);
        }
        userRepository.deleteAll(createdUsers);

        createdQuizzes.clear();
        createdCategories.clear();
        createdUsers.clear();
    }

    @Test
    void adminCategoryEndpointsRequireAdmin() throws Exception {
        User user = createUser(UserRole.USER);

        mockMvc.perform(post("/api/admin/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AdminCategoryRequest("Java", uniqueSlug("java")))))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/admin/quizzes")
                        .header("Authorization", bearer(user)))
                .andExpect(status().isForbidden());
    }

    @Test
    void unsupportedAdminCategoryListReturnsMethodNotAllowed() throws Exception {
        User admin = createUser(UserRole.ADMIN);

        mockMvc.perform(get("/api/admin/categories")
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.status").value(405))
                .andExpect(jsonPath("$.message").value("Method not allowed"));
    }

    @Test
    void adminCanCreateCategory() throws Exception {
        User admin = createUser(UserRole.ADMIN);
        AdminCategoryRequest request = new AdminCategoryRequest("Java", uniqueSlug("java"));

        MvcResult result = mockMvc.perform(post("/api/admin/categories")
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Java"))
                .andExpect(jsonPath("$.slug").value(request.slug()))
                .andReturn();

        createdCategories.add(categoryRepository.findById(extractId(result)).orElseThrow());
    }

    @Test
    void duplicateCategorySlugFails() throws Exception {
        User admin = createUser(UserRole.ADMIN);
        Category category = createCategory("Java", uniqueSlug("java"));
        AdminCategoryRequest request = new AdminCategoryRequest("Java Duplicate", category.getSlug());

        mockMvc.perform(post("/api/admin/categories")
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Category slug already exists"));
    }

    @Test
    void adminCanUpdateCategory() throws Exception {
        User admin = createUser(UserRole.ADMIN);
        Category category = createCategory("Java", uniqueSlug("java"));
        AdminCategoryRequest request = new AdminCategoryRequest("Java Core", uniqueSlug("java-core"));

        mockMvc.perform(put("/api/admin/categories/{id}", category.getId())
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Java Core"))
                .andExpect(jsonPath("$.slug").value(request.slug()));
    }

    @Test
    void categoryWithQuizCannotBeDeletedButEmptyCategoryCan() throws Exception {
        User admin = createUser(UserRole.ADMIN);
        Category usedCategory = createCategory("SQL", uniqueSlug("sql"));
        Quiz quiz = createQuiz(usedCategory);
        Category emptyCategory = createCategory("Networking", uniqueSlug("networking"));

        mockMvc.perform(delete("/api/admin/categories/{id}", usedCategory.getId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(delete("/api/admin/categories/{id}", emptyCategory.getId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isNoContent());

        createdQuizzes.remove(quiz);
        quizRepository.delete(quiz);
        createdCategories.remove(emptyCategory);
        assertThat(categoryRepository.findById(emptyCategory.getId())).isEmpty();
    }

    private User createUser(UserRole role) {
        User user = new User();
        user.setEmail("phase7-" + role.name().toLowerCase() + "-" + System.nanoTime() + "@example.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole(role);
        User savedUser = userRepository.save(user);
        createdUsers.add(savedUser);
        return savedUser;
    }

    private Category createCategory(String name, String slug) {
        Category category = new Category();
        category.setName(name);
        category.setSlug(slug);
        Category savedCategory = categoryRepository.save(category);
        createdCategories.add(savedCategory);
        return savedCategory;
    }

    private Quiz createQuiz(Category category) {
        Quiz quiz = new Quiz();
        quiz.setCategory(category);
        quiz.setTitle("Quiz " + System.nanoTime());
        quiz.setDescription("Admin category test quiz");
        quiz.setTimeLimitMinutes(10);
        quiz.setPublished(false);
        Quiz savedQuiz = quizRepository.save(quiz);
        createdQuizzes.add(savedQuiz);
        return savedQuiz;
    }

    private String bearer(User user) {
        return "Bearer " + jwtService.generateToken(user);
    }

    private Long extractId(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private String uniqueSlug(String prefix) {
        return prefix + "-" + System.nanoTime();
    }
}
