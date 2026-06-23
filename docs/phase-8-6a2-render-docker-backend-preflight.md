# Phase 8.6A2 Render Docker Backend Deploy Readiness

## Status

**DONE / CLOSED - PASS WITH NOTES**

Dockerfile, `.dockerignore`, and Render Docker documentation are ready for manual Render deployment, but the local Docker build could not be completed because Docker Desktop's Linux daemon was unavailable.

Full Phase 8.6 is **NOT closed**. Render service creation, real environment variables, deploy, logs, public backend URL, and deployed smoke tests remain deferred to Phase 8.6B.

## Scope

Phase 8.6A2 prepares the Spring Boot Java 25 backend for Render Docker deployment. This phase does not push, deploy, create Render resources, use Render CLI, use GitHub CLI, push a Docker image, read secrets, create `.env` files, enable seed data, modify frontend, or change backend business logic.

## Why 8.6A2 Was Needed

Phase 8.6A verified the backend deploy contract but identified a Render Java runtime blocker: Render's documented native runtimes do not include Java in the same safe path as Node/Python/Go. The safer Render path for this project is Docker, using the existing backend-scoped `backend/Dockerfile` and a `backend` build context.

## Files Changed

- `backend/Dockerfile`
- `backend/.dockerignore`
- `docs/deployment-render-backend.md`
- `docs/deployment-backend.md`
- `docs/deployment-target.md`
- `docs/phase-8-6a-backend-staging-deploy-preflight.md`
- `docs/phase-8-6a2-render-docker-backend-preflight.md`
- `README.md`

Backend source/business logic was not changed.

## Docker Strategy

Use backend-scoped Docker deployment on Render:

```text
Runtime / Environment: Docker
Root Directory: backend
Dockerfile Path: Dockerfile
Docker Build Context Directory: .
Health Check Path: /api/categories
Native Java Build Command: not used
Native Java Start Command: not used
```

With Render root directory set to `backend`, `Dockerfile` and `.dockerignore` are resolved as `backend/Dockerfile` and `backend/.dockerignore`.

## Dockerfile Summary

`backend/Dockerfile` is a multi-stage build:

- build stage uses `eclipse-temurin:25-jdk`;
- copies Maven Wrapper inputs and `.mvn`;
- runs `chmod +x mvnw`;
- warms Maven dependencies with `./mvnw -B -DskipTests dependency:go-offline`;
- builds inside Docker with `./mvnw -B clean package -DskipTests`;
- runtime stage uses `eclipse-temurin:25-jre`;
- copies `/app/target/quizmaster-0.0.1-SNAPSHOT.jar` to `/app/app.jar`;
- creates and runs as non-root user `appuser`;
- exposes `8080` as documentation only;
- starts with `java ${JAVA_OPTS:-} -Dserver.port=${PORT:-8080} -jar /app/app.jar`.

No secrets, `.env` files, host `target/`, or Docker build artifacts are copied into the image.

## .dockerignore Summary

`backend/.dockerignore` excludes:

```text
target/
*.log
.env
.env.*
.git/
.gitignore
node_modules/
dist/
coverage/
.idea/
.vscode/
*.iml
logs/
```

It keeps `src/`, `pom.xml`, `mvnw`, `mvnw.cmd`, and `.mvn/` available for Docker build.

## Render Settings

Phase 8.6B should use Docker deployment:

```text
Service type: Web Service
Region: Singapore / nearest Singapore
Branch: main
Runtime / Environment: Docker
Root Directory: backend
Dockerfile Path: Dockerfile
Docker Build Context Directory: .
Health Check Path: /api/categories
Auto deploy: off/manual for first staging deploy
```

The earlier native Java build/start commands from 8.6A are not the preferred Render path.

## Required Render Environment Variables

Use placeholders only in docs. Set real values only in Render Dashboard during Phase 8.6B:

```env
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=<strong-secret-at-least-32-chars>
CORS_ALLOWED_ORIGINS=<frontend-origin-or-comma-separated-list>
SPRING_DATASOURCE_URL=<neon-jdbc-url-with-sslmode-require>
SPRING_DATASOURCE_USERNAME=<neon-username>
SPRING_DATASOURCE_PASSWORD=<neon-password>
SPRING_JPA_HIBERNATE_DDL_AUTO=update
APP_SEED_DEMO=false
```

`SPRING_JPA_HIBERNATE_DDL_AUTO=update` is staging-only. Production default remains `validate`; production v1.0 still needs Flyway/Liquibase or controlled SQL migrations.

## PORT Handling

`application-prod.yaml` already supports:

```yaml
server:
  port: ${PORT:8080}
```

The Docker CMD also passes:

```text
-Dserver.port=${PORT:-8080}
```

Render's `PORT` environment variable is therefore honored in both app config and container startup.

## CORS Handling

`CORS_ALLOWED_ORIGINS` maps to `app.cors.allowed-origins`. Existing config rejects blank values, unresolved placeholders, and wildcard `*`. Comma-separated origins are supported by Spring Boot list binding.

The API CORS config applies to `/api/**`, allows `Authorization` and `Content-Type`, includes `OPTIONS`, and sets `allowCredentials=false`.

Final browser CORS verification remains deferred to Phase 8.7 after the Vercel frontend URL exists. Phase 8.6B can run curl preflight checks, but curl is not a substitute for browser validation.

## Seeder Safety

`DemoDataSeeder` only runs when `app.seed-demo=true` is explicitly set. Render staging must set `APP_SEED_DEMO=false` or omit any true value. The empty Neon staging database should not contain demo users/categories; 8.6B smoke must register a staging test user before login.

## Database Handling

Neon PostgreSQL staging was prepared in Phase 8.4. Phase 8.6A2 did not connect to Neon and did not read secret files. Render Docker deployment must receive database values only through Render environment variables, with JDBC URL including `sslmode=require`.

## Local Backend Test Result

```text
.\mvnw.cmd test
Result: PASS
Tests run: 55, Failures: 0, Errors: 0, Skipped: 0
```

## Local Backend Package Result

```text
.\mvnw.cmd clean package
Result: PASS
Tests run: 55, Failures: 0, Errors: 0, Skipped: 0
Expected JAR: backend/target/quizmaster-0.0.1-SNAPSHOT.jar
```

## Docker Build Result

```text
docker build -t quizmaster-backend:8.6a2 .
Result: SKIPPED / PASS WITH NOTES
Reason: Docker CLI exists, but Docker Desktop Linux daemon was unavailable:
failed to connect to dockerDesktopLinuxEngine
```

8.6B must treat the Render Docker build log as the first full Docker build verification unless Docker Desktop is started and the build is rerun locally before then.

## Secret / Artifact Scan Result

Pre-commit scan result:

- `git diff --check`: PASS.
- Neon password prefix scan: no real secret matches.
- Raw Neon owner URL scan: no matches.
- `SPRING_DATASOURCE_PASSWORD` matches are placeholder env examples only.
- `APP_SEED_DEMO=true` and `app.seed-demo=true` matches are existing demo/runbook guidance or explicit "do not enable" warnings, not Render staging settings.
- No build artifacts, `.env` files, `dist/`, `node_modules/`, logs, or Docker build outputs are intended to be staged.

## What Was Not Done

- No push.
- No deploy.
- No Render service creation.
- No Render CLI.
- No GitHub CLI.
- No Docker image push.
- No real env vars.
- No secret read.
- No smoke test against a backend URL.
- No production-ready claim.

## Remaining Risks

- Java 25 image support must be confirmed by Render build logs because the local Docker daemon was unavailable.
- Render free tier, if used, can sleep and cold start.
- Browser CORS verification is deferred until frontend deploy.
- `ddl-auto=update` remains staging-only and does not provide rollback.
- No Flyway/Liquibase migration strategy exists yet.
- Full Phase 8.6 remains open until deployed smoke tests pass.

## Manual Phase 8.6B Checklist

1. Confirm git clean.
2. Push `main` only after approval.
3. Create Render Web Service.
4. Select Docker runtime/environment.
5. Set Root Directory `backend`.
6. Set Dockerfile Path `Dockerfile`.
7. Set Docker Build Context Directory `.`.
8. Set Health Check Path `/api/categories`.
9. Set required env vars in Render Dashboard.
10. Deploy.
11. Inspect logs without exposing secrets.
12. Smoke `GET /api/categories`.
13. Register a staging test user.
14. Login the staging test user.
15. Optionally call `/api/auth/me` with the returned token.
16. Confirm no demo seeder ran.
17. Report backend URL and results.

## Commit And Git Status

```text
Commit: <pending until commit>
Git status: <pending until final verification>
```
