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
import java.util.List;
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
    void seedsExpectedDemoData() {
        AtomicLong ids = new AtomicLong(1);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password123")).thenReturn("hashed-demo-password");
        when(categoryRepository.findBySlug(anyString())).thenReturn(Optional.empty());
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> {
            Category category = invocation.getArgument(0);
            category.setId(ids.getAndIncrement());
            return category;
        });
        when(quizRepository.findByTitleAndCategoryId(anyString(), anyLong())).thenReturn(Optional.empty());
        when(quizRepository.save(any(Quiz.class))).thenAnswer(invocation -> {
            Quiz quiz = invocation.getArgument(0);
            quiz.setId(ids.getAndIncrement());
            return quiz;
        });
        when(questionRepository.save(any(Question.class))).thenAnswer(invocation -> {
            Question question = invocation.getArgument(0);
            question.setId(ids.getAndIncrement());
            return question;
        });
        when(optionRepository.saveAll(anyList())).thenAnswer(invocation -> {
            List<Option> options = invocation.getArgument(0);
            assertThat(options).hasSize(4);
            assertThat(options).extracting(Option::getDisplayOrder).containsExactly(1, 2, 3, 4);
            assertThat(options).filteredOn(Option::getCorrect).hasSize(1);
            return options;
        });

        seeder.run();

        verify(userRepository, org.mockito.Mockito.times(3)).save(any(User.class));
        verify(passwordEncoder, org.mockito.Mockito.times(3)).encode("password123");
        verify(categoryRepository, org.mockito.Mockito.times(6)).save(any(Category.class));
        verify(quizRepository, org.mockito.Mockito.times(2)).save(any(Quiz.class));
        verify(questionRepository, org.mockito.Mockito.times(16)).save(any(Question.class));
        verify(optionRepository, org.mockito.Mockito.times(16)).saveAll(anyList());
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
}
