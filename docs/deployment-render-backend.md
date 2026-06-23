# QuizMaster Render Backend Staging Deploy Guide

## Phase 8.6B Staging Deployment Completed

Backend staging has been deployed manually on Render using the Docker path.

```text
Status: deployed for staging
Render service: quizmaster-api-staging
Backend URL: https://quizmaster-api-staging.onrender.com
Runtime / Environment: Docker
Region: Singapore / Southeast Asia
Plan: Free
Branch: main
Root Directory: backend
Dockerfile Path: Dockerfile
Docker Build Context Directory: .
Health Check Path: /api/categories
Latest deployed commit: a5a2563 Prepare Render Docker backend deployment
```

Smoke results recorded in [`docs/phase-8-6b-render-backend-staging-deploy.md`](phase-8-6b-render-backend-staging-deploy.md):

- `GET /api/categories`: PASS, `200 OK`, body `[]`.
- Register staging user: PASS, token redacted.
- Login staging user: PASS, token redacted.
- CORS allowed origin `http://localhost:5173`: PASS.
- CORS unknown origin `https://evil.example`: PASS, blocked.
- Render logs: PASS, Java 25/prod profile/Tomcat port 10000/Hikari/PostgreSQL connected, no secret values observed.

Keep all Render env var values outside Git. Frontend/Vercel browser CORS verification remains deferred to Phase 8.7.

## Phase 8.6A2 Docker Path Supersedes Native Java Path

Phase 8.6A2 chooses Render **Docker** deployment for the backend. The earlier 8.6A native Java build/start command is kept only as historical preflight context and is no longer the preferred Render path, because Render's documented native runtimes do not include Java as a safe official runtime path for this project.

Use these Render settings in Phase 8.6B:

```text
Service type: Web Service
Runtime / Environment: Docker
Region: Singapore / nearest Singapore
Root Directory: backend
Dockerfile Path: Dockerfile
Docker Build Context Directory: .
Health Check Path: /api/categories
```

Do not set native Java build/start commands for the Render service when using Docker. The container starts the app with:

```text
java ${JAVA_OPTS:-} -Dserver.port=${PORT:-8080} -jar /app/app.jar
```

Render supplies `PORT`, and `application-prod.yaml` also supports `server.port=${PORT:8080}`.

Required Render env vars for Docker staging:

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

`SPRING_JPA_HIBERNATE_DDL_AUTO=update` is staging-only. Production default remains `validate`, and production v1.0 still needs versioned migrations or controlled SQL. `APP_SEED_DEMO=false` prevents accidental demo seed; do not assume `demo-user@quizmaster.local` exists in empty staging data.

After Render deploy, use placeholder-only smoke commands:

```bash
curl -i https://<render-backend-staging-url>/api/categories
```

Expected empty-data response:

```json
[]
```

Register staging user:

```bash
curl -i -X POST https://<render-backend-staging-url>/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"staging-user-<timestamp>@quizmaster.local","password":"password123"}'
```

Login staging user:

```bash
curl -i -X POST https://<render-backend-staging-url>/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"staging-user-<timestamp>@quizmaster.local","password":"password123"}'
```

Optional auth smoke:

```bash
curl -i https://<render-backend-staging-url>/api/auth/me \
  -H "Authorization: Bearer <token>"
```

CORS allowed origin preflight:

```bash
curl -i -X OPTIONS https://<render-backend-staging-url>/api/categories \
  -H "Origin: https://<vercel-frontend-staging-url>" \
  -H "Access-Control-Request-Method: GET"
```

CORS unknown origin preflight:

```bash
curl -i -X OPTIONS https://<render-backend-staging-url>/api/categories \
  -H "Origin: https://evil.example" \
  -H "Access-Control-Request-Method: GET"
```

Curl preflight is useful in 8.6B/8.7, but final browser CORS verification remains deferred to Phase 8.7 after Vercel deploy.

Manual Phase 8.6B Docker checklist:

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
12. Smoke public endpoint.
13. Register staging test user.
14. Login staging test user.
15. Check no seeder ran.
16. Check logs do not expose secrets.
17. Report backend URL and results.

Known risks remain: Java 25 image support must be verified by Docker/Render build, Render free tier may cold start, browser CORS verification is deferred, and `ddl-auto=update` has no production rollback strategy.

## Purpose

Tài liệu này là checklist preflight và hướng dẫn thao tác thủ công cho backend staging trên Render Web Service. Phase 8.6A chỉ chuẩn bị và xác minh cấu hình; không deploy, không push, không tạo service Render, không đọc hoặc ghi secret.

Full Phase 8.6 was closed for backend deploy after Phase 8.6B completed manual Render deploy and backend smoke tests. Frontend staging remains pending for Phase 8.7.

## Scope

- Target: backend Spring Boot trong `backend/`.
- Platform: Render Web Service, region Singapore hoac region gan Singapore nhat neu dashboard hien thi ten khac.
- Database: Neon PostgreSQL staging da duoc chuan bi tu Phase 8.4.
- Frontend: Vercel staging chua co URL that.
- Source deploy: GitHub sau khi user chap thuan push.
- Secret: chi nhap trong Render dashboard o 8.6B, khong dua vao Git/docs/logs.

## Render Settings

Thiet lap can chon trong Render dashboard neu tao Web Service tu GitHub:

```text
Service type: Web Service
Region: Singapore / nearest Singapore
Root Directory: backend
Branch: main
Runtime: Java, if the dashboard supports it for this service
Build Command: chmod +x mvnw && ./mvnw clean package -DskipTests
Start Command: java -Dserver.port=$PORT -jar target/quizmaster-0.0.1-SNAPSHOT.jar
Health Check Path: /api/categories
```

Neu Render UI yeu cau health path khong co leading slash, dung:

```text
api/categories
```

Project da co `backend/Dockerfile` pin Java 25. Theo Render Supported Languages docs kiem tra ngay 2026-06-23, Java khong nam trong nhom native runtimes; Java/Kotlin/Scala duoc chay bang Docker image. Vi vay 8.6B phai xac nhan dashboard Render thuc te:

- Neu co Java/native runtime phu hop: dung build/start command o tren.
- Neu khong co Java/native runtime: dung Docker runtime voi `backend/Dockerfile`, hoac dung service setup theo Docker da duoc document truoc do.
- Neu dashboard khong cho chon runtime nao co Java 25 hoac Docker build Java 25 fail: deploy phai dung lai va bao cao runtime blocker.

## Local Artifact Verification

Local package da tao dung JAR:

```text
backend/target/quizmaster-0.0.1-SNAPSHOT.jar
```

Artifact den tu Maven:

```text
groupId: com.quizmaster
artifactId: quizmaster
version: 0.0.1-SNAPSHOT
packaging: jar
Spring Boot: 3.5.15
Java release: 25
```

Render start command phai tro dung JAR nay. Neu ten JAR thay doi trong `pom.xml`, update command truoc khi deploy.

## Java Runtime Risk

Local runtime hien tai:

```text
OpenJDK Temurin 25
Maven Wrapper: Apache Maven 3.9.16
```

Khong downgrade Java trong Phase 8.6A. 8.6B phai xac nhan Render runtime hoac Docker image co Java 25. Neu Render khong support Java 25 trong path duoc chon, deploy co the fail. Mitigation sau nay co the la cau hinh Docker/runtime phu hop hoac align project ve Java LTS, nhung do khong thuoc 8.6A.

## PORT Binding

`backend/src/main/resources/application-prod.yaml` da co:

```yaml
server:
  port: ${PORT:8080}
```

Render cung cap `PORT`. Start command van truyen ro:

```text
java -Dserver.port=$PORT -jar target/quizmaster-0.0.1-SNAPSHOT.jar
```

Day la cau hinh phu hop cho Render. Neu dung Dockerfile hien co, Spring van doc `PORT` tu environment.

## Required Environment Variables

Chi nhap gia tri that trong Render dashboard o Phase 8.6B. Tai lieu chi dung placeholder:

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

Notes:

- `SPRING_JPA_HIBERNATE_DDL_AUTO=update` chi duoc dung cho staging initial deploy khi chua co migrations.
- Production default trong repo van la `validate`.
- Truoc production v1.0 can Flyway/Liquibase hoac controlled SQL migration.
- `APP_SEED_DEMO=false` la safety explicit; khong dat `true` cho Render staging.
- Khong dat secret hoac database credential trong frontend/Vercel variables.

## Datasource And Neon

Prod profile doc datasource tu env vars:

```yaml
spring.datasource.url: ${SPRING_DATASOURCE_URL}
spring.datasource.username: ${SPRING_DATASOURCE_USERNAME}
spring.datasource.password: ${SPRING_DATASOURCE_PASSWORD}
```

Yeu cau cho Neon staging:

- JDBC URL phai co `sslmode=require`.
- Username/password la env vars rieng.
- Khong commit raw Neon URL, password, hoac secret file.
- Khong ket noi Neon trong 8.6A.
- Phase 8.4 da tao schema bang local prod-profile smoke voi temporary `ddl-auto=update`.
- Data staging du kien van empty.

## CORS

Prod profile doc:

```text
CORS_ALLOWED_ORIGINS -> app.cors.allowed-origins
```

`CorsProperties` validate:

- danh sach origins khong duoc blank;
- khong cho wildcard `*`;
- trim va distinct origins;
- fail fast neu placeholder chua resolve.

Spring Boot co the bind comma-separated env var vao `List<String>`, vi vay co the dung:

```env
CORS_ALLOWED_ORIGINS=https://<frontend-origin-1>,https://<frontend-origin-2>
```

`CorsConfig` ap dung cho `/api/**`, cho methods `GET, POST, PUT, PATCH, DELETE, OPTIONS`, headers `Authorization` va `Content-Type`, va `allowCredentials=false`. OPTIONS preflight di qua Spring CORS configuration.

Phase 8.6A chua co Vercel frontend domain that. Final browser CORS verification defer sang Phase 8.7 sau frontend deploy. Curl preflight o 8.6B/8.7 huu ich nhung khong thay the browser CORS.

Allowed origin preflight placeholder:

```bash
curl -i -X OPTIONS https://<render-backend-staging-url>/api/categories \
  -H "Origin: https://<vercel-frontend-staging-url>" \
  -H "Access-Control-Request-Method: GET"
```

Unknown origin preflight placeholder:

```bash
curl -i -X OPTIONS https://<render-backend-staging-url>/api/categories \
  -H "Origin: https://evil.example" \
  -H "Access-Control-Request-Method: GET"
```

Khong dung wildcard `*` cho authenticated staging/production.

## Demo Seeder Safety

`DemoDataSeeder` chi chay khi property sau duoc bat explicit:

```text
app.seed-demo=true
```

Spring relaxed binding co the map env var `APP_SEED_DEMO=true` ve property nay, vi vay Render staging phai dat:

```env
APP_SEED_DEMO=false
```

hoac it nhat khong bao gio dat true. Staging DB theo Phase 8.4 la empty-data strategy, nen 8.6B khong duoc gia dinh login bang `demo-user@quizmaster.local`. Smoke flow phai register staging test user truoc roi moi login user do.

## Smoke Flow For Empty Staging DB

8.6B sau deploy nen smoke theo thu tu:

1. `GET https://<render-backend-staging-url>/api/categories`
2. Register mot staging test user bang endpoint public.
3. Login staging test user vua tao.
4. Neu can auth smoke sau do, dung token cua staging test user.

Khong su dung demo-user login tru khi co task rieng bat seed co approval.

## Logs And Secrets

Khi xem Render logs:

- Khong copy log chua secret vao issue/docs/chat.
- Khong in datasource password/JWT secret.
- Kiem tra `show-sql=false` trong prod unless intentionally overridden.
- Kiem tra khong co log "Demo data seed enabled" tren staging.

## Rollback Notes

Render co the redeploy previous commit neu service da co deploy history. Database rollback khong duoc cover boi `ddl-auto=update`; neu schema/data bi thay doi thi can migration/backup strategy rieng. Production v1.0 can migration plan truoc khi coi rollback la day du.

## Free Tier Caveat

Neu dung free instance, service co the sleep sau idle va cold start lam request dau cham. Do phu hop staging/demo hon production.

## Manual Phase 8.6B Checklist

1. Confirm git clean.
2. Push `main` only after approval.
3. Create Render Web Service.
4. Set root/build/start or Docker settings according to actual dashboard support.
5. Set required env vars in Render dashboard.
6. Deploy.
7. Inspect logs without exposing secrets.
8. Smoke test public endpoint.
9. Register staging test user.
10. Login staging test user.
11. Check no seeder ran.
12. Check logs do not expose secrets.
13. Report backend URL and results.

## References Checked On 2026-06-23

- Render Supported Languages: https://render.com/docs/language-support
- Render Web Services: https://render.com/docs/web-services
- Render Health Checks: https://render.com/docs/health-checks
- Render Free Instances: https://render.com/docs/free
