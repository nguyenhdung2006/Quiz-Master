package com.quizmaster.category;

import com.quizmaster.common.BadRequestException;
import com.quizmaster.common.NotFoundException;
import com.quizmaster.quiz.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminCategoryService {

    private final CategoryRepository categoryRepository;
    private final QuizRepository quizRepository;

    @Transactional
    public CategoryResponse createCategory(AdminCategoryRequest request) {
        validateUniqueSlug(request.slug(), null);

        Category category = new Category();
        category.setName(request.name().trim());
        category.setSlug(request.slug().trim());

        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, AdminCategoryRequest request) {
        Category category = findCategory(id);
        validateUniqueSlug(request.slug(), id);

        category.setName(request.name().trim());
        category.setSlug(request.slug().trim());

        return CategoryResponse.from(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = findCategory(id);
        if (quizRepository.existsByCategoryId(id)) {
            throw new BadRequestException("Cannot delete category that has quizzes");
        }

        categoryRepository.delete(category);
    }

    private Category findCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found"));
    }

    private void validateUniqueSlug(String slug, Long currentCategoryId) {
        categoryRepository.findBySlug(slug)
                .filter(category -> !category.getId().equals(currentCategoryId))
                .ifPresent(category -> {
                    throw new BadRequestException("Category slug already exists");
                });
    }
}
