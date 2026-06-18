# Backend API

Base URL for local development:

```text
http://localhost:8080
```

## Auth

Public:

- `POST /api/auth/register`
- `POST /api/auth/login`

Authenticated:

- `GET /api/auth/me`

Successful register/login returns a JWT access token. Send it as:

```text
Authorization: Bearer <accessToken>
```

## Public Categories

Public:

- `GET /api/categories`

Returns category `id`, `name`, and `slug`.

## Public Quizzes

Public:

- `GET /api/quizzes`
- `GET /api/quizzes?categoryId={id}`
- `GET /api/quizzes/{id}`

Public quiz responses return metadata only. They do not expose questions, options, explanations, or correct answers.

## Attempts

Authenticated user:

- `POST /api/attempts`
- `POST /api/attempts/{id}/submit`
- `GET /api/attempts/{id}/result`
- `GET /api/attempts/me`

Starting an attempt returns ordered questions and options, but never exposes correct answers, explanations, score, or selected options.

Submitting an attempt returns only the result summary.

The result/review endpoint is available after submission and may expose selected option, correct option, correctness, and explanations for review.

## Admin Categories

ADMIN only:

- `POST /api/admin/categories`
- `PUT /api/admin/categories/{id}`
- `DELETE /api/admin/categories/{id}`

Categories require a unique slug. A category cannot be deleted while quizzes use it.

## Admin Quizzes And Questions

ADMIN only:

- `GET /api/admin/quizzes`
- `GET /api/admin/quizzes/{id}`
- `POST /api/admin/quizzes`
- `PUT /api/admin/quizzes/{id}`
- `DELETE /api/admin/quizzes/{id}`
- `PATCH /api/admin/quizzes/{id}/publish`
- `PATCH /api/admin/quizzes/{id}/unpublish`
- `POST /api/admin/quizzes/{quizId}/questions`
- `PUT /api/admin/questions/{questionId}`
- `DELETE /api/admin/questions/{questionId}`

Admin quiz detail may expose correct answer flags for editing.

Publishing validates that a quiz has questions, each question has at least two options, each question has exactly one correct option, display orders are valid and unique, and required content is not blank.

Structural question/option edits are rejected for published quizzes and for quizzes with attempts.
