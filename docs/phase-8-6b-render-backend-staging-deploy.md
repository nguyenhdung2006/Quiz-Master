# Phase 8.6B Render Docker Backend Staging Deploy

## Status

**DONE / CLOSED - PASS WITH NOTES**

Backend staging deploy tren Render bang Docker da hoan tat va smoke test backend public URL da pass. Full staging system van chua hoan tat vi frontend Vercel deploy va browser CORS/flow verification con defer sang Phase 8.7. Khong claim production-ready.

## Scope

Phase 8.6B ghi nhan ket qua manual Render Docker backend deploy da duoc thuc hien ben ngoai task nay. Task nay chi cap nhat tai lieu closure, khong deploy lai, khong trigger Render deploy, khong push GitHub, khong doc secret, khong sua backend business logic, khong sua frontend, khong doi env vars, va khong bat demo seed.

## Service Details

```text
Render service: quizmaster-api-staging
Backend URL: https://quizmaster-api-staging.onrender.com
Platform: Render Web Service
Runtime: Docker
Region: Singapore / Southeast Asia
Plan: Free
Branch: main
Latest deployed commit: a5a2563 Prepare Render Docker backend deployment
Root Directory: backend
Dockerfile: backend/Dockerfile
Docker context: backend / .
Health/public smoke endpoint: /api/categories
```

## Render Settings

Render service was created from the GitHub repository on branch `main` after the required push. The deployed path is Docker:

```text
Runtime / Environment: Docker
Root Directory: backend
Dockerfile Path: Dockerfile
Docker Build Context Directory: .
Health Check Path: /api/categories
```

Native Java build/start commands are not used for this staging service.

## Environment Variables

Render was configured with the following env var contract. Values below are placeholders only:

```env
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=<configured-in-render-redacted>
CORS_ALLOWED_ORIGINS=<configured-origin>
SPRING_DATASOURCE_URL=<neon-jdbc-url-with-sslmode-require-redacted>
SPRING_DATASOURCE_USERNAME=<neon-username-redacted>
SPRING_DATASOURCE_PASSWORD=<neon-password-redacted>
SPRING_JPA_HIBERNATE_DDL_AUTO=update
APP_SEED_DEMO=false
```

Notes:

- `SPRING_JPA_HIBERNATE_DDL_AUTO=update` is staging-only.
- Production default should remain `validate`.
- No real JWT secret, database URL, username, password, or access token is stored in this document.
- `APP_SEED_DEMO=false` keeps demo seed disabled.

## Deploy Evidence

Manual deployment evidence:

- GitHub push was completed before Render service creation.
- Render service was created from GitHub repo on branch `main`.
- Render Docker deploy completed successfully.
- Render showed service live for commit `a5a2563`.
- Render assigned public URL `https://quizmaster-api-staging.onrender.com`.

## Public Endpoint Smoke

Command:

```powershell
curl.exe -i https://quizmaster-api-staging.onrender.com/api/categories
```

Result:

```text
HTTP/1.1 200 OK
Body: []
```

Interpretation: **PASS**. Backend is live, database connection works, empty staging DB is expected, and demo seeder did not populate demo categories.

## Register Smoke

Endpoint:

```text
POST https://quizmaster-api-staging.onrender.com/api/auth/register
```

Test user:

```text
staging-user-20260623123157@quizmaster.local
```

Result:

```json
{
  "accessToken": "<redacted>",
  "user": {
    "id": 2,
    "email": "staging-user-20260623123157@quizmaster.local",
    "role": "USER"
  }
}
```

Interpretation: **PASS**. Register works, database write works, and JWT issuance works. Token was intentionally redacted.

## Login Smoke

Endpoint:

```text
POST https://quizmaster-api-staging.onrender.com/api/auth/login
```

Test user:

```text
staging-user-20260623123157@quizmaster.local
```

Result:

```json
{
  "accessToken": "<redacted>",
  "user": {
    "id": 2,
    "email": "staging-user-20260623123157@quizmaster.local",
    "role": "USER"
  }
}
```

Interpretation: **PASS**. Login works and JWT signing/verification config works. Token was intentionally redacted.

## CORS Allowed Origin

Command:

```powershell
curl.exe -i -X OPTIONS "https://quizmaster-api-staging.onrender.com/api/categories" -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: GET"
```

Result:

```text
HTTP/1.1 200 OK
access-control-allow-origin: http://localhost:5173
access-control-allow-methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
```

Interpretation: **PASS**. The configured local frontend origin is allowed.

## CORS Unknown Origin

Command:

```powershell
curl.exe -i -X OPTIONS "https://quizmaster-api-staging.onrender.com/api/categories" -H "Origin: https://evil.example" -H "Access-Control-Request-Method: GET"
```

Result:

```text
HTTP/1.1 403 Forbidden
Body: Invalid CORS request
```

Interpretation: **PASS**. Unknown origin is blocked.

## Seeder Safety

Result: **PASS**.

- `APP_SEED_DEMO=false` was configured.
- `GET /api/categories` returned `[]`.
- No demo categories or demo users were assumed for smoke tests.
- No demo seed execution was observed in Render logs.

## Render Logs Review

Render logs showed:

- Spring Boot 3.5.15 started.
- Java 25 runtime detected.
- Active profile: `prod`.
- Tomcat initialized and started on Render-assigned port `10000`.
- HikariPool started.
- PostgreSQL connected.
- Database version shown: 18.4.
- Render detected service running on port `10000`.
- Service is live.
- No restart loop observed.
- No stacktrace/error after deploy observed.

## Secret Safety Review

Result: **PASS WITH NOTES**.

- No secret values were observed in logs.
- No DB password was observed in logs.
- No JWT secret was observed in logs.
- The manual smoke test produced JWT access tokens, but docs store them only as `<redacted>`.
- The user pasted a full access token in chat during manual smoke testing; this document intentionally does not include it.
- Render env var values remain outside Git.

## Notes / Limitations

- Browser CORS with real Vercel frontend remains deferred to Phase 8.7.
- Frontend is not deployed yet.
- Full staging system is not complete until Vercel deploy and browser/API flow pass.
- Render Free service may sleep and cold start.
- `SPRING_JPA_HIBERNATE_DDL_AUTO=update` is staging-only.
- No Flyway/Liquibase or controlled migration strategy exists yet.
- No production-ready claim is made.
- Access tokens from manual tests must remain redacted.

## Exit Criteria

| Criteria | Result | Evidence |
|---|---|---|
| GitHub source available to Render | PASS | `main` pushed before service creation |
| Render service created | PASS | `quizmaster-api-staging` |
| Docker deploy completed | PASS | Render service live on commit `a5a2563` |
| Public backend URL assigned | PASS | `https://quizmaster-api-staging.onrender.com` |
| Public endpoint responds | PASS | `GET /api/categories` returned `200` and `[]` |
| Database connection works | PASS | public endpoint and register/write smoke passed |
| Register works | PASS | HTTP 200 with redacted token and user object |
| Login works | PASS | HTTP 200 with redacted token and user object |
| Allowed CORS origin works | PASS | localhost origin preflight returned 200 |
| Unknown CORS origin blocked | PASS | `https://evil.example` returned 403 |
| Demo seeder disabled | PASS | categories remained `[]`, no seed logs |
| Logs safe | PASS | no secret/JWT/DB password observed |
| Frontend browser CORS | DEFERRED | Phase 8.7 |

## Final Conclusion

**Phase 8.6B DONE / CLOSED - PASS WITH NOTES.**

Backend staging is deployed on Render with Docker and available at:

```text
https://quizmaster-api-staging.onrender.com
```

This closes backend staging deploy only. QuizMaster is still not production-ready, and the frontend staging deployment is still pending.

## Next Step

```text
Phase 8.7 Frontend Staging Deploy / Vercel Backend Integration
```
