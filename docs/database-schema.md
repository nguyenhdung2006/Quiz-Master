# QuizMaster Database Schema

This document describes the MVP PostgreSQL schema. It intentionally uses only the tables needed for the first working quiz platform.

## Tables

### users

Columns:

| Column | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | bigint | no | Primary key |
| email | varchar(255) | no | Unique |
| password | varchar(255) | no | Password hash |
| role | varchar(30) | no | `USER` or `ADMIN` |
| created_at | timestamp | no | Account creation time |

Constraints:

- Primary key: `id`
- Unique: `email`

Indexes:

- Unique index on `email`

### categories

Columns:

| Column | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | bigint | no | Primary key |
| name | varchar(120) | no | Display name |
| slug | varchar(140) | no | URL-friendly identifier |

Constraints:

- Primary key: `id`
- Unique: `slug`
- Category name is required.
- Do not delete a category that still has quizzes.

Indexes:

- Unique index on `slug`

### quizzes

Columns:

| Column | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | bigint | no | Primary key |
| category_id | bigint | no | References `categories.id` |
| title | varchar(200) | no | Quiz title |
| description | text | yes | Quiz description |
| time_limit_minutes | integer | yes | Optional time limit |
| published | boolean | no | Public visibility |
| created_at | timestamp | no | Creation time |

Constraints:

- Primary key: `id`
- Foreign key: `category_id` references `categories(id)`

Indexes:

- Index on `category_id`
- Index on `published`
- Optional combined index on `(published, category_id)` if catalog filtering needs it

### questions

Columns:

| Column | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | bigint | no | Primary key |
| quiz_id | bigint | no | References `quizzes.id` |
| display_order | integer | no | Display order within the quiz |
| content | text | no | Question text |
| explanation | text | yes | Explanation shown after submission |

Constraints:

- Primary key: `id`
- Foreign key: `quiz_id` references `quizzes(id)`

Indexes:

- Index on `quiz_id`
- Index on `(quiz_id, display_order)`

### options

Columns:

| Column | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | bigint | no | Primary key |
| question_id | bigint | no | References `questions.id` |
| display_order | integer | no | Display order within the question |
| content | text | no | Option text |
| is_correct | boolean | no | Whether this option is correct |

Constraints:

- Primary key: `id`
- Foreign key: `question_id` references `questions(id)`
- Unique partial constraint or unique partial index on `question_id` where `is_correct = true` to enforce at most one correct option per question

Indexes:

- Index on `question_id`
- Index on `(question_id, display_order)`

Single-choice MVP rules:

- Each question must have at least two options.
- Each question must have exactly one correct option.
- Each submitted answer selects exactly one option for one question.
- Multiple-correct-answer questions are out of scope for the MVP.
- PostgreSQL can enforce at most one correct option with a partial unique index; the application should validate at least one correct option before publishing.

### attempts

Columns:

| Column | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | bigint | no | Primary key |
| user_id | bigint | no | References `users.id` |
| quiz_id | bigint | no | References `quizzes.id` |
| correct_count | integer | yes | Number of correctly answered questions, null until submission |
| total_questions | integer | yes | Number of quiz questions at submission time, null until submission |
| score_percentage | integer | yes | Rounded score from 0 to 100, null until submission |
| started_at | timestamp | no | Attempt start time |
| submitted_at | timestamp | yes | Null until submitted |

Constraints:

- Primary key: `id`
- Foreign key: `user_id` references `users(id)`
- Foreign key: `quiz_id` references `quizzes(id)`

Indexes:

- Index on `user_id`
- Index on `quiz_id`
- Index on `(user_id, submitted_at)` for attempt history

### attempt_answers

Columns:

| Column | Type | Nullable | Notes |
| --- | --- | --- | --- |
| id | bigint | no | Primary key |
| attempt_id | bigint | no | References `attempts.id` |
| question_id | bigint | no | References `questions.id` |
| option_id | bigint | no | References `options.id` |

Constraints:

- Primary key: `id`
- Foreign key: `attempt_id` references `attempts(id)`
- Foreign key: `question_id` references `questions(id)`
- Foreign key: `option_id` references `options(id)`

Indexes:

- Index on `attempt_id`
- Index on `question_id`
- Unique constraint on `(attempt_id, question_id)` because the MVP allows exactly one selected option per question

## Nullable Field Rules

- Required identity and relationship fields are non-null.
- `quizzes.description` is nullable because a short quiz may not need extra detail.
- `quizzes.time_limit_minutes` is nullable so untimed quizzes are possible.
- `questions.explanation` is nullable because not every question needs an explanation at first.
- `attempts.correct_count` is nullable until submission.
- `attempts.total_questions` is nullable until submission.
- `attempts.score_percentage` is nullable until submission.
- `attempts.submitted_at` is nullable until submission.

## Scoring Rules

- `correct_count` is the number of correctly answered questions.
- `total_questions` is the number of questions in the quiz at submission time.
- `score_percentage` is a rounded integer percentage from 0 to 100.
- Scoring is calculated when the attempt is submitted.

## Migration Notes

- Local development may start with JPA schema generation if needed.
- Production should use controlled migrations before deployment.
- Flyway or Liquibase can be added when the backend structure is ready.
- Do not add extra tables for future features until the MVP requires them.

## Data Safety Notes

- Store password hashes only.
- Do not expose `options.is_correct` in quiz-taking responses.
- Preserve attempt data so users can review past results.
- If a quiz has submitted attempts, admins should not hard-delete the quiz.
- If a quiz has submitted attempts, admins should not directly edit or delete existing questions or options in a way that breaks historical review.
- Admins can unpublish a quiz that should no longer be available.
- Hard delete is allowed only for draft or unpublished quizzes with no attempts.
- Major content changes should later be handled by cloning or versioning, but quiz versioning is out of scope for the MVP.
