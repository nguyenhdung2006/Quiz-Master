# Phase 8.2B Frontend Env Contract / Vercel SPA Deploy Config

## Scope

Phase 8.2B prepares the existing React/Vite frontend for a future Vercel staging deployment. It defines the frontend build-time environment contract, adds SPA route fallback configuration and documents Vercel project settings.

This phase does not deploy Vercel, modify UI/business logic, change backend configuration, create a database, push Git or claim production readiness.

## Changes Made

- Added `frontend/vercel.json` with a catch-all rewrite to `/index.html`.
- Preserved the existing local development value in `frontend/.env.example`.
- Added `frontend/.env.production.example` with a non-live Render URL placeholder.
- Documented Vercel settings, build-time environment behavior and remaining risks.
- Left `frontend/src/api/client.js` unchanged because its production behavior is already safe from localhost fallback.
- Did not pin Node because the proposed `<23` range conflicts with the currently verified local Node 24 runtime.

## Vercel Target

The selected frontend target remains Vercel. The project is configured from the monorepo as:

```text
Project root directory: frontend
Install command: npm ci
Build command: npm run build
Output directory: dist
Branch: main
First deployment: explicit/manual after user-approved push
```

Expected staging URL remains a placeholder until Vercel creates a deployment:

```text
https://quizmaster-<placeholder>.vercel.app
```

## Frontend Environment Variables

Local development example:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Selected separate-origin staging contract:

```env
VITE_API_BASE_URL=https://quizmaster-api-<placeholder>.onrender.com
```

`VITE_API_BASE_URL` is read when Vite builds the frontend. Updating the variable in Vercel requires a new build/deployment. Only the public backend origin belongs in this variable.

Values prefixed with `VITE_` are exposed to browser code. Database credentials, JWT secrets and any backend-only secret must never be added to the frontend environment.

## API Base URL Behavior

The existing API client trims `VITE_API_BASE_URL` and removes trailing slashes.

- Development without the variable falls back to `http://localhost:8080`.
- Production with the variable calls the configured HTTPS backend origin.
- Production without the variable uses an empty base URL and calls same-origin `/api/...` paths.
- Production never falls back to localhost.

For the selected Vercel + Render architecture, the variable is operationally required because no same-origin `/api` proxy is defined.

## SPA Route Refresh Handling

The app uses `BrowserRouter` and includes deep routes such as:

- `/quizzes/:id`
- `/attempts/:attemptId/take`
- `/attempts/:attemptId/result`
- `/attempts/:attemptId/review`
- `/admin/quizzes/:id/edit`

`frontend/vercel.json` contains:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Because the Vercel project root is `frontend`, the config is in the correct project directory. It allows Vercel to serve the SPA entry point for direct navigation and refresh, after which React Router resolves the route. No Netlify config was added.

## Node Runtime

Local verification environment:

```text
Node.js: 24.15.0
npm: 11.12.1
```

No `engines` field was added. The suggested range `>=20 <23` would declare the current, successfully used Node 24 runtime unsupported. Phase 8.2B does not change dependencies merely to force a runtime range.

Before staging, confirm a Vercel-supported Node version compatible with Vite 6 and the existing lockfile; then pin the chosen version if reproducibility requires it.

## Vercel Project Settings

```text
Root Directory: frontend
Framework Preset: Vite
Install Command: npm ci
Build Command: npm run build
Output Directory: dist
Environment Variable:
  VITE_API_BASE_URL=https://<backend-staging-url>
```

Use the real Render staging URL only after it exists. Vercel environment scopes for Preview/Production should be reviewed before enabling auto-deploy.

## Test / Build Evidence

- `frontend/npm run build`: PASS — Vite 6.4.3 transformed 94 modules and generated `dist` successfully in about 3 seconds.
- Production asset scan for `localhost:8080`: PASS — 0 matches under `frontend/dist/assets`.
- `frontend/vercel.json` JSON parse: PASS — one rewrite from `/(.*)` to `/index.html`.
- `git diff --check`: required to pass before commit.

Backend tests are skipped because Phase 8.2B changes frontend deployment config/docs only and backend code/configuration is unchanged.

## Remaining Risks

- Vercel has not been deployed and SPA rewrites have not been tested on a real staging URL.
- Render backend has not been deployed, so there is no real API URL for `VITE_API_BASE_URL`.
- Neon PostgreSQL has not been provisioned.
- Real staging environment variables have not been created.
- Node runtime is not pinned.
- Backend Docker build remains unverified because the local Docker daemon is unavailable.
- Flyway/Liquibase migration strategy does not exist yet.
- Local Git commits have not been pushed, so providers cannot deploy them.
- End-to-end staging smoke tests have not run.
- QuizMaster is not production-ready.

## Final Conclusion

Phase 8.2B adds the repository-side Vercel SPA fallback and documents a safe public frontend environment contract without changing application behavior or UI.

Completion still depends on production build and bundle checks passing. Even after those checks, actual Vercel/Render/Neon provisioning, environment setup and staging smoke tests remain separate future work.
