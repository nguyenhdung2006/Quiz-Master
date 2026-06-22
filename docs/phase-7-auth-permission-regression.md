# Phase 7.3 Auth / Permission Regression QA

## 1. Purpose

This report records regression QA for authentication, authorization, attempt ownership, and public answer safety after Phase 7.1 JWT configuration hardening and Phase 7.2 CORS/API base URL hardening. Phase 7.3 changed no backend logic, frontend logic, database schema, seed logic, scoring, or UI.

## 2. Scope

In scope:

- Guest and public access.
- Login, `/api/auth/me`, and basic token rejection.
- USER and ADMIN permissions.
- Attempt ownership and submitted result/review access.
- Public answer and explanation safety.
- Locked and unpublished quiz visibility.
- Frontend logout and account switching.
- JWT and CORS regression after Phases 7.1 and 7.2.

Out of scope:

- Bug fixes and UI redesign.
- Global expired-token handling, refresh tokens, OAuth, forgot-password, and email verification.
- Seeder, scoring, attempt-flow, and deployment changes.
- Concurrent-submit hardening, which remains a separate identified risk.

## 3. Environment

- Backend URL: `http://localhost:8080`.
- Frontend URL: `http://localhost:5173`.
- Latest commit before QA: `1b24251 Harden CORS and frontend API base URL configuration`.
- Git status before QA: clean on `main`.
- Backend profile: default `dev`.
- Demo seed: backend was started with `--app.seed-demo=true`. Existing seed data was reused idempotently; the database was not reset and no manual attempt was created.
- Existing local QA data was retained. The public catalog contained six seeded public quizzes plus two permitted older QA quizzes.
- Accounts used: `demo-admin@quizmaster.local` (ADMIN), `demo-user@quizmaster.local` (USER), and `demo-empty@quizmaster.local` (USER).

## 4. Automated Test Results

Backend:

```powershell
cd D:\QuizMaster\backend
.\mvnw.cmd test
```

- Result: **PASS**.
- Tests: 55 run, 0 failures, 0 errors, 0 skipped.
- Coverage used by this QA includes `AuthControllerTest`, `AttemptApiTest`, `PublicQuizApiTest`, `AdminQuizApiTest`, `AdminCategoryApiTest`, `JwtServiceTest`, and `CorsConfigTest`.
- Accepted warnings: Mockito/Byte Buddy dynamic-agent and future JDK restriction warnings.

Frontend:

```powershell
cd D:\QuizMaster\frontend
npm run build
```

- Result: **PASS**.
- Vite 6.4.3 transformed 94 modules and completed in 3.21 seconds.

## 5. Manual/API Regression Matrix

| ID | Area | Scenario | Expected | Actual | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| AUTH-01 | Guest | View categories | 200 without token; public DTO only | 200; category data remained public metadata | PASS | Also covered by `PublicQuizApiTest.categoriesArePublic` |
| AUTH-02 | Guest | View public catalog | 200; no draft/locked quiz | 200; 8 permitted public quizzes; all three seeded draft/locked titles absent | PASS | Two extra public quizzes are retained older QA data |
| AUTH-03 | Guest | View public quiz detail | 200; no correct answer/explanation | 200; metadata-only response under current API design; no answer fields | PASS | Quiz questions are returned only when an authenticated attempt starts |
| AUTH-04 | Guest | Start attempt | 401; no attempt created | 401 | PASS | No manual attempt created; automated start test also verifies protection |
| AUTH-05 | Guest | View My Attempts | 401 | 401 | PASS | `/api/attempts/me` |
| AUTH-06 | Guest | Access admin API | 401 | 401 | PASS | `GET /api/admin/quizzes` |
| AUTH-07 | Login | USER login | 200 and usable token; USER role | 200; token used successfully; `/me` returned demo-user and USER | PASS | Response field is `accessToken` |
| AUTH-08 | Login | ADMIN login | 200 and usable token; ADMIN role | 200; token used successfully; `/me` returned demo-admin and ADMIN | PASS | JWT format remained compatible with frontend |
| AUTH-09 | Login | Wrong password | 401; no token | 401 | PASS | Used demo-user with an incorrect password |
| AUTH-10 | Token | `/api/auth/me` with USER token | 200; correct email and role | 200; `demo-user@quizmaster.local`, USER | PASS | Token issued after Phase 7.1 |
| AUTH-11 | Token | `/api/auth/me` without token | 401 | 401 | PASS | Structured authentication rejection |
| AUTH-12 | Token | `/api/auth/me` with malformed token | 401; no user data | 401 | PASS | Used `Bearer invalid.token.here` |
| AUTH-13 | USER | View own attempts | 200; current user's history only | 200; demo-user had attempts 328, 327, and permitted manual 309; demo-empty had zero | PASS | Ownership also covered by `AttemptApiTest` |
| AUTH-14 | USER | Start published quiz | Authenticated start succeeds without answer leakage | PASS in automated API test | PASS | `AttemptApiTest.startAttemptReturnsOrderedQuestionsAndOptionsWithoutAnswers`; no new QA attempt created |
| AUTH-15 | USER | Start locked/unpublished quiz | Reject; no valid attempt | 404 for Locked Demo Quiz 679 | PASS | Locked quiz remained unpublished |
| AUTH-16 | USER | Access admin quiz list | 403 | 403 | PASS | Backend role guard, not only frontend routing |
| AUTH-17 | USER | Create category | 403; no row created | 403 | PASS | `POST /api/admin/categories`; request stopped before business logic |
| AUTH-18 | USER | Write admin quiz endpoint | 403; no row created | 403 | PASS | `POST /api/admin/quizzes` |
| AUTH-19 | ADMIN | Access admin quiz list | 200 with public/draft/locked data | 200; 19 local quizzes including seeded and retained QA data | PASS | Admin token used |
| AUTH-20 | ADMIN | Category management permission | ADMIN CRUD permitted | PASS in automated API tests | PASS | `AdminCategoryApiTest` covers create/update/delete; no manual QA row created |
| AUTH-21 | ADMIN | See locked/unpublished quiz | Locked quiz visible with structural lock | 200; Locked Demo Quiz 679, published false, 4 questions, `structuralEditingLocked=true` | PASS | Admin UI also displayed the draft quiz |
| AUTH-22 | ADMIN | Admin endpoint without token | 401 | 401 | PASS | Same endpoint as AUTH-06 |
| AUTH-23 | Ownership | Find submitted demo-user attempt | At least one seeded submitted attempt | Found attempts 328 and 327; used 328 | PASS | No seed reset required |
| AUTH-24 | Ownership | Owner views result/review | 200 with score and post-submit review | 200; correct option and explanation fields present | PASS | Attempt 328 was already submitted |
| AUTH-25 | Ownership | demo-empty views demo-user result | 404/403; no result data | 404; no score, correct option, or explanation returned | PASS | Owner-scoped repository lookup |
| AUTH-26 | Ownership | ADMIN behavior on user result | Follow existing ownership design; no assumed override | ADMIN received 404 from the same owner endpoint | PASS | MVP has no admin-wide attempt review endpoint |
| AUTH-27 | Public safety | Catalog answer leakage | No correct/explanation fields | No `isCorrect`, `correctAnswer`, `correctOptionId`, or `explanation` fields | PASS | API body scan plus automated test |
| AUTH-28 | Public safety | Detail answer leakage | No correct/explanation fields | No answer or explanation fields | PASS | Public detail is metadata-only by design |
| AUTH-29 | Public safety | Started attempt answer leakage | No correct/explanation before submit | PASS in automated API tests | PASS | Covered by `AttemptApiTest` and `AdminQuizApiTest`; no new attempt created |
| AUTH-30 | Public safety | Submitted result review | Selected/correct/explanation/score allowed after submit | Attempt 328 returned 200 with correct option and explanation data | PASS | Data remained owner-only |
| AUTH-31 | Visibility | Locked quiz absent from public catalog | Hidden | Hidden | PASS | Exact title scan |
| AUTH-32 | Visibility | Locked quiz public detail | 404 | 404 for quiz 679 | PASS | No quiz data returned |
| AUTH-33 | Visibility | Empty draft hidden from public | Absent and detail unavailable | Absent; public detail 404 for quiz 563 | PASS | Spring Security draft also absent |
| AUTH-34 | Frontend | Logout clears current user | Guest state; protected route redirects to login | Logout removed USER state; `/attempts` redirected to `/login` | PASS | In-app browser at canonical localhost origin |
| AUTH-35 | Frontend | USER to ADMIN switching | Old role not retained; ADMIN route works after admin login | USER was redirected from admin; after logout/login ADMIN opened `/admin/quizzes` and saw Locked Demo Quiz | PASS | No stale USER role |
| AUTH-36 | Frontend | ADMIN to USER switching | Admin access removed | After logout/login USER, `/admin/quizzes` redirected to `/` | PASS | No stale ADMIN role |
| AUTH-37 | JWT regression | Tokens after Phase 7.1 | Login, `/me`, and protected APIs work | USER/ADMIN tokens worked across `/me`, attempts, and admin APIs | PASS | Missing and malformed tokens remained rejected |
| AUTH-38 | CORS regression | Canonical local frontend reaches API | Normal API/browser flows without CORS block | Allowed-origin preflight returned 200 and `Access-Control-Allow-Origin: http://localhost:5173`; browser login/catalog/admin flows worked with zero console errors | PASS | `http://127.0.0.1:5173` preflight returned 403 and no allow-origin header |

## 6. Findings

### Passed Controls

- Guest access is limited to the intended public category and quiz APIs.
- Missing, malformed, and unauthorized tokens are rejected with 401/403 as appropriate.
- Backend ADMIN role enforcement remains effective for both read and write endpoints.
- Attempt history and submitted result/review remain owner-scoped; ADMIN has no implicit ownership bypass.
- Public catalog/detail and pre-submit attempt responses do not expose correct answers or explanations.
- Submitted owners receive correct answers and explanations only through result/review data.
- Locked and unpublished quizzes are hidden publicly while remaining visible in admin context.
- Frontend logout and USER/ADMIN switching do not retain the previous account's permissions.
- Phase 7.1 JWT changes and Phase 7.2 CORS changes did not break normal local auth/API/browser flows.

### Issues / Risks

- No critical, high, medium, or low auth/permission regression was found.
- Global expired-token frontend handling remains intentionally deferred to Phase 7.4.
- Concurrent submit behavior remains an existing audit risk outside Phase 7.3; this QA did not claim it was resolved.
- Older local QA quizzes and manual attempt 309 remain present by design and were not modified or deleted.

### Not Verified

- No required AUTH-01 through AUTH-38 case remains unverified. Side-effecting published-attempt start and admin category CRUD cases were verified by the current passing automated API tests rather than repeated manually.

## 7. Conclusion

**Phase 7.3 result: PASS.**

No serious authentication, authorization, ownership, public-answer, locked-visibility, JWT, or CORS regression was found. The project can proceed to Phase 7.4 Frontend Token/Error State Hardening. This result does not make a production-readiness claim.
