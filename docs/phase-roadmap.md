# QuizMaster Phase Roadmap

This document breaks the MVP into practical implementation phases. Do not implement later phases before their design inputs are ready.

## Phase 0: Project Setup and Documentation

Goal:

- Establish project direction and MVP boundaries.

Deliverables:

- Project planning document
- Focused design documents
- Repository folder outline

Risk level: Low

Complexity level: Low

What not to do:

- Do not create Spring Boot application code.
- Do not create React application code.
- Do not add entities, controllers, services, repositories, DTOs, or components.

Exit criteria:

- Planning documents exist and are accepted.
- MVP scope is clear.
- Out-of-scope features are documented.

## Phase 1: Use Cases, Class Diagram, Database Schema, API Design

Goal:

- Finish implementation-ready design.

Deliverables:

- Use case document
- UML-style class diagram
- Database schema document
- API design document

Risk level: Low

Complexity level: Medium

What not to do:

- Do not start coding before the model and API are clear.
- Do not add future-only features to the design.

Exit criteria:

- Core actors and flows are documented.
- Tables and relationships are documented.
- Initial API endpoints are documented.
- Single-choice MVP rules are documented.
- Historical attempt protection rules are documented.

## Phase 2: Backend Entities and Database Setup

Goal:

- Create the persistence foundation.

Deliverables:

- Spring Boot project setup
- PostgreSQL configuration
- Core entity classes
- Repository interfaces
- Initial local database setup
- Display order fields for questions and options
- Attempt scoring fields for correct count, total questions, and score percentage

Risk level: Medium

Complexity level: Medium

What not to do:

- Do not implement all business workflows yet.
- Do not create frontend pages.
- Do not add unnecessary tables.
- Do not design multiple-correct-answer questions for the MVP.

Exit criteria:

- Backend starts successfully.
- Database connection works.
- Core tables can be created locally.

## Phase 3: Authentication and Authorization

Goal:

- Support secure login and role-based access.

Deliverables:

- Register endpoint
- Login endpoint
- Current user endpoint
- JWT access token support
- `USER` and `ADMIN` roles
- Basic security configuration

Risk level: High

Complexity level: Medium

What not to do:

- Do not add OAuth.
- Do not add refresh tokens unless necessary.
- Do not rely on frontend checks for security.

Exit criteria:

- Users can register and login.
- Protected endpoints require authentication.
- Admin endpoints require admin role.

## Phase 4: Quiz Catalog and Quiz Detail

Goal:

- Allow users and guests to browse published quizzes.

Deliverables:

- Quiz list endpoint
- Quiz detail endpoint
- Category list endpoint
- Published filtering
- Category support

Risk level: Medium

Complexity level: Low

What not to do:

- Do not expose correct answers.
- Do not build advanced filtering unless needed.
- Do not implement quiz submission yet.

Exit criteria:

- Published quizzes can be listed.
- Categories can be listed.
- Published quiz details can be viewed.
- Unpublished quizzes are hidden from public endpoints.

## Phase 5: Take Quiz, Submit Quiz, Scoring

Goal:

- Implement the core quiz-taking workflow.

Deliverables:

- Start attempt endpoint
- Submit attempt endpoint
- Answer storage
- Correct count, total questions, and score percentage calculation
- Duplicate submission protection

Risk level: High

Complexity level: High

What not to do:

- Do not expose correct answers before submission.
- Do not allow users to submit attempts they do not own.
- Do not overcomplicate scoring rules.
- Do not support multiple selected options per question in the MVP.

Exit criteria:

- Authenticated users can start an attempt.
- Authenticated users can submit answers.
- Each question accepts exactly one selected option.
- Correct count, total questions, and score percentage are calculated correctly.
- Submitted attempts cannot be submitted again.

## Phase 6: Result and Answer Review

Goal:

- Let users understand their quiz performance.

Deliverables:

- Result endpoint
- Answer review data
- Attempt history endpoint
- Ownership checks

Risk level: High

Complexity level: Medium

What not to do:

- Do not allow users to view other users' attempts.
- Do not create advanced analytics.
- Do not add badges or achievements.

Exit criteria:

- Users can see their own result.
- Users can review selected and correct answers after submission.
- Users can view their own attempt history.

## Phase 7: Admin Quiz and Question Management

Goal:

- Allow admins to manage quiz content.

Deliverables:

- Create, edit, delete quiz endpoints
- Create, edit, delete category endpoints
- Publish and unpublish endpoints
- Create, edit, delete question endpoints
- Option management
- Admin authorization

Risk level: Medium

Complexity level: High

What not to do:

- Do not build a marketplace.
- Do not allow public user-generated quizzes.
- Do not skip validation for admin input.
- Do not hard-delete quizzes that have submitted attempts.
- Do not edit or delete questions and options in a way that breaks historical review.
- Do not add quiz versioning in the MVP.
- Do not delete categories that still have quizzes.

Exit criteria:

- Admins can manage quizzes.
- Admins can manage categories.
- Admins can manage questions and options.
- Admins can unpublish quizzes that have submitted attempts.
- Non-admin users cannot access admin endpoints.

## Phase 8: Frontend Implementation

Goal:

- Build the user-facing React application.

Deliverables:

- React, Vite, Tailwind setup
- Public pages
- Auth pages
- Quiz catalog and detail pages
- Take quiz page
- Result and review pages
- My attempts page
- Admin pages

Risk level: Medium

Complexity level: High

What not to do:

- Do not make a landing-page-only product.
- Do not put all API calls in one huge file.
- Do not build complex UI features outside the MVP.

Exit criteria:

- Main user flows work in the browser.
- Auth state works.
- Admin pages can manage quiz content.
- UI is readable on common desktop and mobile sizes.

## Phase 9: Staging Release Formalization

Goal:

- Align the roadmap with the completed Phase 8 staging deployment evidence.

Deliverables:

- Record that Phase 8 is DONE / CLOSED — PASS WITH NOTES
- Map old Public Deployment / Staging Release work to Phase 8.6–8.9 evidence
- Record staging frontend/backend URLs
- Confirm no redeployment or full smoke retest is required for this phase
- Point next work toward v1.0 readiness

Risk level: Medium

Complexity level: Low

What not to do:

- Do not redeploy backend or frontend.
- Do not rerun full smoke tests.
- Do not mutate staging data.
- Do not add post-v1 features.
- Do not claim production readiness.

Exit criteria:

- Phase 9 formalization doc exists.
- Old staging release roadmap item is closed as PASS WITH NOTES.
- Known limitations remain documented.
- Next roadmap starts with Phase B — Demo Data & Account Strategy.

## Phase B: Demo Data & Account Strategy

Goal:

- Prepare safe, intentional demo data and account guidance for v1.0 readiness.

Deliverables:

- Demo data policy
- Demo account strategy
- Staging data cleanup or curation plan
- Clear separation from production data

Risk level: Medium

Complexity level: Medium

Status:

- B1 strategy plan: PASS; see `docs/demo-data-strategy.md`.
- B2 staging demo data creation: next.

What not to do:

- Do not publish admin credentials.
- Do not store demo passwords in repository files.
- Do not mutate staging data until Phase B2 is explicitly started.
