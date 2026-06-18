package com.quizmaster.attempt;

import com.quizmaster.quiz.Question;
import java.util.List;

public record AttemptReviewQuestionResponse(
        Long questionId,
        String content,
        String explanation,
        Long selectedOptionId,
        Long correctOptionId,
        boolean correct,
        List<AttemptReviewOptionResponse> options
) {
    public static AttemptReviewQuestionResponse from(
            Question question,
            Long selectedOptionId,
            Long correctOptionId,
            List<AttemptReviewOptionResponse> options
    ) {
        return new AttemptReviewQuestionResponse(
                question.getId(),
                question.getContent(),
                question.getExplanation(),
                selectedOptionId,
                correctOptionId,
                selectedOptionId != null && selectedOptionId.equals(correctOptionId),
                options
        );
    }
}
