# Phase 8.7 Frontend Staging Deploy / Vercel Backend Integration

## Status

**DONE / CLOSED - PASS WITH NOTES**

Frontend staging deploy tren Vercel da duoc xac minh voi backend staging Render. SPA fallback,
build-time API URL, CORS allow-list, public API calls, register/login/logout va protected route behavior
deu pass. Staging data hien dang rong cho catalog/attempts, nen full quiz-taking smoke duoc defer sang
Phase 8.8 sau khi co noi dung staging phu hop. Khong claim production-ready.

## Scope

Phase nay ghi nhan ket qua frontend staging da duoc deploy ben ngoai task nay va thuc hien verification.
Task nay khong deploy lai Vercel, khong trigger Render deploy, khong push GitHub, khong doc/giai ma
secret, khong sua business logic, khong bat demo seed, va khong tao production claim.

## Service Details

```text
Frontend URL: https://quizmaster-staging.vercel.app
Backend URL: https://quizmaster-api-staging.onrender.com
Frontend platform: Vercel
Frontend root directory: frontend
Frontend build command: npm run build
Frontend output directory: dist
Frontend env: VITE_API_BASE_URL=https://quizmaster-api-staging.onrender.com
Backend CORS origins: http://localhost:5173, https://quizmaster-staging.vercel.app
```

## Vercel / SPA Verification

`frontend/vercel.json` keeps the SPA rewrite:

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

Direct deployed-route checks:

| Route | Result | Evidence |
|---|---|---|
| `/` | PASS | HTTP 200 |
| `/quizzes` | PASS | HTTP 200, served `index.html` |
| `/login` | PASS | HTTP 200, served `index.html` |
| `/register` | PASS | HTTP 200, served `index.html` |

Interpretation: deployed Vercel SPA fallback works for the public and auth entry routes tested.

## Local Build Verification

Command:

```powershell
cd D:\QuizMaster\frontend
$env:VITE_API_BASE_URL='https://quizmaster-api-staging.onrender.com'
npm run build
```

Result:

```text
Vite 6.4.3 production build: PASS
94 modules transformed
dist generated successfully
```

Bundle scans:

```text
localhost:8080: no match in frontend/dist
127.0.0.1:8080: no match in frontend/dist
quizmaster-api-staging.onrender.com: present in built JS bundle
```

Interpretation: frontend production build embeds the Render staging backend URL and does not target the
local backend port.

## CORS Verification

Allowed Vercel origin preflight:

```text
OPTIONS https://quizmaster-api-staging.onrender.com/api/categories
Origin: https://quizmaster-staging.vercel.app

HTTP 200
access-control-allow-origin: https://quizmaster-staging.vercel.app
access-control-allow-methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
```

Allowed localhost origin preflight:

```text
OPTIONS https://quizmaster-api-staging.onrender.com/api/categories
Origin: http://localhost:5173

HTTP 200
access-control-allow-origin: http://localhost:5173
```

Unknown origin preflight:

```text
OPTIONS https://quizmaster-api-staging.onrender.com/api/categories
Origin: https://evil.example

HTTP 403
Body: Invalid CORS request
```

Public API calls from the Vercel origin header:

```text
GET /api/categories: HTTP 200, body []
GET /api/quizzes: HTTP 200, body []
```

Interpretation: backend allows the staging Vercel origin and local dev origin, blocks an unknown origin,
and the public catalog endpoints are reachable through the Render URL.

## Browser Smoke

Browser verification was performed against:

```text
https://quizmaster-staging.vercel.app
```

Public routes:

| Flow | Result | Notes |
|---|---|---|
| Landing page `/` | PASS | Page title `QuizMaster`; hero and nav rendered |
| Quiz catalog `/quizzes` | PASS WITH NOTES | Rendered empty catalog state: `Chua co quiz cong khai.` |
| Console logs | PASS | No browser console warn/error observed during checked flows |

Auth and protected routes:

| Flow | Result | Notes |
|---|---|---|
| Register new staging UI user | PASS | User created and app navigated to `/quizzes` as role `USER` |
| `/attempts` while logged in | PASS WITH NOTES | Protected page loaded; attempts list empty |
| `/me/attempts` while logged in | PASS | Redirected to `/attempts` as designed by router |
| `/admin/categories` as normal `USER` | PASS | User was redirected away from admin area to home |
| Logout after register session | PASS | Nav returned to guest state |
| `/attempts` as guest | PASS | Redirected to `/login` |
| Login existing staging UI user | PASS | Login succeeded and navigated to `/attempts` |
| Final logout | PASS | Session returned to guest login state |

No token value is stored in this report.

## Data State

Staging catalog data is intentionally empty at this point:

```text
GET /api/categories -> []
GET /api/quizzes -> []
```

This means quiz detail, quiz taking, result review and admin content-management flows cannot be fully
validated without creating staging quiz content. That broader workflow belongs in Phase 8.8.

## Secret / Safety Review

Result: **PASS WITH NOTES**.

- No frontend source code change was required.
- No Vercel or Render secret value was written to Git.
- No database credential was written to Git.
- Auth smoke used UI flows only; token values were not recorded.
- Demo seed was not enabled.
- `dist` was generated locally for verification only and remains uncommitted.

## Exit Criteria

| Criteria | Result | Evidence |
|---|---|---|
| Vercel frontend URL exists | PASS | `https://quizmaster-staging.vercel.app` |
| Frontend uses Render staging backend URL | PASS | Vercel env provided; local build bundle contains Render URL |
| Local backend URL absent from production bundle | PASS | no `localhost:8080` / `127.0.0.1:8080` in `frontend/dist` |
| SPA fallback works on deployed URL | PASS | `/`, `/quizzes`, `/login`, `/register` returned HTTP 200 |
| Vercel origin allowed by CORS | PASS | preflight returned 200 with exact allow-origin |
| Unknown origin blocked | PASS | `https://evil.example` returned 403 |
| Public API reachable | PASS WITH NOTES | categories/quizzes returned 200 and empty arrays |
| Register/login/logout browser smoke | PASS | UI auth flow completed |
| Protected route behavior | PASS | logged-in attempts loaded; guest redirected to login |
| Admin route blocked for normal user | PASS | user redirected away from admin route |
| Full quiz-taking smoke | DEFERRED | no public quiz content exists yet |

## Final Conclusion

**Phase 8.7 DONE / CLOSED - PASS WITH NOTES.**

QuizMaster staging now has a deployed frontend connected to the deployed backend:

```text
Frontend: https://quizmaster-staging.vercel.app
Backend: https://quizmaster-api-staging.onrender.com
```

The frontend staging deployment and Vercel-to-Render integration are verified. QuizMaster is still not
production-ready.

## Next Step

```text
Phase 8.8 - Staging Full Smoke Test
```

Phase 8.8 should create or otherwise provide controlled staging quiz content, then test catalog, quiz
detail, attempt start, submit, result, answer review, admin quiz/category management, and cold-start
behavior end to end.
