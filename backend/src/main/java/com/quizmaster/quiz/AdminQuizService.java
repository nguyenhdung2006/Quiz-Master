package com.quizmaster.quiz;

import com.quizmaster.attempt.AttemptRepository;
import com.quizmaster.category.Category;
import com.quizmaster.category.CategoryRepository;
import com.quizmaster.common.BadRequestException;
import com.quizmaster.common.NotFoundException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminQuizService {

    private final CategoryRepository categoryRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final AttemptRepository attemptRepository;

    @Transactional(readOnly = true)
    public List<AdminQuizResponse> getQuizzes() {
        return quizRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(quiz -> AdminQuizResponse.from(quiz, questionRepository.countByQuizId(quiz.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminQuizDetailResponse getQuiz(Long id) {
        Quiz quiz = findQuiz(id);
        return toDetailResponse(quiz);
    }

    @Transactional
    public AdminQuizResponse createQuiz(AdminQuizRequest request) {
        Category category = findCategory(request.categoryId());

        Quiz quiz = new Quiz();
        quiz.setCategory(category);
        quiz.setTitle(request.title().trim());
        quiz.setDescription(request.description());
        quiz.setTimeLimitMinutes(request.timeLimitMinutes());
        quiz.setPublished(false);

        return AdminQuizResponse.from(quizRepository.save(quiz), 0);
    }

    @Transactional
    public AdminQuizResponse updateQuiz(Long id, AdminQuizRequest request) {
        Quiz quiz = findQuiz(id);
        Category category = findCategory(request.categoryId());

        quiz.setCategory(category);
        quiz.setTitle(request.title().trim());
        quiz.setDescription(request.description());
        quiz.setTimeLimitMinutes(request.timeLimitMinutes());

        Quiz savedQuiz = quizRepository.save(quiz);
        return AdminQuizResponse.from(savedQuiz, questionRepository.countByQuizId(savedQuiz.getId()));
    }

    @Transactional
    public void deleteQuiz(Long id) {
        Quiz quiz = findQuiz(id);
        if (attemptRepository.existsByQuizId(id)) {
            throw new BadRequestException("Cannot delete quiz that has attempts");
        }

        List<Question> questions = questionRepository.findByQuizIdOrderByDisplayOrderAsc(id);
        for (Question question : questions) {
            optionRepository.deleteAll(optionRepository.findByQuestionIdOrderByDisplayOrderAsc(question.getId()));
        }
        questionRepository.deleteAll(questions);
        quizRepository.delete(quiz);
    }

    @Transactional
    public AdminQuizResponse publishQuiz(Long id) {
        Quiz quiz = findQuiz(id);
        validateQuizCanBePublished(quiz);

        quiz.setPublished(true);
        Quiz savedQuiz = quizRepository.save(quiz);
        return AdminQuizResponse.from(savedQuiz, questionRepository.countByQuizId(savedQuiz.getId()));
    }

    @Transactional
    public AdminQuizResponse unpublishQuiz(Long id) {
        Quiz quiz = findQuiz(id);
        quiz.setPublished(false);

        Quiz savedQuiz = quizRepository.save(quiz);
        return AdminQuizResponse.from(savedQuiz, questionRepository.countByQuizId(savedQuiz.getId()));
    }

    @Transactional
    public AdminQuestionResponse createQuestion(Long quizId, AdminQuestionRequest request) {
        Quiz quiz = findQuiz(quizId);
        validateStructuralEditAllowed(quiz);
        validateQuestionRequest(request, null, quizId);

        Question question = new Question();
        question.setQuiz(quiz);
        applyQuestionRequest(question, request);

        Question savedQuestion = questionRepository.save(question);
        List<Option> savedOptions = optionRepository.saveAll(toOptions(savedQuestion, request.options()));
        return AdminQuestionResponse.from(savedQuestion, savedOptions);
    }

    @Transactional
    public AdminQuestionResponse updateQuestion(Long questionId, AdminQuestionRequest request) {
        Question question = findQuestion(questionId);
        Quiz quiz = question.getQuiz();
        validateStructuralEditAllowed(quiz);
        validateQuestionRequest(request, questionId, quiz.getId());

        applyQuestionRequest(question, request);
        Question savedQuestion = questionRepository.save(question);

        List<Option> existingOptions = optionRepository.findByQuestionIdOrderByDisplayOrderAsc(savedQuestion.getId());
        optionRepository.deleteAll(existingOptions);

        List<Option> savedOptions = optionRepository.saveAll(toOptions(savedQuestion, request.options()));
        return AdminQuestionResponse.from(savedQuestion, savedOptions);
    }

    @Transactional
    public void deleteQuestion(Long questionId) {
        Question question = findQuestion(questionId);
        validateStructuralEditAllowed(question.getQuiz());

        optionRepository.deleteAll(optionRepository.findByQuestionIdOrderByDisplayOrderAsc(questionId));
        questionRepository.delete(question);
    }

    private AdminQuizDetailResponse toDetailResponse(Quiz quiz) {
        List<Question> questions = questionRepository.findByQuizIdOrderByDisplayOrderAsc(quiz.getId());
        Map<Long, List<Option>> optionsByQuestionId = loadOptionsByQuestionId(questions);

        List<AdminQuestionResponse> questionResponses = questions.stream()
                .map(question -> AdminQuestionResponse.from(
                        question,
                        optionsByQuestionId.getOrDefault(question.getId(), List.of())
                ))
                .toList();

        return AdminQuizDetailResponse.from(
                quiz,
                questionResponses,
                attemptRepository.existsByQuizId(quiz.getId())
        );
    }

    private Category findCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found"));
    }

    private Quiz findQuiz(Long id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Quiz not found"));
    }

    private Question findQuestion(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Question not found"));
    }

    private void validateStructuralEditAllowed(Quiz quiz) {
        if (quiz.isPublished()) {
            throw new BadRequestException("Unpublish quiz before editing questions");
        }

        if (attemptRepository.existsByQuizId(quiz.getId())) {
            throw new BadRequestException("Cannot edit quiz questions after attempts exist");
        }
    }

    private void validateQuestionRequest(AdminQuestionRequest request, Long currentQuestionId, Long quizId) {
        validateSingleCorrectOption(request.options());
        validateUniqueOptionDisplayOrders(request.options());

        questionRepository.findByQuizIdOrderByDisplayOrderAsc(quizId)
                .stream()
                .filter(question -> question.getDisplayOrder().equals(request.displayOrder()))
                .filter(question -> !question.getId().equals(currentQuestionId))
                .findFirst()
                .ifPresent(question -> {
                    throw new BadRequestException("Question display order already exists");
                });
    }

    private void validateSingleCorrectOption(List<AdminOptionRequest> options) {
        long correctCount = options.stream()
                .filter(option -> Boolean.TRUE.equals(option.correct()))
                .count();

        if (correctCount != 1) {
            throw new BadRequestException("Each question must have exactly one correct option");
        }
    }

    private void validateUniqueOptionDisplayOrders(List<AdminOptionRequest> options) {
        Set<Integer> displayOrders = new HashSet<>();
        for (AdminOptionRequest option : options) {
            if (!displayOrders.add(option.displayOrder())) {
                throw new BadRequestException("Option display order must be unique within a question");
            }
        }
    }

    private void validateQuizCanBePublished(Quiz quiz) {
        if (isBlank(quiz.getTitle())) {
            throw new BadRequestException("Quiz title is required");
        }

        List<Question> questions = questionRepository.findByQuizIdOrderByDisplayOrderAsc(quiz.getId());
        if (questions.isEmpty()) {
            throw new BadRequestException("Quiz must have at least one question");
        }

        Map<Long, List<Option>> optionsByQuestionId = loadOptionsByQuestionId(questions);
        Set<Integer> questionDisplayOrders = new HashSet<>();

        for (Question question : questions) {
            if (isBlank(question.getContent())) {
                throw new BadRequestException("Question content is required");
            }

            if (question.getDisplayOrder() == null || question.getDisplayOrder() <= 0) {
                throw new BadRequestException("Question display order must be positive");
            }

            if (!questionDisplayOrders.add(question.getDisplayOrder())) {
                throw new BadRequestException("Question display order must be unique within a quiz");
            }

            validateOptionsCanBePublished(optionsByQuestionId.getOrDefault(question.getId(), List.of()));
        }
    }

    private void validateOptionsCanBePublished(List<Option> options) {
        if (options.size() < 2) {
            throw new BadRequestException("Each question must have at least two options");
        }

        long correctCount = 0;
        Set<Integer> optionDisplayOrders = new HashSet<>();

        for (Option option : options) {
            if (isBlank(option.getContent())) {
                throw new BadRequestException("Option content is required");
            }

            if (option.getDisplayOrder() == null || option.getDisplayOrder() <= 0) {
                throw new BadRequestException("Option display order must be positive");
            }

            if (!optionDisplayOrders.add(option.getDisplayOrder())) {
                throw new BadRequestException("Option display order must be unique within a question");
            }

            if (Boolean.TRUE.equals(option.getCorrect())) {
                correctCount++;
            }
        }

        if (correctCount != 1) {
            throw new BadRequestException("Each question must have exactly one correct option");
        }
    }

    private void applyQuestionRequest(Question question, AdminQuestionRequest request) {
        question.setContent(request.content().trim());
        question.setExplanation(request.explanation());
        question.setDisplayOrder(request.displayOrder());
    }

    private List<Option> toOptions(Question question, List<AdminOptionRequest> optionRequests) {
        List<Option> options = new ArrayList<>();
        for (AdminOptionRequest optionRequest : optionRequests) {
            Option option = new Option();
            option.setQuestion(question);
            option.setContent(optionRequest.content().trim());
            option.setCorrect(optionRequest.correct());
            option.setDisplayOrder(optionRequest.displayOrder());
            options.add(option);
        }
        return options;
    }

    private Map<Long, List<Option>> loadOptionsByQuestionId(List<Question> questions) {
        List<Long> questionIds = questions.stream()
                .map(Question::getId)
                .toList();

        if (questionIds.isEmpty()) {
            return Map.of();
        }

        return optionRepository.findByQuestionIdInOrderByQuestionIdAscDisplayOrderAsc(questionIds)
                .stream()
                .collect(Collectors.groupingBy(option -> option.getQuestion().getId()));
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
