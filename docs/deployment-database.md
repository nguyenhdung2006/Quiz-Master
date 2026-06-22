# QuizMaster Database Deployment

## Purpose

Tài liệu này mô tả PostgreSQL staging target, contract kết nối backend, chiến lược schema ban đầu và các giới hạn còn lại trước khi deploy QuizMaster. Tài liệu không chứa secret, raw Neon URL hoặc production credentials.

## Provider and Region

| Thuộc tính | Giá trị |
|---|---|
| Provider | Neon PostgreSQL |
| Project | `quizmaster-staging` |
| Purpose | Staging |
| Region | AWS Asia Pacific 1 — Singapore |
| Database | `neondb` |
| Role/User | `<neon-username>` |
| Neon branch | `production` — default branch trong project staging |
| Initial connection type | Direct, không pooled |
| PostgreSQL version observed | 18.4 |

Branch Neon tên `production` chỉ là tên default branch bên trong project `quizmaster-staging`. Nó không biến database này thành production database và không phải bằng chứng production readiness.

## Environment Separation

- Staging database đã được provision riêng cho Phase 8.4.
- Production database chưa được tạo.
- Credentials staging không được tái sử dụng cho production.
- Khi cần production thật, phải tạo database/project hoặc branch strategy có approval, backup, retention và migration plan riêng.
- Frontend không bao giờ nhận database URL, username hoặc password.

## Secret Handling

Secret staging được lưu ngoài repository và chỉ được đưa vào process/platform environment khi cần. Không commit:

- raw Neon connection string;
- full JDBC URL có password;
- database password;
- nội dung file secret ngoài repository.

Tài liệu và Git chỉ dùng placeholder:

```env
SPRING_DATASOURCE_URL=<neon-jdbc-url-with-required-tls>
SPRING_DATASOURCE_USERNAME=<neon-username>
SPRING_DATASOURCE_PASSWORD=<neon-password>
```

## Required Backend Environment Variables

Backend staging cần:

```env
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=<strong-secret-at-least-32-chars>
CORS_ALLOWED_ORIGINS=https://<frontend-staging-url>
SPRING_DATASOURCE_URL=<neon-jdbc-url-with-required-tls>
SPRING_DATASOURCE_USERNAME=<neon-username>
SPRING_DATASOURCE_PASSWORD=<neon-password>
SPRING_JPA_HIBERNATE_DDL_AUTO=update
PORT=<provided-by-platform>
```

`SPRING_JPA_HIBERNATE_DDL_AUTO=update` chỉ dùng tạm cho initial staging schema. Production profile trong repository vẫn mặc định `validate`.

## SSL and JDBC Format

Neon yêu cầu SSL/TLS. Spring Boot/pgJDBC dùng format:

```text
jdbc:postgresql://<neon-host>/<database>?sslmode=require
```

Username và password được truyền bằng biến riêng, không nhúng vào URL. Initial local smoke dùng `sslmode=require` với direct connection.

Raw Neon URL có thể chứa `channel_binding=require`. Phase 8.4 chưa đưa tùy chọn này vào JDBC smoke ban đầu; channel binding cần được đánh giá/test riêng nếu áp dụng sau. Không suy diễn support mà chưa kiểm thử với pgJDBC/runtime thực tế.

## DDL Strategy

Repository production default:

```text
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
```

Initial staging override:

```text
SPRING_JPA_HIBERNATE_DDL_AUTO=update
```

Override `update` đã cho Hibernate tạo/update schema ban đầu trên Neon staging database trống. Đây là giải pháp staging-only, không version hóa, không có rollback đáng tin cậy và không production-grade.

Trước production v1.0 phải chọn Flyway, Liquibase hoặc controlled SQL migrations; sau đó dùng `validate` để xác minh schema. Phase 8.4 không thêm migration tool.

## Seeder Safety

Initial staging data strategy là **empty database**. Không import local QA/demo data và không bật bất kỳ dạng demo seed nào:

```text
app.seed-demo=true
APP_SEED_DEMO=true
--app.seed-demo=true
```

Sau initial `ddl-auto=update`, database không còn schema-empty nhưng application data vẫn empty. Nếu cần demo data sau này, đó phải là task riêng có approval và dataset staging rõ ràng.

## Local Backend-to-Neon Smoke Evidence

Manual Phase 8.4 evidence:

- backend clean package: PASS;
- backend tests: 55/55 PASS;
- active profile: `prod`;
- HikariPool added a PostgreSQL connection;
- PostgreSQL version observed from backend log: 18.4;
- Tomcat started on port 8080;
- `GET http://localhost:8080/api/categories` returned `[]`;
- empty array was expected because initial data strategy is empty;
- no evidence of demo seeder execution;
- no evidence of localhost datasource fallback;
- environment variables were cleared after the test;
- Git working tree remained clean.

Secret values and raw connection details are intentionally excluded. This docs task does not repeat the Neon connection test because it does not access the external secret file.

## Non-fatal Initial Schema Warnings

During initial `ddl-auto=update`, Hibernate emitted warnings such as attempts to skip missing constraints. Backend startup and the public categories request still passed.

These warnings make the result **PASS WITH NOTES**. They reinforce that automatic schema update is temporary and that the resulting schema must be reviewed before adopting versioned migrations.

## Deferred Verification

- Full API/auth/quiz/attempt smoke test is deferred to Phase 8.6/8.8.
- Render-to-Neon network/TLS verification has not run.
- Pooled connection behavior has not been tested.
- Channel binding has not been verified with the selected JDBC/runtime combination.
- Backup/restore, retention, free-tier limits and recovery procedures need review.
- Production database provisioning is deferred.

## Risks and Limitations

- `ddl-auto=update` is not production-grade.
- Staging deploy has not happened.
- Database currently has schema but intentionally empty application data.
- Secrets must remain outside Git and be stored only in approved local/platform environment storage.
- Neon free-tier/serverless behavior may affect cold start, connection limits and retention.
- No production database, migration history or rollback plan exists.
- QuizMaster is not production-ready.

## Before Staging Deployment

1. Add the placeholder-defined values as real Render environment variables without copying them into Git/docs/logs.
2. Decide whether the first Render staging run still needs temporary `update`, then return to `validate` after schema control is established.
3. Confirm Render egress can reach the Neon direct endpoint with TLS.
4. Review Hibernate initial schema warnings and capture a schema baseline before migrations.
5. Keep demo seed disabled.
6. Run `GET /api/categories` first, then the planned full staging smoke suite.
