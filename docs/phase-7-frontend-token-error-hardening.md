# Phase 7.4 Frontend Token/Error State Hardening

## 1. Purpose

Phase 7.4 làm frontend ổn định hơn khi token hết hạn/không hợp lệ và khi API trả lỗi. Task chỉ harden luồng hiện có, không thêm feature mới hoặc thay đổi UI lớn.

## 2. Scope

In scope:

- Xử lý 401 và 403.
- Chuẩn hóa API error message.
- Loading/disabled state.
- Chống double click cơ bản cho login, register, start quiz và submit quiz.
- Fallback cho protected/admin route.

Out of scope:

- Refresh token, forgot password, OAuth.
- Backend changes.
- UI redesign.
- Scoring hoặc attempt backend changes.
- Dashboard, analytics, import và upload.

## 3. Resume State

- Git status trước khi tiếp tục: working tree clean trên branch `main`; branch local ahead `origin/main` 17 commits.
- Latest commit: `8966103 Document Phase 7 auth permission regression`.
- Uncommitted changes: không có.
- Action: bắt đầu Phase 7.4 từ Case A, audit frontend trước rồi bổ sung hardening tối thiểu. Không có thay đổi cũ cần discard, overwrite hoặc điều chỉnh.

## 4. Changes

- `frontend/src/api/client.js`
  - Thêm `ApiError` với `status`, `body`, `cause`, `isNetworkError`.
  - Thêm fallback message cho 400, 401, 403, 404, 5xx, network và status khác.
  - Thêm helper `getErrorMessage`, `isUnauthorized`, `isForbidden`.
  - Phát event unauthorized chỉ với request có token và cho phép global handling.
  - Cho phép login/register bỏ Authorization header và không phát global unauthorized event.
- `frontend/src/auth/AuthContext.jsx`
  - Lắng nghe unauthorized event để clear token/user khi protected request trả 401.
  - `/api/auth/me` chỉ clear auth với 401; 403, 5xx và network error giữ token và hiển thị auth fallback.
  - Login/register 401 được giữ local cho form, không bị xử lý nhầm như expired protected session.
- `frontend/src/pages/LoginPage.jsx`, `RegisterPage.jsx`, `QuizDetailPage.jsx`, `TakeQuizPage.jsx`
  - Giữ loading/disabled state hiện có.
  - Thêm khóa đồng bộ bằng `useRef` để chặn lần gọi thứ hai trước khi React kịp render trạng thái disabled.

## 5. Behavior

- Wrong login password: form hiển thị message backend (`Invalid email or password`), vẫn ở `/login`, không global logout/redirect loop/crash.
- Invalid/expired token: 401 từ `/api/auth/me` hoặc protected request clear token/user; protected route chuyển về login và không trắng màn hình.
- 403: không phát unauthorized event và không clear token. USER bị admin route guard đưa về trang public; ADMIN vẫn truy cập admin bình thường. Page-level 403 giữ error message phù hợp.
- Network/server error: `ApiError` luôn có message fallback; network error hiển thị lỗi kết nối và không xóa token. Protected auth check có error fallback/retry.
- Duplicate prevention: login/register/start/submit dùng cả ref lock và disabled/loading state. Đây là bảo vệ phía frontend cơ bản, không phải backend concurrency control.

## 6. QA Results

| ID | Scenario | Expected | Actual | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| FE-401-01 | Invalid token on protected route | Clear auth, về login, không trắng màn hình | Token hợp lệ hiện tại được làm mất hiệu lực bằng JWT secret tạm; reload `/attempts` chuyển về `/login`, guest UI render bình thường | PASS | Browser QA tool không cho ghi `localStorage` trực tiếp; dùng token-signature invalidation tương đương, sau đó đã khôi phục backend secret dev ban đầu |
| FE-401-02 | Wrong login password | Hiện lỗi tại login, không crash/loop | Guest login bằng password sai hiển thị `Invalid email or password`, URL giữ `/login` | PASS | Login request không kích hoạt global unauthorized |
| FE-403-01 | USER vào admin route | Không vào admin, token không bị clear | `demo-user` vào `/admin/quizzes` được redirect `/`; header vẫn hiện USER | PASS | Route guard chặn trước admin API |
| FE-403-02 | ADMIN vào admin route | Admin pages hoạt động | `demo-admin` mở `/admin/quizzes`, list render bình thường | PASS | Không thấy regression |
| FE-START-01 | Double click Start | Disabled/loading, vào một attempt | Double-click Start trên Java Core Basics chuyển đến attempt `465`; trang take render đúng | PASS | Frontend ref lock chặn click đồng thời |
| FE-SUBMIT-01 | Double click Submit | Disabled/loading, result đúng | Chọn đủ 8 đáp án rồi double-click Submit; chuyển một lần đến `/attempts/465/result`, kết quả render 100% | PASS | Không có error hoặc request lặp nhìn thấy từ UI |
| FE-RESULT-01 | Result/review unauthorized | Redirect login, không trắng màn hình | Logout rồi mở `/attempts/465/result` chuyển về `/login` | PASS | Protected route hoạt động |
| FE-NETWORK-01 | Backend offline | Lỗi kết nối rõ, không trắng màn hình | Dừng backend rồi mở catalog; hiển thị `Không kết nối được máy chủ...` và nút retry | PASS | Backend được khởi động lại sau test |

Frontend production build: PASS (`vite build`, 94 modules transformed).

Backend tests: SKIPPED. Backend code không thay đổi trong Phase 7.4.

## 7. Known Limitations

- Không có refresh token.
- Không thêm global toast system; route/page dùng error state hiện có.
- Concurrent start/submit chỉ được chặn cơ bản ở frontend; backend race/locking tiếp tục defer.
- QA double-click xác nhận hành vi UI và navigation; không phải backend race/load test.
- Manual QA tạo và submit attempt local `465` cho `demo-user@quizmaster.local`.

## 8. Conclusion

Phase 7.4: **PASS**.

Không có blocker. Frontend xử lý đúng ranh giới giữa login 401, protected 401 và 403; các action chính có loading/disabled cùng synchronous lock; build và manual QA đều pass. Có thể chuyển sang Phase 7.5 Seeder / Demo Safety Verification. Kết luận này không phải tuyên bố production-ready.
