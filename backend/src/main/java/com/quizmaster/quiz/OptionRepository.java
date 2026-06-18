package com.quizmaster.quiz;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OptionRepository extends JpaRepository<Option, Long> {

    List<Option> findByQuestionIdOrderByDisplayOrderAsc(Long questionId);

    List<Option> findByQuestionIdInOrderByQuestionIdAscDisplayOrderAsc(List<Long> questionIds);

    long countByQuestionId(Long questionId);

    long countByQuestionIdAndCorrectTrue(Long questionId);
}
