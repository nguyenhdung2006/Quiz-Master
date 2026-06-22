# Phase 8.4 PostgreSQL Staging Database Preparation

## Status

**Phase 8.4 DONE / CLOSED — PASS WITH NOTES.**

Neon PostgreSQL staging đã được provision và local backend-to-Neon smoke đã pass. Kết quả có ghi chú vì schema ban đầu dùng `ddl-auto=update`, full staging deployment/API smoke chưa chạy và production database chưa được tạo.

## Scope

Phase này tổng hợp và xác minh an toàn việc chuẩn bị Neon PostgreSQL staging, SSL/JDBC contract, DDL decision, empty-data strategy và bằng chứng local smoke.

Không deploy Render/Vercel, không tạo production database, không import demo data, không thêm migration tool, không đọc/ghi secret thật và không sửa business logic/UI.

## What Was Done

- Provisioned một Neon project dành riêng cho staging tại Singapore.
- Chọn direct connection cho initial schema setup.
- Chọn JDBC với `sslmode=require` và credentials tách riêng.
- Dùng runtime override `ddl-auto=update` tạm thời để tạo schema ban đầu.
- Giữ production profile default là `validate`.
- Chọn empty application data, không chạy demo seeder.
- Chạy local backend với prod profile và Neon staging thành công.
- Ghi database deployment runbook chỉ bằng placeholder.

## Safely Documented Values

```env
SPRING_DATASOURCE_URL=<neon-jdbc-url-with-required-tls>
SPRING_DATASOURCE_USERNAME=<neon-username>
SPRING_DATASOURCE_PASSWORD=<neon-password>
SPRING_JPA_HIBERNATE_DDL_AUTO=update
```

Không có raw Neon URL, password hoặc full connection string thật trong tài liệu.

## Neon Staging Database Summary

| Thuộc tính | Giá trị |
|---|---|
| Provider | Neon PostgreSQL |
| Project | `quizmaster-staging` |
| Purpose | Staging |
| Region | AWS Asia Pacific 1 — Singapore |
| Database | `neondb` |
| Role/User | `<neon-username>` |
| Branch | `production` — default branch trong staging project |
| Connection | Direct for initial setup |
| Observed PostgreSQL version | 18.4 |

Tên branch `production` là tên mặc định trong project staging, không phải production database thật.

## Secret Safety Result

- Secret được giữ ngoài repository.
- Docs và report chỉ dùng placeholder.
- Không đọc hoặc in nội dung file secret trong docs task này.
- Không ghi password/raw URL vào log hoặc Git.
- Env dùng trong manual test đã được clear.
- Repository clean sau manual connection test theo evidence đã cung cấp.

## SSL / JDBC Decision

JDBC format đã chọn:

```text
jdbc:postgresql://<neon-host>/<database>?sslmode=require
```

Username/password dùng env riêng. Initial smoke ưu tiên xác minh TLS cơ bản với `sslmode=require`. `channel_binding=require` xuất hiện trong raw provider URL nhưng được defer để đánh giá/test riêng với pgJDBC nếu cần.

## DDL Strategy Decision

- Repository production default: `validate`.
- Phase 8.4 staging initial schema: runtime override `update`.
- Không sửa `application-prod.yaml` vì default hiện tại đúng.
- `update` chỉ dùng staging, không production-grade.
- Trước production v1.0 cần Flyway/Liquibase hoặc controlled SQL migration cùng baseline/rollback plan.
- Phase này không thêm migration tool.

## Initial Data Strategy

Chọn Option 1: **Empty database**.

- Không import local QA/demo data.
- Không bật seeder bằng property, env hoặc CLI argument.
- Hibernate đã tạo schema, nên database không còn schema-empty.
- Application data vẫn empty; `/api/categories` trả `[]` đúng kỳ vọng.

## Local Backend-to-Neon Test Evidence

Manual evidence đã hoàn thành trước docs task:

- backend chạy với profile `prod`;
- direct Neon connection qua HikariPool thành công;
- PostgreSQL 18.4 được quan sát trong backend log;
- Tomcat khởi động port 8080;
- public `GET /api/categories` trả `[]`;
- không có evidence localhost fallback;
- không có evidence demo seeder chạy;
- env được clear sau test.

Docs task không tái chạy connection vì bị cấm truy cập secret thật.

## Non-fatal Warnings

Hibernate có cảnh báo non-fatal trong lần `ddl-auto=update` đầu tiên, ví dụ bỏ qua constraint chưa tồn tại. Backend vẫn start và API smoke cơ bản pass.

Không coi warning này là bằng chứng schema production-grade. Schema cần review/baseline trước khi chuyển sang migrations.

## Tests / Build Result

- Manual Phase 8.4 backend tests: PASS 55/55.
- Manual Phase 8.4 clean package: PASS.
- JAR: `backend/target/quizmaster-0.0.1-SNAPSHOT.jar`.
- Backend-to-Neon local smoke: PASS WITH NOTES.
- Docs task backend test: PASS 55/55, 0 failures, 0 errors, 0 skipped.
- Docs task `clean package`: PASS; executable Spring Boot JAR created successfully.
- Frontend build skipped vì frontend không thay đổi.

## Not Done / Deferred

- Không deploy Render hoặc Vercel.
- Không tạo production DB.
- Không test Render-to-Neon network path.
- Không chạy full API/auth/quiz/attempt staging smoke.
- Không test pooled connection/channel binding.
- Không thêm Flyway/Liquibase.
- Không import/seed data.
- Không review backup/restore/free-tier retention đầy đủ.
- Không push Git.

## Files Changed

- `docs/deployment-database.md` — created.
- `docs/phase-8-4-postgresql-staging-database-preparation.md` — created.
- `README.md` — concise database deployment reference.
- `docs/deployment-target.md` — synchronized Phase 8.4 state.
- `docs/deployment-backend.md` — synchronized Neon preparation status.

## Commit

```text
Hash: see the Git commit containing this report and the final Phase 8.4 handoff
Message: Document PostgreSQL staging database preparation
```

## Git Status

```text
Branch: main
Ahead origin/main at phase start: 25 commits
Expected final ahead count after the Phase 8.4 commit: 26 commits
Push: not performed
```

## Remaining Risks

- Temporary staging `ddl-auto=update` is not production-grade.
- Docker backend image remains unverified locally.
- Render/Vercel staging deployments and full smoke tests have not run.
- Pooled Neon connection and channel binding are unverified.
- Backup/restore, retention and free-tier limits require review.
- Production database and versioned migrations do not exist.
- Git has not been pushed.
- QuizMaster is not production-ready.

## Recommended Next Step

```text
Phase 8.5 Frontend Production Config / Frontend Production Deploy Readiness Verification
Dùng: 5.5 High
```

Phase 8.2B đã xử lý phần lớn env/Vercel SPA config, vì vậy 8.5 nên tập trung verification/docs và chỉ sửa config nếu tìm thấy gap thật.

## Final Conclusion

**Phase 8.4 DONE / CLOSED — PASS WITH NOTES.**

Staging database đã sẵn sàng ở mức local connectivity/schema baseline ban đầu với empty application data. Nó chưa được xác minh từ Render, chưa có versioned migrations và không phải production database.
