package com.quizmaster.quiz;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizRepository extends JpaRepository<Quiz, Long> {

    List<Quiz> findByPublishedTrue();

    Optional<Quiz> findByIdAndPublishedTrue(Long id);

    List<Quiz> findByCategoryIdAndPublishedTrue(Long categoryId);
}
