# QuizMaster API Design

This document defines the initial REST API shape for the MVP. Controllers should follow this contract when implementation begins.

## General Rules

- Base path: `/api`
- Use JSON request and response bodies.
- Validate all request bodies.
- Return clear validation errors.
- Do not return JPA entities directly.
- Do not expose correct answers before quiz submission.
- Admin endpoints must require `ADMIN`.
- Attempt result endpoints must check ownership.
- MVP questions are single-choice only.
- Each question must have at least two options and exactly one correct option.
- Each submitted answer must select exactly one option per question.

## Category Endpoints

| Method | Path | Auth | Request Summary | Response Summary |
| --- | --- | --- | --- | --- |
| GET | `/api/categories` | Public | None | Category list |

Response notes:

- Public category responses should include id, name, and slug.
- Categories may be used by the quiz catalog for filtering later.

## Admin Category Endpoints

| Method | Path | Auth | Request Summary | Response Summary |
| --- | --- | --- | --- | --- |
| POST | `/api/admin/categories` | Admin | Category name and slug | Created category |
| PUT | `/api/admin/categories/{id}` | Admin | Updated category name and slug | Updated category |
| DELETE | `/api/admin/categories/{id}` | Admin | Category id | No content |

Validation notes:

- Category name is required.
- Category slug is required and must be unique.
- Do not delete a category that still has quizzes.

Security notes:

- Only admins can create, edit, or delete categories.

## Authentication Endpoints

| Method | Path | Auth | Request Summary | Response Summary |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Email and password | Access token and user summary |
| POST | `/api/auth/login` | Public | Email and password | Access token and user summary |
| GET | `/api/auth/me` | User/Admin | None | Current user summary |

Validation notes:

- Email is required and must be valid.
- Password is required and must meet the chosen minimum length.
- Register should reject duplicate emails.

Security notes:

- Store password hashes only.
- Login errors should not reveal whether the email or password was wrong.

## Quiz Endpoints

| Method | Path | Auth | Request Summary | Response Summary |
| --- | --- | --- | --- | --- |
| GET | `/api/quizzes` | Public | Optional category or paging later | Published quiz summaries |
| GET | `/api/quizzes/{id}` | Public | Quiz id | Published quiz detail |

Response notes:

- Quiz list should include id, title, category, time limit, and short description.
- Quiz detail may include questions and options only when appropriate for starting or previewing.
- Public quiz detail must not expose `isCorrect`.

Validation notes:

- Return not found for missing quiz.
- Return not found or forbidden-style response for unpublished quizzes on public endpoints.

## Attempt Endpoints

| Method | Path | Auth | Request Summary | Response Summary |
| --- | --- | --- | --- | --- |
| POST | `/api/attempts` | User/Admin | Quiz id | Created attempt and quiz questions without correct answers |
| POST | `/api/attempts/{id}/submit` | User/Admin | One selected option per question | Correct count, total questions, score percentage, and result summary |
| GET | `/api/attempts/{id}/result` | User/Admin | Attempt id | Result and answer review |
| GET | `/api/attempts/me` | User/Admin | None | Current user's attempt history |

Validation notes:

- Quiz id is required when starting an attempt.
- Quiz must exist and be published.
- Submitted answers must belong to the quiz in the attempt.
- Each question must receive exactly one selected option.
- Do not allow submitting an attempt twice.
- Reject duplicate answers for the same question.

Response notes:

- Result responses should include `correctCount`, `totalQuestions`, and `scorePercentage`.
- `correctCount` is the number of correctly answered questions.
- `totalQuestions` is the number of questions in the quiz at submission time.
- `scorePercentage` is a rounded integer percentage from 0 to 100.

Security notes:

- A user can only submit their own attempt.
- A user can only view their own attempt result.
- Correct answers and explanations appear only after submission.

## Admin Quiz Endpoints

| Method | Path | Auth | Request Summary | Response Summary |
| --- | --- | --- | --- | --- |
| POST | `/api/admin/quizzes` | Admin | Quiz fields | Created quiz |
| PUT | `/api/admin/quizzes/{id}` | Admin | Updated quiz fields | Updated quiz |
| DELETE | `/api/admin/quizzes/{id}` | Admin | Quiz id | No content |
| PATCH | `/api/admin/quizzes/{id}/publish` | Admin | Quiz id | Updated publication status |
| PATCH | `/api/admin/quizzes/{id}/unpublish` | Admin | Quiz id | Updated publication status |

Validation notes:

- Title is required.
- Category is required.
- Time limit must be positive when provided.
- A quiz should have enough valid questions before publication.
- Each question must have at least two options.
- Each question must have exactly one correct option.
- Hard delete is allowed only for draft or unpublished quizzes with no attempts.
- If a quiz has submitted attempts, use unpublish instead of delete.

Security notes:

- Only admins can access these endpoints.
- Admin authorization must be enforced in the backend.
- Admins should not directly edit published historical content in a way that breaks submitted attempt review.

## Admin Question Endpoints

| Method | Path | Auth | Request Summary | Response Summary |
| --- | --- | --- | --- | --- |
| POST | `/api/admin/quizzes/{quizId}/questions` | Admin | Question content, display order, explanation, options | Created question |
| PUT | `/api/admin/questions/{questionId}` | Admin | Updated question fields and options | Updated question |
| DELETE | `/api/admin/questions/{questionId}` | Admin | Question id | No content |

Validation notes:

- Question content is required.
- Question display order is required.
- A question should have at least two options.
- Exactly one option must be marked correct.
- Option content is required.
- Option display order is required.

Security notes:

- Only admins can create, edit, or delete questions.
- Public quiz-taking responses must hide `isCorrect`.
- If a quiz has submitted attempts, admins should not directly edit or delete existing questions or options in a way that breaks historical review.
- Major quiz changes should later use cloning or versioning, but quiz versioning is out of scope for the MVP.

## Error Response Strategy

Use a small consistent error shape.

Suggested fields:

- `message`
- `status`
- `errors`
- `timestamp`

Keep error handling practical. Avoid complex error frameworks unless the application needs them.
