# Phase 8.6A Backend Staging Deploy Preflight

## Status

**DONE / CLOSED - READY FOR MANUAL RENDER DEPLOY**

Full Phase 8.6 is **NOT closed** because Render deploy has not happened. Phase 8.6B still must push with approval, create/configure the Render service, deploy, inspect logs, and run public smoke tests.

## Scope

Phase 8.6A prepared backend staging deploy documentation and verified the backend deploy contract locally. It did not deploy, push, create Render resources, read secret files, connect to Neon, set real env vars, import data, enable demo seed, modify frontend, or change backend business logic.

## Git State

Initial git state:

```text
Branch: main
Working tree: clean
origin/main...HEAD: 0 behind, 27 ahead
Latest commit before task: 2c69cd5 Verify frontend production deployment configuration
```

No push was performed.

## Inspected

- `README.md`
- `docs/deployment-target.md`
- `docs/deployment-backend.md`
- `docs/deployment-database.md`
- `docs/deployment-frontend.md`
- `backend/pom.xml`
- `backend/mvnw`
- `backend/mvnw.cmd`
- `backend/Dockerfile`
- `backend/src/main/resources/application.yaml`
- `backend/src/main/resources/application-dev.yaml`
- `backend/src/main/resources/application-prod.yaml`
- `backend/src/main/java/com/quizmaster/config/*`
- `backend/src/main/java/com/quizmaster/auth/*`
- `backend/src/main/java/com/quizmaster/demo/DemoDataSeeder.java`
- `backend/src/main/java/com/quizmaster/QuizmasterApplication.java`

No `render.yaml`, `application.yml`, `application-prod.yml`, or `application-dev.yml` was present.

## Changed

- Added `docs/deployment-render-backend.md`.
- Added this phase report.
- Updated README/deployment docs with links/status notes.

Backend source/config was not changed because no deploy-blocking backend config gap was found inside the application configuration. The remaining runtime question belongs to Render setup in 8.6B.

## Backend Runtime Findings

`pom.xml` declares:

```text
Spring Boot: 3.5.15
groupId: com.quizmaster
artifactId: quizmaster
version: 0.0.1-SNAPSHOT
Java: 25
Expected JAR: backend/target/quizmaster-0.0.1-SNAPSHOT.jar
```

Local commands verified:

```text
java -version -> OpenJDK Temurin 25
.\mvnw.cmd -v -> Apache Maven 3.9.16, Java 25
```

The package step produced the expected Spring Boot executable JAR.

## Render Settings Recommendation

If Render dashboard supports a Java runtime suitable for this service:

```text
Service type: Web Service
Region: Singapore / nearest Singapore
Root Directory: backend
Build Command: chmod +x mvnw && ./mvnw clean package -DskipTests
Start Command: java -Dserver.port=$PORT -jar target/quizmaster-0.0.1-SNAPSHOT.jar
Health Check Path: /api/categories
```

Important runtime note: Render official docs checked on 2026-06-23 still list native support for Node.js/Bun, Python, Ruby, Go, Rust, and Elixir; Java is documented as a Docker use case. This repo already has `backend/Dockerfile` pinning Eclipse Temurin Java 25. Phase 8.6B must confirm which path the actual Render dashboard supports and stop if Java 25 cannot run.

## Env Var Checklist

Render staging placeholders only:

```env
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=<strong-secret-at-least-32-chars>
CORS_ALLOWED_ORIGINS=<frontend-origin>
SPRING_DATASOURCE_URL=<neon-jdbc-url-with-sslmode-require>
SPRING_DATASOURCE_USERNAME=<neon-username>
SPRING_DATASOURCE_PASSWORD=<neon-password>
SPRING_JPA_HIBERNATE_DDL_AUTO=update
APP_SEED_DEMO=false
```

`SPRING_JPA_HIBERNATE_DDL_AUTO=update` is staging-only. Production default remains `validate`; production v1.0 needs Flyway/Liquibase or controlled SQL migrations.

## PORT Finding

`application-prod.yaml` includes:

```yaml
server:
  port: ${PORT:8080}
```

Render `PORT` is therefore supported. The recommended start command also passes `-Dserver.port=$PORT`.

## CORS Findings

`CORS_ALLOWED_ORIGINS` maps to `app.cors.allowed-origins`. The property validates non-empty origins, rejects unresolved placeholders and wildcard `*`, trims values, and removes duplicates. Comma-separated origins are supported by Spring Boot list binding.

`CorsConfig` applies to `/api/**`, allows `GET, POST, PUT, PATCH, DELETE, OPTIONS`, allows `Authorization` and `Content-Type`, and sets `allowCredentials=false`.

There is no deployed Vercel frontend domain yet. Browser CORS verification is deferred to Phase 8.7 after frontend deploy. Curl preflight checks can be used in 8.6B/8.7 but are not a substitute for browser verification.

## Seeder Findings

`DemoDataSeeder` is guarded by:

```text
@ConditionalOnProperty(name = "app.seed-demo", havingValue = "true")
```

Default behavior does not seed. Render staging must not set `APP_SEED_DEMO=true`; explicit safety value is `APP_SEED_DEMO=false`.

Because Phase 8.4 selected empty staging data, 8.6B smoke must register a staging test user first. It must not assume `demo-user@quizmaster.local` exists.

## Database Findings

Neon PostgreSQL staging is already prepared from Phase 8.4. 8.6A did not connect to Neon and did not read secret files.

Expected database contract:

- JDBC URL includes `sslmode=require`.
- Username/password stay in Render env vars.
- No secrets in repo.
- Schema was previously created by temporary local `ddl-auto=update` smoke.
- Application data is expected to be empty.
- Full deployed API flow is deferred to 8.6B.

## Local Test And Build Results

```text
.\mvnw.cmd test
Result: PASS
Tests run: 55, Failures: 0, Errors: 0, Skipped: 0
```

```text
.\mvnw.cmd clean package
Result: PASS
Tests run: 55, Failures: 0, Errors: 0, Skipped: 0
JAR: D:\QuizMaster\backend\target\quizmaster-0.0.1-SNAPSHOT.jar
```

Warnings observed but not deploy-blocking for 8.6A:

- Mockito/ByteBuddy dynamic Java agent warning on Java 25.
- Lombok `sun.misc.Unsafe` terminal deprecation warning during package.

## Safety Checks

Pre-commit checks run:

- `git diff --check`
- `git status --short`
- `git diff --name-only`
- tracked-file secret/artifact grep commands listed in the task

Real secrets must remain absent. Placeholder env var names are allowed.

## Deferred To 8.6B

- Push after approval.
- Render service creation.
- Real Render env var setup.
- Deploy.
- Render logs inspection.
- Backend public URL.
- Public endpoint smoke.
- Register/login smoke.
- Verify no seeder ran.
- CORS check with real frontend origin when available.

## Risks / Blockers

- Render runtime selection must be confirmed manually. Official docs checked on 2026-06-23 still do not list Java as a native runtime; Docker may be required.
- Java 25 support must be confirmed in the selected Render path.
- `ddl-auto=update` is staging-only and has no rollback strategy.
- No Flyway/Liquibase migration strategy exists yet.
- No public backend URL exists yet.
- No deployed browser CORS verification exists yet.
- Free Render service, if used, may sleep and cold start.

## Recommended Next Step

```text
Phase 8.6B Manual Render Backend Deploy
```

Commit after this task:

```text
<pending until commit>
```
