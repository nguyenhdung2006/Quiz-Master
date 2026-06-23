# Phase 8.8 - Staging Full Smoke Test

## Status

**PASS WITH NOTES**

## Executive Summary

Phase 8.8 tested the deployed staging frontend, backend, CORS behavior, SPA route fallback, guest routes,
auth flows, protected route behavior, and available error states against the real staging environment.

Frontend:

```text
https://quizmaster-staging.vercel.app
```

Backend:

```text
https://quizmaster-api-staging.onrender.com
```

Final result after rerun: **PASS WITH NOTES**. The first Phase 8.8 attempt was correctly marked
**NOT CLOSED** because admin provisioning and published quiz content were missing. The rerun safely
unblocked those prerequisites by registering a staging admin candidate through the deployed frontend,
manually promoting it in Neon SQL Editor, and creating minimal Phase 8.8 content through the Admin UI.

The deployed staging app is now usable end to end for the Phase 8.8 smoke surface: guest browsing,
auth, admin category/quiz management, publish validation, published quiz visibility, USER quiz-taking,
result/review/history, ownership protection, CORS, SPA fallback, and no-localhost checks all passed.
Remaining notes are non-critical limitations: Render free tier cold start risk, no custom domain, staging
`ddl-auto=update`, no formal migrations yet, backend offline test skipped, and browser resource timing
unavailable in automation.

## Environment

| Item | Value |
|---|---|
| Frontend URL | `https://quizmaster-staging.vercel.app` |
| Backend URL | `https://quizmaster-api-staging.onrender.com` |
| Frontend platform | Vercel |
| Backend platform | Render Web Service |
| Database provider | Neon PostgreSQL staging, per Phase 8 docs |
| Branch | `main` |
| Latest commit before first smoke | `38ae86b Document frontend staging deployment` |
| Latest commit before rerun | `064b32b Document staging smoke test` |
| Git sync status before rerun | `origin/main...HEAD` = `0 1` |
| Working tree before rerun | clean |

## Preconditions

Required for full smoke:

| Precondition | Observed | Result |
|---|---|---|
| USER A account | `phase88-user-a-rerun-1782201208790@quizmaster.local` created through deployed frontend | PASS |
| USER B account | `phase88-user-b-rerun-1782201208790@quizmaster.local` created through deployed frontend | PASS |
| ADMIN account | `phase88-admin-1782200443830@quizmaster.local` registered through frontend, then manually promoted in Neon SQL Editor | PASS |
| At least 1 category | `Phase 8.8 Smoke Category` exists; public API returns id `1` | PASS |
| At least 1 published quiz | `Phase 8.8 Smoke Published Quiz` exists; public API returns id `2` | PASS |
| Published quiz has 2+ questions/options | Published quiz has 2 questions, each with 2 options | PASS |
| Explanation data | Review page shows explanations after submit | PASS |
| Optional draft quiz | `Phase 8.8 Smoke Draft Quiz` exists and remains Draft/admin-only | PASS |

Initial attempt note: the first run found empty public categories/quizzes and no admin provisioning, so
the report was marked **NOT CLOSED** in commit `064b32b`. The rerun completed the missing prerequisites
without enabling demo seed and without direct Codex access to database secrets.

## Test Data

| Type | Value | Notes |
|---|---|---|
| Admin | `phase88-admin-1782200443830@quizmaster.local` | Registered through frontend, promoted manually by user in Neon SQL Editor |
| USER A | `phase88-user-a-rerun-1782201208790@quizmaster.local` | Created through deployed frontend registration |
| USER B | `phase88-user-b-rerun-1782201208790@quizmaster.local` | Created through deployed frontend registration |
| Category | `Phase 8.8 Smoke Category` / `phase-8-8-smoke-category` | Created through Admin UI |
| Published quiz | `Phase 8.8 Smoke Published Quiz` | Created through Admin UI; published; public id `2` |
| Draft quiz | `Phase 8.8 Smoke Draft Quiz` | Created through Admin UI; left unpublished; admin id `1` |
| Questions | `Phase 8.8 Smoke Question 1`, `Phase 8.8 Smoke Question 2` | Each has 2 options and one correct answer |
| Attempt | USER A attempt id `1` | Submitted with one correct and one wrong answer |
| Cleanup | Non-destructive | Test data left in staging and documented |

No password, secret, or token value is recorded in this report.

## Admin Provisioning Method

Admin provisioning was completed using the safest available path:

1. Codex registered `phase88-admin-1782200443830@quizmaster.local` through the deployed frontend.
2. Backend source was inspected before SQL was suggested:
   - table: `users`
   - email column: `email`
   - role column: `role`
   - role enum values: `USER`, `ADMIN`
   - role storage: `@Enumerated(EnumType.STRING)`
3. The user manually ran a targeted `UPDATE users SET role = 'ADMIN' ...` statement in Neon SQL Editor.
4. The SQL returned 1 row and the role became `ADMIN`.
5. Codex verified admin login through the deployed frontend.

Codex did not receive or use Neon credentials, did not print a database URL, and did not enable demo seed.

## Result Legend

| Label | Meaning |
|---|---|
| PASS | verified and works |
| FAIL | verified and broken |
| BLOCKED | cannot test because prerequisite is missing |
| DEFERRED | intentionally postponed with a clear reason |
| N/A | not applicable |
| PASS WITH NOTES | works, but with limitations worth documenting |

## Guest Test Matrix

| ID | Test | Expected | Actual | Result | Notes |
|---|---|---|---|---|---|
| GUEST-01 | Landing loads | Landing renders, no crash | `/` rendered hero/nav; refresh rendered | PASS | No console warn/error observed |
| GUEST-02 | Catalog loads | `/quizzes` renders empty state or quiz list | Catalog showed `Phase 8.8 Smoke Published Quiz` | PASS | Published quiz visible |
| GUEST-03 | Category filter | Works if categories exist | Category filter showed `Phase 8.8 Smoke Category` and catalog stayed clean | PASS | Category API returned id `1` |
| GUEST-04 | Quiz detail loads | Published quiz detail loads | `/quizzes/2` loaded metadata, question count, and start control | PASS | Public detail visible |
| GUEST-05 | Guest start quiz redirects to login | Guest cannot create attempt | Guest clicking Start quiz redirected to `/login` | PASS | No guest attempt created through UI |
| GUEST-06 | Public answer safety | No correct flags/explanations before submit | Public detail/API returned metadata only; no options/correct flags/explanations | PASS | Review explanations appear only after submit |
| GUEST-07 | Protected route redirect | Guest redirected/blocked | `/attempts`, `/me/attempts`, `/admin/categories`, `/admin/quizzes/new` redirected to `/login` | PASS | Browser route behavior verified |

## Auth Test Matrix

| ID | Test | Expected | Actual | Result | Notes |
|---|---|---|---|---|---|
| AUTH-01 | Register USER A | Register succeeds | New USER A registered and routed to catalog logged in | PASS | Token not inspected or recorded |
| AUTH-02 | Login USER/admin | Login succeeds | Admin relogin and USER A auth state both worked | PASS | User identity/role visible in nav |
| AUTH-03 | Refresh while logged in | Auth state persists/restores | USER A review/history/result routes reloaded after refresh | PASS | No console warn/error observed |
| AUTH-04 | Logout | Session cleared and guest nav returns | Admin/USER logout returned guest or alternate login state correctly | PASS | Protected routes redirect when guest |
| AUTH-05 | Wrong login | Clean error, no crash | Invalid credentials showed `Invalid email or password` | PASS | No white screen |
| AUTH-06 | Invalid token | Handled auth error/no crash | Browser automation did not expose safe localStorage mutation | BLOCKED | Token value was not read or documented |

## USER Test Matrix

| ID | Test | Expected | Actual | Result | Notes |
|---|---|---|---|---|---|
| USER-01 | Login USER A | Authenticated state ready | USER A registered/logged in through frontend | PASS | `phase88-user-a-rerun-1782201208790@quizmaster.local` |
| USER-02 | Open catalog | Published quiz visible | Published quiz visible in catalog | PASS | Draft quiz not shown publicly |
| USER-03 | Open quiz detail | Metadata/question count, no answers | Detail showed metadata, 2 questions, no answer key/explanations | PASS | Public answer safety preserved |
| USER-04 | Start attempt | Attempt created | Start created attempt id `1` and routed to `/attempts/1/take` | PASS | Authenticated flow |
| USER-05 | Take quiz page renders | Questions/options visible | Question text/options/navigation rendered | PASS | Q1/Q2 visible sequentially |
| USER-06 | Select answers | Selection works | Selected Q1 correct and Q2 wrong | PASS | Progress updated 0/2 -> 1/2 |
| USER-07 | Navigate questions | Navigation works | Next navigation to Q2 worked | PASS | Previous button visible on Q2 |
| USER-08 | Submit | Submit succeeds/duplicates handled | Submit routed to `/attempts/1/result` | PASS | Duplicate submit was not attempted |
| USER-09 | Result page | Score/correct/total visible | Result showed 50%, 1 correct, 1 wrong, total 2 | PASS | Backend-scored result |
| USER-10 | Review page | Answers/correct/explanations visible after submit | Review showed selected answer, correct answer, wrong/correct states, explanations | PASS | Explanations only post-submit |
| USER-11 | Attempt history | Submitted attempt appears | History listed attempt #1 with score 50% | PASS | Newest ordering not stress-tested |
| USER-12 | Refresh result/review/history | No 404, data reloads | Result, review, and history loaded/refreshed | PASS | SPA fallback and auth restore worked |

## Ownership/Security Test Matrix

| ID | Test | Expected | Actual | Result | Notes |
|---|---|---|---|---|---|
| OWN-01 | USER B cannot access USER A result | 403/redirect/handled forbidden | USER B saw `Result not found` for `/attempts/1/result` | PASS | Owner scope enforced without leaking result |
| OWN-02 | USER B cannot access USER A review | 403/redirect/handled forbidden | USER B saw `Review not found` for `/attempts/1/review` | PASS | Owner scope enforced without leaking review |
| OWN-03 | USER cannot access admin category page | Blocked or redirected | USER A/USER B visiting `/admin/categories` redirected to `/` | PASS | Role protection verified |
| OWN-04 | USER cannot access admin quiz editor | Blocked or redirected | USER B visiting `/admin/quizzes/2/edit` redirected to `/` | PASS | Role protection verified |
| OWN-05 | Guest cannot access protected user routes | Redirected to login | Guest `/attempts` and `/me/attempts` redirected to `/login` | PASS | Browser verified |

## Admin Test Matrix

| ID | Test | Expected | Actual | Result | Notes |
|---|---|---|---|---|---|
| ADMIN-01 | Login admin | Admin login succeeds | Admin login succeeded; nav showed ADMIN role and Admin link | PASS | Admin was manually promoted by user |
| ADMIN-02 | Category list loads | Admin category list visible | Category page loaded and later showed 1 category | PASS | Admin UI accessible |
| ADMIN-03 | Create category | Test category created | `Phase 8.8 Smoke Category` created with slug `phase-8-8-smoke-category` | PASS | Public categories API returned it |
| ADMIN-04 | Quiz list loads | Admin quiz list visible | Quiz list loaded published and draft smoke quizzes | PASS | Admin list rendered |
| ADMIN-05 | Create draft quiz | Draft created, not public | `Phase 8.8 Smoke Draft Quiz` created and stayed Draft | PASS | Not present in public catalog |
| ADMIN-06 | Quiz editor renders | Metadata/question editor loads | Quiz editor loaded metadata, publish status, and question editor | PASS | Edit URL `/admin/quizzes/2/edit` |
| ADMIN-07 | Add questions/options | Save and reload preserves data | Added 2 questions, each with 2 options and explanation | PASS | Question list showed both |
| ADMIN-08 | Publish validation | Invalid publish rejected | Publishing with 0 questions returned `Quiz must have at least one question` | PASS WITH NOTES | Other invalid option cases not created because UI enforces exactly one selected option |
| ADMIN-09 | Publish valid quiz | Quiz appears publicly | Valid quiz published and appeared in public catalog/API | PASS | Public id `2` |
| ADMIN-10 | Draft/locked not public | Draft hidden from public catalog | Draft quiz appears in admin list only, not public catalog | PASS | Public catalog showed only published quiz |
| ADMIN-11 | Unpublish | Public catalog updates safely | Not run | DEFERRED | Kept published quiz for user/ownership smoke and avoided disrupting attempt data |
| ADMIN-12 | Normal USER blocked from admin | USER cannot access admin routes | USER A/USER B blocked from admin routes | PASS | Non-admin role protection verified |

## Error State Test Matrix

| ID | Test | Expected | Actual | Result | Notes |
|---|---|---|---|---|---|
| ERR-01 | Empty catalog state | Clean empty UI | Initial attempt showed clean empty catalog before content existed | PASS | Historical evidence retained |
| ERR-02 | Wrong login | Clean error | `Invalid email or password` shown | PASS | No white screen |
| ERR-03 | 401 invalid token | Handled cleanly | Could not safely mutate token in browser automation | BLOCKED | No token value documented |
| ERR-04 | 403 wrong role | Handled cleanly | USER A redirected away from admin routes | PASS | No crash |
| ERR-05 | Backend cold start | App eventually recovers | Backend public calls responded 200 during smoke | PASS WITH NOTES | Render free tier cold start remains known limitation |
| ERR-06 | Backend offline test | Optional; avoid disruption | Skipped intentionally | DEFERRED | Do not intentionally break staging |

## Deployment-Specific Test Matrix

| ID | Test | Expected | Actual | Result | Notes |
|---|---|---|---|---|---|
| DEPLOY-01 | Refresh major routes | No Vercel 404 | `/`, `/quizzes`, `/login`, `/register`, `/attempts`, `/me/attempts`, `/admin/categories`, `/admin/quizzes/new`, `/quizzes/2`, `/attempts/1/result`, `/attempts/1/review` served SPA or loaded via app | PASS | Auth routes handled correctly |
| DEPLOY-02 | Direct URL access | Route works when pasted/opened | Direct `curl -I` returned HTTP 200 for checked frontend routes including `/quizzes/2` | PASS | SPA fallback works |
| DEPLOY-03 | Browser console | No critical runtime/CORS error | No console warn/error observed in browser automation for checked flows | PASS | Browser dev logs checked |
| DEPLOY-04 | Network/API target | API calls use Render, no localhost | Public API/CORS hit Render; bundle contains Render URL and no local backend port | PASS WITH NOTES | Browser resource timing API unavailable in automation |
| DEPLOY-05 | CORS | Vercel/local allowed, unknown blocked | Matches expected results | PASS | See CORS Evidence |
| DEPLOY-06 | Database persistence | Created data persists after refresh | Admin data, public catalog, attempt result/review/history persisted across route reloads | PASS WITH NOTES | Backend restart persistence not tested |

## CORS Evidence

| Origin | Endpoint | Result |
|---|---|---|
| `https://quizmaster-staging.vercel.app` | `OPTIONS /api/categories` | PASS, HTTP 200, exact allow-origin |
| `http://localhost:5173` | `OPTIONS /api/categories` | PASS, HTTP 200, exact allow-origin |
| `https://evil.example` | `OPTIONS /api/categories` | PASS, HTTP 403, `Invalid CORS request` |

Public backend checks:

```text
GET /api/categories -> HTTP 200, includes Phase 8.8 Smoke Category
GET /api/quizzes -> HTTP 200, includes Phase 8.8 Smoke Published Quiz
GET /api/quizzes/2 -> HTTP 200, metadata only; no answer key/options/explanations
```

## No Localhost Leak Evidence

Verified by local production build with:

```text
VITE_API_BASE_URL=https://quizmaster-api-staging.onrender.com
npm run build
```

Build result: PASS, Vite 6.4.3, 94 modules transformed.

Bundle scan:

```text
localhost:8080: no match in frontend/dist
127.0.0.1:8080: no match in frontend/dist
quizmaster-api-staging.onrender.com: present in frontend/dist
```

Browser resource timing was not available in this automation environment, so direct browser network URL
enumeration could not be used as evidence. The deployed UI loaded real catalog/auth/admin/attempt states
from the Render-backed staging app, and curl/CORS checks verified the Render backend target.

## Bugs Found

No Critical/High app bugs were found in the tested areas.

| ID | Severity | Area | Summary | Repro Steps | Expected | Actual | Decision |
|---|---|---|---|---|---|---|---|
| B-01 | Note | Browser automation | Browser resource timing was unavailable, so network tab URL enumeration could not be captured directly | Try to read resource timing in browser automation | Resource list available | Runtime did not expose `performance` resource entries | Use curl/CORS/build evidence; no app fix needed |
| B-02 | Note | Error-state coverage | Invalid-token corruption was not performed because automation did not expose safe localStorage mutation | Try to mutate localStorage in browser automation | Safe token corruption possible without reading token | localStorage was unavailable in evaluate context | Leave as blocked/non-critical |

## Deferred / Blocked Items

- Invalid-token UI test is BLOCKED because browser automation did not expose safe localStorage mutation.
- Backend offline test is DEFERRED to avoid disrupting the deployed staging service.
- Browser network resource enumeration is BLOCKED by automation runtime limitation; curl/CORS/build evidence was used instead.
- Admin unpublish was DEFERRED to preserve the published quiz and submitted attempt for Phase 8.8 evidence.

## Known Limitations

- Render free tier may cold start after idle.
- No custom domain is configured for staging.
- Staging database uses temporary `ddl-auto=update` per earlier Phase 8 docs.
- No formal migration strategy exists yet.
- Staging data may be disposable.
- No production-ready claim is made.

## Security Notes

- No secrets were committed.
- No token values were documented.
- No database password or raw Neon connection URL was documented.
- Admin promotion was performed manually by the user in Neon SQL Editor; Codex did not handle DB credentials.
- No wildcard backend CORS was used; unknown origin was blocked.
- Demo seed was not enabled.
- Guest protected routes redirected to login.
- Normal USER was blocked from admin routes.
- Public answer leakage check passed: public detail/API exposed metadata only before submit; correct answers/explanations appeared only after submit on review.

## Final Conclusion

**PASS WITH NOTES**

Phase 8.8 is now safe to close. The rerun verified staging end to end through the deployed Vercel
frontend, Render backend, and Neon staging database. Admin provisioning, category creation, draft quiz,
published quiz, publish validation, public catalog/detail, guest redirect, USER quiz-taking, result,
review, attempt history, ownership protection, role protection, CORS, SPA fallback, and no-localhost
checks passed.

The result is **PASS WITH NOTES** rather than plain PASS because several non-critical limitations remain:
Render free tier cold start risk, no custom domain, staging `ddl-auto=update`, no formal migration
strategy, backend offline test intentionally skipped, invalid-token mutation blocked by automation, and
browser resource timing unavailable.

## Next Step

```text
Phase 8.9 - Phase 8 Final Closure QA
```

Phase 8.9 can start after this Phase 8.8 rerun report is committed. Phase 8.9 should summarize and audit
all Phase 8 deployment documentation; it should not repeat the full smoke matrix unless a regression is
suspected.
