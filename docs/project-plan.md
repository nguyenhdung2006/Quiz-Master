# QuizMaster Project Plan

## 1. Project Goal

QuizMaster is a standalone quiz platform for practicing knowledge through structured quizzes.

It is separate from WordArena and is not a vocabulary learning app. The platform should support general quiz categories such as Java, Spring Boot, SQL, Networking, Software Engineering, English, General Knowledge, and other subjects later.

The core purpose is simple:

- Users browse available quizzes.
- Users take quizzes.
- Users submit answers.
- Users receive correct counts, total question counts, and score percentages.
- Users review correct and incorrect answers.
- Admin users create and manage quiz content.

The product is intended for students, self-learning users, and people preparing for exams or technical interviews.

The first version should prioritize simplicity, maintainability, and fast delivery over advanced features.

## 2. MVP Scope

The MVP includes only the features required to run a practical quiz platform.

Public user features:

- Landing page
- Register
- Login
- View quiz catalog
- View quiz detail

Authenticated user features:

- Take a quiz
- Submit quiz answers
- View quiz result
- Review submitted answers
- View attempt history

Admin features:

- Create quiz
- Edit quiz
- Delete draft or unpublished quiz with no attempts
- Publish or unpublish quiz
- Create category
- Edit category
- Delete category with no quizzes
- Create question
- Edit question
- Delete question
- Create and manage answer options

Backend MVP capabilities:

- JWT-based authentication
- Role-based authorization
- User role and admin role
- PostgreSQL persistence
- Validation for API input
- Basic error handling
- Clear REST API structure

Frontend MVP capabilities:

- React pages for the main user flows
- Forms for authentication and admin management
- Quiz-taking interface
- Result and review interface
- Clean responsive layout using Tailwind

## 3. Out-of-Scope Features

The following features are not part of the MVP and should not be implemented unless the project scope changes later.

- Payments
- Marketplace
- Social network features
- Comments
- Classrooms
- Course management
- Public user-generated content
- AI quiz generation
- Advanced analytics
- Achievements
- Badges
- Complex leaderboards
- Multiple-correct-answer questions
- Quiz versioning
- Google OAuth
- Refresh tokens, unless clearly needed
- Email verification
- Password reset
- Multi-tenant organization support
- Real-time multiplayer quizzes
- Import/export tooling
- Mobile app

These features may be considered after the MVP is stable, but they should not influence the first implementation design.

## 4. User Roles

QuizMaster has three practical access levels in the MVP.

Guest:

- Can view landing page.
- Can view quiz catalog.
- Can view public quiz detail.
- Can register.
- Can login.
- Cannot take or submit quizzes.

User:

- Can do everything a guest can do.
- Can take published quizzes.
- Can submit quiz attempts.
- Can view result pages.
- Can review answers for their own attempts.
- Can view their own attempt history.

Admin:

- Can do everything a user can do.
- Can create quizzes.
- Can edit quizzes.
- Can delete draft or unpublished quizzes with no attempts.
- Can publish or unpublish quizzes.
- Can create, edit, and delete categories that are not used by quizzes.
- Can create, edit, and delete questions.
- Can create, edit, and delete options.

The backend should enforce permissions. The frontend should hide unavailable actions, but frontend hiding must not be treated as security.

## 5. Main User Flows

Guest browsing flow:

1. Open landing page.
2. Navigate to quiz catalog.
3. Browse published quizzes.
4. Open quiz detail.
5. Register or login to take a quiz.

Registration flow:

1. Open register page.
2. Enter email and password.
3. Submit registration form.
4. Receive JWT access token.
5. Continue as authenticated user.

Login flow:

1. Open login page.
2. Enter email and password.
3. Submit login form.
4. Receive JWT access token.
5. Continue as authenticated user.

Quiz-taking flow:

1. Authenticated user opens quiz detail.
2. User starts an attempt.
3. Backend creates an attempt record.
4. Frontend displays quiz questions and options.
5. User selects exactly one option per question.
6. User submits the attempt.
7. Backend calculates correct count, total questions, and score percentage.
8. User sees result page.

Answer review flow:

1. User opens result page.
2. User views selected answers.
3. User sees correct answers.
4. User reads explanations when available.

Attempt history flow:

1. User opens My Attempts page.
2. User sees previous attempts.
3. User opens a past attempt result.
4. User reviews answers again.

Admin quiz management flow:

1. Admin opens quiz management page.
2. Admin creates or edits a quiz.
3. Admin adds questions.
4. Admin sets display order for questions.
5. Admin adds at least two options for each question.
6. Admin sets display order for options.
7. Admin marks exactly one correct option per question.
8. Admin publishes quiz when ready.

## 6. MVP Pages

Public pages:

- Landing page
- Login page
- Register page
- Quiz catalog page
- Quiz detail page

Authenticated user pages:

- Take quiz page
- Result page
- Review answers page
- My attempts page

Admin pages:

- Category management page
- Admin quiz list page
- Create quiz page
- Edit quiz page
- Question management page

The first screen should be useful. Avoid building marketing-heavy pages before the real quiz experience exists.

## 7. Backend Package Strategy

The backend should use feature-based packages under `com.quizmaster`.

Preferred package structure:

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

Each feature package should own its related files.

Example:

```text
com.quizmaster.quiz
|-- Quiz.java
|-- QuizRepository.java
|-- QuizService.java
|-- QuizController.java
`-- dto
    |-- QuizSummaryResponse.java
    |-- QuizDetailResponse.java
    `-- CreateQuizRequest.java
```

Avoid global technical-layer packages such as:

```text
com.quizmaster.controller
com.quizmaster.service
com.quizmaster.repository
com.quizmaster.entity
com.quizmaster.dto
```

Global packages should be used only for truly shared concerns.

Small subpackages inside a feature are allowed when a feature becomes crowded, such as `com.quizmaster.quiz.dto`. Do not create global technical-layer packages like `com.quizmaster.dto`.

Acceptable shared packages:

- `config`: security configuration, application configuration, CORS configuration
- `common`: shared exceptions, shared API response helpers, shared validation or error response models

The rule is simple: if a file belongs mainly to one feature, keep it inside that feature package.

## 8. Frontend Folder Strategy

The frontend should also be organized by feature and purpose, not by large mixed folders.

Suggested structure:

```text
frontend/src
|-- app
|-- features
|   |-- auth
|   |-- quizzes
|   |-- attempts
|   `-- admin
|-- components
|-- layouts
|-- lib
|-- routes
`-- styles
```

Folder responsibilities:

- `app`: app setup, providers, router wiring
- `features/auth`: login, register, current user logic
- `features/quizzes`: catalog, quiz detail, quiz API calls
- `features/attempts`: take quiz, submit quiz, result, review
- `features/admin`: admin category, quiz, and question management
- `components`: small shared UI components only
- `layouts`: public, authenticated, and admin layouts
- `lib`: HTTP client, auth token helpers, utility functions
- `routes`: route definitions if routing is not kept in `app`
- `styles`: Tailwind and global CSS

Avoid putting all pages, API calls, and components into one large folder. Shared components should be genuinely reusable.

## 9. Database Design Strategy

The database should be designed before controllers are implemented.

Initial tables:

- `users`
- `categories`
- `quizzes`
- `questions`
- `options`
- `attempts`
- `attempt_answers`

Core relationships:

- Category has many quizzes.
- Quiz belongs to one category.
- Quiz has many questions.
- Question belongs to one quiz.
- Question has many options.
- Option belongs to one question.
- User has many attempts.
- Quiz has many attempts.
- Attempt belongs to one user and one quiz.
- Attempt has many attempt answers.
- Attempt answer belongs to one attempt, one question, and one selected option.

Database design principles:

- Use simple primary keys.
- Use foreign keys for relationships.
- Add unique constraints where they protect real business rules, such as unique category slug and unique user email.
- Keep nullable fields intentional.
- Store password hashes, never plain passwords.
- Store quiz publication status on the quiz record.
- Store attempt timestamps for started and submitted time.
- Store attempt scoring as correct count, total questions, and score percentage.
- Store enough attempt answer data to review the submitted attempt later.
- Store display order for questions and options.
- Do not add extra tables without a strong reason.
- Hard delete is allowed only for draft or unpublished quizzes with no attempts; otherwise use unpublish.

Potential initial fields:

```text
users
- id
- email
- password
- role
- created_at

categories
- id
- name
- slug

quizzes
- id
- category_id
- title
- description
- time_limit_minutes
- published
- created_at

questions
- id
- quiz_id
- display_order
- content
- explanation

options
- id
- question_id
- display_order
- content
- is_correct

attempts
- id
- user_id
- quiz_id
- correct_count
- total_questions
- score_percentage
- started_at
- submitted_at

attempt_answers
- id
- attempt_id
- question_id
- option_id
```

Use migrations later if the project adopts Flyway or Liquibase. For the early MVP, schema generation may be acceptable during local development, but production deployment should use controlled migrations.

## 10. API Design Strategy

The API should be REST-oriented, predictable, and small.

Initial endpoints:

Categories:

```text
GET /api/categories
```

Authentication:

```text
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

Quizzes:

```text
GET /api/quizzes
GET /api/quizzes/{id}
```

Attempts:

```text
POST /api/attempts
POST /api/attempts/{id}/submit
GET /api/attempts/{id}/result
GET /api/attempts/me
```

Admin quizzes:

```text
POST /api/admin/quizzes
PUT /api/admin/quizzes/{id}
DELETE /api/admin/quizzes/{id}
PATCH /api/admin/quizzes/{id}/publish
PATCH /api/admin/quizzes/{id}/unpublish
```

Admin categories:

```text
POST /api/admin/categories
PUT /api/admin/categories/{id}
DELETE /api/admin/categories/{id}
```

Admin questions:

```text
POST /api/admin/quizzes/{quizId}/questions
PUT /api/admin/questions/{questionId}
DELETE /api/admin/questions/{questionId}
```

API design principles:

- Keep request and response DTOs small.
- Do not expose entity objects directly from controllers.
- Validate request bodies.
- Return clear validation errors.
- Use appropriate HTTP status codes.
- Keep admin endpoints clearly separated under `/api/admin`.
- Require authentication for attempts.
- Require admin role for admin endpoints.
- Do not expose correct answers before submission.
- Use single-choice MVP rules: each question has exactly one correct option and each submitted answer selects exactly one option.
- Do not add generic endpoints before the UI needs them.

## 11. Development Phases

### Phase 0: Project Setup and Documentation

Purpose:

- Establish project direction.
- Create planning documentation.
- Confirm MVP boundaries.
- Prepare repository structure.

Deliverables:

- Project plan
- README outline
- Empty backend, frontend, docs, and database folders if needed

No application code should be created in this phase.

### Phase 1: Use Cases, UML-Style Class Diagram, Database Schema, API Design

Purpose:

- Design before implementation.
- Clarify system behavior.
- Confirm data model and endpoint shape.

Deliverables:

- Use case document
- UML-style class diagram
- Database schema document
- API design document

### Phase 2: Backend Entities and Database Setup

Purpose:

- Create the core persistence model.
- Connect Spring Boot to PostgreSQL.

Deliverables:

- Entity classes
- Repository interfaces
- Database configuration
- Basic seed data if useful

### Phase 3: Authentication and Authorization

Purpose:

- Allow users to register and login.
- Protect authenticated and admin-only endpoints.

Deliverables:

- Register endpoint
- Login endpoint
- Current user endpoint
- JWT access token support
- USER and ADMIN roles
- Security configuration

### Phase 4: Quiz Catalog and Quiz Detail

Purpose:

- Allow users to browse published quizzes.
- Allow users to inspect quiz information before taking it.

Deliverables:

- Quiz list endpoint
- Quiz detail endpoint
- Category support
- Published quiz filtering

### Phase 5: Take Quiz, Submit Quiz, Scoring

Purpose:

- Support the core quiz-taking experience.

Deliverables:

- Start attempt endpoint
- Submit attempt endpoint
- Answer storage
- Correct count, total questions, and score percentage calculation
- Basic handling for already submitted attempts

### Phase 6: Result and Answer Review

Purpose:

- Let users understand their performance.

Deliverables:

- Attempt result endpoint
- Answer review endpoint or result response with review data
- Attempt ownership checks
- My attempts endpoint

### Phase 7: Admin Quiz and Question Management

Purpose:

- Allow admin users to manage quiz content.

Deliverables:

- Create, edit, delete quiz endpoints with historical attempt protection
- Create, edit, delete category endpoints
- Publish and unpublish quiz endpoints
- Create, edit, delete question endpoints
- Option management support
- Admin-only authorization

### Phase 8: Frontend Implementation

Purpose:

- Build the user-facing application after backend contracts are clear.

Deliverables:

- React app setup
- Routing
- Authentication pages
- Quiz catalog and detail pages
- Take quiz page
- Result and review pages
- My attempts page
- Admin management pages

### Phase 9: Staging Release Formalization

Purpose:

- Align the roadmap with the completed Phase 8 staging deployment evidence.

Deliverables:

- Record that Phase 8 is DONE / CLOSED — PASS WITH NOTES
- Map old Public Deployment / Staging Release work to Phase 8.6–8.9 evidence
- Record staging frontend/backend URLs
- Confirm no redeployment or full smoke retest is required for this phase
- Point next work toward v1.0 readiness

### Phase B: Demo Data & Account Strategy

Purpose:

- Prepare safe demo data and account guidance for v1.0 readiness.

Deliverables:

- Demo data policy
- Demo account strategy
- Staging data cleanup or curation plan
- Clear separation from production data

## 12. Risks and Mistakes to Avoid

Avoid changing the product identity:

- QuizMaster is not WordArena.
- QuizMaster is not a vocabulary-only app.
- QuizMaster should remain a general quiz platform.

Avoid expanding the MVP too early:

- Do not add payments.
- Do not add marketplace behavior.
- Do not add social features.
- Do not add classrooms.
- Do not add AI quiz generation.
- Do not add achievements or badges.
- Do not add complex leaderboards.
- Do not add multiple-correct-answer questions.
- Do not add quiz versioning.

Avoid backend architecture mistakes:

- Do not use global controller, service, repository, entity, and DTO folders by default.
- Do not expose JPA entities directly from API responses.
- Do not let controllers contain business logic.
- Do not create large service classes with unrelated responsibilities.
- Do not add complex architecture patterns before the app needs them.
- Do not create extra tables without a clear reason.

Avoid frontend architecture mistakes:

- Do not put every component into one shared components folder.
- Do not put every API call into one huge API file.
- Do not create a landing-page-only app before the real quiz flows exist.
- Do not make admin UI patterns leak into public user pages.

Avoid security mistakes:

- Do not store plain text passwords.
- Do not trust frontend role checks.
- Do not allow users to view other users' attempts.
- Do not expose correct answers before quiz submission.
- Do not allow non-admin users to access admin endpoints.
- Do not hard-delete quizzes that have submitted attempts.
- Do not edit or delete questions and options in a way that breaks historical review.

Avoid maintainability mistakes:

- Do not create huge files.
- Do not mix many responsibilities in one file.
- Do not add abstractions only because they might be useful later.
- Do not make database fields vague or overloaded.
- Do not ignore validation.

## 13. Rules for Keeping Files Small and Maintainable

Each file should have one clear purpose.

Backend rules:

- Keep each controller focused on one feature area.
- Keep each service focused on one feature area.
- Keep request DTOs separate from response DTOs.
- Keep DTOs small and named after their use case.
- Keep entity classes focused on persistence, not API formatting.
- Move shared exceptions or error models into `common` only when reused.
- Avoid utility classes unless there is repeated logic.
- Avoid deeply nested package structures unless they improve clarity.

Frontend rules:

- Keep page components focused on layout and flow.
- Move reusable UI pieces into small components.
- Keep feature-specific components inside their feature folder.
- Keep API functions close to the feature that uses them.
- Avoid one large state file for the whole application.
- Avoid one large form component when smaller components are clearer.

General rules:

- Prefer several readable files over one huge file.
- Name files by the job they perform.
- Keep functions short enough to understand without scrolling heavily.
- Split a file when it starts handling multiple reasons to change.
- Do not prematurely create framework-like abstractions.
- Use comments only when they explain non-obvious decisions.

## 14. Definition of Done for MVP

The MVP is done when the following are true.

Core product:

- Guests can view the landing page.
- Guests can view the quiz catalog.
- Guests can view quiz detail.
- Users can register.
- Users can login.
- Users can take a published quiz.
- Users can submit answers.
- Users can see correct count, total questions, and score percentage.
- Users can review correct and incorrect answers.
- Users can view their attempt history.
- Admins can create and manage quizzes.
- Admins can create and manage categories.
- Admins can create and manage questions and options.
- Admins can publish and unpublish quizzes.

Backend:

- Spring Boot application runs successfully.
- PostgreSQL is configured.
- Core entities and relationships are implemented.
- Authentication works with JWT access tokens.
- USER and ADMIN permissions are enforced.
- Main API endpoints return predictable responses.
- Validation errors are clear.
- Users cannot access attempts owned by other users.
- Correct answers are not exposed before submission.

Frontend:

- React app runs successfully.
- Main pages are implemented.
- Authentication state is handled.
- Quiz-taking flow works end to end.
- Result and review pages are usable.
- Admin pages support basic content management.
- Layout is readable on common desktop and mobile screen sizes.

Quality:

- Files are small and focused.
- Feature-based organization is followed.
- No out-of-scope MVP features are included.
- Key backend logic has tests.
- Main frontend flows have been manually verified.
- Environment variables are documented.
- The app is ready for deployment preparation to Vercel, Render, and PostgreSQL.
