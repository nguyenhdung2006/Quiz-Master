# QuizMaster Frontend Deployment

## Purpose

Tài liệu này mô tả contract và checklist cho lần triển khai frontend QuizMaster lên Vercel staging trong tương lai. Đây là tài liệu readiness; Phase 8.5 không tạo Vercel project, không đặt environment variable thật và không deploy.

## Platform and Monorepo Settings

| Thiết lập | Giá trị |
|---|---|
| Platform | Vercel |
| Framework | Vite |
| Repository root | QuizMaster monorepo |
| Vercel Root Directory | `frontend` |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| SPA configuration | `frontend/vercel.json` |

Không thêm Netlify configuration vì frontend target đã chốt là Vercel. Không commit `dist`, `node_modules`, `.env` thật hoặc Vercel project IDs.

## Environment Contract

Vercel staging phải đặt build-time variable sau khi Render cấp backend staging URL thật:

```env
VITE_API_BASE_URL=https://<backend-staging-url>
```

Placeholder an toàn dùng trong docs/config example:

```env
VITE_API_BASE_URL=https://quizmaster-api-<placeholder>.onrender.com
```

`VITE_API_BASE_URL` là biến public được Vite nhúng vào client bundle lúc build. Thay đổi giá trị trong Vercel yêu cầu rebuild/redeploy. Không đặt JWT secret, database credential hoặc bất kỳ secret nào trong biến có prefix `VITE_`.

Backend Render staging URL chưa tồn tại ở Phase 8.5. Không dùng placeholder làm giá trị platform thật; cập nhật bằng URL HTTPS thật sau Phase 8.6.

## Development and Production Behavior

`frontend/src/api/client.js` tập trung mọi API request:

- development có thể fallback về `http://localhost:8080` khi không đặt env;
- production build không fallback về localhost;
- production thiếu env sẽ dùng same-origin `/api`;
- kiến trúc Vercel/Render tách origin yêu cầu đặt rõ `VITE_API_BASE_URL` bằng Render URL.

Vercel staging không có proxy `/api` được định nghĩa trong repository, nên không được dựa vào same-origin fallback cho lần deploy staging dự kiến.

## SPA Fallback

`frontend/vercel.json` phải parse được và chứa đúng một rewrite cần thiết:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Phase 8.5 đã xác minh JSON parse thành công và source/destination khớp. Cấu hình này cho phép Vercel trả SPA entry point cho deep route, nhưng chỉ browser refresh trên URL Vercel thật mới xác nhận được hành vi end-to-end.

## Phase 8.7 Route Refresh Checklist

Sau khi frontend được deploy, mở trực tiếp và refresh các route sau trên Vercel URL thật:

- `/`
- `/login`
- `/register`
- `/quizzes`
- `/quizzes/:id`
- `/attempts`
- `/attempts/:attemptId/take`
- `/attempts/:attemptId/result`
- `/attempts/:attemptId/review`
- `/me/attempts` (redirect về `/attempts`)
- `/admin/categories`
- `/admin/quizzes`
- `/admin/quizzes/new`
- `/admin/quizzes/:id/edit`

Checklist task đôi khi ký hiệu route cuối là `:quizId`; router hiện dùng param name `:id`. Hai ký hiệu có cùng URL shape, và Phase 8.5 không đổi route behavior.

Với protected/admin routes, cần phân biệt SPA fallback thành công với auth redirect/authorization hợp lệ. Kiểm tra login, register, token, CORS và API response đầy đủ thuộc phase deployed smoke.

## Verified Build Evidence

Phase 8.5 build bằng placeholder không phải URL thật:

```text
VITE_API_BASE_URL=https://quizmaster-api-placeholder.onrender.com
npm run build
```

Kết quả:

- Vite 6.4.3 production build: PASS;
- 94 modules transformed;
- `dist` được tạo cục bộ và vẫn untracked/ignored;
- bundle có placeholder build URL;
- không có `localhost:8080`;
- không có `127.0.0.1:8080`.

Bundle có literal chung `http://localhost` từ React Router để tạo URL khi browser origin không khả dụng. Đây không phải backend API endpoint; API client production đã nhúng Render placeholder và không chứa localhost port 8080.

## Before Vercel Staging Deployment

1. Hoàn thành Phase 8.6 và lấy Render backend staging HTTPS URL thật.
2. Tạo/configure Vercel project với Root Directory `frontend`.
3. Đặt `VITE_API_BASE_URL` bằng Render URL thật trong đúng Vercel environment.
4. Xác nhận backend `CORS_ALLOWED_ORIGINS` chứa Vercel staging origin thật.
5. Build/deploy lại sau mọi thay đổi build-time env.
6. Không upload hoặc commit `dist`; để Vercel build từ source.
7. Chạy browser/CORS/API và route refresh checklist trong Phase 8.7.

## Known Limitations

- Backend Render staging URL chưa có cho đến Phase 8.6.
- Vercel project chưa được tạo/configure trong Phase 8.5.
- Vercel environment variables chưa được đặt.
- Actual Vercel deploy chưa chạy.
- Deep-route refresh chưa được browser-test trên deployed URL.
- Frontend-to-backend CORS chưa thể xác minh end-to-end.
- Node runtime trên Vercel chưa được pin/xác minh.
- QuizMaster chưa production-ready.
