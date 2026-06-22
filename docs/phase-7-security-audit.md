# Phase 7.0 Security Hardening Audit

## 1. Purpose

This document records the security and configuration baseline before Phase 7 hardening. Phase 7.0 is an audit only: no backend logic, frontend logic, database schema, authentication flow, seeder behavior, scoring, or UI was changed.

The audit is based on the current source, existing tests, a full backend test run, and a frontend production build. It does not claim that the application is production-ready.

## 2. Scope

In scope:

- JWT signing and expiration configuration.
- CORS configuration.
- Demo seeder default safety.
- Public correct-answer and explanation safety.
- Admin authorization.
- Attempt ownership and result/review safety.
- Frontend token storage, invalid/expired-token behavior, and error states.
- Frontend API base URL and hardcoded local configuration.
- Request validation, duplicate submission, concurrency, and production-readiness gaps.

Out of scope:

- OAuth, refresh tokens, forgot-password, and email verification.
- Leaderboards, dashboards, analytics, Excel import, image upload, payments, classrooms, social features, and multi-choice quizzes.
- UI redesign, scoring changes, attempt-flow changes, deployment implementation, and database changes.

## 3. Current Baseline

- Branch: `main`.
- Latest commit observed before the audit: `9f12d54 Document Phase 6 closure QA`.
- Git status before the task: clean.
- Backend local URL: `http://localhost:8080`.
- Frontend local URL: `http://localhost:5173`.
- Phase 6 Content and Demo Data: closed.
- Demo seeding requires the explicit argument `--app.seed-demo=true`.

## 4. Audit Summary Table

| Area | Status | Evidence | Risk | Recommended follow-up |
| --- | --- | --- | --- | --- |
| JWT secret/config | NEEDS HARDENING | `application.yaml`, `JwtService` | Environment override exists, but a known development secret is the fallback | Require a strong environment secret outside development and fail startup when absent |
| JWT expiration | PASS WITH RISK | `JWT_EXPIRATION_MS`, signed `exp`, validation in `JwtService` | Configurable 24-hour default; no startup bounds or focused expiry regression test | Validate configuration and add expiry/invalid-signature tests |
| CORS | NEEDS HARDENING | `CorsConfig` | Only `http://localhost:5173` is allowed and the value is not configurable | Configure origins by environment and test permitted/rejected origins |
| Demo seeder default safety | PASS | `@ConditionalOnProperty`, `DemoDataSeederTest.requiresExplicitSeedProperty` | Explicit enablement is safe, but production guard is property-only | Add defense in depth for production profile and document deployment policy |
| Public quiz response safety | PASS | Public DTOs and public/attempt API tests | Current responses omit correct flags and explanations | Preserve DTO separation and regression tests |
| Attempt ownership | PASS | `findByIdAndUserId`, `AttemptApiTest` | Current result/take/history access is owner-scoped | Keep ownership checks in service/repository, add invalid-token coverage |
| Admin authorization | PASS | `/api/admin/**` has `ROLE_ADMIN`; admin API tests | Backend guard works; frontend route is only UX support | Preserve backend guard and expand permission regression coverage as APIs grow |
| Frontend API base URL | PASS WITH RISK | `VITE_API_BASE_URL` with localhost fallback and `.env.example` | Build without deployment configuration targets local backend | Require deployment-time configuration and document environment matrix |
| Frontend invalid token handling | NEEDS FOLLOW-UP | `AuthContext`, `api/client.js`, protected routes | Bootstrap `/me` clears invalid token, but ordinary 401 responses do not globally logout/redirect | Centralize 401 handling without treating 403 as logout |
| Hardcoded localhost/local defaults | NEEDS HARDENING | `application.yaml`, `CorsConfig`, `client.js` | Local DB credentials, API URL, and origin defaults are unsuitable for deployment | Separate development and production configuration |
| Input validation | PASS WITH RISK | Bean Validation request records and service checks | Core fields are validated, but many strings/lists lack maximum bounds | Add bounded input rules and focused negative tests |
| Duplicate submit/race condition | NEEDS FOLLOW-UP | `AttemptService`, unique attempt-answer constraint | Sequential resubmit is rejected; concurrent submit has no lock/version | Make submission atomic under concurrency and add a concurrency test |
| Production profile readiness | NEEDS HARDENING | Single `application.yaml` | `ddl-auto=update`, `show-sql=true`, default DB credentials, and fallback JWT secret remain active | Add explicit production profile and startup validation |

## 5. Detailed Findings

### Finding 1: JWT secret has an unsafe deployment fallback

- Status: NEEDS HARDENING
- Evidence: `backend/src/main/resources/application.yaml` maps `app.jwt.secret` to `${JWT_SECRET:dev-secret-change-this-value}`. `JwtService` hashes that value with SHA-256 and uses the result as the HMAC-SHA256 signing key.
- Why it matters: environment configuration is supported, but a deployment that forgets `JWT_SECRET` starts with a publicly known signing input.
- Risk level: High for deployment; acceptable only as an explicit local-development convenience.
- Recommended action: require a sufficiently strong `JWT_SECRET` in non-development profiles and fail startup when it is missing or still equal to the development value.
- Suggested phase: 7.1.

### Finding 2: JWT expiration is enforced but needs configuration validation tests

- Status: PASS WITH RISK
- Evidence: `JWT_EXPIRATION_MS` defaults to `86400000`; `JwtService.generateToken` writes `issuedAt` and `expiration`, and validation verifies the signature, subject, current user, and expiry.
- Why it matters: expiration is an active control, but zero, negative, or excessively long configuration is not rejected at startup. Existing auth tests do not directly exercise expired or invalid-signature tokens.
- Risk level: Medium.
- Recommended action: bind validated JWT properties and add focused expiry, malformed-token, and invalid-signature tests.
- Suggested phase: 7.1 and 7.3.

### Finding 3: CORS is restrictive but local-only

- Status: NEEDS HARDENING
- Evidence: `CorsConfig` allows only `http://localhost:5173`, allows the required API methods and `Authorization`/`Content-Type` headers, sets credentials to false, and registers only `/api/**`. No wildcard origin is used, and `http://127.0.0.1:5173` is not allowed.
- Why it matters: the restrictive local rule is safer than `*`, but it cannot support a deployed frontend and is not environment-configurable.
- Risk level: Medium deployment/configuration risk.
- Recommended action: bind an allowlist from environment-specific configuration and test both accepted and rejected origins. Do not replace it with an unrestricted wildcard.
- Suggested phase: 7.2.

### Finding 4: Demo seeding is disabled by default

- Status: PASS
- Evidence: `DemoDataSeeder` uses `@ConditionalOnProperty(name = "app.seed-demo", havingValue = "true")` without `matchIfMissing=true`. `DemoDataSeederTest.requiresExplicitSeedProperty` and the idempotency test cover explicit enablement and repeat runs.
- Why it matters: normal application startup does not create demo accounts or data.
- Risk level: Low in the current baseline.
- Recommended action: retain the explicit flag and add a production-profile refusal as defense in depth before deployment. Demo credentials must never be presented as production accounts.
- Suggested phase: 7.5.

### Finding 5: Public responses do not disclose answers or explanations

- Status: PASS
- Evidence: public quiz/start/take DTOs expose identifiers and content but not `Option.correct` or `Question.explanation`. `PublicQuizApiTest.publishedQuizDetailIsPublicAndMetadataOnly`, `AdminQuizApiTest.publicDetailAndStartAttemptDoNotExposeCorrectAnswers`, and the start/take tests in `AttemptApiTest` assert the absence of correct flags, correct answers, and explanations.
- Why it matters: clients cannot learn scoring data before submission through the supported public/take endpoints.
- Risk level: Low with current DTO separation and tests.
- Recommended action: keep public and admin/review DTOs separate and require the same regression checks for future endpoints.
- Suggested phase: 7.3.

### Finding 6: Review data is gated by submission and ownership

- Status: PASS
- Evidence: `AttemptService.getResult` uses `findByIdAndUserId`, rejects attempts without `submittedAt`, and only then builds selected option, correct option, and explanation data. `AttemptApiTest.submitScoresSkippedQuestionsAsIncorrectAndResultShowsReviewAfterSubmit`, `cannotSubmitTwiceOrViewOtherUsersAttempt`, and `resultBeforeSubmitFailsAndHistoryReturnsOnlyCurrentUserAttempts` cover the main invariants. The frontend review page consumes the result payload; there is no separate supported `/review` API.
- Why it matters: result/review data is available only to the authenticated attempt owner after submission.
- Risk level: Low with current code and tests.
- Recommended action: preserve repository-level owner filtering and add regression cases whenever result/review endpoints change.
- Suggested phase: 7.3.

### Finding 7: Admin APIs have a backend role guard

- Status: PASS
- Evidence: `SecurityConfig` requires `ROLE_ADMIN` for `/api/admin/**`. `AuthControllerTest.meRequiresAuthenticationAndUserCannotAccessAdminApi`, `AdminQuizApiTest.adminQuizEndpointsRequireAdmin`, and `AdminCategoryApiTest.adminCategoryEndpointsRequireAdmin` verify unauthenticated 401 and USER 403 behavior.
- Why it matters: `AdminRoute` improves frontend UX, but Spring Security remains the authoritative access control.
- Risk level: Low for existing admin endpoints.
- Recommended action: keep the centralized backend matcher and explicit 401/403 tests for every new admin API family.
- Suggested phase: 7.3.

### Finding 8: Frontend token handling is only partially centralized

- Status: NEEDS FOLLOW-UP
- Evidence: `api/client.js` stores `quizmaster.accessToken` in `localStorage` and automatically adds `Authorization: Bearer`. `AuthContext.refreshCurrentUser` clears authentication after a non-network `/api/auth/me` failure and protected routes redirect unauthenticated users. In contrast, `apiRequest` converts ordinary 401/403 responses to errors but does not notify `AuthContext`; pages generally show the error in place.
- Why it matters: an expired token discovered during a normal result, history, submit, or admin request can leave stale authenticated UI state until refresh or another `/me` check. `localStorage` also makes token confidentiality dependent on preventing XSS.
- Risk level: Medium.
- Recommended action: centralize 401 session invalidation and redirect/return-path behavior, keep 403 as an authorization error, and add frontend tests for expired tokens and network failures. Continue to avoid rendering unhandled errors as a blank page.
- Suggested phase: 7.4.

### Finding 9: API and infrastructure defaults are development-only

- Status: NEEDS HARDENING
- Evidence: frontend uses `VITE_API_BASE_URL` but falls back to `http://localhost:8080`; `.env.example` documents that local URL. Backend defaults to local PostgreSQL with `postgres/postgres`, `ddl-auto: update`, and `show-sql: true`. Only one application configuration file was found.
- Why it matters: a missing deployment variable can silently select a local or unsafe default, automatic schema updates are not controlled migrations, and SQL logging may expose operational data.
- Risk level: High as a production-readiness gap, not a critical local-development bug.
- Recommended action: introduce explicit dev/prod profiles, validated required deployment variables, controlled migrations, and production-safe logging/JPA settings.
- Suggested phase: 7.1 and 7.2, followed by deployment work outside this audit.

### Finding 10: Input validation covers core invariants but lacks comprehensive bounds

- Status: PASS WITH RISK
- Evidence: auth DTOs use `@Email`, `@NotBlank`, and minimum password length; attempt DTOs require IDs and validate nested answers; admin DTOs validate required content, positive order/time values, and minimum option count. Services verify quiz ownership of questions/options, duplicate question answers, publish validity, and exactly one correct option where required. Existing auth/admin/attempt tests cover malformed JSON and invalid domain input.
- Why it matters: no broad maximum lengths or answer-list size limits were observed, so oversized valid-shaped input relies on database/application limits rather than an explicit API contract.
- Risk level: Medium.
- Recommended action: define maximum lengths and collection sizes based on product limits, normalize email consistently, and add boundary tests without changing the single-choice contract.
- Suggested phase: 7.3.

### Finding 11: Sequential duplicate submit is safe; concurrent submit is not verified

- Status: NEEDS FOLLOW-UP
- Evidence: `AttemptService.submitAttempt` is transactional and rejects an already populated `submittedAt`. `AttemptAnswer` has a unique constraint on `(attempt_id, question_id)`, and the frontend guards/disables while `submitting`. `AttemptApiTest.cannotSubmitTwiceOrViewOtherUsersAttempt` covers sequential resubmission. No `@Version`, pessimistic lock, or concurrency test was found.
- Why it matters: two requests can read the same unsubmitted attempt before either commits. The unique constraint may reject one answer batch, but the resulting API error and atomicity are not defined or tested.
- Risk level: Medium.
- Recommended action: serialize or optimistically lock submission, map conflicts to a stable response, and add a concurrent-submit integration test. Frontend disabling remains UX support, not the server guarantee.
- Suggested phase: 7.3.

### Finding 12: Security regression coverage has focused gaps

- Status: NEEDS FOLLOW-UP
- Evidence: current tests strongly cover public data separation, ownership, admin roles, publish/unpublish, structural locking, history, result/review, and seeder idempotency. No focused tests were found for expired/forged JWTs, CORS origin policy, concurrent submission, or frontend automatic 401 recovery.
- Why it matters: these are the areas most likely to regress during the upcoming hardening changes.
- Risk level: Medium.
- Recommended action: add targeted tests alongside each Phase 7 change rather than building a broad unrelated test framework.
- Suggested phase: 7.3, 7.4, and 7.6.

## 6. Security Controls Already Working

- Passwords are encoded and verified with `BCryptPasswordEncoder`; legacy plaintext login is rejected by test.
- JWT signature, subject, current-user match, and expiration are validated before authentication is installed.
- Spring Security is stateless and returns structured 401/403 responses.
- Admin APIs require the backend `ADMIN` role.
- Attempt take, submit, result, and history operations are authenticated and owner-scoped.
- Correct answers and explanations are absent from public, start, and take responses.
- Correct answers and explanations are returned only in the submitted owner's result/review data.
- Unpublished and locked quizzes remain hidden from public APIs while historical results remain available to their owner.
- Demo seeding requires explicit opt-in and is idempotent.
- Frontend login, register, start, and submit actions use in-flight guards to reduce accidental double actions.

## 7. Risks and Gaps Before Deployment

- Deployment must not permit the fallback JWT secret.
- Database URL, username, and password must be required deployment configuration rather than local defaults.
- CORS origins and frontend API URL must be configured for the deployed domains.
- `ddl-auto=update` and `show-sql=true` need production-safe replacements.
- A defined production profile and configuration validation are missing.
- Demo accounts and the seed flag need an explicit production policy and defense in depth.
- Expired-token handling is inconsistent between initial `/me` bootstrap and later API requests.
- JWTs in `localStorage` increase the impact of an XSS issue; CSP and frontend injection prevention should be included in deployment hardening analysis.
- Concurrent attempt submission behavior is not deterministic or tested.
- Request DTOs need product-based maximum lengths and collection sizes.
- No rate limiting or login abuse control was verified in the current code. This is a deployment hardening gap, not evidence of an active breach.

No severe ownership, admin-authorization, or pre-submit answer-disclosure bug was found. The configuration gaps above still block any production-ready claim.

## 8. Recommended Phase 7 Task Breakdown

### 7.1 Backend JWT and environment configuration hardening

Require and validate secrets and database settings in non-development profiles. Add production-safe JPA/logging settings and focused JWT expiry/signature tests.

### 7.2 CORS and frontend API base URL hardening

Make allowed origins environment-specific without wildcards. Require the deployed frontend API URL, document dev/prod examples, and test origin behavior.

### 7.3 Authentication, permission, validation, and attempt regression

Expand forged/expired-token, role, ownership, input-boundary, and public-answer tests. Define and enforce atomic concurrent submission behavior.

### 7.4 Frontend token and error-state hardening

Centralize 401 logout/redirect behavior while preserving 403 messaging and network retry. Add frontend tests for stale tokens, failed `/me`, and protected-route recovery.

### 7.5 Seeder and demo safety verification

Add a production-profile guard for demo seeding and verify the deployment runbook cannot accidentally enable demo accounts. Preserve opt-in and idempotency behavior.

### 7.6 Final Phase 7 regression

Run backend, frontend, API security, and browser regression after hardening. Re-audit configuration with deployment-like values and publish a final report without claiming controls that were not verified.

## 9. Verification

Backend tests:

```powershell
cd D:\QuizMaster\backend
.\mvnw.cmd test
```

- Result: **PASS**.
- Tests: 47 run, 0 failures, 0 errors, 0 skipped.
- Accepted warnings: Mockito/Byte Buddy dynamic agent attachment and its future JDK restriction warning.

Frontend build:

```powershell
cd D:\QuizMaster\frontend
npm run build
```

- Result: **PASS**.
- Vite 6.4.3 transformed 94 modules and completed in 2.77 seconds.

Git status:

- Before Phase 7.0: clean.
- After test/build and before report creation: clean.
- Expected task change: only `docs/phase-7-security-audit.md`; final post-commit status is verified in the completion report.

## 10. Conclusion

Phase 7.0 audit is complete. No severe security logic blocker was found in public answer safety, attempt ownership, or admin authorization, and the existing 47-test backend suite remains green. The application is **not production-ready** because deployment-safe JWT, database, CORS, frontend API, profile, token-expiry UX, and concurrency hardening remain incomplete.

Proceed with Phase 7.1 backend JWT and environment configuration hardening first, then Phase 7.2 CORS/API configuration and the targeted regression phases above.
