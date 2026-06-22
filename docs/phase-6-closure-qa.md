# Phase 6 Closure QA

## 1. Summary

- Phase 6 status: **PASS / CLOSED**
- QA date: 2026-06-22 (Asia/Saigon), approximately 20:30-20:36
- Latest commit before this report: `b0b0ebd Document demo seed runbook`
- Runbook used: `docs/demo-runbook.md`
- Git working tree was clean before this closure report was created.
- Seed command:

  ```powershell
  cd D:\QuizMaster\backend
  .\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--app.seed-demo=true"
  ```

- No database reset was performed. Existing user data and the manual QA attempt 309 were preserved.

## 2. Build and Test

- Backend tests: **PASS**, 47/47 tests, 0 failures, 0 errors, 0 skipped.
- Frontend production build: **PASS**, Vite 6.4.3, 94 modules transformed, completed in 2.47 seconds.
- Accepted warnings: Mockito/Byte Buddy dynamic agent attachment and its future JDK deprecation warning. These warnings did not affect test results.

## 3. Seeded Dataset

Verified seeded totals after the first run:

- Demo users: 3
- Categories: 6
- Public quizzes: 6
- Draft/unpublished quizzes: 3
- Total seeded quizzes: 9
- Questions: 53
- Options: 212
- Seeded submitted attempts: 2
- Structurally locked quizzes: 1

Seeded attempt history for `demo-user@quizmaster.local`:

- Java Core Basics: attempt 327, submitted, 7/8 correct, 88%, 8 answers.
- Locked Demo Quiz: attempt 328, submitted, 2/4 correct, 50%, 4 answers.
- Manual SQL Basics attempt 309 remained unchanged and is not seeded data.

`demo-empty@quizmaster.local` retained zero attempts.

## 4. Public Safety

- The six intended public quizzes were visible in the public catalog and each public detail endpoint returned HTTP 200.
- Public quiz responses did not expose correct-answer fields or explanations.
- The following draft/unpublished quizzes were absent from the public catalog and each public detail endpoint returned HTTP 404:
  - Draft - Spring Security Practice
  - Draft - Empty Quiz For Publish Validation
  - Locked Demo Quiz
- No JWT or authentication data was exposed through public responses.

## 5. Authentication, User, and Admin QA

- Login and role checks passed for `demo-admin`, `demo-user`, and `demo-empty`.
- Both seeded submitted attempts returned valid result and review data.
- Review data contained the selected option, correct option, and explanation only after submission.
- Ownership checks held: `demo-empty` saw zero attempts and no cross-user attempt data.
- Admin data showed 9 seeded quizzes, 53 questions, and 212 options.
- The empty draft publish request returned HTTP 400 with `Quiz must have at least one question`.
- Locked Demo Quiz final state:
  - Quiz ID: 679
  - Category: Software Engineering
  - Published: false
  - `structuralEditingLocked`: true
  - Questions: 4
  - Options: 16
  - Every question had four options, exactly one correct option, and an explanation.

## 6. Idempotency

The backend was stopped and started a second time with the same seed command. Verification after the second run found:

- No duplicate demo users, categories, quizzes, questions, options, attempts, or attempt answers.
- All six category names and all nine seeded quiz titles remained unique.
- Dataset totals remained stable at 9 quizzes, 53 questions, and 212 options.
- Java Core Basics seeded attempt remained attempt 327 with 8 answers.
- Locked Demo Quiz seeded attempt remained attempt 328 with 4 answers.
- Locked Demo Quiz remained quiz 679, unpublished and structurally locked.
- `demo-empty` still had zero attempts.

The Spring Boot run processes were intentionally stopped after QA completed; their termination status was not a build or application failure.

## 7. Browser Smoke Test

Browser smoke testing passed for:

- Landing page and public catalog loading.
- Public Java Core Basics detail page.
- Guest Start Quiz redirect to login.
- Demo user login and My Attempts history, including attempts 327, 328, and the permitted manual attempt 309.
- Result and review pages for both seeded attempts, including selected answers, correct answers, and explanations.
- Demo-empty login and empty attempt history.
- Demo admin login and visibility of all nine seeded quizzes.
- Locked Demo Quiz admin edit page showing draft status, four questions, and disabled structural editing because attempt history exists.

No new attempt was created during closure QA.

## 8. Final Verdict

**Phase 6 Content and Demo Data is CLOSED.**

All required seed, attempt history, result/review, public safety, authentication, ownership, admin locking, validation, idempotency, runbook, and browser checks passed. Existing permitted QA data was retained. No Phase 6 bugs or deferred items remain; the project can proceed to visual/UI alignment or the next planned phase.
