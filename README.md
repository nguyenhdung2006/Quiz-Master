# QuizMaster

QuizMaster is a standalone quiz platform backend. It supports authentication, public quiz browsing, quiz attempts, answer review, and admin quiz management for the MVP.

## Backend

Backend path:

```powershell
D:\QuizMaster\backend
```

Required tools:

- Java 25
- Maven wrapper included in `backend`
- PostgreSQL 17

Database:

- Name: `quizmaster`
- Default local URL: `jdbc:postgresql://localhost:5432/quizmaster`

Common configuration is in `backend/src/main/resources/application.yaml`. Local development uses the
`dev` profile by default and loads `application-dev.yaml`, which contains a clearly marked local-only JWT
secret. Do not use that secret for a deployed environment.

Local environment variables can override the database and token-expiration defaults:

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/quizmaster"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="postgres"
$env:JWT_EXPIRATION_MS="86400000"
```

Run the backend:

```powershell
cd D:\QuizMaster\backend
.\mvnw.cmd spring-boot:run
```

For the `prod` profile, `JWT_SECRET` is required and has no fallback. It must contain at least 32
characters. The backend fails during startup when the variable is missing, blank, or too short.

```powershell
$env:SPRING_PROFILES_ACTIVE="prod"
$env:JWT_SECRET="replace-with-a-strong-random-production-secret"
cd D:\QuizMaster\backend
.\mvnw.cmd spring-boot:run
```

This profile-specific JWT safeguard does not by itself make the application production-ready; the
remaining Phase 7 configuration and deployment hardening still applies.

Backend CORS uses `app.cors.allowed-origins`. The default `dev` profile allows only the canonical local
frontend origin `http://localhost:5173`; `http://127.0.0.1:5173` is not enabled. The `prod` profile
requires `CORS_ALLOWED_ORIGINS`, with no wildcard or local fallback. Use a comma-separated list for
multiple deployed frontend origins:

```powershell
$env:CORS_ALLOWED_ORIGINS="https://quizmaster.example,https://admin.quizmaster.example"
```

Missing, blank, or wildcard production CORS configuration causes backend startup to fail. CORS still
allows the API methods plus the `Authorization` and `Content-Type` headers required by the application.

### Backend deployment environment

The Render backend uses `backend/Dockerfile` to pin Java 25. Production datasource values are required
and have no local/default fallback. Render supplies `PORT`; the backend reads it with a local fallback
of `8080`.

```env
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=<strong-secret-at-least-32-chars>
CORS_ALLOWED_ORIGINS=https://<frontend-staging-url>
SPRING_DATASOURCE_URL=<jdbc-postgresql-url-with-required-tls>
SPRING_DATASOURCE_USERNAME=<db-username>
SPRING_DATASOURCE_PASSWORD=<db-password>
SPRING_JPA_HIBERNATE_DDL_AUTO=update # staging only until migrations exist
PORT=<provided-by-platform>
```

Production defaults to `SPRING_JPA_HIBERNATE_DDL_AUTO=validate` and `show-sql=false`. A first staging
database without migrations may temporarily use `update`; production v1.0 still requires a versioned
migration strategy. Never set `app.seed-demo=true` or `APP_SEED_DEMO=true` in production.

Build the backend container from `backend/`:

```powershell
docker build -t quizmaster-backend .
```

Render uses a Docker Web Service with repository root directory `backend` and Dockerfile
`backend/Dockerfile`; it does not use a native Java build command. Required environment variables,
local verification and first-deploy checks are documented in
[`docs/deployment-backend.md`](docs/deployment-backend.md).
The Phase 8.6A manual Render backend preflight/checklist is documented in
[`docs/deployment-render-backend.md`](docs/deployment-render-backend.md), with the closure report in
[`docs/phase-8-6a-backend-staging-deploy-preflight.md`](docs/phase-8-6a-backend-staging-deploy-preflight.md).

Neon staging database contract, SSL/JDBC format, empty-data policy and DDL limitations are documented in
[`docs/deployment-database.md`](docs/deployment-database.md). The repository contains placeholders only;
database credentials must remain outside Git.

Run tests:

```powershell
cd D:\QuizMaster\backend
.\mvnw.cmd test
```

Current API summary is documented in `docs/backend-api.md`.

## Frontend

Frontend API requests are centralized in `frontend/src/api/client.js` and use `VITE_API_BASE_URL`.
Copy the local value shown in `frontend/.env.example` when environment configuration is needed:

```text
VITE_API_BASE_URL=http://localhost:8080
```

For a deployment with a separate backend origin, set the variable at build time to the real HTTPS API
origin, for example `VITE_API_BASE_URL=https://api.quizmaster.example`. No production domain is built
into the repository. When a production build omits the variable, requests remain same-origin instead of
silently targeting localhost; the deployment must then proxy `/api` to the backend.

### Frontend deployment environment

```text
Vercel project root: frontend
Build command: npm run build
Output directory: dist
SPA fallback: frontend/vercel.json
```

Required for the selected separate-origin staging architecture:

```env
VITE_API_BASE_URL=https://<backend-staging-url>
```

Vite embeds this value at build time, so changing it in Vercel requires a rebuild/redeploy. Do not use a
localhost API URL in production and never expose database credentials or backend secrets through a
`VITE_` variable. See `frontend/.env.production.example` for a safe placeholder. Vercel monorepo settings,
SPA fallback and the deferred deployed-route checklist are documented in
[`docs/deployment-frontend.md`](docs/deployment-frontend.md).

## Demo data

QuizMaster includes an explicit local/demo seed flow for curated accounts, categories, quizzes, questions, explanations, attempts, and a locked quiz example. The seed does not run by default.

Start the backend with demo seed enabled:

```powershell
cd D:\QuizMaster\backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--app.seed-demo=true"
```

See [the demo data runbook](docs/demo-runbook.md) for safety notes, expected data, demo accounts, QA checks, and reset guidance.
