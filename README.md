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

## Demo data

QuizMaster includes an explicit local/demo seed flow for curated accounts, categories, quizzes, questions, explanations, attempts, and a locked quiz example. The seed does not run by default.

Start the backend with demo seed enabled:

```powershell
cd D:\QuizMaster\backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--app.seed-demo=true"
```

See [the demo data runbook](docs/demo-runbook.md) for safety notes, expected data, demo accounts, QA checks, and reset guidance.
