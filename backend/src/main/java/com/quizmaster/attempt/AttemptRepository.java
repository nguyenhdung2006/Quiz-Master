package com.quizmaster.attempt;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttemptRepository extends JpaRepository<Attempt, Long> {

    List<Attempt> findByUserIdOrderByStartedAtDesc(Long userId);

    Optional<Attempt> findByIdAndUserId(Long id, Long userId);

    boolean existsByQuizId(Long quizId);

    boolean existsByQuizIdAndSubmittedAtIsNotNull(Long quizId);
}
