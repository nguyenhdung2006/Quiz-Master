# Phase 8.2A Backend Env / Datasource / PORT / Docker Runtime Hardening

## Scope

Phase 8.2A hardens backend production configuration and defines a reproducible Java 25 Docker runtime for the selected Render staging target. It does not provision Neon, deploy Render, run demo seed, change database schema, add migrations, modify frontend code or claim production readiness.

## Changes Made

- Added production-only datasource settings with mandatory Spring datasource environment variables.
- Added production dynamic `PORT` support with local fallback 8080.
- Changed production JPA defaults to `ddl-auto=validate` and `show-sql=false`.
- Added a multi-stage Java 25 backend Dockerfile and `.dockerignore`.
- Marked `backend/mvnw` executable in the Git index for Linux builds.
- Updated README and deployment target documentation.

Development behavior remains unchanged: the default `dev` profile still uses local PostgreSQL fallbacks, `ddl-auto=update`, `show-sql=true`, the local-only JWT secret and `http://localhost:5173` CORS origin.

## Production Datasource Fail-fast

`application-prod.yaml` overrides the common local datasource configuration:

```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
```

There is no production fallback to localhost, `postgres` username or `postgres` password. Missing placeholders prevent application startup. Credentials must be stored in Render environment variables and must never be logged, committed or sent to the frontend.

## PORT Support

Production configuration contains:

```yaml
server:
  port: ${PORT:8080}
```

Render provides `PORT`. Backend reads `PORT` with fallback 8080 for local production-profile testing. Render terminates public HTTPS and routes traffic to the application port inside the service.

## JPA Production Behavior

Production uses:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: ${SPRING_JPA_HIBERNATE_DDL_AUTO:validate}
    show-sql: ${SPRING_JPA_SHOW_SQL:false}
```

The safe default is `validate`: startup fails if the schema does not match the entities. Since Phase 8.2A does not add Flyway/Liquibase or provision a schema, the first staging deployment may explicitly set `SPRING_JPA_HIBERNATE_DDL_AUTO=update` as a temporary staging-only bridge. Production v1.0 requires versioned migrations and should return to `validate` (or an explicitly chosen equivalent).

SQL logging is disabled by default in production. `SPRING_JPA_SHOW_SQL` exists only as an explicit diagnostic override and should remain false normally.

## JWT / CORS Preservation

Existing Phase 7 protections are preserved:

```env
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=<strong-secret-at-least-32-chars>
CORS_ALLOWED_ORIGINS=https://<frontend-staging-url>
```

Production JWT has no fallback and must be at least 32 characters. Production CORS rejects missing/blank values, unresolved placeholders and wildcard origins. No local frontend origin is added to production.

## Seeder Safety

Demo seeding remains opt-in and was not run in this phase.

```text
Do not set app.seed-demo=true in production.
Do not set APP_SEED_DEMO=true in production.
```

If staging demo data is later required, enabling it must be a separate explicit decision against a disposable staging database.

## Docker Runtime

`backend/Dockerfile` uses a multi-stage build:

- build image: `eclipse-temurin:25-jdk`;
- runtime image: `eclipse-temurin:25-jre`;
- Maven Wrapper builds `quizmaster-0.0.1-SNAPSHOT.jar` with tests skipped inside the image;
- local CI/tests are run separately before image build;
- entrypoint: `java -jar /app/app.jar`;
- documented container port: 8080; actual Spring port follows `PORT`.

Java remains version 25; no downgrade was made. The Dockerfile includes `chmod +x mvnw`, while the repository also records mode `100755` for Linux compatibility.

The final image currently runs with the base image default user. A non-root runtime user is recommended as a later production-hardening improvement after the first staging image is verified.

## Render Backend Plan

```text
Service type: Web Service
Runtime: Docker
Root directory: backend
Dockerfile: backend/Dockerfile from repository root
Region: Singapore
Branch: main
First deploy: manual/explicit trigger after user-approved push
```

No Render service was created in Phase 8.2A.

## Required Backend Environment Variables

```env
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=<strong-secret-at-least-32-chars>
CORS_ALLOWED_ORIGINS=https://<frontend-staging-url>
SPRING_DATASOURCE_URL=<neon-jdbc-url-with-required-tls>
SPRING_DATASOURCE_USERNAME=<neon-username>
SPRING_DATASOURCE_PASSWORD=<neon-password>
SPRING_JPA_HIBERNATE_DDL_AUTO=<validate-or-update>
PORT=<provided-by-render>
```

Optional diagnostic/configuration values:

```env
SPRING_JPA_SHOW_SQL=false
JWT_EXPIRATION_MS=86400000
```

Do not place real values in Git. `SPRING_JPA_HIBERNATE_DDL_AUTO=update` is staging-only until migrations exist; production default remains `validate`.

## Staging Notes

- Provision Neon in AWS Singapore and obtain a TLS-enabled pgJDBC URL in a later phase.
- Start with an empty/disposable staging database.
- Decide explicitly whether temporary `update` is acceptable for the first schema creation.
- Set the real Vercel staging origin in CORS only after Vercel assigns it.
- Confirm Render passes `PORT`, health checks succeed and cold-start behavior is acceptable.
- Do not enable demo seed implicitly.

## Remaining Risks

- Neon staging database and real credentials do not exist yet.
- Docker image availability/build must be verified with a running Docker daemon.
- No Flyway/Liquibase migration strategy exists; staging `update` is not production-grade.
- Render deployment, health check and staging smoke tests have not run.
- A non-root runtime container user is not configured yet.
- Frontend Vercel SPA fallback remains unresolved.
- Local commits have not been pushed, so providers cannot deploy them.
- QuizMaster is not production-ready.

## Test / Build Evidence

- `backend/.\mvnw.cmd test`: PASS — 55 tests, 0 failures, 0 errors, 0 skipped.
- `backend/.\mvnw.cmd clean package`: PASS — 55 tests pass and executable JAR is produced.
- Production startup with valid test JWT/CORS but all three datasource variables removed: EXPECTED FAIL/PASS — process exits with code 1, active profile is `prod`, the datasource URL remains unresolved (`${SPRING_DATASOURCE_URL}`), Hikari rejects it, and there is no fallback connection to localhost/default credentials.
- Docker build: NOT VERIFIED LOCALLY — Docker CLI exists, but the Docker Desktop Linux engine is unavailable (`dockerDesktopLinuxEngine` pipe not found). A sandboxed attempt also could not access the Buildx lock; the approved external attempt could not complete and was stopped. Java was not downgraded and the Temurin 25 image tags remain to be confirmed by a real Docker build.
- Frontend build: skipped because Phase 8.2A changes backend deployment config/docs only and frontend code is unchanged.
- `git diff --check`: required to pass before commit.

Observed Java 25 warnings from the existing build remain non-fatal: Mockito/Byte Buddy dynamic-agent warnings and Lombok use of a deprecated `Unsafe` method.

## Final Conclusion

Phase 8.2A hardens the backend deployment contract without deploying or creating a database. Completion requires tests/package to pass, missing production datasource variables to fail startup as expected, the Maven executable bit to be recorded and all changes to remain free of secrets/artifacts.

Even after those checks, the application remains a staging candidate only. Neon provisioning, migration planning, Render deployment and end-to-end staging smoke tests are still required.
