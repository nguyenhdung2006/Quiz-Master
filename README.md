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

Configuration is in `backend/src/main/resources/application.yaml`.

Local environment variables can override defaults:

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/quizmaster"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="postgres"
$env:JWT_SECRET="change-this-local-secret"
$env:JWT_EXPIRATION_MS="86400000"
```

Run the backend:

```powershell
cd D:\QuizMaster\backend
.\mvnw.cmd spring-boot:run
```

Run tests:

```powershell
cd D:\QuizMaster\backend
.\mvnw.cmd test
```

Current API summary is documented in `docs/backend-api.md`.

## Demo data

QuizMaster includes an explicit local/demo seed flow for curated accounts, categories, quizzes, questions, explanations, attempts, and a locked quiz example. The seed does not run by default.

Start the backend with demo seed enabled:

```powershell
cd D:\QuizMaster\backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--app.seed-demo=true"
```

See [the demo data runbook](docs/demo-runbook.md) for safety notes, expected data, demo accounts, QA checks, and reset guidance.
