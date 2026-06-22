package com.quizmaster.demo;

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
            savedOptionBatches.add(options);
            return options;
        });

        seeder.run();

        assertThat(usersByEmail).hasSize(3);
        assertThat(categoriesBySlug).hasSize(6);
        assertThat(quizzesByTitleAndCategory).hasSize(4);
        assertThat(savedQuestions).hasSize(19);
        assertThat(savedOptionBatches).hasSize(19);

        Quiz javaCoreBasics = findQuiz(quizzesByTitleAndCategory, "Java Core Basics");
        Quiz springBootEssentials = findQuiz(quizzesByTitleAndCategory, "Spring Boot Essentials");
        Quiz practiceDraft = findQuiz(quizzesByTitleAndCategory, "Draft — Spring Security Practice");
        Quiz emptyDraft = findQuiz(
                quizzesByTitleAndCategory,
                "Draft — Empty Quiz For Publish Validation"
        );

        assertThat(javaCoreBasics.isPublished()).isTrue();
        assertThat(springBootEssentials.isPublished()).isTrue();
        assertThat(practiceDraft.isPublished()).isFalse();
        assertThat(practiceDraft.getCategory().getSlug()).isEqualTo("spring-boot");
        assertThat(emptyDraft.isPublished()).isFalse();
        assertThat(emptyDraft.getCategory().getSlug()).isEqualTo("java-core");

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

        seeder.run();

        verify(userRepository, times(3)).save(any(User.class));
        verify(passwordEncoder, times(3)).encode("password123");
        verify(categoryRepository, times(6)).save(any(Category.class));
        verify(quizRepository, times(4)).save(any(Quiz.class));
        verify(questionRepository, times(19)).save(any(Question.class));
        verify(optionRepository, times(19)).saveAll(anyList());
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
        when(quizRepository.findByTitleAndCategoryId(anyString(), anyLong()))
                .thenReturn(Optional.of(existingQuiz));

        seeder.run();

        verify(userRepository, never()).save(any(User.class));
        verify(passwordEncoder, never()).encode(anyString());
        verify(categoryRepository, never()).save(any(Category.class));
        verify(quizRepository, never()).save(any(Quiz.class));
        verify(questionRepository, never()).save(any(Question.class));
        verify(optionRepository, never()).saveAll(anyList());
    }

    private Quiz findQuiz(Map<String, Quiz> quizzesByTitleAndCategory, String title) {
        return quizzesByTitleAndCategory.values().stream()
                .filter(quiz -> quiz.getTitle().equals(title))
                .findFirst()
                .orElseThrow();
    }
}
