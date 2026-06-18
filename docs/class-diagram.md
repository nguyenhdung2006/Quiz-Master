# QuizMaster Class Diagram

This document describes the core MVP domain model in UML-style text. It is a guide for implementation, not generated code.

## UML-Style Diagram

```text
User "1" -- "0..*" Attempt
Category "1" -- "0..*" Quiz
Quiz "1" -- "0..*" Question
Question "1" -- "2..*" Option
Quiz "1" -- "0..*" Attempt
Attempt "1" -- "0..*" AttemptAnswer
Question "1" -- "0..*" AttemptAnswer
Option "1" -- "0..*" AttemptAnswer
```

MVP question rule:

- Each question has at least two options.
- Each question has exactly one correct option.
- Each user selects exactly one option per question.
- Multiple-correct-answer questions are out of scope for the MVP.

## Classes

### User

Attributes:

- `id`
- `email`
- `password`
- `role`
- `createdAt`

Notes:

- `email` must be unique.
- `password` stores a password hash, never plain text.
- `role` is either `USER` or `ADMIN` in the MVP.
- A user owns their attempts.

### Category

Attributes:

- `id`
- `name`
- `slug`

Notes:

- `slug` must be unique.
- Categories group quizzes by subject, such as Java, SQL, or Networking.

### Quiz

Attributes:

- `id`
- `categoryId`
- `title`
- `description`
- `timeLimitMinutes`
- `published`
- `createdAt`

Notes:

- A quiz belongs to one category.
- Only published quizzes should appear in the public catalog.
- Admins can create, edit, publish, and unpublish quizzes.
- Hard delete is allowed only for draft or unpublished quizzes with no attempts.
- If a quiz has submitted attempts, admins should unpublish it instead of deleting it.

### Question

Attributes:

- `id`
- `quizId`
- `displayOrder`
- `content`
- `explanation`

Notes:

- A question belongs to one quiz.
- Questions are displayed by `displayOrder`.
- `explanation` is shown after submission.
- Questions should not expose correct option data before submission.
- Existing questions should not be edited or deleted if doing so would break historical review for submitted attempts.

### Option

Attributes:

- `id`
- `questionId`
- `displayOrder`
- `content`
- `isCorrect`

Notes:

- An option belongs to one question.
- Options are displayed by `displayOrder`.
- `isCorrect` is sensitive and must not be exposed during quiz-taking.
- Each question must have exactly one correct option in the MVP.
- Existing options should not be edited or deleted if doing so would break historical review for submitted attempts.

### Attempt

Attributes:

- `id`
- `userId`
- `quizId`
- `correctCount`
- `totalQuestions`
- `scorePercentage`
- `startedAt`
- `submittedAt`

Notes:

- An attempt belongs to one user and one quiz.
- `submittedAt` is null until the attempt is submitted.
- `correctCount`, `totalQuestions`, and `scorePercentage` are null until submission.
- `correctCount` is the number of correctly answered questions.
- `totalQuestions` is the number of questions in the quiz at submission time.
- `scorePercentage` is a rounded integer percentage from 0 to 100.
- Users can only view their own attempts.
- Scoring is calculated when the attempt is submitted.

### AttemptAnswer

Attributes:

- `id`
- `attemptId`
- `questionId`
- `optionId`

Notes:

- Stores the single option selected by the user for a question.
- Belongs to one attempt.
- Keeps enough data to review the attempt later.
- After a valid submission, each attempt should have exactly one answer per question.

## Ownership Rules

- `User` owns `Attempt`.
- `Attempt` owns `AttemptAnswer`.
- `Quiz` owns `Question`.
- `Question` owns `Option`.

If a quiz has submitted attempts, admins should not hard-delete the quiz or directly edit or delete existing questions and options in a way that breaks historical review. Admins can unpublish the quiz. Major changes should be handled later by cloning or versioning, but quiz versioning is out of scope for the MVP.

## Access Rules

- Guests can read published quiz summaries and public quiz detail.
- Users can create and submit attempts for themselves.
- Users can view only their own attempt results.
- Admins can manage quiz, question, and option content.
- Correct answers are visible to users only after submission.
