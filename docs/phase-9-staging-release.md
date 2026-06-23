# Phase 9 — Staging Release Formalization

## Status

PASS WITH NOTES

Phase 9 is a formal roadmap alignment phase, not a new deployment phase.

## Purpose

The old roadmap treated Phase 9 as Public Deployment / Staging Release work. The real project state has moved past that: Phase 8.6–8.9 already deployed and validated the staging release through Render, Vercel, Neon PostgreSQL, staged content, smoke testing, and final closure QA.

This document formalizes that alignment so Phase 9 is not tracked as pending redeployment. The correct next direction is v1.0 readiness, not another staging deployment pass.

## Scope

In scope:

- Documenting that staging release has already been achieved through Phase 8 evidence.
- Recording frontend/backend staging URLs.
- Mapping old roadmap Phase 9 to actual Phase 8 evidence.
- Updating roadmap direction toward v1.0 readiness.
- Recording known limitations.

Out of scope:

- Redeploying backend.
- Redeploying frontend.
- Running full smoke tests again.
- Mutating staging DB/data.
- Changing backend code.
- Changing frontend code.
- Adding post-v1 features.
- Claiming production readiness.

## Staging URLs

- Frontend: `https://quizmaster-staging.vercel.app`
- Backend: `https://quizmaster-api-staging.onrender.com`

## Evidence From Phase 8

This phase summarizes existing repository evidence only. It does not introduce new test results.

- Render backend staging deploy documented in `docs/phase-8-6b-render-backend-staging-deploy.md`.
- Vercel frontend staging deploy documented in `docs/phase-8-7-frontend-staging-deploy.md`.
- Neon staging database connected and used by the deployed backend per Phase 8 deployment and smoke docs.
- CORS allowed-origin and blocked-origin verification passed.
- SPA fallback and direct route behavior passed.
- Guest/auth/user/admin smoke flows passed with notes.
- Ownership and security checks passed.
- No Critical/High bugs were found in the tested scope.
- Phase 8 closure QA documented in `docs/phase-8-closure-qa.md`.

Relevant evidence docs:

- `docs/phase-8-closure-qa.md`
- `docs/phase-8-staging-smoke-test.md`
- `docs/phase-8-7-frontend-staging-deploy.md`
- `docs/phase-8-6b-render-backend-staging-deploy.md`
- `docs/deployment-target.md`

## Roadmap Mapping

| Old roadmap item | Actual current status | Conclusion | Important note |
|---|---|---|---|
| Phase 9 — Public Deployment / Staging Release | Effectively completed through Phase 8.6–8.9 staging deployment and smoke validation | PASS WITH NOTES | This does not mean production-ready |

## Known Limitations

- Render Free cold start.
- No custom domain.
- No production database.
- Staging uses `ddl-auto=update`.
- No migrations yet.
- No production-grade monitoring or rollback.
- Staging data is smoke data, not demo-quality data.
- Remaining schema drift risk.
- Provider coordination overhead across Vercel, Render, and Neon.

## Next Recommended Work

1. Phase B — Demo Data & Account Strategy
2. Phase C — UX/UI Polish for v1.0
3. Phase D — Documentation & Portfolio Packaging
4. Phase E — Production-Lite Hardening
5. Phase F — Release Candidate QA
6. Phase G — v1.0 Release Closure

Post-v1 features remain out of scope for the current roadmap.

## Exit Criteria

| Item | Result |
|---|---|
| Phase 8 closure status recorded | PASS |
| Phase 9 no longer treated as pending deployment | PASS |
| Frontend/backend staging URLs recorded | PASS |
| No redeployment performed | PASS |
| No full smoke retest performed | PASS |
| No code changes performed | PASS |
| Known limitations documented | PASS WITH NOTES |
| Next roadmap points to v1.0 readiness | PASS |

## Final Conclusion

Phase 9 is closed as a staging release formalization phase: PASS WITH NOTES.

The project has a validated staging deployment, but it is not production-ready. The correct next step is v1.0 readiness work, starting with demo data/account strategy and UI polish.
