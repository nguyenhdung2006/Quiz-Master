package com.quizmaster.quiz;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminQuizController {

    private final AdminQuizService adminQuizService;

    @GetMapping("/quizzes")
    public List<AdminQuizResponse> getQuizzes() {
        return adminQuizService.getQuizzes();
    }

    @GetMapping("/quizzes/{id}")
    public AdminQuizDetailResponse getQuiz(@PathVariable Long id) {
        return adminQuizService.getQuiz(id);
    }

    @PostMapping("/quizzes")
    public ResponseEntity<AdminQuizResponse> createQuiz(@Valid @RequestBody AdminQuizRequest request) {
        AdminQuizResponse response = adminQuizService.createQuiz(request);
        return ResponseEntity.created(URI.create("/api/admin/quizzes/" + response.id())).body(response);
    }

    @PutMapping("/quizzes/{id}")
    public AdminQuizResponse updateQuiz(
            @PathVariable Long id,
            @Valid @RequestBody AdminQuizRequest request
    ) {
        return adminQuizService.updateQuiz(id, request);
    }

    @DeleteMapping("/quizzes/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        adminQuizService.deleteQuiz(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/quizzes/{id}/publish")
    public AdminQuizResponse publishQuiz(@PathVariable Long id) {
        return adminQuizService.publishQuiz(id);
    }

    @PatchMapping("/quizzes/{id}/unpublish")
    public AdminQuizResponse unpublishQuiz(@PathVariable Long id) {
        return adminQuizService.unpublishQuiz(id);
    }

    @PostMapping("/quizzes/{quizId}/questions")
    public ResponseEntity<AdminQuestionResponse> createQuestion(
            @PathVariable Long quizId,
            @Valid @RequestBody AdminQuestionRequest request
    ) {
        AdminQuestionResponse response = adminQuizService.createQuestion(quizId, request);
        return ResponseEntity.created(URI.create("/api/admin/questions/" + response.id())).body(response);
    }

    @PutMapping("/questions/{questionId}")
    public AdminQuestionResponse updateQuestion(
            @PathVariable Long questionId,
            @Valid @RequestBody AdminQuestionRequest request
    ) {
        return adminQuizService.updateQuestion(questionId, request);
    }

    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long questionId) {
        adminQuizService.deleteQuestion(questionId);
        return ResponseEntity.noContent().build();
    }
}
