# QuizMaster Deployment Target

## Status

**Phase 8.1 DONE / CLOSED — PASS WITH NOTES.**

**Phase 8.6A DONE / CLOSED - READY FOR MANUAL RENDER DEPLOY.** This closes only the backend staging
deploy preflight/checklist. Full Phase 8.6 is still open because Render service creation, real env var
setup, deploy, logs, backend URL, and smoke tests are deferred to Phase 8.6B.

Deployment target đã được chọn cho môi trường staging:

- Frontend: Vercel
- Backend: Render Web Service
- Database: Neon PostgreSQL

Đây là quyết định kiến trúc staging cho Phase 8, không phải tuyên bố production-ready.

## Scope

Phase 8.1 chỉ so sánh provider và chốt deployment target. Phase này không:

- deploy ứng dụng hoặc tạo URL thật;
- tạo database/account trên provider;
- sửa backend/frontend config;
- thêm Dockerfile, migration hoặc SPA rewrite;
- chạy demo seeder;
- push GitHub.

Thông tin provider được đối chiếu với tài liệu chính thức ngày 2026-06-22. Pricing, quota và free tier có thể thay đổi, nên phải kiểm tra lại ngay trước khi tạo tài nguyên.

## Current State

- Repository là monorepo với `frontend/` và `backend/`.
- Branch hiện tại: `main`.
- Working tree sạch khi bắt đầu Phase 8.1.
- Latest commit khi bắt đầu: `0e23912 Document Phase 8 deployment preparation audit`.
- Local `main` đang ahead `origin/main` 21 commit.
- Backend dùng Spring Boot 3.5.15 và Java 25.
- Frontend dùng React, Vite 6.4.3 và `BrowserRouter`.
- Phase 8.5 đã verify Vercel root/build/output/env contract, parse SPA rewrite và production bundle; chưa deploy.
- Neon PostgreSQL staging đã được provision thủ công trong Phase 8.4; production database chưa được tạo.
- Phase 8.0 đã xác nhận backend tests/package và frontend build đều pass.

## Decision Summary

Chọn kiến trúc tách ba dịch vụ:

| Thành phần | Target | Region/phạm vi | Mục đích |
|---|---|---|---|
| Frontend | Vercel | Global CDN | Static React/Vite staging |
| Backend | Render Web Service | Singapore | Spring Boot API staging |
| Database | Neon PostgreSQL | AWS Asia Pacific Singapore (`aws-ap-southeast-1`) | PostgreSQL staging |

Backend và database cùng khu vực Singapore để giảm latency. Vercel phục vụ frontend tĩnh qua mạng edge/global nên không cần buộc cùng một compute region cho kiến trúc hiện tại.

Quyết định có một điều kiện kỹ thuật quan trọng: theo [Render Supported Languages](https://render.com/docs/language-support), Render không hỗ trợ Java bằng native runtime; Java phải được deploy bằng Docker. Vì vậy Phase sau phải thiết kế Docker image Java 25 trước khi deploy. Build/start command native đề xuất ban đầu không được xem là hợp lệ ở thời điểm audit.

## Selected Staging Architecture

```text
Browser
  -> Vercel static frontend
  -> HTTPS API calls
  -> Render Web Service (Singapore, Docker/Java 25)
  -> TLS PostgreSQL connection
  -> Neon PostgreSQL (Singapore)
```

Frontend chỉ biết public backend URL. Backend giữ toàn bộ JWT secret và database credentials. Database không được expose trực tiếp cho frontend.

## Selected Platforms

### Frontend

**Vercel** được chọn cho React/Vite frontend.

- Vercel có hướng dẫn chính thức cho Vite, Git integration và preview URL cho pull request.
- Root directory có thể đặt là `frontend` trong monorepo.
- Build command: `npm run build`.
- Output directory: `dist`.
- Build-time environment variable: `VITE_API_BASE_URL`.
- Custom domain có thể thêm sau; không thực hiện trong Phase 8.1.
- Vite SPA deep linking không hoạt động mặc định. [Vercel Vite docs](https://vercel.com/docs/frameworks/frontend/vite) yêu cầu `vercel.json` rewrite về `/index.html`; Phase 8.2B đã thêm cấu hình tại `frontend/vercel.json` và vẫn cần xác minh trên staging thật.
- Vercel Hobby miễn phí cho project cá nhân/quy mô nhỏ nhưng bị giới hạn non-commercial personal use và quota theo tháng. Nếu QuizMaster chuyển sang mục đích thương mại phải đánh giá Pro plan theo [Hobby Plan docs](https://vercel.com/docs/plans/hobby).

### Backend

**Render Web Service** được chọn cho Spring Boot API, region Singapore.

- Hỗ trợ Git-based deploy, monorepo root directory, environment variables, logs, HTTPS managed và custom domain.
- Mỗi web service có subdomain `onrender.com`; HTTP được redirect sang HTTPS và TLS được terminate tại load balancer.
- [Render Web Services docs](https://render.com/docs/web-services) yêu cầu bind `0.0.0.0`, khuyến nghị dùng biến `PORT`, mặc định là `10000`; Render đôi khi có thể phát hiện port khác nhưng không nên dựa vào hành vi này.
- Render không hỗ trợ native Java. Target cụ thể phải là **Render Web Service chạy Docker image Java 25**.
- Repository hiện chưa có Dockerfile, nên đây là prerequisite cho phase hardening sau, không phải thay đổi của 8.1.
- Free Web Service spin down sau 15 phút không có inbound traffic; lần wake tiếp theo có thể mất khoảng một phút. Free tier có 750 instance-hours/workspace/tháng và các quota khác. Chỉ phù hợp staging/demo, không phù hợp production theo [Render Free docs](https://render.com/docs/free).

Kế hoạch cấu hình sau hardening:

```text
Service type: Web Service
Runtime: Docker
Root directory: backend
Dockerfile: backend/Dockerfile (resolved from the repository root)
Region: Singapore
Branch: main
Build/start: defined by the committed Java 25 multi-stage Dockerfile
Health check: to be defined before staging deploy
```

Không dùng cấu hình native sau vì Render hiện không có Java native runtime:

```text
Build command: ./mvnw clean package
Start command: java -jar target/quizmaster-0.0.1-SNAPSHOT.jar
```

Hai lệnh trên vẫn đúng khi chạy trong một môi trường Java phù hợp, nhưng không tự tạo ra Java runtime trên Render.

### Database

**Neon PostgreSQL** được chọn, staging trước, region Singapore.

- Managed PostgreSQL, có console, direct/pooled connection và database branching.
- Neon cung cấp region AWS Singapore, cùng khu vực với Render Singapore. Region của project không thể đổi; muốn đổi phải tạo project mới và migrate theo [Neon Regions docs](https://neon.com/docs/introduction/regions).
- Neon yêu cầu kết nối SSL/TLS. Connection string chính thức chứa `sslmode=require`; backend cần chuyển thành JDBC URL tương thích pgJDBC và kiểm thử thực tế theo [Neon connection docs](https://neon.com/docs/connect/connect-from-any-app).
- Pooled connection là mặc định trong Neon console và hỗ trợ nhiều concurrent connections hơn. Cần xác minh pooling mode tương thích với Hibernate/JPA trước staging.
- Free plan hiện được mô tả cho prototype/side project, có scale-to-zero, 0,5 GB storage/project và 100 CU-hours/project/tháng. Các quota phải được kiểm tra lại theo [Neon Plans docs](https://neon.com/docs/introduction/plans) trước khi provision.
- Branching giúp tách thử nghiệm, nhưng không thay thế backup/restore runbook cho production.

## Why This Architecture

1. Phù hợp project cá nhân/portfolio và không cần tự quản lý VPS.
2. Tách frontend/backend/database giúp khoanh vùng lỗi build, CORS, API và database.
3. Vercel phù hợp static Vite và có preview deployments.
4. Render và Neon đều có Singapore, giảm latency backend-database cho người dùng Việt Nam.
5. Docker trên Render cho phép pin Java 25 thay vì phụ thuộc native runtime không tồn tại.
6. Neon có managed PostgreSQL, TLS, dashboard và branching phù hợp staging.
7. Stack vẫn cho phép nâng từng thành phần độc lập khi chuyển từ demo/staging sang production.

Đổi lại, kiến trúc này có ba dashboard, ba nhóm quota và yêu cầu cấu hình CORS/URL/secret chính xác.

## Options Considered

### Option A — Vercel + Render + Neon

**Pros:** frontend workflow đơn giản; backend/database cùng Singapore; managed HTTPS/PostgreSQL; tách lỗi rõ; Neon branching thuận tiện.

**Cons:** Render cần Docker cho Java; free backend có cold start; phải quản lý config trên ba nền tảng; không có private network giữa Render và Neon.

**Operational complexity:** trung bình. Docker làm tăng setup ban đầu nhưng cho runtime Java 25 có thể lặp lại.

**Cost/free-tier risk:** phù hợp staging nhỏ; Vercel Hobby giới hạn non-commercial; Render free sleep/quota; Neon free có compute/storage/egress limits.

**Suitability:** tốt nhất cho QuizMaster staging sau khi hardening config và Docker.

**Main blockers:** Docker build remains unverified locally; Neon, migration/DDL and staging smoke tests remain incomplete.

**Verdict:** **SELECTED WITH NOTES**.

### Option B — Vercel/Netlify + Railway + Railway PostgreSQL

**Pros:** Railway có hướng dẫn chính thức cho Spring Boot, GitHub deploy, auto-detect Java, Dockerfile và database trong cùng project; logs/env vars dễ tiếp cận.

**Cons:** [Railway Spring Boot guide](https://docs.railway.com/guides/spring-boot) minh họa Java 17, không xác nhận Java 25 cho QuizMaster; runtime vẫn cần kiểm chứng hoặc Docker. Pricing chủ yếu usage-based và có thể kém dự đoán hơn với project sinh viên chạy lâu.

**Operational complexity:** thấp đến trung bình; ít dashboard hơn Option A.

**Cost/free-tier risk:** trial/credits và usage pricing có thể thay đổi; cần kiểm tra [Railway Pricing docs](https://docs.railway.com/reference/pricing/plans) lúc triển khai.

**Suitability:** phương án dự phòng tốt nếu Render Docker/cold start gây trở ngại.

**Main blockers:** Java 25 chưa được chứng minh; vẫn còn config/PORT/database/migration blockers của project.

**Verdict:** **DEFERRED — first fallback**.

### Option C — Netlify + Render + Render PostgreSQL/Neon

**Pros:** Netlify nhận diện Vite, gợi ý `npm run build` và `dist`; hỗ trợ deploy preview, env vars, redirects; backend Render giữ nguyên.

**Cons:** không tạo lợi thế quyết định so với Vercel cho frontend hiện tại. SPA vẫn cần `_redirects`; Render Java vẫn cần Docker. Render free PostgreSQL hết hạn sau 30 ngày nên không phù hợp staging bền vững; Neon tốt hơn ở lựa chọn database này.

**Operational complexity:** tương đương Option A.

**Cost/free-tier risk:** quota/credit của Netlify và cold start Render; Render free DB có lifecycle quá ngắn.

**Suitability:** tốt nhưng không vượt Option A. [Netlify Vite docs](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/) xác nhận build/publish setup phù hợp.

**Main blockers:** `_redirects`, Docker Java 25, `PORT`, datasource/migration.

**Verdict:** **NOT SELECTED — Netlify is the frontend fallback**.

### Option D — VPS

**Pros:** kiểm soát hoàn toàn Java 25, Nginx, system service, PostgreSQL, port, domain và chi phí cố định.

**Cons:** phải tự harden OS/firewall/TLS, backup, monitoring, patching, process supervision và database recovery; single-server failure risk; cần kỹ năng vận hành cao hơn đáng kể.

**Operational complexity:** cao nhất.

**Cost/free-tier risk:** thường có chi phí tháng cố định; chi phí thời gian vận hành lớn dù VM rẻ.

**Suitability:** chưa phù hợp giai đoạn portfolio/staging đầu tiên.

**Main blockers:** thiếu toàn bộ runbook infrastructure/security/backup/monitoring.

**Verdict:** **DEFERRED — reconsider only when control/cost requirements justify operations**.

## Rejected / Deferred Options

- **Netlify:** không bị loại về kỹ thuật; giữ làm fallback frontend. Vercel được chọn vì workflow Vite/preview rõ và đúng target mặc định.
- **Railway:** fallback backend/database số một; chưa chọn vì cần xác minh Java 25 và pricing/usage behavior.
- **Fly.io:** linh hoạt về regions/containers nhưng thiên về container/network/CLI operations; không giảm việc phải tạo image Java 25 so với Render và phức tạp hơn cho lần staging đầu.
- **Koyeb:** có Git/Docker deployment và edge regions, nhưng Java 25/build behavior, free-tier availability và region phù hợp cần xác minh thêm trước khi thay target đã chọn.
- **Render PostgreSQL:** cùng provider/backend là lợi thế, nhưng free database hết hạn sau 30 ngày; Neon phù hợp staging tồn tại lâu hơn.
- **Supabase PostgreSQL:** managed PostgreSQL tốt, dashboard mạnh, nhưng QuizMaster không cần Auth/Storage/Realtime/BaaS; thêm bề mặt sản phẩm không cần thiết.
- **VPS PostgreSQL:** hoãn vì backup, upgrades, TLS, monitoring và disaster recovery phải tự quản lý.

## Staging URL Placeholders

Các giá trị dưới đây chỉ là placeholder, chưa tồn tại và chưa được kiểm thử:

```text
Frontend staging URL: https://quizmaster-<placeholder>.vercel.app
Backend staging URL: https://quizmaster-api-<placeholder>.onrender.com
Database: Neon PostgreSQL staging project `quizmaster-staging` (connection details remain secret/placeholders)
```

Không invent tên deployment thật và không dùng placeholder làm CORS/env production trước khi platform cấp URL thực tế.

## Branch and Deployment Policy

- Branch deploy: `main`.
- Source: GitHub repository sau khi user cho phép push.
- Hiện local `main` đang ahead `origin/main` 21 commit tại đầu Phase 8.1.
- Không push trong Phase 8.1.
- Lần deploy staging đầu tiên: ưu tiên manual deploy/explicit trigger nếu platform hỗ trợ, để quan sát từng bước build và logs.
- Sau khi config staging ổn định: có thể bật auto deploy từ `main`.
- Vercel preview deployments có thể dùng cho PR sau này; chưa thiết kế branch workflow nâng cao trong Phase này.
- Production phải có approval/checklist riêng; không auto-promote từ staging chỉ vì build pass.

## Platform Configuration Plan

### Vercel Frontend

```text
Framework: Vite
Root directory: frontend
Install command: npm ci
Build command: npm run build
Output directory: dist
Branch: main
Environment: staging/preview values first
SPA fallback: frontend/vercel.json -> /index.html
```

`frontend/vercel.json` đã rewrite mọi SPA route về `/index.html`. Sau deploy phải kiểm thử refresh trực tiếp các deep route và bảo đảm static assets vẫn được phục vụ đúng.

Phase 8.5 đã parse thành công rewrite, build bằng Render URL placeholder và xác nhận bundle không chứa local backend `localhost:8080`/`127.0.0.1:8080`. Actual Vercel project, environment variables và deployed route refresh vẫn được defer tới Phase 8.7.

### Render Backend

```text
Service type: Web Service
Runtime: Docker
Root directory: backend
Region: Singapore
Branch: main
Dockerfile: backend/Dockerfile
Public URL: Render-provided onrender.com staging URL
Auto deploy: off/manual for first attempt; reconsider after stable staging
```

`backend/Dockerfile` defines the Java 25 build/runtime stages. A real Docker/Render build is still required because the local Docker Linux daemon is unavailable.

Docker image pin Java 25 bằng Eclipse Temurin 25 JDK/JRE và build executable JAR. Backend config đọc `PORT` do platform cung cấp với fallback 8080. Health-check strategy và chạy container bằng non-root user vẫn cần quyết định trước production; secret không được bake vào image.

### Neon PostgreSQL

```text
Provider: Neon PostgreSQL
Purpose: staging first
Region: AWS Asia Pacific Singapore
Connection: JDBC/pgJDBC over required TLS
Credentials: stored only in Render environment variables
Pooling: evaluate pooled versus direct URL for Hibernate/JPA
```

Phase 8.4 đã provision Neon staging và dùng direct connection cho initial schema/local smoke. Không import local data hoặc seed. Pooled connection vẫn cần đánh giá sau.

## Environment Variables by Platform

### Frontend

Vercel build environment:

```env
VITE_API_BASE_URL=https://<backend-staging-url>
```

`VITE_API_BASE_URL` là build-time variable; thay đổi trên Vercel cần rebuild/redeploy. `VITE_` variables được đưa vào client bundle; tuyệt đối không đặt JWT secret hoặc DB credentials ở frontend.

### Backend

Render environment dự kiến:

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

Profile production dùng Spring standard `SPRING_DATASOURCE_*` và không có fallback local/default. `validate` là DDL mặc định an toàn; staging database đầu tiên có thể tạm đặt `SPRING_JPA_HIBERNATE_DDL_AUTO=update` cho tới khi có migration version hóa.

Seeder policy:

```text
Do not set app.seed-demo=true in production.
Staging demo seed, if needed, must be a separate explicit decision.
```

### Database

Neon tạo connection details gồm host, database, role/user, password và TLS parameters. Các giá trị này chỉ được chuyển vào Render secret environment.

```text
DB credentials are stored only in backend platform environment variables.
Never expose DB credentials to frontend.
Never commit the Neon connection string.
```

## Known Limitations

- Vercel Hobby chỉ dành cho personal/non-commercial use và có usage limits.
- Render Free Web Service cold-start sau idle, filesystem ephemeral và không dành cho production.
- Render cần Docker cho Java; build/start native không dùng được.
- Neon Free có compute/storage/egress limits và scale-to-zero behavior.
- Giao tiếp Render–Neon đi qua public TLS endpoint, không phải shared private network.
- Ba provider tạo thêm coordination overhead cho URL, CORS, secrets và incident diagnosis.
- Region của Render service/Neon project không đổi trực tiếp được; chọn Singapore ngay từ lúc tạo.

## Risks Before Deployment

1. Datasource/JPA/PORT production đã được harden ở Phase 8.2A nhưng chưa được xác minh với Neon thật.
2. Production mặc định `ddl-auto=validate`; chưa có migration version hóa. Staging `update` chỉ là giải pháp tạm.
3. Production mặc định `show-sql=false`.
4. Backend đã map dynamic `PORT` với fallback 8080 nhưng chưa smoke test trên Render.
5. `backend/mvnw` đã được đánh dấu executable trong Git và Dockerfile vẫn chạy `chmod +x` phòng vệ.
6. Render không có native Java; Java 25 được pin qua `backend/Dockerfile`, nhưng Phase 8.3 vẫn không thể build image vì local Docker Linux daemon không hoạt động. Temurin 25 tags và container fail-fast remain NOT VERIFIED by an actual image build.
7. Frontend đã có Vercel SPA rewrite nhưng chưa được smoke test trên URL staging thật.
8. Node version chưa được pin; local build dùng Node 24.15.0 và Vercel runtime cần được chốt trước staging.
9. Neon PostgreSQL staging đã provision; local direct JDBC/TLS smoke pass với PostgreSQL 18.4, nhưng Render network path, pooling và channel binding chưa được test.
10. Local Git chưa push 21 commit tại đầu Phase; provider chưa thể thấy code mới.
11. Chưa có staging deployment hoặc staging smoke test.
12. Seeder chưa có hard guard cấm profile production.

## Required Fixes Before Staging Deploy

1. Verify production datasource fail-fast and Neon JDBC/TLS against the real staging environment.
2. Decide the production-grade Flyway/Liquibase migration strategy; keep staging `update` temporary.
3. Verify `show-sql=false` and dynamic `PORT` behavior on Render.
4. Build and verify `backend/Dockerfile` with an available Docker daemon and confirm the Temurin 25 tags.
5. Verify Vercel SPA fallback on every important deep route after deployment.
6. Confirm Vercel Node runtime, then pin it only if the selected supported version matches local/dependency requirements.
7. Verify the provisioned Neon staging database from Render and review backup/free-tier limits.
8. Establish versioned migrations and return staging/production to controlled `validate` behavior.
9. Set backend/frontend env vars without exposing secrets.
10. Push GitHub only after user approval.
11. Run staging smoke tests, including cold-start behavior and deep-route refresh.

## What Phase 8.1 Does Not Do

- Không deploy frontend/backend.
- Không tạo Vercel, Render hoặc Neon resource/account.
- Không tạo/import/reset database.
- Không chạy seeder.
- Không thêm Dockerfile hoặc sửa executable bit.
- Không sửa datasource, JPA, port, CORS, JWT hoặc env config.
- Không thêm `vercel.json`.
- Không sửa schema hoặc thêm Flyway/Liquibase.
- Không push remote.
- Không claim QuizMaster production-ready.

## Recommended Next Steps

Backend hardening, frontend Vercel readiness verification, backend runtime verification và Neon staging preparation đã được thực hiện qua Phase 8.5. Bước tiếp theo nên là:

```text
Phase 8.6 Backend Staging Deploy
Dùng: 5.5 High
```

Phase 8.6 nên tạo và verify Render staging backend có kiểm soát để lấy backend HTTPS URL thật. Phase 8.7 sau đó mới đặt Vercel env, deploy frontend và browser-test SPA deep-route refresh/CORS.

Tạo platform services, push và smoke test vẫn cần approval ở các phase riêng.

## Official References

- [Vercel: Vite](https://vercel.com/docs/frameworks/frontend/vite)
- [Vercel: Hobby Plan](https://vercel.com/docs/plans/hobby)
- [Netlify: Vite](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/)
- [Render: Web Services](https://render.com/docs/web-services)
- [Render: Supported Languages](https://render.com/docs/language-support)
- [Render: Free Instances](https://render.com/docs/free)
- [Render: Regions](https://render.com/docs/regions)
- [Railway: Spring Boot](https://docs.railway.com/guides/spring-boot)
- [Neon: Connect from any application](https://neon.com/docs/connect/connect-from-any-app)
- [Neon: Plans](https://neon.com/docs/introduction/plans)
- [Neon: Regions](https://neon.com/docs/introduction/regions)

## Test / Build Evidence

Backend tests và frontend build được skip vì Phase 8.1 chỉ thêm tài liệu quyết định deployment target, không sửa code hoặc config. Phase 8.0 ngay trước đó đã xác minh backend tests 55/55 pass, backend clean package pass và frontend production build pass.

QA của Phase 8.1 tập trung vào kiểm tra Markdown structure, Git diff và đối chiếu các giả định platform với official docs.

## Final Conclusion

**Phase 8.1 DONE / CLOSED — PASS WITH NOTES.**

Deployment target selected for staging:

```text
Frontend: Vercel
Backend: Render Web Service (Docker, Singapore)
Database: Neon PostgreSQL (AWS Singapore)
```

QuizMaster will target a staging deployment first. QuizMaster is still not production-ready. Production readiness requires Phase 8.2–8.9 config hardening, Docker/runtime work, database provisioning, actual deployments and smoke tests.

The next phase should perform the controlled backend staging deployment before any frontend deployment.
