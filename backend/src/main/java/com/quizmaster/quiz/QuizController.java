package com.quizmaster.quiz;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @GetMapping
    public List<QuizSummaryResponse> getQuizzes(
            @RequestParam(required = false) Long categoryId
    ) {
        return quizService.getPublishedQuizzes(categoryId);
    }

    @GetMapping("/{id}")
    public QuizDetailResponse getQuiz(@PathVariable Long id) {
        return quizService.getPublishedQuiz(id);
    }
}
