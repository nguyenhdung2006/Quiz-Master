# QuizMaster Frontend Deployment

## Phase 8.7 Staging Deployment Completed

Frontend staging has been deployed on Vercel and verified against the Render backend staging service.

```text
Status: deployed for staging
Frontend URL: https://quizmaster-staging.vercel.app
Backend URL: https://quizmaster-api-staging.onrender.com
Vercel Root Directory: frontend
Build command: npm run build
Output directory: dist
Build-time API URL: https://quizmaster-api-staging.onrender.com
```

Smoke results recorded in
[`docs/phase-8-7-frontend-staging-deploy.md`](phase-8-7-frontend-staging-deploy.md):

- Local production build with the Render staging URL: PASS.
- Bundle scan: no `localhost:8080` or `127.0.0.1:8080`; Render staging URL present.
- Deployed route checks for `/`, `/quizzes`, `/login`, and `/register`: PASS.
- Vercel origin CORS preflight: PASS.
- Unknown origin CORS preflight: PASS, blocked.
- Browser register/login/logout and protected route smoke: PASS.
- Public catalog data: PASS WITH NOTES, empty staging arrays are expected at this phase.

Full quiz-taking and admin content smoke remain deferred to Phase 8.8 because controlled staging quiz
content is not present yet. This staging deployment does not make QuizMaster production-ready.

## Purpose

Tai lieu nay mo ta contract, checklist va ket qua trien khai frontend QuizMaster len Vercel staging.
Phase 8.5 la readiness-only; Phase 8.7 da verify deployment that tren Vercel.

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
VITE_API_BASE_URL=https://quizmaster-api-staging.onrender.com
```

Placeholder an toàn dùng trong docs/config example:

```env
VITE_API_BASE_URL=https://quizmaster-api-<placeholder>.onrender.com
```

`VITE_API_BASE_URL` là biến public được Vite nhúng vào client bundle lúc build. Thay đổi giá trị trong Vercel yêu cầu rebuild/redeploy. Không đặt JWT secret, database credential hoặc bất kỳ secret nào trong biến có prefix `VITE_`.

Backend Render staging URL was assigned in Phase 8.6B and wired into Vercel in Phase 8.7. Do not use
placeholders as real platform values.

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

Bundle có literal chung `http://localhost` từ React Router để tạo URL khi browser origin không khả dụng.
Đây không phải backend API endpoint; API client production đã nhúng Render staging URL và không chứa
localhost port 8080.

## Before Future Vercel Staging Redeploy

1. Confirm the Render backend staging URL still matches Vercel `VITE_API_BASE_URL`.
2. Confirm backend `CORS_ALLOWED_ORIGINS` still contains the Vercel staging origin.
3. Build/deploy again after every build-time env change.
4. Do not upload or commit `dist`; let Vercel build from source.
5. Re-run browser/CORS/API and route refresh checks after redeploy.

## Known Limitations

- Full quiz-taking smoke is deferred until staging quiz content exists.
- Admin create/edit smoke is deferred to Phase 8.8.
- Node runtime trên Vercel chưa được pin/xác minh.
- QuizMaster chưa production-ready.
