package com.quizmaster.quiz;

import com.quizmaster.common.NotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;

    @Transactional(readOnly = true)
    public List<QuizSummaryResponse> getPublishedQuizzes(Long categoryId) {
        List<Quiz> quizzes = categoryId == null
                ? quizRepository.findByPublishedTrue()
                : quizRepository.findByCategoryIdAndPublishedTrue(categoryId);

        return quizzes.stream()
                .map(quiz -> QuizSummaryResponse.from(quiz, questionRepository.countByQuizId(quiz.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public QuizDetailResponse getPublishedQuiz(Long id) {
        Quiz quiz = quizRepository.findByIdAndPublishedTrue(id)
                .orElseThrow(() -> new NotFoundException("Quiz not found"));

        return QuizDetailResponse.from(quiz, questionRepository.countByQuizId(quiz.getId()));
    }
}
