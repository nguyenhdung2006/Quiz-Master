# Phase 7.5 Seeder / Demo Safety Verification

## 1. Purpose

Verify demo seeder safety after Phase 7 hardening. This phase validates default behavior, explicit enablement, runtime idempotency, demo identities, public visibility, locked-quiz safety, attempt history, and production/demo wording without changing application or seeder code.

## 2. Scope

In scope:

- Seeder default behavior and explicit seed flag.
- Runtime idempotency.
- Demo accounts and seeded dataset identities.
- Public quiz visibility and locked quiz safety.
- `demo-user` and `demo-empty` attempt histories.
- Demo-data production wording and configuration safety.

Out of scope:

- Seeder or application code changes.
- Database reset or deletion of manual QA data.
- Backend business logic and frontend UI changes.
- Deployment implementation.

## 3. Environment

- QA date: 2026-06-22 (Asia/Saigon).
- Backend URL: `http://localhost:8080`.
- Frontend URL: not required for runtime seeder verification; frontend production build was run.
- Latest commit before QA: `26d3b1f Harden frontend token and error handling`.
- Git status before QA: clean; local `main` was ahead of `origin/main` by 18 commits.
- Backend state before QA: no listener on port 8080.
- Database: existing local PostgreSQL `quizmaster`; no manual SQL write, reset, update, or delete was performed. Verification SQL was read-only; normal automated tests and the explicitly requested seeder runs used their existing application behavior.
- Normal backend startup was run without `app.seed-demo`; an additional non-web startup captured zero seed log matches.
- The explicit seed command was run twice as a normal web application for runtime idempotency. A final non-web explicit run captured the seeder enabled/completed and skip logs.
- Existing local QA data was preserved, including SQL attempt `309` and Phase 7.4 attempt `465`.

Initial and final whole-database totals were identical:

| Users | Categories | Quizzes | Questions | Options | Attempts | Attempt answers |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 24 | 11 | 19 | 62 | 236 | 32 | 54 |

These totals include non-seed local QA records. Seed identities were checked separately.

## 4. Test/build Results

- Backend: `.\mvnw.cmd test` — **PASS**, 55 tests, 0 failures, 0 errors, 0 skipped.
- Frontend: `npm run build` — **PASS**, Vite 6.4.3, 94 modules transformed.
- Accepted test warning: Mockito/Byte Buddy dynamic agent warning on Java 25; it did not affect the result.

## 5. Seeder Verification Matrix

| ID | Area | Scenario | Expected | Actual | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| SEED-01 | Default behavior | Normal backend start does not seed | No automatic demo seed | Startup succeeded; zero seed log matches; all seven measured totals remained unchanged | PASS | Also supported by `@ConditionalOnProperty` without `matchIfMissing` |
| SEED-02 | Explicit enablement | Start with `--app.seed-demo=true` | Seeder runs only with flag | Logs contained `Demo data seed enabled` and `Demo data seed completed` | PASS | Existing submitted attempts were explicitly logged as skipped |
| SEED-03 | Idempotency | Run explicit seed twice | No duplicate seed data | Both web runs and final log run left totals at `24/11/19/62/236/32/54`; seed identities remained 3 users, 6 categories, 9 quizzes | PASS | Seed-specific content remained 53 questions and 212 options |
| SEED-04 | Accounts | Login all demo accounts | ADMIN/USER/USER roles | All three logins returned expected roles | PASS | Passwords used only against local backend |
| SEED-05 | Public catalog | Show six seeded public quizzes | All six present | All six were present exactly once | PASS WITH NOTES | Catalog had 8 total because two older non-seed public QA quizzes remain locally |
| SEED-06 | Public visibility | Hide draft and locked seed quizzes | None in public catalog | Both draft quizzes and Locked Demo Quiz were absent | PASS | No cleanup performed |
| SEED-07 | Public detail | Open Locked Demo Quiz publicly | 404/not found | `/api/quizzes/679` returned 404 | PASS | No question/option/explanation payload exposed |
| SEED-08 | Admin lock | View locked quiz as ADMIN | Admin-visible, unpublished, structurally locked | Quiz `679`: `published=false`, `structuralEditingLocked=true`, 4 questions, 16 options, 4 explanations, 1 submitted attempt | PASS | No structural edit was attempted |
| SEED-09 | Main user | Seeded attempts exist | Java 7/8 and Locked 2/4 | Attempts `327` = 7/8 (88%) and `328` = 2/4 (50%) remained unchanged | PASS WITH NOTES | User also has permitted local attempts `309` and `465` |
| SEED-10 | Empty user | No attempts | Empty list | `/api/attempts/me` returned zero attempts | PASS | Ownership baseline preserved |
| SEED-11 | Documentation | Demo data not presented as production | Clear local/demo-only wording | README and runbook clearly state seed is opt-in, demo credentials are local-only, records are not production evidence, and reset safety | PASS | No wording edit required |
| SEED-12 | Production config | Production does not enable seed by default | No `app.seed-demo=true` in common/prod config | Neither common, dev, nor prod YAML enables the seed property | PASS WITH NOTES | Enablement is property-only; no profile-level prohibition exists |

## 6. Findings

### Passed Controls

- Seeder is absent by default and runs with the explicit property only.
- Runtime data stayed stable across repeated explicit seed runs.
- Three demo users, six seed categories, and nine seed quizzes each remained one logical identity.
- Seed content remained 53 questions and 212 options.
- Locked Demo Quiz remained unpublished, admin-visible, structurally locked, and publicly hidden.
- Seeded attempts `327` and `328` remained stable; `demo-empty` remained empty.
- Documentation clearly avoids fake production claims and warns against destructive reset or production credential use.

### Issues / Risks

#### Production profile has no defense-in-depth seed prohibition

- Severity: Low.
- Evidence: `DemoDataSeeder` is controlled by `app.seed-demo=true`; `application-prod.yaml` does not enable it, but also does not block an operator from explicitly setting it.
- Expected: Current Phase 7.5 requirement is satisfied because production does not enable seed by default.
- Actual: Safe by default, with explicit property as the only activation gate.
- Recommended next task: consider a separate hardening decision to reject demo seeding under the production profile. This is not a discovered idempotency or visibility bug and was not changed in Phase 7.5.

### Local Data Notes

- Whole-database totals exceed fresh-seed totals because earlier QA data is retained.
- Public catalog contains two extra non-seed public quizzes: `QA Published Quiz phase4-20260620-002730` and `Phase 5 Published Quiz`.
- `demo-user` has the two seeded attempts plus permitted manual attempts `309` and `465`.
- No local data was deleted, rewritten, or reset.

## 7. Conclusion

Phase 7.5: **PASS WITH NOTES**.

No seeder defect, visibility leak, duplicate seed data, account regression, or destructive-data issue was found. The notes concern retained local QA data and the already-known property-only production activation guard. It is safe to proceed to Phase 7.6 Final Regression, but this conclusion does not claim that the application is production-ready.
