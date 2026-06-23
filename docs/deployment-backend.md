# QuizMaster Backend Deployment

## Phase 8.6B Render Docker Staging Deploy

Backend staging is now deployed on Render using Docker:

```text
Render service: quizmaster-api-staging
Backend URL: https://quizmaster-api-staging.onrender.com
Runtime / Environment: Docker
Region: Singapore / Southeast Asia
Plan: Free
Root Directory: backend
Dockerfile Path: Dockerfile
Health Check Path: /api/categories
Latest deployed commit: a5a2563 Prepare Render Docker backend deployment
```

The Phase 8.6B closure report is
[`docs/phase-8-6b-render-backend-staging-deploy.md`](phase-8-6b-render-backend-staging-deploy.md).

Backend deploy smoke passed for public categories, register, login, and CORS preflight checks. This does
not make QuizMaster production-ready, and frontend staging deployment/browser verification remains
pending.

## Phase 8.6A Render Preflight

Phase 8.6A is closed as backend staging deploy preflight only. The manual Render backend guide is
[`docs/deployment-render-backend.md`](deployment-render-backend.md), and the phase report is
[`docs/phase-8-6a-backend-staging-deploy-preflight.md`](phase-8-6a-backend-staging-deploy-preflight.md).

At the time of Phase 8.6A, no Render service had been created and no backend URL existed yet. Phase 8.6B
later completed the approved push, manual Render deploy, log review, and public smoke tests.

## Phase 8.6A2 Render Docker Readiness

Phase 8.6A2 supersedes the native Java Render path with Docker deployment readiness. Use
[`docs/deployment-render-backend.md`](deployment-render-backend.md) as the Render Docker guide and
[`docs/phase-8-6a2-render-docker-backend-preflight.md`](phase-8-6a2-render-docker-backend-preflight.md)
as the closure report.

The selected Render backend path is now:

```text
Runtime / Environment: Docker
Root Directory: backend
Dockerfile Path: Dockerfile
Docker Build Context Directory: .
Health Check Path: /api/categories
```

Do not use native Java build/start commands for this Render staging service unless a later approved task
intentionally changes the deployment strategy.

## Target

Target: Render Web Service in Singapore, connected to Neon PostgreSQL in AWS Singapore. The first target is staging, not production.

Render backend staging service was created in Phase 8.6B. Neon staging was provisioned manually in Phase 8.4; production database has not been created.

## Render Service Type

```text
Service type: Web Service
Region: Singapore
Branch: main
First deploy: completed manually in Phase 8.6B
```

Render must build the repository Dockerfile. Do not select a native Java runtime because Render does not provide one for this project plan.

## Root Directory

```text
Root directory: backend
```

With this monorepo setting, Docker build context contains `backend/mvnw`, `.mvn`, `pom.xml` and `src` while excluding host build artifacts through `.dockerignore`.

## Runtime

```text
Runtime: Docker
Java: 25
Build image: eclipse-temurin:25-jdk
Runtime image: eclipse-temurin:25-jre
```

Java must not be downgraded without an explicit project decision. A real Docker/Render build must still confirm both Temurin tags because the local Docker Linux daemon was unavailable during Phase 8.3.

## Dockerfile

Repository path:

```text
backend/Dockerfile
```

When the Render root directory is `backend`, the Dockerfile is the `Dockerfile` at the root of the service build context.

The multi-stage file copies only Maven inputs/source, runs the Maven Wrapper, then copies the executable Spring Boot JAR into the runtime image. `.dockerignore` excludes `target`, `.git`, IDE state, environment files and logs. Secrets are supplied only at runtime.

Container non-root user remains deferred until Docker build can be verified.

## Build / Start Behavior

Local Windows verification:

```powershell
cd D:\QuizMaster\backend
.\mvnw.cmd test
.\mvnw.cmd clean package
java -jar .\target\quizmaster-0.0.1-SNAPSHOT.jar
```

Docker build stage:

```text
./mvnw clean package -DskipTests
```

Docker start behavior:

```text
java -jar /app/app.jar
```

Tests are run before image creation; the Docker build deliberately skips rerunning them. Render uses the Dockerfile entrypoint, so no Render native Java build/start command is required.

## Required Environment Variables

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

Optional values:

```env
SPRING_JPA_SHOW_SQL=false
JWT_EXPIRATION_MS=86400000
```

Never store real values in Git or expose them to the frontend.

## JPA / DDL Strategy

Production defaults are:

```text
ddl-auto=validate
show-sql=false
```

For first staging deployment without migrations, `SPRING_JPA_HIBERNATE_DDL_AUTO=update` may be used temporarily against a disposable staging database. For production-grade deployment, use `validate` with versioned migrations such as Flyway/Liquibase.

Phase 8.3 does not add a migration tool.

## Datasource / Neon Notes

All three Spring datasource variables are mandatory in the production profile and have no localhost/default credential fallback. Neon must provide a JDBC PostgreSQL URL compatible with pgJDBC and required TLS parameters.

Prepared in Phase 8.4:

- staging-only Neon project/database in Singapore;
- direct connection for initial Hibernate schema setup;
- JDBC `sslmode=require` contract;
- successful local prod-profile connection and `GET /api/categories` returning `[]` against empty staging data.

Still required after first deploy:

- test pooled versus direct connection for Hibernate/Hikari;
- continue monitoring Render-to-Neon TLS/network behavior;
- keep credentials only in Render environment variables;
- review the schema created by temporary `ddl-auto=update` and establish migrations.

## PORT Behavior

Production reads:

```yaml
server:
  port: ${PORT:8080}
```

Render supplies `PORT`. Local production-profile checks fall back to 8080. Phase 8.3 also verified that setting `PORT=19090` caused embedded Tomcat to initialize on 19090 before the intentionally missing datasource stopped startup.

`EXPOSE 8080` documents the local/default container port; it does not override Spring's runtime `PORT` value.

## Seeder Safety

Do not set either of these values in production:

```text
app.seed-demo=true
APP_SEED_DEMO=true
```

Demo seeding remains opt-in and must be a separate decision for a disposable staging database.

## Local Verification Commands

```powershell
cd D:\QuizMaster\backend
.\mvnw.cmd test
.\mvnw.cmd clean package
```

Production fail-fast check without datasource variables:

```powershell
$env:SPRING_PROFILES_ACTIVE="prod"
$env:JWT_SECRET="<test-secret-at-least-32-chars>"
$env:CORS_ALLOWED_ORIGINS="https://example.com"
$env:PORT="19090"
Remove-Item Env:\SPRING_DATASOURCE_URL -ErrorAction SilentlyContinue
Remove-Item Env:\SPRING_DATASOURCE_USERNAME -ErrorAction SilentlyContinue
Remove-Item Env:\SPRING_DATASOURCE_PASSWORD -ErrorAction SilentlyContinue
java -jar .\target\quizmaster-0.0.1-SNAPSHOT.jar
```

Expected result: non-zero exit, unresolved datasource URL rejected, no localhost fallback. Clear all temporary variables after the check.

## Docker Verification Commands

```powershell
cd D:\QuizMaster\backend
docker version
docker info
docker build -t quizmaster-backend:phase-8-3 .
```

If the build passes, verify container fail-fast:

```powershell
docker run --rm `
  -e SPRING_PROFILES_ACTIVE=prod `
  -e JWT_SECRET=<test-secret-at-least-32-chars> `
  -e CORS_ALLOWED_ORIGINS=https://example.com `
  quizmaster-backend:phase-8-3
```

Expected result: non-zero exit because datasource variables are absent, with no localhost fallback.

## Known Limitations

- Docker build and Java 25 image tags were verified by Render deploy logs; local Docker Desktop Linux engine remained unavailable during preflight.
- Container runs as a non-root user in the committed Dockerfile.
- Neon staging has been provisioned; Render-to-Neon connection passed deployed backend smoke, while pooled connection behavior remains unverified.
- No Flyway/Liquibase migrations or rollback plan exist.
- No actuator health endpoint exists.
- Render backend deployment and backend smoke tests passed in Phase 8.6B; Vercel/frontend deployment has not run.
- Local commits through `a5a2563` were pushed before Render service creation.
- QuizMaster is not production-ready.

## After First Render Deploy

1. Keep real Neon values only in Render environment storage.
2. Treat `SPRING_JPA_HIBERNATE_DDL_AUTO=update` as staging-only and plan migration-controlled `validate`.
3. Keep backend URL documented as `https://quizmaster-api-staging.onrender.com`.
4. Do not expose Render logs that contain sensitive runtime context.
5. Use `GET /api/categories` as the lightweight public smoke endpoint because no actuator health endpoint exists.
6. Continue with frontend/Vercel integration and browser CORS verification in Phase 8.7.
7. Run broader auth, quiz and attempt smoke tests after frontend integration.
