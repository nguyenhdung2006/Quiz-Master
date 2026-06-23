# Phase 8.8 - Staging Full Smoke Test

## Status

**NOT CLOSED**

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

Final result: **NOT CLOSED**. The deployed app loads, backend and CORS work, guest/auth/protected smoke
passes, and no Critical/High app defect was found in the tested surface. However, full Phase 8.8 cannot
close because no admin account was available to the tester and the public staging catalog has no category
or published quiz content. That blocks admin content smoke, quiz detail, quiz-taking, result, review, and
ownership tests.

## Environment

| Item | Value |
|---|---|
| Frontend URL | `https://quizmaster-staging.vercel.app` |
| Backend URL | `https://quizmaster-api-staging.onrender.com` |
| Frontend platform | Vercel |
| Backend platform | Render Web Service |
| Database provider | Neon PostgreSQL staging, per Phase 8 docs |
| Branch | `main` |
| Latest commit before smoke | `38ae86b Document frontend staging deployment` |
| Git sync status before smoke | `origin/main...HEAD` = `0 0` |
| Working tree before smoke | clean |

## Preconditions

Required for full smoke:

| Precondition | Observed | Result |
|---|---|---|
| USER A account | Created through deployed frontend | PASS |
| USER B account | Not needed after quiz/attempt flow was blocked | BLOCKED |
| ADMIN account | No safe admin credentials/provisioning available to tester | BLOCKED |
| At least 1 category | `GET /api/categories` returned `[]` | BLOCKED |
| At least 1 published quiz | `GET /api/quizzes` returned `[]` | BLOCKED |
| Published quiz has 2+ questions/options | No published quiz exists | BLOCKED |
| Explanation data | No published quiz exists | BLOCKED |
| Optional draft quiz | Admin flow unavailable | BLOCKED |

The staging database is not fully empty after this smoke because USER A was created. The public catalog
remains empty.

## Test Data

| Type | Value | Notes |
|---|---|---|
| USER A | `phase88-user-a-1782199791890@quizmaster.local` | Created through deployed frontend registration |
| USER B | N/A | Ownership checks blocked before a second user was useful |
| Category | N/A | Admin provisioning unavailable |
| Published quiz | N/A | Public API returned no quizzes |
| Draft quiz | N/A | Admin provisioning unavailable |
| Attempts | N/A | Quiz-taking blocked by missing published quiz |
| Cleanup | Non-destructive | USER A left in staging; no destructive cleanup performed |

No password, secret, or token value is recorded in this report.

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
| GUEST-01 | Landing loads | Landing renders, no crash | `/` rendered hero/nav; refresh also rendered | PASS | No console warn/error observed |
| GUEST-02 | Catalog loads | `/quizzes` renders empty state or quiz list | Catalog rendered clean empty state | PASS WITH NOTES | Public catalog is empty |
| GUEST-03 | Category filter | Works if categories exist | Only `All` filter shown because categories API returned `[]` | PASS WITH NOTES | Empty state remained clean |
| GUEST-04 | Quiz detail loads | Published quiz detail loads | No published quiz exists | BLOCKED | Missing staging content |
| GUEST-05 | Guest start quiz redirects to login | Guest cannot create attempt | No quiz/start button exists | BLOCKED | Missing staging content |
| GUEST-06 | Public answer safety | No correct flags/explanations before submit | Cannot inspect quiz detail/network payload without quiz | BLOCKED | Missing staging content |
| GUEST-07 | Protected route redirect | Guest redirected/blocked | `/attempts`, `/me/attempts`, `/admin/categories`, `/admin/quizzes/new` redirected to `/login` | PASS | Browser route behavior verified |

## Auth Test Matrix

| ID | Test | Expected | Actual | Result | Notes |
|---|---|---|---|---|---|
| AUTH-01 | Register USER A | Register succeeds | New USER registered and routed to catalog logged in | PASS | Token not inspected or recorded |
| AUTH-02 | Login USER A | Login succeeds | Login succeeded and routed to catalog logged in | PASS | User identity visible in nav |
| AUTH-03 | Refresh while logged in | Auth state persists/restores | Refresh kept USER A logged in | PASS | No console warn/error observed |
| AUTH-04 | Logout | Session cleared and guest nav returns | Logout returned nav to Login/Register state | PASS | Protected route later redirects |
| AUTH-05 | Wrong login | Clean error, no crash | Invalid credentials showed `Invalid email or password` | PASS | No white screen |
| AUTH-06 | Invalid token | Handled auth error/no crash | Browser automation did not expose safe localStorage mutation | BLOCKED | Token value was not read or documented |

## USER Test Matrix

| ID | Test | Expected | Actual | Result | Notes |
|---|---|---|---|---|---|
| USER-01 | Login USER A | Authenticated state ready | USER A login passed | PASS | See AUTH-02 |
| USER-02 | Open catalog | Published quiz visible | Catalog loaded but no quiz visible | BLOCKED | Missing published quiz |
| USER-03 | Open quiz detail | Metadata/question count, no answers | No quiz detail route available | BLOCKED | Missing published quiz |
| USER-04 | Start attempt | Attempt created | Cannot start without quiz | BLOCKED | Missing published quiz |
| USER-05 | Take quiz page renders | Questions/options visible | Cannot create attempt | BLOCKED | Missing published quiz |
| USER-06 | Select answers | Selection works | Cannot test | BLOCKED | Missing published quiz |
| USER-07 | Navigate questions | Navigation works | Cannot test | BLOCKED | Missing published quiz |
| USER-08 | Submit | Submit succeeds/duplicates handled | Cannot test | BLOCKED | Missing published quiz |
| USER-09 | Result page | Score/correct/total visible | Cannot test | BLOCKED | Missing attempt |
| USER-10 | Review page | Answers/correct/explanations visible after submit | Cannot test | BLOCKED | Missing attempt |
| USER-11 | Attempt history | Submitted attempt appears | Attempts page loaded empty state | PASS WITH NOTES | No attempt exists |
| USER-12 | Refresh result/review/history | No 404, data reloads | `/attempts` refresh/load passed; result/review blocked | PASS WITH NOTES | Attempt-specific routes blocked |

## Ownership/Security Test Matrix

| ID | Test | Expected | Actual | Result | Notes |
|---|---|---|---|---|---|
| OWN-01 | USER B cannot access USER A result | 403/redirect/handled forbidden | No USER A attempt exists | BLOCKED | Missing quiz/attempt |
| OWN-02 | USER B cannot access USER A review | 403/redirect/handled forbidden | No USER A attempt exists | BLOCKED | Missing quiz/attempt |
| OWN-03 | USER cannot access admin category page | Blocked or redirected | USER A visiting `/admin/categories` redirected to `/` | PASS | Role protection verified |
| OWN-04 | USER cannot access admin quiz editor | Blocked or redirected | USER A visiting `/admin/quizzes/new` redirected to `/` | PASS | Role protection verified |
| OWN-05 | Guest cannot access protected user routes | Redirected to login | Guest `/attempts` and `/me/attempts` redirected to `/login` | PASS | Browser verified |

## Admin Test Matrix

| ID | Test | Expected | Actual | Result | Notes |
|---|---|---|---|---|---|
| ADMIN-01 | Login admin | Admin login succeeds | No admin credentials/provisioning available | BLOCKED | Requires safe staging admin |
| ADMIN-02 | Category list loads | Admin category list visible | Cannot access as admin | BLOCKED | Missing admin account |
| ADMIN-03 | Create category | Test category created | Cannot access admin UI | BLOCKED | Missing admin account |
| ADMIN-04 | Quiz list loads | Admin quiz list visible | Cannot access as admin | BLOCKED | Missing admin account |
| ADMIN-05 | Create draft quiz | Draft created, not public | Cannot access admin UI | BLOCKED | Missing admin account |
| ADMIN-06 | Quiz editor renders | Metadata/question editor loads | Cannot access admin UI | BLOCKED | Missing admin account |
| ADMIN-07 | Add questions/options | Save and reload preserves data | Cannot access admin UI | BLOCKED | Missing admin account |
| ADMIN-08 | Publish validation | Invalid publish rejected | Cannot access admin UI | BLOCKED | Missing admin account |
| ADMIN-09 | Publish valid quiz | Quiz appears publicly | Cannot access admin UI | BLOCKED | Missing admin account |
| ADMIN-10 | Draft/locked not public | Draft hidden from public catalog | Cannot create draft | BLOCKED | Missing admin account |
| ADMIN-11 | Unpublish | Public catalog updates safely | Cannot access admin UI | BLOCKED | Missing admin account |
| ADMIN-12 | Normal USER blocked from admin | USER cannot access admin routes | USER A blocked from category/editor routes | PASS | Non-admin role protection verified |

## Error State Test Matrix

| ID | Test | Expected | Actual | Result | Notes |
|---|---|---|---|---|---|
| ERR-01 | Empty catalog state | Clean empty UI | Catalog displayed `Chua co quiz cong khai.` | PASS | No crash |
| ERR-02 | Wrong login | Clean error | `Invalid email or password` shown | PASS | No white screen |
| ERR-03 | 401 invalid token | Handled cleanly | Could not safely mutate token in browser automation | BLOCKED | No token value documented |
| ERR-04 | 403 wrong role | Handled cleanly | USER A redirected away from admin routes | PASS | No crash |
| ERR-05 | Backend cold start | App eventually recovers | Backend public calls responded 200 during smoke | PASS WITH NOTES | Render free tier cold start remains known limitation |
| ERR-06 | Backend offline test | Optional; avoid disruption | Skipped intentionally | DEFERRED | Do not intentionally break staging |

## Deployment-Specific Test Matrix

| ID | Test | Expected | Actual | Result | Notes |
|---|---|---|---|---|---|
| DEPLOY-01 | Refresh major routes | No Vercel 404 | `/`, `/quizzes`, `/login`, `/register`, `/attempts`, `/me/attempts`, `/admin/categories`, `/admin/quizzes/new` served SPA | PASS | Auth routes then handled by app |
| DEPLOY-02 | Direct URL access | Route works when pasted/opened | Direct `curl -I` returned HTTP 200 for checked routes | PASS | SPA fallback works |
| DEPLOY-03 | Browser console | No critical runtime/CORS error | No console warn/error observed in browser automation for checked flows | PASS | Browser dev logs checked |
| DEPLOY-04 | Network/API target | API calls use Render, no localhost | Public API/CORS hit Render; bundle contains Render URL and no local backend port | PASS WITH NOTES | Browser resource timing API unavailable in automation |
| DEPLOY-05 | CORS | Vercel/local allowed, unknown blocked | Matches expected results | PASS | See CORS Evidence |
| DEPLOY-06 | Database persistence | Created data persists after refresh | USER A stayed authenticated after refresh; public data remained empty | PASS WITH NOTES | Backend restart persistence not tested |

## CORS Evidence

| Origin | Endpoint | Result |
|---|---|---|
| `https://quizmaster-staging.vercel.app` | `OPTIONS /api/categories` | PASS, HTTP 200, exact allow-origin |
| `http://localhost:5173` | `OPTIONS /api/categories` | PASS, HTTP 200, exact allow-origin |
| `https://evil.example` | `OPTIONS /api/categories` | PASS, HTTP 403, `Invalid CORS request` |

Public backend checks:

```text
GET /api/categories -> HTTP 200, []
GET /api/quizzes -> HTTP 200, []
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
enumeration could not be used as evidence. The deployed UI did load real empty catalog/auth states from
the Render-backed staging app, and curl/CORS checks verified the Render backend target.

## Bugs Found

No Critical/High app bugs were found in the tested areas.

| ID | Severity | Area | Summary | Repro Steps | Expected | Actual | Decision |
|---|---|---|---|---|---|---|---|
| B-01 | Note | Staging prerequisites | Full Phase 8.8 cannot close because admin provisioning and published quiz content are missing | Open public APIs and admin routes without admin credentials | Admin/test data available for full smoke | Public categories/quizzes are empty; admin credentials unavailable | Provision safe staging admin and test quiz data, then rerun Phase 8.8 |

## Deferred / Blocked Items

- Admin flow is BLOCKED because no safe staging admin account/provisioning was available to the tester.
- Quiz-taking flow is BLOCKED because public categories and quizzes returned empty arrays.
- Quiz detail and public answer-safety inspection are BLOCKED because no published quiz exists.
- USER ownership checks are BLOCKED because no attempt exists.
- Invalid-token UI test is BLOCKED because browser automation did not expose safe localStorage mutation.
- Backend offline test is DEFERRED to avoid disrupting the deployed staging service.
- Browser network resource enumeration is BLOCKED by automation runtime limitation; curl/build evidence was used instead.

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
- No wildcard backend CORS was used; unknown origin was blocked.
- Demo seed was not enabled.
- Guest protected routes redirected to login.
- Normal USER was blocked from admin routes.
- Public answer leakage could not be tested because no published quiz exists.

## Final Conclusion

**NOT CLOSED**

The deployed staging frontend and backend are usable for landing/catalog/auth/protected-route smoke, and
CORS/no-localhost checks passed. Phase 8.8 still cannot close because the core end-to-end quiz-taking and
admin content-management flows are blocked by missing safe admin provisioning and missing published
staging quiz content. These are staging prerequisites, not confirmed app defects.

## Next Step

```text
Phase 8.9 - Phase 8 Final Closure QA
```

Before Phase 8.9 closure, provide or safely provision a staging admin account and controlled Phase 8.8
quiz content, then rerun the blocked Phase 8.8 smoke matrix.
