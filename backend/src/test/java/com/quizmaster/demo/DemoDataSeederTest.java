package com.quizmaster.demo;

import com.quizmaster.attempt.AttemptRepository;
import com.quizmaster.attempt.AttemptService;
import com.quizmaster.attempt.StartAttemptRequest;
import com.quizmaster.attempt.StartAttemptResponse;
import com.quizmaster.attempt.SubmitAttemptRequest;
import com.quizmaster.attempt.SubmitAttemptResponse;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.HashSet;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DemoDataSeederTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private QuizRepository quizRepository;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private OptionRepository optionRepository;

    @Mock
    private AttemptRepository attemptRepository;

    @Mock
    private AttemptService attemptService;

    @Mock
    private PasswordEncoder passwordEncoder;

    private DemoDataSeeder seeder;

    @BeforeEach
    void setUp() {
        seeder = new DemoDataSeeder(
                userRepository,
                categoryRepository,
                quizRepository,
                questionRepository,
                optionRepository,
                attemptRepository,
                attemptService,
                passwordEncoder
        );
    }

    @Test
    void requiresExplicitSeedProperty() {
        ConditionalOnProperty condition = DemoDataSeeder.class.getAnnotation(ConditionalOnProperty.class);

        assertThat(condition).isNotNull();
        assertThat(condition.name()).containsExactly("app.seed-demo");
        assertThat(condition.havingValue()).isEqualTo("true");
        assertThat(condition.matchIfMissing()).isFalse();
    }

    @Test
    void seedsExpectedDemoDataAndDoesNotDuplicateOnSecondRun() {
        AtomicLong ids = new AtomicLong(1);
        Map<String, User> usersByEmail = new HashMap<>();
        Map<String, Category> categoriesBySlug = new HashMap<>();
        Map<String, Quiz> quizzesByTitleAndCategory = new HashMap<>();
        List<Question> savedQuestions = new ArrayList<>();
        List<List<Option>> savedOptionBatches = new ArrayList<>();
        Map<Long, Quiz> quizByAttemptId = new HashMap<>();
        Set<Long> submittedQuizIds = new HashSet<>();
        List<SubmitAttemptRequest> submissions = new ArrayList<>();

        when(userRepository.findByEmail(anyString())).thenAnswer(invocation ->
                Optional.ofNullable(usersByEmail.get(invocation.getArgument(0))));
        when(passwordEncoder.encode("password123")).thenReturn("hashed-demo-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(ids.getAndIncrement());
            usersByEmail.put(user.getEmail(), user);
            return user;
        });
        when(categoryRepository.findBySlug(anyString())).thenAnswer(invocation ->
                Optional.ofNullable(categoriesBySlug.get(invocation.getArgument(0))));
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> {
            Category category = invocation.getArgument(0);
            category.setId(ids.getAndIncrement());
            categoriesBySlug.put(category.getSlug(), category);
            return category;
        });
        when(quizRepository.findByTitleAndCategoryId(anyString(), anyLong())).thenAnswer(invocation ->
                Optional.ofNullable(quizzesByTitleAndCategory.get(
                        invocation.getArgument(0) + "|" + invocation.getArgument(1)
                )));
        when(quizRepository.save(any(Quiz.class))).thenAnswer(invocation -> {
            Quiz quiz = invocation.getArgument(0);
            quiz.setId(ids.getAndIncrement());
            quizzesByTitleAndCategory.put(quiz.getTitle() + "|" + quiz.getCategory().getId(), quiz);
            return quiz;
        });
        when(questionRepository.save(any(Question.class))).thenAnswer(invocation -> {
            Question question = invocation.getArgument(0);
            question.setId(ids.getAndIncrement());
            savedQuestions.add(question);
            return question;
        });
        when(optionRepository.saveAll(anyList())).thenAnswer(invocation -> {
            List<Option> options = invocation.getArgument(0);
            assertThat(options).hasSize(4);
            assertThat(options).extracting(Option::getDisplayOrder).containsExactly(1, 2, 3, 4);
            assertThat(options).filteredOn(Option::getCorrect).hasSize(1);
            options.forEach(option -> option.setId(ids.getAndIncrement()));
            savedOptionBatches.add(options);
            return options;
        });
        when(questionRepository.findByQuizIdOrderByDisplayOrderAsc(anyLong())).thenAnswer(invocation ->
                savedQuestions.stream()
                        .filter(question -> question.getQuiz().getId().equals(invocation.getArgument(0)))
                        .toList());
        when(optionRepository.findByQuestionIdOrderByDisplayOrderAsc(anyLong())).thenAnswer(invocation ->
                savedOptionBatches.stream()
                        .flatMap(List::stream)
                        .filter(option -> option.getQuestion().getId().equals(invocation.getArgument(0)))
                        .toList());
        when(quizRepository.saveAndFlush(any(Quiz.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(attemptRepository.existsByUserIdAndQuizIdAndSubmittedAtIsNotNull(anyLong(), anyLong()))
                .thenAnswer(invocation -> submittedQuizIds.contains(invocation.getArgument(1)));
        when(attemptService.startAttempt(any(StartAttemptRequest.class), anyString())).thenAnswer(invocation -> {
            StartAttemptRequest request = invocation.getArgument(0);
            Quiz quiz = quizzesByTitleAndCategory.values().stream()
                    .filter(candidate -> candidate.getId().equals(request.quizId()))
                    .findFirst()
                    .orElseThrow();
            long attemptId = ids.getAndIncrement();
            quizByAttemptId.put(attemptId, quiz);
            return new StartAttemptResponse(attemptId, quiz.getId(), quiz.getTitle(), quiz.getTimeLimitMinutes(), List.of());
        });
        when(attemptService.submitAttempt(anyLong(), any(SubmitAttemptRequest.class), anyString()))
                .thenAnswer(invocation -> {
                    Long attemptId = invocation.getArgument(0);
                    SubmitAttemptRequest request = invocation.getArgument(1);
                    Quiz quiz = quizByAttemptId.get(attemptId);
                    submissions.add(request);
                    submittedQuizIds.add(quiz.getId());
                    return new SubmitAttemptResponse(
                            attemptId,
                            quiz.getId(),
                            quiz.getTitle(),
                            countCorrectAnswers(request, savedOptionBatches),
                            request.answers().size(),
                            0,
                            null,
                            null
                    );
                });

        seeder.run();

        assertThat(usersByEmail).hasSize(3);
        assertThat(categoriesBySlug).hasSize(6);
        assertThat(quizzesByTitleAndCategory).hasSize(9);
        assertThat(savedQuestions).hasSize(53);
        assertThat(savedOptionBatches).hasSize(53);
        assertThat(savedOptionBatches.stream().mapToInt(List::size).sum()).isEqualTo(212);

        Quiz javaCoreBasics = findQuiz(quizzesByTitleAndCategory, "Java Core Basics");
        Quiz springBootEssentials = findQuiz(quizzesByTitleAndCategory, "Spring Boot Essentials");
        Quiz sqlBasics = findQuiz(quizzesByTitleAndCategory, "SQL Basics");
        Quiz networkingFundamentals = findQuiz(quizzesByTitleAndCategory, "Networking Fundamentals");
        Quiz softwareEngineeringBasics = findQuiz(
                quizzesByTitleAndCategory,
                "Software Engineering Basics"
        );
        Quiz englishForItBasics = findQuiz(quizzesByTitleAndCategory, "English for IT Basics");
        Quiz practiceDraft = findQuiz(quizzesByTitleAndCategory, "Draft — Spring Security Practice");
        Quiz emptyDraft = findQuiz(
                quizzesByTitleAndCategory,
                "Draft — Empty Quiz For Publish Validation"
        );
        Quiz lockedDemoQuiz = findQuiz(quizzesByTitleAndCategory, "Locked Demo Quiz");

        assertPublicQuiz(javaCoreBasics, "java-core", 10, 8, savedQuestions, savedOptionBatches);
        assertPublicQuiz(springBootEssentials, "spring-boot", 10, 8, savedQuestions, savedOptionBatches);
        assertPublicQuiz(sqlBasics, "sql-database", 10, 8, savedQuestions, savedOptionBatches);
        assertPublicQuiz(
                networkingFundamentals,
                "computer-networking",
                10,
                8,
                savedQuestions,
                savedOptionBatches
        );
        assertPublicQuiz(
                softwareEngineeringBasics,
                "software-engineering",
                10,
                8,
                savedQuestions,
                savedOptionBatches
        );
        assertPublicQuiz(
                englishForItBasics,
                "english-for-it",
                8,
                6,
                savedQuestions,
                savedOptionBatches
        );
        assertThat(practiceDraft.isPublished()).isFalse();
        assertThat(practiceDraft.getCategory().getSlug()).isEqualTo("spring-boot");
        assertThat(emptyDraft.isPublished()).isFalse();
        assertThat(emptyDraft.getCategory().getSlug()).isEqualTo("java-core");
        assertThat(lockedDemoQuiz.isPublished()).isFalse();
        assertThat(lockedDemoQuiz.getCategory().getSlug()).isEqualTo("software-engineering");

        List<Question> practiceQuestions = savedQuestions.stream()
                .filter(question -> question.getQuiz() == practiceDraft)
                .toList();
        assertThat(practiceQuestions).hasSize(3);
        assertThat(practiceQuestions).allMatch(question -> !question.getExplanation().isBlank());
        assertThat(savedQuestions).noneMatch(question -> question.getQuiz() == emptyDraft);

        List<List<Option>> practiceOptions = savedOptionBatches.stream()
                .filter(options -> options.getFirst().getQuestion().getQuiz() == practiceDraft)
                .toList();
        assertThat(practiceOptions).hasSize(3);
        assertThat(practiceOptions).allSatisfy(options -> {
            assertThat(options).hasSize(4);
            assertThat(options).filteredOn(Option::getCorrect).hasSize(1);
        });

        List<Question> lockedQuestions = savedQuestions.stream()
                .filter(question -> question.getQuiz() == lockedDemoQuiz)
                .toList();
        assertThat(lockedQuestions).hasSize(4);
        assertThat(lockedQuestions).allMatch(question -> !question.getExplanation().isBlank());
        assertThat(submissions).hasSize(2);
        assertThat(submissions).extracting(submission -> submission.answers().size()).containsExactly(8, 4);
        assertThat(submissions).allSatisfy(submission -> {
            assertThat(submission.answers()).extracting(answer -> answer.questionId()).doesNotHaveDuplicates();
            assertThat(submission.answers()).extracting(answer -> answer.optionId()).doesNotHaveDuplicates();
        });
        assertThat(countCorrectAnswers(submissions.get(0), savedOptionBatches)).isEqualTo(7);
        assertThat(countCorrectAnswers(submissions.get(1), savedOptionBatches)).isEqualTo(2);

        seeder.run();

        verify(userRepository, times(3)).save(any(User.class));
        verify(passwordEncoder, times(3)).encode("password123");
        verify(categoryRepository, times(6)).save(any(Category.class));
        verify(quizRepository, times(9)).save(any(Quiz.class));
        verify(quizRepository, times(2)).saveAndFlush(any(Quiz.class));
        verify(questionRepository, times(53)).save(any(Question.class));
        verify(optionRepository, times(53)).saveAll(anyList());
        verify(attemptService, times(2)).startAttempt(
                any(StartAttemptRequest.class),
                org.mockito.ArgumentMatchers.eq("demo-user@quizmaster.local")
        );
        verify(attemptService, times(2)).submitAttempt(
                anyLong(),
                any(SubmitAttemptRequest.class),
                org.mockito.ArgumentMatchers.eq("demo-user@quizmaster.local")
        );
    }

    @Test
    void skipsRowsThatAlreadyExist() {
        User existingUser = new User();
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(existingUser));

        AtomicLong categoryIds = new AtomicLong(1);
        when(categoryRepository.findBySlug(anyString())).thenAnswer(invocation -> {
            Category category = new Category();
            category.setId(categoryIds.getAndIncrement());
            category.setSlug(invocation.getArgument(0));
            return Optional.of(category);
        });

        Quiz existingQuiz = new Quiz();
        existingQuiz.setId(2L);
        when(quizRepository.findByTitleAndCategoryId(anyString(), anyLong()))
                .thenReturn(Optional.of(existingQuiz));
        when(attemptRepository.existsByUserIdAndQuizIdAndSubmittedAtIsNotNull(anyLong(), anyLong()))
                .thenReturn(true);
        existingUser.setId(1L);

        seeder.run();

        verify(userRepository, never()).save(any(User.class));
        verify(passwordEncoder, never()).encode(anyString());
        verify(categoryRepository, never()).save(any(Category.class));
        verify(quizRepository, never()).save(any(Quiz.class));
        verify(questionRepository, never()).save(any(Question.class));
        verify(optionRepository, never()).saveAll(anyList());
        verify(attemptService, never()).startAttempt(any(), anyString());
        verify(attemptService, never()).submitAttempt(anyLong(), any(), anyString());
    }

    private Quiz findQuiz(Map<String, Quiz> quizzesByTitleAndCategory, String title) {
        return quizzesByTitleAndCategory.values().stream()
                .filter(quiz -> quiz.getTitle().equals(title))
                .findFirst()
                .orElseThrow();
    }

    private int countCorrectAnswers(
            SubmitAttemptRequest submission,
            List<List<Option>> savedOptionBatches
    ) {
        Set<Long> correctOptionIds = savedOptionBatches.stream()
                .flatMap(List::stream)
                .filter(option -> Boolean.TRUE.equals(option.getCorrect()))
                .map(Option::getId)
                .collect(java.util.stream.Collectors.toSet());
        return (int) submission.answers().stream()
                .filter(answer -> correctOptionIds.contains(answer.optionId()))
                .count();
    }

    private void assertPublicQuiz(
            Quiz quiz,
            String categorySlug,
            int timeLimitMinutes,
            int expectedQuestionCount,
            List<Question> savedQuestions,
            List<List<Option>> savedOptionBatches
    ) {
        assertThat(quiz.isPublished()).isTrue();
        assertThat(quiz.getCategory().getSlug()).isEqualTo(categorySlug);
        assertThat(quiz.getTimeLimitMinutes()).isEqualTo(timeLimitMinutes);

        List<Question> quizQuestions = savedQuestions.stream()
                .filter(question -> question.getQuiz() == quiz)
                .toList();
        assertThat(quizQuestions).hasSize(expectedQuestionCount);
        assertThat(quizQuestions).allMatch(question -> !question.getExplanation().isBlank());

        List<List<Option>> quizOptions = savedOptionBatches.stream()
                .filter(options -> options.getFirst().getQuestion().getQuiz() == quiz)
                .toList();
        assertThat(quizOptions).hasSize(expectedQuestionCount);
        assertThat(quizOptions).allSatisfy(options -> {
            assertThat(options).hasSize(4);
            assertThat(options).filteredOn(Option::getCorrect).hasSize(1);
        });
    }
}
