# Phase C0 - Current Feature Inventory

## Status

PASS

This inventory is complete enough for Phase C planning. The repository was inspected through backend source, frontend source, tests, README, and deployment/demo documentation.

Pre-audit checks:

| Check | Result |
| --- | --- |
| `git status --short` | Clean |
| `git rev-list --left-right --count origin/main...HEAD` | `0 0` |
| Recent commits inspected | Latest: `c559ec9 Document Phase B staging demo data creation` |
| Source areas inspected | `backend/`, `frontend/`, `docs/`, `README.md` |

## Purpose

This report inventories existing real QuizMaster features before starting UX/UI polish and mockup alignment. It is meant to help Phase C decide what can be visually aligned with the uploaded mockups, what needs real product work, and what should be deferred.

## Important Rule

This report lists actual implemented/documented features only. Mockup screenshots are not treated as proof of implemented functionality.

## Current App Summary

QuizMaster is currently a full-stack quiz application with:

- Spring Boot backend with PostgreSQL persistence.
- React/Vite frontend with Tailwind styling.
- Guest/public quiz browsing.
- Email/password registration and login.
- JWT access-token authentication.
- Authenticated user quiz-taking, result, answer review, and attempt history.
- Admin category, quiz, question, option, and publish management.
- Staging frontend deployed at `https://quizmaster-staging.vercel.app`.
- Staging backend deployed at `https://quizmaster-api-staging.onrender.com`.
- Demo data documented and created in staging for Phase B2.

## User Roles

| Role | Current capabilities | Evidence source |
| --- | --- | --- |
| Guest | View landing page, register, login, view public categories, view published quiz catalog, view published quiz detail metadata. Guest attempting to start a quiz is redirected to login. | `frontend/src/App.jsx`, `frontend/src/layouts/PublicLayout.jsx`, `frontend/src/pages/QuizCatalogPage.jsx`, `frontend/src/pages/QuizDetailPage.jsx`, `backend/src/main/java/com/quizmaster/config/SecurityConfig.java` |
| USER | All guest capabilities; start a published quiz attempt; resume in-progress attempt; select one option per question; submit; view own result/review/history. | `frontend/src/auth/ProtectedRoute.jsx`, `frontend/src/pages/TakeQuizPage.jsx`, `frontend/src/pages/ResultPage.jsx`, `frontend/src/pages/AnswerReviewPage.jsx`, `frontend/src/pages/MyAttemptsPage.jsx`, `backend/src/main/java/com/quizmaster/attempt/AttemptController.java`, `AttemptService.java` |
| ADMIN | All USER capabilities; access admin layout; create/update/delete categories; create/update/delete quizzes when allowed; create/update/delete questions/options when unlocked; publish/unpublish quizzes. | `frontend/src/auth/AdminRoute.jsx`, `frontend/src/layouts/AdminLayout.jsx`, `frontend/src/pages/admin/*`, `backend/src/main/java/com/quizmaster/category/AdminCategoryController.java`, `backend/src/main/java/com/quizmaster/quiz/AdminQuizController.java` |

## Backend Feature Inventory

### Auth

Implemented:

- `POST /api/auth/register`.
- `POST /api/auth/login`.
- `GET /api/auth/me`.
- Email normalization to lowercase/trimmed.
- Duplicate email rejection.
- Password hashing through `BCryptPasswordEncoder`.
- JWT access token generation with subject email, `userId`, `role`, issued-at, and expiration claims.
- JWT validation through `JwtAuthenticationFilter`.
- Stateless Spring Security session policy.
- Roles: `USER`, `ADMIN`.

Not implemented:

- Refresh tokens.
- Password reset / forgot password.
- Email verification.
- OAuth login.
- Account profile management beyond current user identity response.

### Public Quiz APIs

Implemented:

- `GET /api/categories`.
- `GET /api/quizzes`.
- `GET /api/quizzes?categoryId={id}`.
- `GET /api/quizzes/{id}`.
- Published-only quiz filtering.
- Public quiz detail returns metadata only: id, title, description, category, question count, time limit, published flag.
- Public detail does not expose questions, options, explanations, or correct answers.

Limitations:

- No search endpoint.
- No sort parameter.
- No pagination.
- No difficulty/tag fields.

### Attempt / User Quiz APIs

Implemented:

- `POST /api/attempts` starts an attempt for an authenticated user.
- `GET /api/attempts/{id}/take` restores an in-progress attempt.
- `POST /api/attempts/{id}/submit` scores a submitted attempt.
- `GET /api/attempts/{id}/result` returns result plus review data after submission.
- `GET /api/attempts/me` returns current user's attempt history.
- Ownership checks use attempt id plus current user id.
- Starting/taking does not expose correct answers or explanations.
- Result/review exposes selected option, correct option, correctness, and explanation after submission.
- Duplicate submit is rejected with `Attempt has already been submitted`.
- Duplicate answers for one question are rejected.
- Answers for questions/options outside the quiz are rejected.
- Skipped questions are counted incorrect through total question count versus answered/correct count.

Limitations:

- No countdown enforcement on backend.
- No attempt expiration.
- No per-question timing.
- No multi-choice scoring.

### Admin APIs

Implemented:

- Category create/update/delete under `/api/admin/categories`.
- Public category read reused by admin frontend.
- Quiz list/detail/create/update/delete under `/api/admin/quizzes`.
- Question create/update/delete under `/api/admin/quizzes/{quizId}/questions` and `/api/admin/questions/{questionId}`.
- Options are handled inside question create/update payloads.
- Publish/unpublish endpoints.
- Publish validation checks:
  - quiz title required;
  - at least one question;
  - question content required;
  - positive unique question display orders;
  - at least two options per question;
  - option content required;
  - positive unique option display orders;
  - exactly one correct option per question.
- Category delete is rejected when quizzes use the category.
- Quiz delete is rejected when attempts exist.
- Structural question/option edits are rejected when quiz is published.
- Structural question/option edits are rejected when quiz has attempts.

Limitations:

- Admin metadata update is still allowed for quizzes with attempts.
- No quiz versioning.
- No bulk import.
- No image upload.
- No admin analytics endpoints.

### Security / Permissions

Implemented:

- `/api/auth/register` and `/api/auth/login` are public.
- `/api/categories/**` and `/api/quizzes/**` are public.
- `/api/admin/**` requires `ROLE_ADMIN`.
- `/api/auth/me` and `/api/attempts/**` require authentication.
- Backend permissions are enforced server-side, not only by frontend route hiding.
- CORS allowed origins are configured through `app.cors.allowed-origins`.
- CORS allows `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`.
- CORS allows `Authorization` and `Content-Type` headers.
- CORS rejects blank, unresolved placeholder, or wildcard origins.
- Production profile requires external datasource variables and JWT secret.

Known limitations:

- No refresh-token rotation.
- No rate limiting.
- No audit log.
- No monitoring/alerting.
- No production migration/rollback strategy.
- Staging still uses temporary `ddl-auto=update` per deployment docs.

### Data Model

| Model | Important UI-relevant fields |
| --- | --- |
| `User` | `id`, `email`, `password` hash, `role`, `createdAt` |
| `UserRole` | `USER`, `ADMIN` |
| `Category` | `id`, `name`, `slug`, `createdAt`, `updatedAt` |
| `Quiz` | `id`, `category`, `title`, `description`, `timeLimitMinutes`, `published`, `createdAt`, `updatedAt` |
| `Question` | `id`, `quiz`, `content`, `explanation`, `displayOrder`, `createdAt`, `updatedAt` |
| `Option` | `id`, `question`, `content`, `correct`, `displayOrder`, `createdAt`, `updatedAt` |
| `Attempt` | `id`, `user`, `quiz`, `correctCount`, `totalQuestions`, `scorePercentage`, `startedAt`, `submittedAt` |
| `AttemptAnswer` | `id`, `attempt`, `question`, `option`; unique attempt/question pair |

### Backend Missing Features

| Feature | Status | Evidence / note |
| --- | --- | --- |
| Google OAuth | Not found | No OAuth controller/provider flow; docs mark OAuth out of scope. |
| Facebook OAuth | Not found | No provider flow. |
| Refresh token | Not found | Access token only. |
| Forgot password | Not found | No endpoint or email flow. |
| Email verification | Not found | No verification entity/token/email flow. |
| Leaderboard | Not found | No API/entity/page. |
| Analytics dashboard endpoints | Not found | No stats/reporting controller. |
| Notification system | Not found | No notification model/API. |
| Dark mode persistence | Not found | No theme field/API. |
| Import Excel | Not found | No upload/import endpoint. |
| Image upload | Not found | No media storage/entity/endpoint. |
| Payment/upgrade | Not found | Out of MVP; no billing model/API. |
| Achievements/badges | Not found | No badge/achievement model/API. |
| Public profile | Not found | No profile route/API beyond current user. |
| Advanced search/filter/pagination | Partially found | Category filter exists; no search/sort/page API. |
| Difficulty/tags | Not found | No fields in `Quiz` or related models. |
| Multi-choice questions | Not found | Single-choice is enforced; exactly one correct option. |
| Local/demo seeder | Implemented | `DemoDataSeeder`, disabled by default and documented as opt-in. |

## Frontend Feature Inventory

### Routes

| Route | Page/component | Access level | Current behavior | Notes |
| --- | --- | --- | --- | --- |
| `/` | `LandingPage` inside `PublicLayout` | Public | Simple marketing/entry page with links to catalog/register and static preview card. | Real page exists, but less visual/illustrative than mockup. |
| `/login` | `LoginPage` | Public | Email/password login, show/hide password, inline error, redirects to prior route or `/quizzes`. | No social login. |
| `/register` | `RegisterPage` | Public | Email/password/confirm registration, show/hide password, auto-login when token returned. | No name field, terms checkbox, social registration, email verification. |
| `/quizzes` | `QuizCatalogPage` | Public | Loads categories and published quizzes; category filter; loading/error/empty states. | No search, sort, pagination, sidebar filters, difficulty filters. |
| `/quizzes/:id` | `QuizDetailPage` | Public; start requires auth | Loads public metadata; guest Start redirects login; auth Start creates attempt and navigates to take route. | No question preview before attempt. |
| `/attempts/:attemptId/take` | `TakeQuizPage` | Authenticated | Restores/takes attempt, local answer draft persistence, previous/next, question navigator, submit confirmations. | No visible countdown timer despite time limit metadata. |
| `/attempts/:attemptId/result` | `ResultPage` | Authenticated owner | Loads result summary and score card. | Uses same result endpoint as review. |
| `/attempts/:attemptId/review` | `AnswerReviewPage` | Authenticated owner | Shows per-question review, selected/correct answers, explanations, summary navigator. | Requires submitted attempt. |
| `/attempts` | `MyAttemptsPage` | Authenticated | Shows attempt history, result/review links for submitted attempts. | No pagination/filtering. |
| `/me/attempts` | `Navigate` | Authenticated | Redirects to `/attempts`. | Compatibility route. |
| `/admin/quizzes` | `AdminQuizListPage` inside `AdminLayout` | ADMIN | Lists admin quizzes with status, category, count, time, created date, edit link. | No admin dashboard route. |
| `/admin/quizzes/new` | `AdminQuizEditorPage` | ADMIN | Creates draft quiz metadata. | Questions available after saved draft route. |
| `/admin/quizzes/:id/edit` | `AdminQuizEditorPage` | ADMIN | Edits metadata; manages questions/options; publish/unpublish; structural lock messages. | No image upload/import Excel. |
| `/admin/categories` | `AdminCategoryPage` | ADMIN | Create/edit/delete categories with confirmation and protected delete errors. | Public read API used for list. |
| `*` | `NotFoundPage` | Public layout | 404 page. | Uses public layout. |

### Public Pages

#### Landing

- Functionality: static hero/intro, calls to browse quizzes and create account, static capability cards.
- UI roughness: current page is usable but visually simpler than the uploaded illustrated mockup; no real hero artwork/assets.
- Data dependencies: none.
- Missing states: none needed.

#### Quiz catalog

- Functionality: loads categories and quizzes, category chips filter via backend `categoryId`, card grid.
- UI roughness: simple chip filter and cards; no mockup-style sidebar/search/sort.
- Data dependencies: `GET /api/categories`, `GET /api/quizzes`.
- Missing states/features: search, sort, pagination, difficulty/time filters, image/card thumbnails.

#### Quiz detail

- Functionality: metadata, question count/time limit, Start quiz, guest login redirect.
- UI roughness: simple card, no rich detail layout.
- Data dependencies: `GET /api/quizzes/{id}`, `POST /api/attempts`.
- Missing states/features: no public preview of questions/options, no recommended quizzes.

#### Login

- Functionality: email/password login, show/hide password, invalid login error handling.
- UI roughness: simple auth shell; less elaborate than mockup.
- Data dependencies: `POST /api/auth/login`, `GET /api/auth/me`.
- Missing states/features: forgot password, remember me, social login, name/avatar/profile dropdown.

#### Register

- Functionality: email/password/confirm-password registration and auth application.
- UI roughness: simple auth shell.
- Data dependencies: `POST /api/auth/register`, `GET /api/auth/me`.
- Missing states/features: full name, terms checkbox, social login, email verification.

### User Pages

#### Take quiz

- Functionality: question display, option selection, previous/next, question navigator, progress, local answer draft persistence, submit confirmation for blank/partial answers.
- UI roughness: usable but less close to mockup; no timer countdown widget.
- Data dependencies: `POST /api/attempts`, `GET /api/attempts/{id}/take`, `POST /api/attempts/{id}/submit`.
- Missing states/features: enforced timer, quiz info side panel metrics like points, achievements, per-question scoring display.

#### Result

- Functionality: score percentage, correct/wrong/skipped/total, review link, catalog link.
- UI roughness: has circular score card but simpler than mockup; no achievements/ranking/time-complete metrics except started/submitted data hidden in result object.
- Data dependencies: `GET /api/attempts/{id}/result`.
- Missing states/features: badges/achievements, rank percentile, completion time display.

#### Review

- Functionality: selected answers, correct answers, explanation, per-question status, summary.
- UI roughness: close in capability to mockup but simpler visually.
- Data dependencies: `GET /api/attempts/{id}/result`.
- Missing states/features: right-side numbered color navigator exists, but no collapse/expand state beyond rendering all cards.

#### Attempt history

- Functionality: list current user's attempts, show submitted/in-progress status, result/review links.
- UI roughness: simple list cards.
- Data dependencies: `GET /api/attempts/me`.
- Missing states/features: filters, pagination, analytics trends.

### Admin Pages

#### Category management

- Functionality: list/create/edit/delete categories, slug helper, confirm delete.
- UI roughness: functional but not mockup-style sidebar/table density.
- Data dependencies: `GET /api/categories`, admin category mutations.
- Missing states/features: search/pagination.

#### Quiz list

- Functionality: list quizzes with status/metadata and edit link.
- UI roughness: card list, not dense table/dashboard.
- Data dependencies: `GET /api/admin/quizzes`.
- Missing states/features: search/sort/filter/pagination.

#### Quiz metadata form

- Functionality: title, description, category, time limit.
- UI roughness: basic form.
- Data dependencies: admin quiz create/update.
- Missing states/features: difficulty, tags, thumbnail/image, points per question.

#### Question editor

- Functionality: content, explanation, display order, dynamic options, single correct radio, add/remove option, client validation.
- UI roughness: usable but less visually rich than mockup.
- Data dependencies: admin question create/update/delete.
- Missing states/features: image upload, Excel import, drag reorder, multi-choice, rich text.

#### Publish/unpublish UI

- Functionality: draft/published badge, question count, visibility, publish/unpublish button, messages/errors, structural lock warnings.
- UI roughness: functional sticky status card.
- Data dependencies: publish/unpublish endpoints and admin quiz detail.
- Missing states/features: preview mode button.

### Shared Frontend Systems

| System | Status | Notes |
| --- | --- | --- |
| Navbar | Implemented | Public layout shows Home, Quizzes, My Attempts when auth, Admin when admin, Login/Register or Logout. |
| Admin layout/sidebar | Implemented | Sidebar links: Quizzes, Categories, Public site; signed-in admin block. No dashboard/statistics link. |
| Layout containers | Implemented | `PageContainer`, `PageHeader`, `PublicLayout`, `AdminLayout`. |
| ProtectedRoute | Implemented | Redirects guests to login; handles auth loading/error. |
| AdminRoute | Implemented | Redirects guests to login and non-admin users to `/`. |
| AuthContext | Implemented | Stores token, refreshes `/api/auth/me`, login/register/logout, handles global unauthorized. |
| API client | Implemented | Centralized base URL, bearer token, timeout, error handling, unauthorized event. |
| Button styles | Implemented | Shared Button component. |
| Card styles | Implemented | Shared Card component. |
| Form styles | Implemented | Shared Input/Select/Textarea controls. |
| Loading states | Implemented | `LoadingState`. |
| Empty states | Implemented | `EmptyState`. |
| Error states | Implemented | `ErrorState`. |
| Responsive patterns | Implemented | Tailwind responsive grids/flex patterns across public/user/admin pages. |

### Frontend Missing Features

| Feature | Status | Evidence / note |
| --- | --- | --- |
| Dashboard page | Not found | No `/dashboard` or admin dashboard route. |
| Stats page | Not found | No `/statistics` or report page. |
| Charts | Not found | No chart library and no chart components. |
| Leaderboard page | Not found | No route/API. |
| Social login buttons wired to backend | Not found | Login/Register contain email/password only. |
| Notification bell | Not found | No component/state/API. |
| Dark mode | Not found | No theme toggle/persistence. |
| Avatar upload | Not found | No profile/avatar model/UI. |
| Profile dropdown behavior | Partially found | Auth email/role and logout exist; no dropdown/profile actions. |
| Import Excel UI | Not found | No button/input/parser/API. |
| Image upload UI | Not found | No file input/upload flow in current admin editor. |
| Payment/upgrade UI | Not found | No route/component/API. |
| Achievement UI | Not found | No real achievement data/components. |
| Advanced catalog filters | Partially found | Category filter exists only. |
| Pagination | Not found | No API/page UI pagination. |
| Search | Not found | No search state/API in current catalog. |
| Sort | Not found | No sort state/API in current catalog. |

## Current Demo Data Support

Using docs only:

- Phase B2 created five staging demo categories:
  - Java / Spring Boot
  - Database / SQL
  - Networking
  - English Vocabulary
  - Software Engineering
- Phase B2 created five published demo quizzes:
  - Java Core & Spring Boot Basics
  - SQL & Relational Database Fundamentals
  - Computer Networking Essentials
  - Software Engineering & Testing Basics
  - English Vocabulary for Developers
- Each demo quiz has four single-choice questions and four options per question.
- Public catalog should have content on staging.
- Existing Phase 8.8 smoke data was preserved.
- No credentials are documented here.

Documentation note:

- `README.md` still says the next step is Phase B2, while `docs/phase-b-demo-data-execution.md` and current git history show B2 is complete. This is a documentation freshness issue, not a product feature gap.

## Mockup Alignment Analysis

| Mockup area | Can match with existing features? | Requires new backend? | Requires new frontend only? | Recommendation |
| --- | --- | --- | --- | --- |
| 1. Landing page | Existing feature, UI polish only | No | Yes | Polish with current static content and links. Do not claim live stats unless backed by data. |
| 2. Quiz catalog with cards/sidebar/search/sort | Partly existing | Search/sort/pagination need backend or client-only limited handling | Cards/sidebar can be frontend-only; search/sort only limited client-side on loaded list | Do card/sidebar/category polish now; defer or scope search/sort carefully. |
| 3. Quiz detail | Existing feature, UI polish only | No | Yes | Polish metadata/start flow only. Do not expose questions before attempt. |
| 4. Take quiz page | Existing feature, UI polish only | Backend timer enforcement would be new | Yes for layout/progress/navigator polish | Polish visual layout; do not fake countdown enforcement. |
| 5. Result page | Existing feature, UI polish only | Achievements/ranking/time metrics need backend if real | Yes for score/correct/wrong/skipped visuals | Polish score summary; do not fake badges/ranking. |
| 6. Review page | Existing feature, UI polish only | No | Yes | Good candidate for mockup-style review polish using existing result/review data. |
| 7. Login/register page | Existing email/password feature | OAuth/forgot/email verification need backend | Yes for visual polish of existing forms | Polish current email/password forms; social buttons must be absent or disabled only if clearly marked unavailable. |
| 8. Admin quiz editor | Existing feature, UI polish only for current fields | Image upload/import Excel require backend and possibly storage/import parsing | Yes for layout around current fields | Polish current metadata/question/options/publish workflow; do not fake image/Excel. |
| 9. Admin sidebar/dashboard layout | Sidebar exists; dashboard does not | Dashboard stats require backend | Sidebar polish frontend-only | Polish admin shell/sidebar; defer dashboard content unless real endpoints are built. |
| 10. Admin analytics/report page | Not found | Yes | No, unless static placeholder, which should not ship | Requires backend/API feature; should defer or make a real MVP later. |
| 11. Leaderboard | Not found | Yes | No | Requires backend/API/database query; defer post-v1 unless explicitly scoped. |
| 12. Notifications | Not found | Yes | No | Requires backend/API; defer post-v1. |
| 13. Dark mode | Not found | No for local toggle, yes if user persistence | Yes for local-only | Optional frontend-only polish, but persistence would need design/API. |
| 14. Import Excel | Not found | Yes | Frontend parser alone would still need admin create flow integration | Must not fake; defer or implement as real feature later. |
| 15. Image upload | Not found | Yes, likely storage/schema | No | Must not fake; defer post-v1 unless storage/schema scope is approved. |
| 16. Upgrade/payment | Not found | Yes, plus provider/billing model | No | Must not fake; defer post-v1. |
| 17. Social login | Not found | Yes | No | Must not fake; defer until OAuth is implemented. |

## Recommended Phase C Breakdown

### Phase C1 - Existing Flow Visual Polish

Recommended before v1.0:

- Public layout/navbar polish.
- Landing page polish using static, honest content.
- Login/register visual polish for existing email/password auth only.
- Shared UI polish for buttons, cards, forms, loading/error/empty states.

No backend work required.

### Phase C2 - Catalog UX Enhancements

Recommended scope:

- Visual catalog card/sidebar polish.
- Keep category filtering because it is already supported by the backend.
- Optional client-side search/sort only if clearly scoped to the currently loaded list.

Defer unless backend work is approved:

- Server search.
- Server sort.
- Pagination.
- Difficulty/tag filters.
- Thumbnails/images.

### Phase C3 - Take/Result/Review Visual Polish

Recommended before v1.0:

- Take quiz layout closer to mockup: progress, side summary, question navigator, selected option styling.
- Result page score summary polish using existing `correctCount`, `totalQuestions`, `scorePercentage`, and review link.
- Review page polish using existing review payload.

Do not add fake:

- Achievements.
- Rank percentile.
- Timer enforcement.
- Award badges.

### Phase C4 - Admin Editor Visual Polish

Recommended before v1.0:

- Admin sidebar/shell polish.
- Quiz list polish.
- Category management polish.
- Metadata/question/options/publish UI polish.
- Better locked-state and validation-message presentation.

Do not add fake:

- Import Excel.
- Image upload.
- Analytics widgets.
- Upgrade/payment card.

### Phase C5 - Optional Admin Analytics Dashboard MVP

Not recommended before v1.0 unless project scope expands.

Reason:

- No analytics/report backend exists.
- Mockup analytics screen would require real endpoints for quiz counts, attempts, average score, completion rate, trends, distribution, popular quizzes, and difficult questions.
- Some data can be derived from existing tables, but new service/controller/DTO/query work is required.

If approved later, make it a real feature phase, not visual polish.

## Risk Assessment

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Scope creep | Phase C turns from polish into product expansion. | Keep C1-C4 focused on existing flows. |
| Fake feature temptation | Mockup includes analytics, notifications, OAuth, Excel, upload, payment, achievements. | Do not render controls that imply unavailable backend behavior. |
| UI changes breaking working flows | Existing staging flows are already validated. | Keep API contracts unchanged and regression-test main flows after polish. |
| Responsive issues | Mockups are desktop-heavy. | Verify mobile/desktop layouts after each frontend polish phase. |
| Admin editor complexity | Editor has locks, publish rules, and historical attempt safety. | Preserve disabled/locked behavior and backend validation messages. |
| Answer leak risk | Over-polished detail/take pages could accidentally expose review data early. | Keep public detail metadata-only and take endpoint answer-safe. |
| Overbuilding dashboard/leaderboard before v1.0 | Requires backend/schema/API expansion and delays release. | Defer C5/leaderboard unless explicitly approved as new feature work. |

## Final Recommendation

Recommended option: **Option A - Keep v1.0 focused. Do visual polish only on existing features.**

Rationale:

- The core MVP already works end to end.
- The uploaded mockups are strongest as visual direction for existing flows: landing, catalog, take quiz, result, review, auth, and admin editor.
- Fully matching all screenshots would require real new features: analytics dashboard, leaderboard, notifications, dark mode persistence, import Excel, image upload, payment/upgrade, achievements, and OAuth.
- Those features should not be faked in UI and should not be called simple UI polish.

Option B, adding one real Admin Analytics Dashboard MVP, is feasible only as a new backend/frontend feature phase. It is not recommended before v1.0 unless the release goal changes.

Option C, fully matching all mockups, is a larger product expansion and should be treated as post-v1 or a new roadmap track.
