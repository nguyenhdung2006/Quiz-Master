# Phase 8.5 Frontend Production Config / Deploy Readiness Verification

## Status

**Phase 8.5 DONE / CLOSED — PASS WITH NOTES.**

Frontend config, environment contract, SPA fallback và production bundle readiness đã được xác minh. Kết quả có ghi chú vì chưa có backend Render staging URL, chưa deploy Vercel và chưa thể browser-test deep-route refresh/CORS trên môi trường thật.

## Scope

Phase này chỉ verify frontend production deployment config và viết runbook cho Vercel staging trong tương lai. Không deploy, không đăng nhập Vercel CLI, không tạo project/platform env, không dùng secret thật, không push và không sửa backend/business logic/UI.

## Files Inspected

- `README.md`
- `docs/deployment-target.md`
- `docs/deployment-backend.md`
- `docs/deployment-database.md`
- `frontend/package.json`
- `frontend/vite.config.js`
- `frontend/vercel.json`
- `frontend/.env.production.example`
- `frontend/.env.example`
- `frontend/src/api/client.js`
- `frontend/src/App.jsx`
- `frontend/src/main.jsx`

## Files Changed

- `docs/deployment-frontend.md` — created.
- `docs/phase-8-5-frontend-production-config.md` — created.
- `README.md` — added concise frontend deployment runbook link.
- `docs/deployment-target.md` — synchronized Phase 8.5 readiness and next phase.

Không thay đổi frontend config/source vì cấu hình hiện tại đã đáp ứng contract. Không thay đổi backend.

## Vercel Target Summary

```text
Platform: Vercel
Root Directory: frontend
Install command: npm ci
Build command: npm run build
Output directory: dist
Framework: Vite
Deploy performed: no
```

Actual Vercel project/URL chưa tồn tại. Frontend URL trong docs vẫn là placeholder.

## Environment Variable Contract

```env
VITE_API_BASE_URL=https://<backend-staging-url>
```

Safe documented placeholder:

```env
VITE_API_BASE_URL=https://quizmaster-api-<placeholder>.onrender.com
```

Vite nhúng env này tại build time; thay đổi cần rebuild/redeploy. Vercel staging phải đặt Render HTTPS URL thật sau Phase 8.6. Development fallback `http://localhost:8080` vẫn chỉ áp dụng trong DEV; production không tự fallback về localhost.

## SPA Rewrite Verification

- `frontend/vercel.json`: tồn tại.
- JSON parse: PASS.
- Rewrite count: 1.
- Source: `/(.*)` — PASS.
- Destination: `/index.html` — PASS.
- Duplicate rewrite: không có.
- Netlify fallback/config: không thêm.

Đây là config-level verification. Browser refresh trên Vercel URL thật được defer sang Phase 8.7.

## Route Inventory

React Router dùng `BrowserRouter`. Các public, protected và admin routes đã được đối chiếu từ `frontend/src/App.jsx`; route refresh checklist đầy đủ được ghi trong `docs/deployment-frontend.md`.

Router hiện dùng `/admin/quizzes/:id/edit`; ký hiệu `:quizId` trong checklist yêu cầu mô tả cùng URL shape. Không sửa route behavior trong Phase 8.5.

## Build Result

Build verification dùng biến tạm thời, không phải platform env:

```text
VITE_API_BASE_URL=https://quizmaster-api-placeholder.onrender.com
Vite 6.4.3
94 modules transformed
Result: PASS
```

Env process đã được clear sau build. `dist` chỉ là ignored local build artifact và không được stage/commit.

Lần chạy đầu trong sandbox bị `spawn EPERM` khi Vite gọi esbuild. Chạy lại ngoài sandbox bằng cùng source/env đã PASS; đây là giới hạn sandbox, không phải frontend build defect.

## Production Bundle Scan

| Pattern | Kết quả | Diễn giải |
|---|---|---|
| `localhost:8080` | No match | PASS |
| `127.0.0.1:8080` | No match | PASS |
| Render placeholder build URL | Match | PASS — build-time env được nhúng |
| generic `http://localhost` | Match | React Router internal URL fallback, không phải API endpoint |

API client production không chứa local backend URL. Generic library literal được ghi chú để kết quả scan có thể tái hiện chính xác.

## Secret and Safety Result

- Không đọc hoặc in secret ngoài repository.
- Không tạo `.env.production` thật.
- Không có raw Neon credential/connection URL trong thay đổi.
- Chỉ dùng placeholder frontend/backend URL.
- Không stage/commit `dist`, `node_modules`, `.env` hoặc build artifact.
- Không thay đổi real Vercel environment variables.

## Not Done / Deferred

- Không deploy Vercel hoặc Render.
- Không chạy Vercel CLI login/deploy.
- Không tạo/configure Vercel project thật.
- Không đặt Vercel environment variable.
- Không browser-test deployed route refresh.
- Không test login/register trên deployed frontend.
- Không test frontend-to-backend CORS/API trên deployed URLs.
- Không chạy backend tests vì không có backend file thay đổi.
- Không push Git.

## Commit

```text
Hash: see the Git commit containing this report and final Phase 8.5 handoff
Message: Verify frontend production deployment configuration
```

## Git Status

```text
Branch: main
Ahead origin/main at phase start: 26 commits
Expected final ahead count after Phase 8.5 commit: 27 commits
Push: not performed
```

## Remaining Risks

- Backend Render staging URL chưa có.
- Vercel project chưa được tạo/configure.
- `VITE_API_BASE_URL` phải được đặt đúng sau khi backend URL tồn tại.
- Backend CORS chỉ có thể verify đầy đủ với Vercel/Render URL thật.
- SPA rewrite cần browser refresh test trên Vercel trong Phase 8.7.
- Vercel Node runtime chưa được pin/xác minh.
- Actual deployment, cold start và end-to-end flows chưa được test.
- QuizMaster chưa production-ready.

## Recommended Next Step

```text
Phase 8.6 Backend Staging Deploy
Dùng: 5.5 High
```

Phase 8.6 cần tạo/verify Render staging backend có kiểm soát và cung cấp URL HTTPS thật. Phase 8.7 sau đó mới cấu hình/deploy Vercel, đối chiếu CORS và chạy route refresh/browser smoke.

## Final Conclusion

**Phase 8.5 DONE / CLOSED — PASS WITH NOTES.**

Frontend đã sẵn sàng ở mức configuration/build contract cho lần Vercel staging deployment sau này. Phase này xác minh readiness, không phải bằng chứng deployment hoặc production readiness.
