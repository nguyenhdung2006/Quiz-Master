# QuizMaster Backend Structure

This document defines the backend organization strategy for the Spring Boot MVP.

## Package Root

Use this root package:

```text
com.quizmaster
```

Preferred feature-based structure:

```text
com.quizmaster
|-- auth
|-- user
|-- category
|-- quiz
|-- attempt
|-- config
`-- common
```

## Package Responsibilities

### auth

Responsible for authentication and current-user behavior.

Expected files later:

```text
auth
|-- AuthController.java
|-- AuthService.java
|-- LoginRequest.java
|-- RegisterRequest.java
|-- AuthResponse.java
|-- CurrentUserResponse.java
|-- JwtService.java
`-- JwtAuthenticationFilter.java
```

### user

Responsible for user persistence and user identity.

Expected files later:

```text
user
|-- User.java
|-- UserRepository.java
`-- UserRole.java
```

### category

Responsible for quiz categories.

Expected files later:

```text
category
|-- Category.java
|-- CategoryRepository.java
|-- CategoryService.java
|-- CategoryController.java
|-- AdminCategoryController.java
`-- dto
    |-- CategoryResponse.java
    |-- CreateCategoryRequest.java
    `-- UpdateCategoryRequest.java
```

### quiz

Responsible for quizzes, questions, and options.

Expected files later:

```text
quiz
|-- Quiz.java
|-- Question.java
|-- Option.java
|-- QuizRepository.java
|-- QuestionRepository.java
|-- OptionRepository.java
|-- QuizService.java
|-- QuizController.java
|-- AdminQuizController.java
`-- dto
    |-- QuizSummaryResponse.java
    |-- QuizDetailResponse.java
    |-- CreateQuizRequest.java
    |-- UpdateQuizRequest.java
    |-- CreateQuestionRequest.java
    `-- UpdateQuestionRequest.java
```

### attempt

Responsible for starting attempts, submitting answers, scoring, results, and review.

Expected files later:

```text
attempt
|-- Attempt.java
|-- AttemptAnswer.java
|-- AttemptRepository.java
|-- AttemptAnswerRepository.java
|-- AttemptService.java
|-- AttemptController.java
`-- dto
    |-- StartAttemptRequest.java
    |-- SubmitAttemptRequest.java
    |-- AttemptResultResponse.java
    `-- AttemptHistoryResponse.java
```

### config

Responsible for application configuration.

Expected files later:

```text
config
|-- SecurityConfig.java
|-- CorsConfig.java
`-- PasswordConfig.java
```

### common

Responsible for shared support used across multiple features.

Expected files later:

```text
common
|-- ApiErrorResponse.java
|-- GlobalExceptionHandler.java
|-- NotFoundException.java
|-- ForbiddenException.java
`-- ValidationErrorResponse.java
```

Only place a file in `common` when more than one feature truly needs it.

## Why Avoid Global Technical Layers

Avoid this structure by default:

```text
com.quizmaster.controller
com.quizmaster.service
com.quizmaster.repository
com.quizmaster.entity
com.quizmaster.dto
```

Reasons:

- It separates files by technical type instead of product feature.
- It makes small features harder to understand.
- It encourages large folders as the project grows.
- It makes related files harder to find.

Feature packages keep each product area self-contained and easier to maintain.

Small subpackages are allowed inside a feature when they improve readability.

Allowed examples:

```text
com.quizmaster.quiz.dto
com.quizmaster.attempt.dto
com.quizmaster.category.dto
```

These are still feature-based because the DTOs remain inside the owning feature. Do not create global packages such as `com.quizmaster.dto`.

## File Size and Responsibility Rules

- One file should have one clear purpose.
- Controllers handle HTTP input and output only.
- Services contain business logic.
- Repositories contain persistence access only.
- Entities model database persistence.
- Request DTOs should be separate from response DTOs.
- DTOs should be named for their use case.
- If a feature folder becomes crowded, use small subpackages inside that feature.
- Avoid large multipurpose service classes.
- Avoid utility classes until repeated logic proves they are needed.

## Implementation Boundary

This document is a planning guide only. Do not create backend classes until the implementation phase begins.
