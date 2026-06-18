package com.quizmaster.quiz;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizmaster.attempt.Attempt;
import com.quizmaster.attempt.AttemptAnswerRepository;
import com.quizmaster.attempt.AttemptRepository;
import com.quizmaster.attempt.StartAttemptRequest;
import com.quizmaster.attempt.SubmitAnswerRequest;
import com.quizmaster.attempt.SubmitAttemptRequest;
import com.quizmaster.auth.JwtService;
import com.quizmaster.category.Category;
import com.quizmaster.category.CategoryRepository;
import com.quizmaster.user.User;
import com.quizmaster.user.UserRepository;
import com.quizmaster.user.UserRole;
import java.time.LocalDateTime;
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
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminQuizApiTest {

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

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private OptionRepository optionRepository;

    @Autowired
    private AttemptRepository attemptRepository;

    @Autowired
    private AttemptAnswerRepository attemptAnswerRepository;

    private final List<User> createdUsers = new ArrayList<>();
    private final List<Category> createdCategories = new ArrayList<>();
    private final List<Quiz> createdQuizzes = new ArrayList<>();

    @AfterEach
    void cleanup() {
        for (User user : createdUsers) {
            List<Attempt> attempts = attemptRepository.findByUserIdOrderByStartedAtDesc(user.getId());
            for (Attempt attempt : attempts) {
                attemptAnswerRepository.deleteAll(attemptAnswerRepository.findByAttemptId(attempt.getId()));
            }
            attemptRepository.deleteAll(attempts);
        }

        for (Quiz quiz : createdQuizzes) {
            quizRepository.findById(quiz.getId()).ifPresent(existingQuiz -> {
                List<Question> questions = questionRepository.findByQuizIdOrderByDisplayOrderAsc(existingQuiz.getId());
                for (Question question : questions) {
                    optionRepository.deleteAll(optionRepository.findByQuestionIdOrderByDisplayOrderAsc(question.getId()));
                }
                questionRepository.deleteAll(questions);
                quizRepository.delete(existingQuiz);
            });
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
    void adminQuizEndpointsRequireAdmin() throws Exception {
        User user = createUser(UserRole.USER);
        User admin = createUser(UserRole.ADMIN);

        mockMvc.perform(get("/api/admin/quizzes"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/admin/quizzes")
                        .header("Authorization", bearer(user)))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/quizzes")
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk());
    }

    @Test
    void adminCanCreateListGetUpdateAndDeleteDraftQuiz() throws Exception {
        User admin = createUser(UserRole.ADMIN);
        Category category = createCategory("Java", uniqueSlug("java"));
        Category updatedCategory = createCategory("Spring", uniqueSlug("spring"));

        MvcResult createResult = mockMvc.perform(post("/api/admin/quizzes")
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AdminQuizRequest(
                                category.getId(),
                                "Java Core",
                                "Basic Java quiz",
                                15
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.published").value(false))
                .andReturn();

        Quiz quiz = quizRepository.findById(extractId(createResult)).orElseThrow();
        createdQuizzes.add(quiz);

        mockMvc.perform(get("/api/admin/quizzes")
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", hasItem(quiz.getId().intValue())));

        mockMvc.perform(get("/api/admin/quizzes/{id}", quiz.getId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(quiz.getId().intValue()))
                .andExpect(jsonPath("$.questions").isArray());

        mockMvc.perform(put("/api/admin/quizzes/{id}", quiz.getId())
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AdminQuizRequest(
                                updatedCategory.getId(),
                                "Java Core Updated",
                                "Updated description",
                                20
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Java Core Updated"))
                .andExpect(jsonPath("$.category.id").value(updatedCategory.getId().intValue()));

        mockMvc.perform(delete("/api/admin/quizzes/{id}", quiz.getId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isNoContent());

        createdQuizzes.remove(quiz);
        assertThat(quizRepository.findById(quiz.getId())).isEmpty();
    }

    @Test
    void quizWithAttemptsCannotBeDeleted() throws Exception {
        User admin = createUser(UserRole.ADMIN);
        User user = createUser(UserRole.USER);
        Category category = createCategory("SQL", uniqueSlug("sql"));
        Quiz quiz = createQuiz(category, false);
        createAttempt(user, quiz);

        mockMvc.perform(delete("/api/admin/quizzes/{id}", quiz.getId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Cannot delete quiz that has attempts"));
    }

    @Test
    void adminCanAddQuestionAndDetailExposesCorrectFlags() throws Exception {
        User admin = createUser(UserRole.ADMIN);
        Category category = createCategory("Networking", uniqueSlug("networking"));
        Quiz quiz = createQuiz(category, false);

        MvcResult result = mockMvc.perform(post("/api/admin/quizzes/{quizId}/questions", quiz.getId())
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validQuestionRequest(1))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.options[0].correct").value(true))
                .andReturn();

        Long questionId = extractId(result);

        mockMvc.perform(get("/api/admin/quizzes/{id}", quiz.getId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questions[0].id").value(questionId.intValue()))
                .andExpect(jsonPath("$.questions[0].options[0].correct").value(true))
                .andExpect(jsonPath("$.questions[0].options[1].correct").value(false));
    }

    @Test
    void questionValidationRejectsBadOptionCountsAndCorrectCounts() throws Exception {
        User admin = createUser(UserRole.ADMIN);
        Category category = createCategory("Software", uniqueSlug("software"));
        Quiz quiz = createQuiz(category, false);

        AdminQuestionRequest oneOption = new AdminQuestionRequest(
                "What is SOLID?",
                "Principles",
                1,
                List.of(new AdminOptionRequest("One option", true, 1))
        );
        AdminQuestionRequest noCorrect = new AdminQuestionRequest(
                "What is SOLID?",
                "Principles",
                1,
                List.of(
                        new AdminOptionRequest("A", false, 1),
                        new AdminOptionRequest("B", false, 2)
                )
        );
        AdminQuestionRequest twoCorrect = new AdminQuestionRequest(
                "What is SOLID?",
                "Principles",
                1,
                List.of(
                        new AdminOptionRequest("A", true, 1),
                        new AdminOptionRequest("B", true, 2)
                )
        );

        mockMvc.perform(post("/api/admin/quizzes/{quizId}/questions", quiz.getId())
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(oneOption)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/admin/quizzes/{quizId}/questions", quiz.getId())
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(noCorrect)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/admin/quizzes/{quizId}/questions", quiz.getId())
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(twoCorrect)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updatingQuestionReplacesOptionsAndQuestionCanBeDeletedWhenNoAttemptsExist() throws Exception {
        User admin = createUser(UserRole.ADMIN);
        Category category = createCategory("English", uniqueSlug("english"));
        Quiz quiz = createQuiz(category, false);
        Question question = createQuestionWithOptions(quiz, 1);

        AdminQuestionRequest updateRequest = new AdminQuestionRequest(
                "Updated question",
                "Updated explanation",
                1,
                List.of(
                        new AdminOptionRequest("New correct", true, 1),
                        new AdminOptionRequest("New wrong", false, 2)
                )
        );

        mockMvc.perform(put("/api/admin/questions/{questionId}", question.getId())
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("Updated question"))
                .andExpect(jsonPath("$.options[0].content").value("New correct"));

        assertThat(optionRepository.findByQuestionIdOrderByDisplayOrderAsc(question.getId()))
                .extracting(Option::getContent)
                .containsExactly("New correct", "New wrong");

        mockMvc.perform(delete("/api/admin/questions/{questionId}", question.getId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isNoContent());

        assertThat(questionRepository.findById(question.getId())).isEmpty();
    }

    @Test
    void questionCannotBeUpdatedOrDeletedWhenQuizHasAttempts() throws Exception {
        User admin = createUser(UserRole.ADMIN);
        User user = createUser(UserRole.USER);
        Category category = createCategory("Attempts", uniqueSlug("attempts"));
        Quiz quiz = createQuiz(category, false);
        Question question = createQuestionWithOptions(quiz, 1);
        createAttempt(user, quiz);

        mockMvc.perform(put("/api/admin/questions/{questionId}", question.getId())
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validQuestionRequest(1))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Cannot edit quiz questions after attempts exist"));

        mockMvc.perform(delete("/api/admin/questions/{questionId}", question.getId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Cannot edit quiz questions after attempts exist"));
    }

    @Test
    void publishedQuizRejectsStructuralQuestionChanges() throws Exception {
        User admin = createUser(UserRole.ADMIN);
        Category category = createCategory("Published", uniqueSlug("published"));
        Quiz quiz = createQuiz(category, true);
        Question question = createQuestionWithOptions(quiz, 1);

        mockMvc.perform(put("/api/admin/questions/{questionId}", question.getId())
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validQuestionRequest(1))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Unpublish quiz before editing questions"));

        mockMvc.perform(delete("/api/admin/questions/{questionId}", question.getId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Unpublish quiz before editing questions"));
    }

    @Test
    void publishRejectsInvalidQuizzes() throws Exception {
        User admin = createUser(UserRole.ADMIN);
        Category category = createCategory("Publish", uniqueSlug("publish"));
        Quiz emptyQuiz = createQuiz(category, false);
        Quiz oneOptionQuiz = createQuiz(category, false);
        Quiz noCorrectQuiz = createQuiz(category, false);
        Quiz twoCorrectQuiz = createQuiz(category, false);

        Question oneOptionQuestion = createQuestion(oneOptionQuiz, 1);
        createOption(oneOptionQuestion, "Only option", true, 1);

        Question noCorrectQuestion = createQuestion(noCorrectQuiz, 1);
        createOption(noCorrectQuestion, "A", false, 1);
        createOption(noCorrectQuestion, "B", false, 2);

        Question twoCorrectQuestion = createQuestion(twoCorrectQuiz, 1);
        createOption(twoCorrectQuestion, "A", true, 1);
        createOption(twoCorrectQuestion, "B", true, 2);

        mockMvc.perform(patch("/api/admin/quizzes/{id}/publish", emptyQuiz.getId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(patch("/api/admin/quizzes/{id}/publish", oneOptionQuiz.getId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(patch("/api/admin/quizzes/{id}/publish", noCorrectQuiz.getId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(patch("/api/admin/quizzes/{id}/publish", twoCorrectQuiz.getId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void publishRejectsInvalidDisplayOrdersAndBlankContent() throws Exception {
        User admin = createUser(UserRole.ADMIN);
        Category category = createCategory("Publish Rules", uniqueSlug("publish-rules"));
        Quiz invalidQuestionOrderQuiz = createQuiz(category, false);
        Quiz duplicateOptionOrderQuiz = createQuiz(category, false);
        Quiz blankContentQuiz = createQuiz(category, false);

        Question invalidOrderQuestion = createQuestion(invalidQuestionOrderQuiz, 0);
        createOption(invalidOrderQuestion, "A", true, 1);
        createOption(invalidOrderQuestion, "B", false, 2);

        Question duplicateOptionOrderQuestion = createQuestion(duplicateOptionOrderQuiz, 1);
        createOption(duplicateOptionOrderQuestion, "A", true, 1);
        createOption(duplicateOptionOrderQuestion, "B", false, 1);

        Question blankQuestion = createQuestion(blankContentQuiz, 1);
        blankQuestion.setContent(" ");
        questionRepository.save(blankQuestion);
        createOption(blankQuestion, "A", true, 1);
        createOption(blankQuestion, "B", false, 2);

        mockMvc.perform(patch("/api/admin/quizzes/{id}/publish", invalidQuestionOrderQuiz.getId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Question display order must be positive"));

        mockMvc.perform(patch("/api/admin/quizzes/{id}/publish", duplicateOptionOrderQuiz.getId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Option display order must be unique within a question"));

        mockMvc.perform(patch("/api/admin/quizzes/{id}/publish", blankContentQuiz.getId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Question content is required"));
    }

    @Test
    void publishAndUnpublishControlPublicCatalog() throws Exception {
        User admin = createUser(UserRole.ADMIN);
        Category category = createCategory("Catalog", uniqueSlug("catalog"));
        Quiz quiz = createQuiz(category, false);
        createQuestionWithOptions(quiz, 1);

        mockMvc.perform(patch("/api/admin/quizzes/{id}/publish", quiz.getId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.published").value(true));

        mockMvc.perform(get("/api/quizzes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", hasItem(quiz.getId().intValue())));

        mockMvc.perform(patch("/api/admin/quizzes/{id}/unpublish", quiz.getId())
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.published").value(false));

        mockMvc.perform(get("/api/quizzes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", not(hasItem(quiz.getId().intValue()))));
    }

    @Test
    void publicDetailAndStartAttemptDoNotExposeCorrectAnswers() throws Exception {
        User user = createUser(UserRole.USER);
        Category category = createCategory("Public", uniqueSlug("public"));
        Quiz quiz = createQuiz(category, true);
        createQuestionWithOptions(quiz, 1);

        MvcResult detailResult = mockMvc.perform(get("/api/quizzes/{id}", quiz.getId()))
                .andExpect(status().isOk())
                .andReturn();

        String detailBody = detailResult.getResponse().getContentAsString();
        assertThat(detailBody).doesNotContain("correct");
        assertThat(detailBody).doesNotContain("isCorrect");
        assertThat(detailBody).doesNotContain("correctAnswer");
        assertThat(detailBody).doesNotContain("explanation");

        MvcResult startResult = mockMvc.perform(post("/api/attempts")
                        .header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new StartAttemptRequest(quiz.getId()))))
                .andExpect(status().isOk())
                .andReturn();

        String startBody = startResult.getResponse().getContentAsString();
        assertThat(startBody).doesNotContain("isCorrect");
        assertThat(startBody).doesNotContain("correctAnswer");
        assertThat(startBody).doesNotContain("explanation");
    }

    @Test
    void resultAfterSubmitStillWorks() throws Exception {
        User user = createUser(UserRole.USER);
        Category category = createCategory("Result", uniqueSlug("result"));
        Quiz quiz = createQuiz(category, true);
        Question question = createQuestionWithOptions(quiz, 1);
        Option correctOption = optionRepository.findByQuestionIdOrderByDisplayOrderAsc(question.getId())
                .stream()
                .filter(option -> Boolean.TRUE.equals(option.getCorrect()))
                .findFirst()
                .orElseThrow();

        MvcResult startResult = mockMvc.perform(post("/api/attempts")
                        .header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new StartAttemptRequest(quiz.getId()))))
                .andExpect(status().isOk())
                .andReturn();

        Long attemptId = extractId(startResult, "attemptId");
        SubmitAttemptRequest submitRequest = new SubmitAttemptRequest(List.of(
                new SubmitAnswerRequest(question.getId(), correctOption.getId())
        ));

        mockMvc.perform(post("/api/attempts/{id}/submit", attemptId)
                        .header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(submitRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questions").doesNotExist());

        mockMvc.perform(get("/api/attempts/{id}/result", attemptId)
                        .header("Authorization", bearer(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questions[0].correctOptionId").value(correctOption.getId().intValue()))
                .andExpect(jsonPath("$.questions[0].correct").value(true));
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

    private Quiz createQuiz(Category category, boolean published) {
        Quiz quiz = new Quiz();
        quiz.setCategory(category);
        quiz.setTitle("Quiz " + System.nanoTime());
        quiz.setDescription("Admin quiz test");
        quiz.setTimeLimitMinutes(15);
        quiz.setPublished(published);
        Quiz savedQuiz = quizRepository.save(quiz);
        createdQuizzes.add(savedQuiz);
        return savedQuiz;
    }

    private Question createQuestionWithOptions(Quiz quiz, int displayOrder) {
        Question question = createQuestion(quiz, displayOrder);
        createOption(question, "Correct " + displayOrder, true, 1);
        createOption(question, "Wrong " + displayOrder, false, 2);
        return question;
    }

    private Question createQuestion(Quiz quiz, int displayOrder) {
        Question question = new Question();
        question.setQuiz(quiz);
        question.setContent("Question " + displayOrder);
        question.setExplanation("Explanation " + displayOrder);
        question.setDisplayOrder(displayOrder);
        return questionRepository.save(question);
    }

    private Option createOption(Question question, String content, boolean correct, int displayOrder) {
        Option option = new Option();
        option.setQuestion(question);
        option.setContent(content);
        option.setCorrect(correct);
        option.setDisplayOrder(displayOrder);
        return optionRepository.save(option);
    }

    private Attempt createAttempt(User user, Quiz quiz) {
        Attempt attempt = new Attempt();
        attempt.setUser(user);
        attempt.setQuiz(quiz);
        attempt.setStartedAt(LocalDateTime.now());
        return attemptRepository.save(attempt);
    }

    private AdminQuestionRequest validQuestionRequest(int displayOrder) {
        return new AdminQuestionRequest(
                "What is JVM?",
                "JVM runs Java bytecode.",
                displayOrder,
                List.of(
                        new AdminOptionRequest("Java Virtual Machine", true, 1),
                        new AdminOptionRequest("Java Visual Manager", false, 2)
                )
        );
    }

    private String bearer(User user) {
        return "Bearer " + jwtService.generateToken(user);
    }

    private Long extractId(MvcResult result) throws Exception {
        return extractId(result, "id");
    }

    private Long extractId(MvcResult result, String field) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsString()).get(field).asLong();
    }

    private String uniqueSlug(String prefix) {
        return prefix + "-" + System.nanoTime();
    }
}
