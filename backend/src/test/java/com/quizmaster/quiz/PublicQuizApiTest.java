package com.quizmaster.quiz;

import com.quizmaster.category.Category;
import com.quizmaster.category.CategoryRepository;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PublicQuizApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    private final List<Question> createdQuestions = new ArrayList<>();
    private final List<Quiz> createdQuizzes = new ArrayList<>();
    private final List<Category> createdCategories = new ArrayList<>();

    @AfterEach
    void cleanup() {
        questionRepository.deleteAll(createdQuestions);
        quizRepository.deleteAll(createdQuizzes);
        categoryRepository.deleteAll(createdCategories);
        createdQuestions.clear();
        createdQuizzes.clear();
        createdCategories.clear();
    }

    @Test
    void categoriesArePublic() throws Exception {
        Category category = createCategory("Java " + uniqueSuffix(), "java-" + uniqueSuffix());

        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", hasItem(category.getId().intValue())))
                .andExpect(jsonPath("$[*].name", hasItem(category.getName())))
                .andExpect(jsonPath("$[*].slug", hasItem(category.getSlug())));
    }

    @Test
    void quizzesArePublicAndOnlyReturnPublishedQuizzes() throws Exception {
        Category category = createCategory("Spring " + uniqueSuffix(), "spring-" + uniqueSuffix());
        Quiz publishedQuiz = createQuiz(category, "Published Quiz " + uniqueSuffix(), true);
        Quiz unpublishedQuiz = createQuiz(category, "Unpublished Quiz " + uniqueSuffix(), false);

        mockMvc.perform(get("/api/quizzes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", hasItem(publishedQuiz.getId().intValue())))
                .andExpect(jsonPath("$[*].id", not(hasItem(unpublishedQuiz.getId().intValue()))));
    }

    @Test
    void quizzesCanBeFilteredByCategory() throws Exception {
        Category includedCategory = createCategory("SQL " + uniqueSuffix(), "sql-" + uniqueSuffix());
        Category otherCategory = createCategory("Networking " + uniqueSuffix(), "networking-" + uniqueSuffix());
        Quiz includedQuiz = createQuiz(includedCategory, "SQL Quiz " + uniqueSuffix(), true);
        Quiz otherQuiz = createQuiz(otherCategory, "Network Quiz " + uniqueSuffix(), true);

        mockMvc.perform(get("/api/quizzes").param("categoryId", includedCategory.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", hasItem(includedQuiz.getId().intValue())))
                .andExpect(jsonPath("$[*].id", not(hasItem(otherQuiz.getId().intValue()))));
    }

    @Test
    void publishedQuizDetailIsPublicAndMetadataOnly() throws Exception {
        Category category = createCategory("Software " + uniqueSuffix(), "software-" + uniqueSuffix());
        Quiz quiz = createQuiz(category, "Design Quiz " + uniqueSuffix(), true);
        createQuestion(quiz, "Question with hidden explanation", "Hidden explanation", 1);

        MvcResult result = mockMvc.perform(get("/api/quizzes/{id}", quiz.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(quiz.getId().intValue()))
                .andExpect(jsonPath("$.title").value(quiz.getTitle()))
                .andExpect(jsonPath("$.category.id").value(category.getId().intValue()))
                .andExpect(jsonPath("$.questionCount").value(1))
                .andExpect(jsonPath("$.published").value(true))
                .andReturn();

        String body = result.getResponse().getContentAsString();
        assertThat(body).doesNotContain("correct");
        assertThat(body).doesNotContain("isCorrect");
        assertThat(body).doesNotContain("correctAnswer");
        assertThat(body).doesNotContain("explanation");
        assertThat(body).doesNotContain("Hidden explanation");
    }

    @Test
    void unpublishedQuizDetailReturnsNotFound() throws Exception {
        Category category = createCategory("English " + uniqueSuffix(), "english-" + uniqueSuffix());
        Quiz quiz = createQuiz(category, "Draft Quiz " + uniqueSuffix(), false);

        mockMvc.perform(get("/api/quizzes/{id}", quiz.getId()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Quiz not found"));
    }

    private Category createCategory(String name, String slug) {
        Category category = new Category();
        category.setName(name);
        category.setSlug(slug);
        Category savedCategory = categoryRepository.save(category);
        createdCategories.add(savedCategory);
        return savedCategory;
    }

    private Quiz createQuiz(Category category, String title, boolean published) {
        Quiz quiz = new Quiz();
        quiz.setCategory(category);
        quiz.setTitle(title);
        quiz.setDescription("Description for " + title);
        quiz.setTimeLimitMinutes(20);
        quiz.setPublished(published);
        Quiz savedQuiz = quizRepository.save(quiz);
        createdQuizzes.add(savedQuiz);
        return savedQuiz;
    }

    private Question createQuestion(
            Quiz quiz,
            String content,
            String explanation,
            int displayOrder
    ) {
        Question question = new Question();
        question.setQuiz(quiz);
        question.setContent(content);
        question.setExplanation(explanation);
        question.setDisplayOrder(displayOrder);
        Question savedQuestion = questionRepository.save(question);
        createdQuestions.add(savedQuestion);
        return savedQuestion;
    }

    private String uniqueSuffix() {
        return Long.toString(System.nanoTime());
    }
}
