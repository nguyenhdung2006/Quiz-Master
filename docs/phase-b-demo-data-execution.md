# Phase B2 - Staging Demo Data Creation

Date: 2026-06-23

## Scope

Phase B2 created presentation-ready demo data in the existing staging environment through the staging frontend/admin UI, using an already-authenticated private admin browser session.

No source code, database schema, deploy settings, seed flags, or SQL were changed during this phase.

## Data Created

Categories:

| ID | Name | Slug |
| --- | --- | --- |
| 2 | Java / Spring Boot | `java-spring-boot` |
| 3 | Database / SQL | `database-sql` |
| 4 | Networking | `networking` |
| 5 | English Vocabulary | `english-vocabulary` |
| 6 | Software Engineering | `software-engineering` |

Published demo quizzes:

| ID | Title | Category | Questions | Time limit |
| --- | --- | --- | --- | --- |
| 3 | Java Core & Spring Boot Basics | Java / Spring Boot | 4 | 10 min |
| 4 | SQL & Relational Database Fundamentals | Database / SQL | 4 | 10 min |
| 5 | Computer Networking Essentials | Networking | 4 | 10 min |
| 6 | Software Engineering & Testing Basics | Software Engineering | 4 | 10 min |
| 7 | English Vocabulary for Developers | English Vocabulary | 4 | 10 min |

Each quiz contains four single-choice questions. Each question contains four options and exactly one correct answer.

Existing Phase 8.8 smoke data was preserved.

## Execution Notes

- Created demo categories through the admin category UI.
- Created demo quiz drafts through the admin quiz UI.
- Added questions/options through the admin question editor.
- Validated publish rule on an empty draft: the UI/backend kept the quiz in Draft and displayed `Quiz must have at least one question`.
- Published each valid demo quiz after question creation.
- Temporarily unpublished the Software Engineering quiz to add a missing fourth question, then republished it successfully.

## Public Verification

Public catalog checks confirmed the five new demo quizzes are visible as published quizzes with `questionCount=4`.

Public quiz detail check confirmed pre-attempt detail exposes only metadata:

- title
- description
- category
- question count
- time limit
- published status

The public detail response did not expose question text, options, correct answers, or explanations before starting an attempt.

## User Flow Verification

Guest behavior:

- Guest catalog/detail access worked.
- Guest clicking `Start quiz` redirected to Login.

Temporary user behavior:

- A temporary `USER` account was registered through the frontend.
- The user started the Java demo quiz through the normal public flow.
- The user submitted all four answers.
- Result page showed `4` correct, `0` wrong, `0` skipped, total `4`, score `100%`.
- Answer review displayed selected answers, correct markers, and explanations after submission.
- My Attempts showed the submitted attempt for the temporary user.

The temporary user's password was not recorded.

## Security Checks

- USER navigation did not expose the Admin link.
- Unauthenticated admin API request to `/api/admin/quizzes` returned HTTP `401`.
- Guest start-attempt flow required authentication.

Direct browser navigation to `/admin/quizzes` as the temporary USER was not completed because the in-app browser adapter opened `about:blank` and did not expose a reliable navigation primitive for that route during this run.

## Secret Handling

No admin password, user password, JWT token, session cookie, database URL, or API key was written to this document or committed.

## Result

Phase B2 staging demo data creation is complete. The staging environment now contains five demo categories and five published four-question demo quizzes suitable for presentation walkthroughs.
