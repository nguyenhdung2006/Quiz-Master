# Phase 8.0 Deployment Preparation Audit

## Scope

Audit này đánh giá mức độ sẵn sàng để đưa QuizMaster lên môi trường staging/production. Phạm vi gồm cấu hình backend, frontend, PostgreSQL, biến môi trường, quy trình build/start, cấu trúc repository và các rủi ro triển khai.

Đây là bước kiểm tra và lập checklist. Phase 8.0 **không** thực hiện deploy, tạo database, chạy seed trên hạ tầng thật, đẩy code lên remote hoặc xác nhận hệ thống đã production-ready.

## Current Project State

- Repository là monorepo gồm `backend/` (Spring Boot) và `frontend/` (React/Vite).
- Backend dùng Spring Boot 3.5.15, Java 25, Maven Wrapper và PostgreSQL.
- Frontend dùng React, React Router và Vite 6.4.3; `package-lock.json` đã được track.
- Có profile `dev` và `prod`; profile mặc định là `dev`.
- Chưa chọn nền tảng deploy, chưa provision PostgreSQL production/staging và chưa có cấu hình deploy dành riêng cho Render, Railway, Fly.io, Vercel hoặc Netlify.
- Nhánh hiện tại là `main`; trước commit audit, local đang đi trước `origin/main` 20 commit. Phase này không push.

## Backend Readiness

### Production Profile

`application-prod.yaml` đã tồn tại và tách secret JWT/CORS khỏi source code. Khi triển khai cần đặt rõ:

```text
SPRING_PROFILES_ACTIVE=prod
```

Điểm tốt là profile production không chứa JWT secret thật. Tuy nhiên datasource và JPA vẫn dùng cấu hình chung trong `application.yaml`, nên profile production hiện chưa cô lập đầy đủ các giá trị nguy hiểm cho production.

### JWT / Secret Config

- Production đọc `JWT_SECRET` từ môi trường.
- Ứng dụng fail-fast nếu secret null, rỗng, còn placeholder chưa resolve hoặc ngắn hơn 32 ký tự.
- Không tìm thấy chỗ log JWT secret.
- `JWT_EXPIRATION_MS` là biến tùy chọn, mặc định 86.400.000 ms (24 giờ).

Kết luận: cơ chế secret JWT phù hợp để triển khai nếu secret được sinh ngẫu nhiên, lưu trong secret manager của nền tảng và không đưa vào Git.

### CORS Config

- Production đọc danh sách origin từ `CORS_ALLOWED_ORIGINS`.
- Cấu hình từ chối danh sách rỗng, wildcard `*`, giá trị trống và placeholder chưa resolve.
- Origin được tách theo dấu phẩy; `allowCredentials` đang là `false`.
- Dev chỉ cho phép `http://localhost:5173`.

Khi frontend/backend khác domain, cần khai báo chính xác origin frontend, ví dụ `https://quizmaster.example.com`; không thêm path và không dùng wildcard.

### Datasource / PostgreSQL Config

Ứng dụng hỗ trợ:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`

Nhưng cả ba đang có fallback local (`localhost:5432/quizmaster`, user/password `postgres`). Đây là rủi ro lớn: production thiếu biến có thể khởi động với cấu hình sai thay vì fail-fast. Trước deploy cần bỏ fallback trong profile `prod` hoặc tạo cấu hình production riêng bắt buộc đủ ba biến.

Chuỗi kết nối phải theo định dạng JDBC mà Spring nhận được, ví dụ `jdbc:postgresql://host:5432/database`. Yêu cầu SSL phụ thuộc nhà cung cấp; cần cấu hình theo tài liệu provider (thường qua tham số trong `DB_URL`) và kiểm thử kết nối thực tế.

### Seeder / Demo Safety

Demo seeder chỉ chạy khi `app.seed-demo=true`; mặc định không bật. Đây là mặc định an toàn. Tuy nhiên chưa có guard cấm seed theo profile `prod`, nên lỗi cấu hình vẫn có thể kích hoạt seed trên production.

Quy ước đề xuất:

- Không bật `app.seed-demo` trên production.
- Nếu cần dữ liệu demo, chỉ bật có chủ đích trên database staging có thể xóa/tạo lại.
- Nên bổ sung guard code hoặc profile để seeder không thể chạy khi profile `prod` đang active.

### Hibernate DDL / Migration Strategy

Hiện tại cấu hình chung dùng:

```yaml
spring.jpa.hibernate.ddl-auto: update
spring.jpa.show-sql: true
```

Không có Flyway hoặc Liquibase. `ddl-auto=update` có thể tiện cho dev/staging tạm thời nhưng không phải chiến lược migration an toàn cho production nghiêm túc: thay đổi schema không được version hóa, khó review và khó rollback. `show-sql=true` cũng nên tắt ở production để giảm log dư thừa và nguy cơ lộ dữ liệu truy vấn.

Khuyến nghị trước production v1.0: chọn Flyway hoặc Liquibase, tạo baseline/migration có version, chuyển production sang `ddl-auto=validate` (hoặc `none`) và đặt `show-sql=false`.

### Backend Build Command

Từ thư mục repository trên Windows:

```powershell
cd backend
.\mvnw.cmd clean package
```

Trên Linux, file `backend/mvnw` hiện có Git mode `100644`, chưa executable. Cần sửa executable bit trước khi dùng `./mvnw`, hoặc tạm chạy `sh mvnw clean package` nếu môi trường hỗ trợ.

Artifact tạo ra:

```text
backend/target/quizmaster-0.0.1-SNAPSHOT.jar
```

### Backend Start Command

Sau khi build:

```text
java -jar target/quizmaster-0.0.1-SNAPSHOT.jar
```

Runtime phải hỗ trợ Java 25 vì project compile với release 25. Đây có thể là hạn chế trên một số nền tảng; cần xác nhận image/runtime trước khi chọn provider.

### Backend Port Config

Chưa có `server.port=${PORT:8080}` hoặc mapping tương đương. Spring Boot mặc định nghe cổng 8080, nhưng nhiều PaaS cấp cổng động qua `PORT`. Nếu provider yêu cầu biến này, ứng dụng hiện sẽ bỏ qua và health check/routing có thể thất bại.

Trước deploy cần thêm cấu hình port phù hợp nền tảng, thường là:

```yaml
server:
  port: ${PORT:8080}
```

## Frontend Readiness

### API Base URL

Frontend đọc `VITE_API_BASE_URL` tại build time, loại bỏ dấu `/` cuối. Quy tắc hiện tại:

- Dev thiếu biến: fallback `http://localhost:8080`.
- Production thiếu biến: dùng URL rỗng, tức gọi same-origin qua `/api/...`.

Bundle production đã được kiểm tra và không chứa `localhost:8080`. Với frontend/backend khác domain, `VITE_API_BASE_URL` phải là URL public của backend khi chạy build. Chỉ để trống nếu có reverse proxy same-origin thực sự xử lý `/api`.

### Production Build

Thiết lập build độc lập:

```text
Root directory: frontend
Install command: npm ci
Build command: npm run build
Output directory: dist
```

`npm run build` đã pass. Repository có lockfile nên `npm ci` phù hợp cho build có thể lặp lại. Project chưa pin phiên bản Node qua `engines`, `.nvmrc` hoặc tương đương; nên pin runtime sau khi chọn provider.

### SPA Route Refresh Handling

Ứng dụng dùng `BrowserRouter` và có nhiều deep route như `/quizzes/:id`, `/attempts/:attemptId/take`, `/me/attempts` và các route `/admin/...`.

Chưa có rewrite/fallback về `index.html`. Vì vậy mở trực tiếp hoặc refresh deep route trên static host có thể trả 404 dù điều hướng trong app hoạt động.

### Vercel / Netlify Readiness

Chưa có:

- `vercel.json` với rewrite SPA;
- `netlify.toml` hoặc `public/_redirects`;
- cấu hình môi trường theo provider.

Vercel/Netlify vẫn có thể cấu hình bằng dashboard, nhưng trước deploy cần thêm rule tương đương `/* -> /index.html` (status 200), đồng thời không làm mất route asset tĩnh. `VITE_API_BASE_URL` phải được đặt trong môi trường build của frontend.

## Database Readiness

PostgreSQL driver đã có và backend build thành công, nhưng database triển khai thực tế **chưa sẵn sàng** vì:

- chưa chọn/provision provider và region;
- chưa có credentials/URL staging hoặc production;
- chưa xác nhận SSL, giới hạn connection, backup/restore và retention;
- chưa có migration version hóa;
- chưa có kế hoạch baseline schema và smoke test trên database sạch;
- chưa quyết định rõ staging có dùng demo seed hay không.

Không nên trỏ lần deploy đầu tiên vào database production có dữ liệu quan trọng khi vẫn còn `ddl-auto=update`.

## Repository / Deployment Readiness

- `target/`, `backend/target/`, `frontend/node_modules/`, `frontend/dist/`, `*.log` và PID frontend đã được ignore.
- `.env` chính xác được ignore, nhưng các biến thể như `.env.local`, `.env.production` hoặc `.env.prod` chưa được bao phủ. Đây là rủi ro vô tình commit secret.
- Frontend có `.env.example`; backend chưa có file env mẫu riêng.
- Chưa có Dockerfile, Procfile, compose hoặc manifest provider.
- Chưa có workflow CI trong `.github/workflows` để tự động chạy backend tests/frontend build.
- Chưa có tài liệu runbook deploy/rollback/health check ngoài audit này.
- Maven wrapper Unix chưa có executable bit.
- Remote Git tồn tại, nhưng local đang đi trước remote và Phase này không push. Mọi provider deploy từ Git sẽ chưa thấy các commit local cho tới khi người dùng chủ động push.

## Required Environment Variables

### Backend

| Biến | Trạng thái | Ghi chú |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | Bắt buộc khi deploy | Đặt `prod`. |
| `JWT_SECRET` | Bắt buộc | Tối thiểu 32 ký tự; dùng secret ngẫu nhiên mạnh. |
| `CORS_ALLOWED_ORIGINS` | Bắt buộc | Danh sách origin frontend chính xác, phân tách bằng dấu phẩy. |
| `DB_URL` | Bắt buộc về vận hành | Hiện có fallback local; cần đổi prod sang fail-fast. |
| `DB_USERNAME` | Bắt buộc về vận hành | Hiện fallback `postgres`; không dùng mặc định này trên production. |
| `DB_PASSWORD` | Bắt buộc về vận hành | Hiện fallback `postgres`; lưu trong secret manager. |
| `JWT_EXPIRATION_MS` | Tùy chọn | Mặc định 24 giờ; xác nhận chính sách phiên. |
| `PORT` | Tùy provider, hiện chưa hỗ trợ | Cần thêm mapping `server.port` nếu PaaS cấp cổng động. |

Không commit giá trị thật. Nên bổ sung `backend/.env.example` chỉ chứa tên biến/giá trị giả an toàn.

### Frontend

| Biến | Trạng thái | Ghi chú |
|---|---|---|
| `VITE_API_BASE_URL` | Bắt buộc nếu khác origin | URL public backend, được nhúng lúc build. Có thể bỏ trống chỉ khi `/api` được proxy same-origin. |

Biến bắt đầu bằng `VITE_` là dữ liệu public trong bundle, không được đặt secret vào đó.

## Missing Items

Các mục cần hoàn tất trước lần deploy staging đáng tin cậy:

1. Chọn provider cho backend, frontend và PostgreSQL; chọn region gần nhau.
2. Tách cấu hình datasource/JPA production và bắt buộc DB credentials.
3. Hỗ trợ `PORT` theo yêu cầu provider.
4. Thêm SPA rewrite cho host frontend.
5. Sửa executable bit của `backend/mvnw` hoặc xác định build command Linux thay thế.
6. Xác nhận provider có Java 25; cân nhắc LTS phổ biến hơn nếu hạ tầng không hỗ trợ.
7. Mở rộng `.gitignore` cho `.env.*` nhưng vẫn allowlist các file `.env.example`.
8. Chọn Flyway/Liquibase và tạo migration trước production nghiêm túc.
9. Tạo backend env example và runbook deploy/rollback.
10. Bổ sung health endpoint/health-check strategy và, nếu phù hợp, CI build/test.

## Risks

| Mức | Rủi ro | Tác động |
|---|---|---|
| Cao | Datasource production vẫn có fallback local/default credentials | Deploy sai cấu hình, không kết nối DB hoặc dùng credential yếu. |
| Cao | `ddl-auto=update`, chưa có migration version hóa | Schema thay đổi khó kiểm soát/rollback, nguy cơ ảnh hưởng dữ liệu. |
| Cao | Chưa có database staging/production và chưa kiểm thử SSL/kết nối | Chưa thể chứng minh ứng dụng chạy trên hạ tầng thật. |
| Trung bình | Chưa hỗ trợ `PORT` động | Backend có thể không được router/health check của PaaS truy cập. |
| Trung bình | Maven wrapper Unix không executable | Build command `./mvnw` lỗi trên Linux. |
| Trung bình | Java 25 không phải runtime có sẵn ở mọi provider | Build/start bị chặn hoặc cần custom image. |
| Trung bình | Thiếu SPA fallback | Refresh deep route frontend trả 404. |
| Trung bình | `.env.*` chưa ignore toàn diện | Có thể vô tình commit secret/config môi trường. |
| Trung bình | Seeder chưa có guard cứng cho profile prod | Một biến cấu hình sai có thể tạo dữ liệu demo trên production. |
| Thấp | Chưa pin Node và chưa có CI | Build giữa môi trường có thể lệch; lỗi chỉ được phát hiện thủ công. |

## Recommended Next Steps

1. Bắt đầu Phase 8.1 bằng việc chọn rõ deployment target và PostgreSQL provider; ưu tiên staging trước production.
2. Chốt runtime Java/Node, build command, start command, port và health check theo provider.
3. Hardening config: datasource fail-fast trong `prod`, `show-sql=false`, seed guard, `.env.*` ignore.
4. Thêm SPA rewrite và đặt `VITE_API_BASE_URL`/CORS theo URL staging thật.
5. Provision database staging, bật SSL theo provider, chạy schema/migration trên database sạch.
6. Deploy staging, chạy smoke test: đăng ký/đăng nhập, quiz, attempt, result/review, admin và refresh mọi deep route quan trọng.
7. Chỉ sau khi staging pass mới quyết định migration/backup/rollback và checklist production.

Mức reasoning đề xuất cho Phase 8.1: **5.5 Medium** — phần lớn là tích hợp cấu hình/provider và xác minh end-to-end; cần cẩn thận với secret, DB và routing nhưng chưa cần thiết kế lại kiến trúc.

## Test / Build Evidence

Audit đã chạy trên Windows với OpenJDK 25, Node.js 24.15.0 và npm 11.12.1:

| Kiểm tra | Kết quả | Bằng chứng chính |
|---|---|---|
| `backend/.\mvnw.cmd test` | PASS | 55 tests, 0 failures, 0 errors, 0 skipped. |
| `frontend/npm run build` | PASS | Vite 6.4.3, 94 modules transformed, build khoảng 5,08 giây. |
| `backend/.\mvnw.cmd clean package` | PASS | 55 tests pass; tạo executable JAR `quizmaster-0.0.1-SNAPSHOT.jar` khoảng 59,9 MB. |
| Quét production bundle tìm `localhost:8080` | PASS | 0 kết quả trong `frontend/dist/assets`. |

Các cảnh báo quan sát được nhưng chưa làm fail build: Mockito/Byte Buddy dynamic agent trên Java 25 và cảnh báo Lombok dùng API `Unsafe`. Cần theo dõi khi nâng Java/dependency.

Không chạy ứng dụng với database thật, không chạy seeder, không kiểm thử network/CORS trên domain thật và không thực hiện smoke test staging trong Phase này.

## Final Conclusion

**Phase 8.0: PASS WITH NOTES — audit hoàn tất, nhưng deployment readiness hiện tại là NOT READY.**

Codebase đã có nền tảng tốt: profile production, JWT/CORS fail-fast, build backend/frontend pass, production bundle không rò localhost và seeder mặc định tắt. Tuy nhiên chưa được phép gọi là production-ready do còn các blocker về datasource/JPA production, migration, database/provider thật, port động, Java runtime, SPA rewrite và Maven wrapper Linux.

Trạng thái phù hợp tiếp theo là chuẩn bị **staging deployment** trong Phase 8.1 sau khi người dùng chọn provider. Không deploy production và không tuyên bố production-ready chỉ dựa trên kết quả audit này.
