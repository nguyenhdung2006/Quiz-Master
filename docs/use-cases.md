# QuizMaster Use Cases

This document defines what each actor can do in the MVP. It should guide page design, API permissions, and backend authorization rules.

## Actors

Guest:

- A visitor who is not logged in.
- Can browse public quiz information.
- Must register or login before taking a quiz.

User:

- A logged-in learner with the `USER` role.
- Can take published quizzes and review their own attempts.
- Cannot manage quiz content.

Admin:

- A logged-in user with the `ADMIN` role.
- Can manage quiz content.
- Can also use normal user quiz features.

## Guest Use Cases

Guests can:

- View the landing page.
- View categories.
- View the quiz catalog.
- View public quiz detail.
- Register an account.
- Login to an existing account.

Guests cannot:

- Start a quiz attempt.
- Submit quiz answers.
- View quiz results.
- View answer reviews.
- View attempt history.
- Access admin pages or admin APIs.
- See correct answers before submitting a quiz.

## User Use Cases

Users can:

- View the landing page.
- View categories.
- View the quiz catalog.
- View quiz detail.
- Start a published quiz.
- Submit answers for their own attempt.
- View their own result.
- Review their own submitted answers.
- View their own attempt history.

Users cannot:

- Create quizzes.
- Edit quizzes.
- Delete quizzes.
- Publish or unpublish quizzes.
- Create, edit, or delete categories.
- Create, edit, or delete questions.
- Create, edit, or delete options.
- View attempts owned by other users.
- Access admin APIs.
- See correct answers before submitting a quiz.

## Admin Use Cases

Admins can:

- Do everything a regular user can do.
- Create quizzes.
- Edit quizzes.
- Delete draft or unpublished quizzes with no attempts.
- Publish quizzes.
- Unpublish quizzes.
- Create categories.
- Edit categories.
- Delete categories that do not have quizzes.
- Create questions for quizzes.
- Edit questions.
- Delete questions.
- Create and manage answer options.

Admins should not:

- Bypass normal validation rules.
- Expose correct answers to users before submission.
- Use admin pages as a replacement for backend authorization.
- Hard-delete quizzes that have submitted attempts.
- Directly edit or delete questions and options if that would break historical attempt review.
- Delete categories that still have quizzes.

## Main User Flows

### Browse Quizzes

1. Guest or user opens the quiz catalog.
2. System displays published quizzes.
3. Actor opens a quiz detail page.
4. System displays quiz title, description, category, and time limit.
5. If the actor is a guest, the UI asks them to login or register before starting.

### Register

1. Guest opens the register page.
2. Guest enters email and password.
3. System validates the request.
4. System creates the user with the `USER` role.
5. System returns an access token.

### Login

1. Guest opens the login page.
2. Guest enters email and password.
3. System validates credentials.
4. System returns an access token.

### Take Quiz

1. User opens a published quiz detail page.
2. User starts a quiz attempt.
3. System creates an attempt.
4. System returns questions and options without exposing correctness.
5. User selects exactly one option per question.
6. User submits the attempt.
7. System stores answers, calculates `correctCount`, `totalQuestions`, and `scorePercentage`, then marks the attempt submitted.

### Review Result

1. User opens the result page for their own attempt.
2. System displays correct count, total questions, score percentage, and submitted answers.
3. System displays correct answers and explanations.
4. User can return to attempt history.

### Manage Quiz Content

1. Admin opens quiz management.
2. Admin creates or edits a quiz.
3. Admin creates questions.
4. Admin creates at least two options for each question.
5. Admin marks exactly one correct option per question.
6. Admin sets display order for questions and options.
7. Admin publishes the quiz when ready.

### Manage Categories

1. Admin opens category management.
2. Admin creates or edits a category with a required name and unique slug.
3. Admin deletes a category only if it has no quizzes.
4. Public users can view categories.

### Retire Quiz Content

1. Admin decides a quiz should no longer be available.
2. If the quiz has no attempts and is draft or unpublished, admin may hard-delete it.
3. If the quiz has submitted attempts, admin unpublishes it.
4. Major content changes should be handled later by cloning or versioning.
5. Quiz versioning is out of scope for the MVP.

## Access Rules

- Public quiz endpoints may be accessed by guests.
- Public category endpoints may be accessed by guests.
- Attempt endpoints require authentication.
- Result and review endpoints require ownership of the attempt.
- Admin endpoints require `ADMIN`.
- Frontend route protection improves usability but is not security.
- Backend authorization is the source of truth.
- Correct answers must not be returned before a quiz is submitted.
- MVP questions are single-choice only.
- Each question must have at least two options and exactly one correct option.
- Each user must select exactly one option per question when submitting.
- Multiple-correct-answer questions are out of scope for the MVP.
