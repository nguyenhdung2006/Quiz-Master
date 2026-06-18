package com.quizmaster.attempt;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttemptAnswerRepository extends JpaRepository<AttemptAnswer, Long> {

    List<AttemptAnswer> findByAttemptId(Long attemptId);

    List<AttemptAnswer> findByAttemptIdAndQuestionIdIn(Long attemptId, List<Long> questionIds);
}
