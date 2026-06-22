# Phase 8.3 Backend Production Profile / Docker Runtime Verification

## Scope

Phase 8.3 verifies the existing backend production profile, Java 25 Docker runtime plan, Maven Wrapper mode and local build/start behavior before Neon provisioning.

This phase does not deploy, create a database, enable demo seed, change business logic, push Git or claim production readiness.

## Current State Before Verification

- Branch: `main`, clean working tree, 24 commits ahead of `origin/main` at phase start.
- Latest commit: `7eec20a Configure frontend deployment environment`.
- Render target: Docker Web Service, root directory `backend`, Singapore.
- Java: 25 in Maven and Docker stages.
- Known blocker: Docker build not verified because the local Linux engine was unavailable.

## Production Profile Verification

`application-prod.yaml` was inspected and loaded by a real JAR startup attempt. It contains:

- production-only dynamic `PORT`;
- mandatory Spring datasource URL/username/password placeholders without defaults;
- production `ddl-auto=validate` default;
- production `show-sql=false` default;
- required JWT secret and production CORS origin list.

Static scanning found no production localhost JDBC URL, default `postgres` credentials, hardcoded `show-sql=true` or hardcoded `ddl-auto=update`. No config change was required.

## Datasource Fail-fast Verification

The packaged JAR was started with profile `prod`, a test-only JWT secret, an allowed HTTPS origin and all three datasource variables removed.

Observed result:

- active profile was `prod`;
- process exited with code 1;
- Hikari rejected unresolved `${SPRING_DATASOURCE_URL}`;
- output did not show a connection attempt to `jdbc:postgresql://localhost`;
- no default username/password was used.

This is a PASS for missing-datasource fail-fast. A successful production start is intentionally deferred until Neon staging exists.

## PORT Verification

The same fail-fast run set `PORT=19090`. Embedded Tomcat initialized on port 19090 before datasource initialization stopped startup. This confirms the production profile reads the platform port.

When `PORT` is absent, the configured fallback remains 8080 for local testing.

## JPA Production Behavior

Production defaults remain:

```text
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
SPRING_JPA_SHOW_SQL=false
```

Staging may temporarily set DDL to `update` only for an empty/disposable database before migrations exist. This is not a production-grade schema strategy; Flyway/Liquibase remains required before a serious production release.

## Dockerfile Verification

Static verification passed:

- multi-stage Dockerfile;
- `eclipse-temurin:25-jdk` build image;
- `eclipse-temurin:25-jre` runtime image;
- Maven Wrapper build with no host `target` copy;
- executable JAR copied from build stage;
- `java -jar /app/app.jar` entrypoint;
- port 8080 documented through `EXPOSE` while Spring reads runtime `PORT`;
- `.dockerignore` excludes target, Git, IDE, env and log files;
- no secret is copied or embedded.

Actual image build remains NOT VERIFIED because the Docker Desktop Linux engine is unavailable. Java was not downgraded and Dockerfile changes were not made without a buildable environment.

Non-root runtime user remains deferred until Docker build can be verified.

## Maven Wrapper Executable Verification

`git ls-files --stage backend/mvnw` reports mode `100755`. The Docker build stage additionally runs `chmod +x mvnw` as a defensive measure.

## Render Runtime Plan

```text
Service type: Render Web Service
Runtime: Docker
Root directory: backend
Dockerfile: backend/Dockerfile
Region: Singapore
Branch: main
Start: Docker ENTRYPOINT -> java -jar /app/app.jar
Initial smoke endpoint: GET /api/categories
```

Render native Java build/start commands are not used. Full environment and verification commands are documented in `docs/deployment-backend.md`.

## Test / Build Evidence

- `backend/.\mvnw.cmd test`: PASS — 55 tests, 0 failures/errors/skips.
- `backend/.\mvnw.cmd clean package`: PASS — 55 tests pass and `target/quizmaster-0.0.1-SNAPSHOT.jar` was produced (59,864,579 bytes).
- Static production config scan: PASS — 0 dangerous matches.
- Production missing datasource check: EXPECTED FAIL/PASS — exit code 1, no localhost fallback.
- `PORT=19090` check: PASS — Tomcat initialized on 19090.
- Frontend build: skipped because Phase 8.3 changes backend deployment/runtime docs only and frontend code is unchanged.
- `git diff --check`: required to pass before commit.

Existing non-fatal Java 25 warnings remain: Mockito/Byte Buddy dynamic-agent warnings and Lombok use of a deprecated `Unsafe` method.

## Docker Evidence

```text
Docker CLI: 29.4.3
Context: desktop-linux
Docker daemon: unavailable
Error: dockerDesktopLinuxEngine named pipe not found
Docker build: NOT VERIFIED
Container fail-fast: NOT RUN
Java 25 tags by actual build: NOT VERIFIED
```

The environment issue was not repaired as part of this repository task.

## Files Changed

- Created `docs/deployment-backend.md`.
- Created `docs/phase-8-3-backend-production-runtime-verification.md`.
- Updated the README deployment pointer.
- Updated `docs/deployment-target.md` to remove stale runtime wording and record Phase 8.3 status.
- No backend config, Dockerfile, Maven Wrapper content or application code change was needed.

## Remaining Risks

- Neon database has not been provisioned.
- Real staging environment variables do not exist.
- Render and Vercel have not been deployed.
- Docker image/Temurin tags and container fail-fast are not verified by an actual build.
- Container non-root execution is deferred.
- No Flyway/Liquibase migration or rollback strategy exists.
- No staging smoke test has run.
- Git has not been pushed.
- QuizMaster is not production-ready.

## Final Conclusion

**Phase 8.3 DONE / CLOSED — PASS WITH NOTES.**

The production profile, local Java 25 build/package, datasource fail-fast, dynamic port and Render Docker plan pass verification. Docker image/container verification remains open solely because the local Linux daemon is unavailable; this must be completed on a working Docker host or during the first controlled Render build.

The next phase may prepare Neon PostgreSQL staging, but no deployment should be considered production-ready until the database, image and end-to-end staging smoke tests pass.
