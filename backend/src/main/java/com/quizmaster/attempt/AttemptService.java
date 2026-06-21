package com.quizmaster.attempt;

import com.quizmaster.common.BadRequestException;
import com.quizmaster.common.NotFoundException;
import com.quizmaster.quiz.Option;
import com.quizmaster.quiz.OptionRepository;
import com.quizmaster.quiz.Question;
import com.quizmaster.quiz.QuestionRepository;
import com.quizmaster.quiz.Quiz;
import com.quizmaster.quiz.QuizRepository;
import com.quizmaster.user.User;
import com.quizmaster.user.UserRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AttemptService {

    private final AttemptRepository attemptRepository;
    private final AttemptAnswerRepository attemptAnswerRepository;
    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;

    @Transactional
    public StartAttemptResponse startAttempt(StartAttemptRequest request, String userEmail) {
        User user = findUser(userEmail);
        Quiz quiz = quizRepository.findByIdAndPublishedTrue(request.quizId())
                .orElseThrow(() -> new NotFoundException("Quiz not found"));

        List<Question> questions = questionRepository.findByQuizIdOrderByDisplayOrderAsc(quiz.getId());
        Map<Long, List<Option>> optionsByQuestionId = loadOptionsByQuestionId(questions);
        validateQuizCanBeStarted(questions, optionsByQuestionId);

        Attempt attempt = new Attempt();
        attempt.setUser(user);
        attempt.setQuiz(quiz);
        attempt.setStartedAt(LocalDateTime.now());
        Attempt savedAttempt = attemptRepository.save(attempt);

        List<StartAttemptQuestionResponse> questionResponses = questions.stream()
                .map(question -> StartAttemptQuestionResponse.from(
                        question,
                        optionsByQuestionId.get(question.getId())
                                .stream()
                                .map(StartAttemptOptionResponse::from)
                                .toList()
                ))
                .toList();

        return new StartAttemptResponse(
                savedAttempt.getId(),
                quiz.getId(),
                quiz.getTitle(),
                quiz.getTimeLimitMinutes(),
                questionResponses
        );
    }

    @Transactional
    public SubmitAttemptResponse submitAttempt(
            Long attemptId,
            SubmitAttemptRequest request,
            String userEmail
    ) {
        User user = findUser(userEmail);
        Attempt attempt = findAttemptForUser(attemptId, user.getId());

        if (attempt.getSubmittedAt() != null) {
            throw new BadRequestException("Attempt has already been submitted");
        }

        Quiz quiz = attempt.getQuiz();
        List<Question> questions = questionRepository.findByQuizIdOrderByDisplayOrderAsc(quiz.getId());
        Map<Long, List<Option>> optionsByQuestionId = loadOptionsByQuestionId(questions);
        validateQuizCanBeStarted(questions, optionsByQuestionId);

        Map<Long, Question> questionById = mapQuestionsById(questions);
        Map<Long, Option> selectedOptionsByQuestionId = validateAndMapSubmittedAnswers(
                request.answers(),
                questionById,
                optionsByQuestionId
        );

        List<AttemptAnswer> attemptAnswers = new ArrayList<>();
        int correctCount = 0;

        for (Question question : questions) {
            Option selectedOption = selectedOptionsByQuestionId.get(question.getId());

            if (selectedOption == null) {
                continue;
            }

            AttemptAnswer attemptAnswer = new AttemptAnswer();
            attemptAnswer.setAttempt(attempt);
            attemptAnswer.setQuestion(question);
            attemptAnswer.setOption(selectedOption);
            attemptAnswers.add(attemptAnswer);

            if (Boolean.TRUE.equals(selectedOption.getCorrect())) {
                correctCount++;
            }
        }

        attemptAnswerRepository.saveAll(attemptAnswers);

        int totalQuestions = questions.size();
        int scorePercentage = Math.round((correctCount * 100.0f) / totalQuestions);

        attempt.setCorrectCount(correctCount);
        attempt.setTotalQuestions(totalQuestions);
        attempt.setScorePercentage(scorePercentage);
        attempt.setSubmittedAt(LocalDateTime.now());

        Attempt savedAttempt = attemptRepository.save(attempt);
        return SubmitAttemptResponse.from(savedAttempt);
    }

    @Transactional(readOnly = true)
    public AttemptResultResponse getResult(Long attemptId, String userEmail) {
        User user = findUser(userEmail);
        Attempt attempt = findAttemptForUser(attemptId, user.getId());

        if (attempt.getSubmittedAt() == null) {
            throw new BadRequestException("Attempt has not been submitted");
        }

        List<Question> questions = questionRepository.findByQuizIdOrderByDisplayOrderAsc(attempt.getQuiz().getId());
        Map<Long, List<Option>> optionsByQuestionId = loadOptionsByQuestionId(questions);
        Map<Long, AttemptAnswer> answerByQuestionId = loadAnswersByQuestionId(attempt.getId(), questions);

        List<AttemptReviewQuestionResponse> reviewQuestions = questions.stream()
                .map(question -> toReviewQuestion(question, optionsByQuestionId, answerByQuestionId))
                .toList();

        return new AttemptResultResponse(
                attempt.getId(),
                attempt.getQuiz().getId(),
                attempt.getQuiz().getTitle(),
                attempt.getCorrectCount(),
                attempt.getTotalQuestions(),
                attempt.getScorePercentage(),
                attempt.getStartedAt(),
                attempt.getSubmittedAt(),
                reviewQuestions
        );
    }

    @Transactional(readOnly = true)
    public TakeAttemptResponse getTakeAttempt(Long attemptId, String userEmail) {
        User user = findUser(userEmail);
        Attempt attempt = findAttemptForUser(attemptId, user.getId());
        Quiz quiz = attempt.getQuiz();

        if (attempt.getSubmittedAt() != null) {
            return new TakeAttemptResponse(
                    attempt.getId(),
                    quiz.getId(),
                    quiz.getTitle(),
                    quiz.getTimeLimitMinutes(),
                    true,
                    attempt.getSubmittedAt(),
                    List.of()
            );
        }

        List<Question> questions = questionRepository.findByQuizIdOrderByDisplayOrderAsc(quiz.getId());
        Map<Long, List<Option>> optionsByQuestionId = loadOptionsByQuestionId(questions);
        validateQuizCanBeStarted(questions, optionsByQuestionId);

        List<StartAttemptQuestionResponse> questionResponses = questions.stream()
                .map(question -> StartAttemptQuestionResponse.from(
                        question,
                        optionsByQuestionId.get(question.getId())
                                .stream()
                                .map(StartAttemptOptionResponse::from)
                                .toList()
                ))
                .toList();

        return new TakeAttemptResponse(
                attempt.getId(),
                quiz.getId(),
                quiz.getTitle(),
                quiz.getTimeLimitMinutes(),
                false,
                null,
                questionResponses
        );
    }

    @Transactional(readOnly = true)
    public List<AttemptHistoryResponse> getMyAttempts(String userEmail) {
        User user = findUser(userEmail);
        return attemptRepository.findByUserIdOrderByStartedAtDesc(user.getId())
                .stream()
                .map(AttemptHistoryResponse::from)
                .toList();
    }

    private User findUser(String userEmail) {
        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private Attempt findAttemptForUser(Long attemptId, Long userId) {
        return attemptRepository.findByIdAndUserId(attemptId, userId)
                .orElseThrow(() -> new NotFoundException("Attempt not found"));
    }

    private void validateQuizCanBeStarted(
            List<Question> questions,
            Map<Long, List<Option>> optionsByQuestionId
    ) {
        if (questions.isEmpty()) {
            throw new BadRequestException("Quiz must have at least one question");
        }

        for (Question question : questions) {
            List<Option> options = optionsByQuestionId.getOrDefault(question.getId(), List.of());
            if (options.size() < 2) {
                throw new BadRequestException("Each question must have at least two options");
            }
        }
    }

    private Map<Long, List<Option>> loadOptionsByQuestionId(List<Question> questions) {
        List<Long> questionIds = questions.stream()
                .map(Question::getId)
                .toList();

        if (questionIds.isEmpty()) {
            return Map.of();
        }

        Map<Long, List<Option>> optionsByQuestionId = new LinkedHashMap<>();
        for (Question question : questions) {
            optionsByQuestionId.put(question.getId(), new ArrayList<>());
        }

        optionRepository.findByQuestionIdInOrderByQuestionIdAscDisplayOrderAsc(questionIds)
                .forEach(option -> optionsByQuestionId.get(option.getQuestion().getId()).add(option));

        return optionsByQuestionId;
    }

    private Map<Long, Question> mapQuestionsById(List<Question> questions) {
        Map<Long, Question> questionById = new HashMap<>();
        questions.forEach(question -> questionById.put(question.getId(), question));
        return questionById;
    }

    private Map<Long, Option> validateAndMapSubmittedAnswers(
            List<SubmitAnswerRequest> answers,
            Map<Long, Question> questionById,
            Map<Long, List<Option>> optionsByQuestionId
    ) {
        Map<Long, Option> selectedOptionsByQuestionId = new HashMap<>();
        Set<Long> answeredQuestionIds = new HashSet<>();

        for (SubmitAnswerRequest answer : answers) {
            Question question = questionById.get(answer.questionId());
            if (question == null) {
                throw new BadRequestException("Question does not belong to this quiz");
            }

            if (!answeredQuestionIds.add(answer.questionId())) {
                throw new BadRequestException("Duplicate answer for question");
            }

            Option selectedOption = optionsByQuestionId.getOrDefault(answer.questionId(), List.of())
                    .stream()
                    .filter(option -> option.getId().equals(answer.optionId()))
                    .findFirst()
                    .orElseThrow(() -> new BadRequestException("Option does not belong to question"));

            selectedOptionsByQuestionId.put(answer.questionId(), selectedOption);
        }

        return selectedOptionsByQuestionId;
    }

    private Map<Long, AttemptAnswer> loadAnswersByQuestionId(Long attemptId, List<Question> questions) {
        List<Long> questionIds = questions.stream()
                .map(Question::getId)
                .toList();

        if (questionIds.isEmpty()) {
            return Map.of();
        }

        Map<Long, AttemptAnswer> answerByQuestionId = new HashMap<>();
        attemptAnswerRepository.findByAttemptIdAndQuestionIdIn(attemptId, questionIds)
                .forEach(answer -> answerByQuestionId.put(answer.getQuestion().getId(), answer));
        return answerByQuestionId;
    }

    private AttemptReviewQuestionResponse toReviewQuestion(
            Question question,
            Map<Long, List<Option>> optionsByQuestionId,
            Map<Long, AttemptAnswer> answerByQuestionId
    ) {
        List<Option> options = optionsByQuestionId.get(question.getId());
        Long selectedOptionId = null;
        AttemptAnswer attemptAnswer = answerByQuestionId.get(question.getId());
        if (attemptAnswer != null) {
            selectedOptionId = attemptAnswer.getOption().getId();
        }

        Long correctOptionId = options.stream()
                .filter(option -> Boolean.TRUE.equals(option.getCorrect()))
                .map(Option::getId)
                .findFirst()
                .orElse(null);

        Long finalSelectedOptionId = selectedOptionId;
        List<AttemptReviewOptionResponse> optionResponses = options.stream()
                .map(option -> AttemptReviewOptionResponse.from(option, finalSelectedOptionId))
                .toList();

        return AttemptReviewQuestionResponse.from(
                question,
                selectedOptionId,
                correctOptionId,
                optionResponses
        );
    }
}
