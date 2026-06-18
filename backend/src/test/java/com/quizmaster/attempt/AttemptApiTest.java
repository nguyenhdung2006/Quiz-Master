package com.quizmaster.attempt;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizmaster.auth.JwtService;
import com.quizmaster.category.Category;
import com.quizmaster.category.CategoryRepository;
import com.quizmaster.quiz.Option;
import com.quizmaster.quiz.OptionRepository;
import com.quizmaster.quiz.Question;
import com.quizmaster.quiz.QuestionRepository;
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
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AttemptApiTest {

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
    private final List<Question> createdQuestions = new ArrayList<>();
    private final List<Option> createdOptions = new ArrayList<>();

    @AfterEach
    void cleanup() {
        for (User user : createdUsers) {
            List<Attempt> attempts = attemptRepository.findByUserIdOrderByStartedAtDesc(user.getId());
            for (Attempt attempt : attempts) {
                attemptAnswerRepository.deleteAll(attemptAnswerRepository.findByAttemptId(attempt.getId()));
            }
            attemptRepository.deleteAll(attempts);
        }

        optionRepository.deleteAll(createdOptions);
        questionRepository.deleteAll(createdQuestions);
        quizRepository.deleteAll(createdQuizzes);
        categoryRepository.deleteAll(createdCategories);
        userRepository.deleteAll(createdUsers);

        createdOptions.clear();
        createdQuestions.clear();
        createdQuizzes.clear();
        createdCategories.clear();
        createdUsers.clear();
    }

    @Test
    void guestCannotStartAttempt() throws Exception {
        Quiz quiz = createQuiz(true);
        createQuestionWithOptions(quiz, 1);

        mockMvc.perform(post("/api/attempts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new StartAttemptRequest(quiz.getId()))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void startAttemptReturnsOrderedQuestionsAndOptionsWithoutAnswers() throws Exception {
        User user = createUser();
        Quiz quiz = createQuiz(true);
        createQuestionWithOptions(quiz, 2);
        createQuestionWithOptions(quiz, 1);

        MvcResult result = mockMvc.perform(post("/api/attempts")
                        .header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new StartAttemptRequest(quiz.getId()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quizId").value(quiz.getId().intValue()))
                .andExpect(jsonPath("$.questions", hasSize(2)))
                .andExpect(jsonPath("$.questions[0].displayOrder").value(1))
                .andExpect(jsonPath("$.questions[0].options[0].displayOrder").value(1))
                .andReturn();

        String body = result.getResponse().getContentAsString();
        assertThat(body).doesNotContain("isCorrect");
        assertThat(body).doesNotContain("correctAnswer");
        assertThat(body).doesNotContain("explanation");
        assertThat(body).doesNotContain("selectedOption");
    }

    @Test
    void cannotStartUnpublishedQuiz() throws Exception {
        User user = createUser();
        Quiz quiz = createQuiz(false);
        createQuestionWithOptions(quiz, 1);

        mockMvc.perform(post("/api/attempts")
                        .header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new StartAttemptRequest(quiz.getId()))))
                .andExpect(status().isNotFound());
    }

    @Test
    void submitScoresSkippedQuestionsAsIncorrectAndResultShowsReviewAfterSubmit() throws Exception {
        User user = createUser();
        Quiz quiz = createQuiz(true);
        Question firstQuestion = createQuestionWithOptions(quiz, 1);
        Question skippedQuestion = createQuestionWithOptions(quiz, 2);
        Option correctOption = createdOptions.stream()
                .filter(option -> option.getQuestion().getId().equals(firstQuestion.getId()))
                .filter(option -> Boolean.TRUE.equals(option.getCorrect()))
                .findFirst()
                .orElseThrow();

        Long attemptId = startAttempt(user, quiz.getId());
        SubmitAttemptRequest submitRequest = new SubmitAttemptRequest(List.of(
                new SubmitAnswerRequest(firstQuestion.getId(), correctOption.getId())
        ));

        mockMvc.perform(post("/api/attempts/{id}/submit", attemptId)
                        .header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(submitRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correctCount").value(1))
                .andExpect(jsonPath("$.totalQuestions").value(2))
                .andExpect(jsonPath("$.scorePercentage").value(50))
                .andExpect(jsonPath("$.questions").doesNotExist());

        MvcResult result = mockMvc.perform(get("/api/attempts/{id}/result", attemptId)
                        .header("Authorization", bearer(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questions", hasSize(2)))
                .andExpect(jsonPath("$.questions[0].explanation").value("Explanation 1"))
                .andExpect(jsonPath("$.questions[0].correct").value(true))
                .andExpect(jsonPath("$.questions[1].questionId").value(skippedQuestion.getId().intValue()))
                .andExpect(jsonPath("$.questions[1].selectedOptionId").doesNotExist())
                .andReturn();

        String body = result.getResponse().getContentAsString();
        assertThat(body).contains("correctOptionId");
        assertThat(body).contains("selected");
    }

    @Test
    void submitValidationRejectsDuplicateQuestionAndOptionFromWrongQuestion() throws Exception {
        User user = createUser();
        Quiz quiz = createQuiz(true);
        Question firstQuestion = createQuestionWithOptions(quiz, 1);
        Question secondQuestion = createQuestionWithOptions(quiz, 2);
        Option firstQuestionOption = createdOptions.stream()
                .filter(option -> option.getQuestion().getId().equals(firstQuestion.getId()))
                .findFirst()
                .orElseThrow();
        Option secondQuestionOption = createdOptions.stream()
                .filter(option -> option.getQuestion().getId().equals(secondQuestion.getId()))
                .findFirst()
                .orElseThrow();

        Long firstAttemptId = startAttempt(user, quiz.getId());
        SubmitAttemptRequest duplicateRequest = new SubmitAttemptRequest(List.of(
                new SubmitAnswerRequest(firstQuestion.getId(), firstQuestionOption.getId()),
                new SubmitAnswerRequest(firstQuestion.getId(), firstQuestionOption.getId())
        ));

        mockMvc.perform(post("/api/attempts/{id}/submit", firstAttemptId)
                        .header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Duplicate answer for question"));

        Long secondAttemptId = startAttempt(user, quiz.getId());
        SubmitAttemptRequest wrongOptionRequest = new SubmitAttemptRequest(List.of(
                new SubmitAnswerRequest(firstQuestion.getId(), secondQuestionOption.getId())
        ));

        mockMvc.perform(post("/api/attempts/{id}/submit", secondAttemptId)
                        .header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongOptionRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Option does not belong to question"));
    }

    @Test
    void cannotSubmitTwiceOrViewOtherUsersAttempt() throws Exception {
        User owner = createUser();
        User otherUser = createUser();
        Quiz quiz = createQuiz(true);
        Question question = createQuestionWithOptions(quiz, 1);
        Option option = createdOptions.stream()
                .filter(candidate -> candidate.getQuestion().getId().equals(question.getId()))
                .findFirst()
                .orElseThrow();
        Long attemptId = startAttempt(owner, quiz.getId());
        SubmitAttemptRequest submitRequest = new SubmitAttemptRequest(List.of(
                new SubmitAnswerRequest(question.getId(), option.getId())
        ));

        mockMvc.perform(post("/api/attempts/{id}/submit", attemptId)
                        .header("Authorization", bearer(owner))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(submitRequest)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/attempts/{id}/submit", attemptId)
                        .header("Authorization", bearer(owner))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(submitRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Attempt has already been submitted"));

        mockMvc.perform(get("/api/attempts/{id}/result", attemptId)
                        .header("Authorization", bearer(otherUser)))
                .andExpect(status().isNotFound());
    }

    @Test
    void resultBeforeSubmitFailsAndHistoryReturnsOnlyCurrentUserAttempts() throws Exception {
        User user = createUser();
        User otherUser = createUser();
        Quiz quiz = createQuiz(true);
        Question question = createQuestionWithOptions(quiz, 1);
        Option option = createdOptions.stream()
                .filter(candidate -> candidate.getQuestion().getId().equals(question.getId()))
                .findFirst()
                .orElseThrow();

        Long unsubmittedAttemptId = startAttempt(user, quiz.getId());
        mockMvc.perform(get("/api/attempts/{id}/result", unsubmittedAttemptId)
                        .header("Authorization", bearer(user)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Attempt has not been submitted"));

        Long submittedAttemptId = startAttempt(user, quiz.getId());
        submitOneAnswer(user, submittedAttemptId, question.getId(), option.getId());

        Long otherAttemptId = startAttempt(otherUser, quiz.getId());
        submitOneAnswer(otherUser, otherAttemptId, question.getId(), option.getId());

        mockMvc.perform(get("/api/attempts/me")
                        .header("Authorization", bearer(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].attemptId").isArray())
                .andExpect(jsonPath("$[0].quizId").value(quiz.getId().intValue()));
    }

    private Long startAttempt(User user, Long quizId) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/attempts")
                        .header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new StartAttemptRequest(quizId))))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("attemptId").asLong();
    }

    private void submitOneAnswer(User user, Long attemptId, Long questionId, Long optionId) throws Exception {
        SubmitAttemptRequest request = new SubmitAttemptRequest(List.of(new SubmitAnswerRequest(questionId, optionId)));
        mockMvc.perform(post("/api/attempts/{id}/submit", attemptId)
                        .header("Authorization", bearer(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    private User createUser() {
        User user = new User();
        user.setEmail("attempt-test-" + System.nanoTime() + "@example.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole(UserRole.USER);
        User savedUser = userRepository.save(user);
        createdUsers.add(savedUser);
        return savedUser;
    }

    private Category createCategory() {
        Category category = new Category();
        category.setName("Attempt Category " + System.nanoTime());
        category.setSlug("attempt-category-" + System.nanoTime());
        Category savedCategory = categoryRepository.save(category);
        createdCategories.add(savedCategory);
        return savedCategory;
    }

    private Quiz createQuiz(boolean published) {
        Quiz quiz = new Quiz();
        quiz.setCategory(createCategory());
        quiz.setTitle("Attempt Quiz " + System.nanoTime());
        quiz.setDescription("Attempt quiz description");
        quiz.setTimeLimitMinutes(15);
        quiz.setPublished(published);
        Quiz savedQuiz = quizRepository.save(quiz);
        createdQuizzes.add(savedQuiz);
        return savedQuiz;
    }

    private Question createQuestionWithOptions(Quiz quiz, int displayOrder) {
        Question question = new Question();
        question.setQuiz(quiz);
        question.setContent("Question " + displayOrder);
        question.setExplanation("Explanation " + displayOrder);
        question.setDisplayOrder(displayOrder);
        Question savedQuestion = questionRepository.save(question);
        createdQuestions.add(savedQuestion);

        createOption(savedQuestion, "Option B", false, 2);
        createOption(savedQuestion, "Option A", true, 1);
        return savedQuestion;
    }

    private void createOption(Question question, String content, boolean correct, int displayOrder) {
        Option option = new Option();
        option.setQuestion(question);
        option.setContent(content);
        option.setCorrect(correct);
        option.setDisplayOrder(displayOrder);
        createdOptions.add(optionRepository.save(option));
    }

    private String bearer(User user) {
        return "Bearer " + jwtService.generateToken(user);
    }
}
