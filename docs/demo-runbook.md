# QuizMaster Demo Data Runbook

## 1. Purpose

This runbook is for local and demo use. It explains how to run the curated demo seed safely, which accounts and data to expect, how to perform basic QA, and how to approach reset requests without risking real data.

The seeded records are not production data and do not represent real users or product-scale usage. The demo flow exercises existing QuizMaster features; it does not add fake features.

## 2. Safety Summary

- Demo data does not seed by default.
- The seeder runs only when the backend is explicitly started with `app.seed-demo=true`.
- Never use the demo accounts or passwords in production.
- Never run destructive reset commands against a production, shared, or otherwise valuable database.
- Do not present demo records as real user data or evidence of production scale.
- The seeder is idempotent and is safe to run multiple times against the same local database.

## 3. Prerequisites

- PostgreSQL is running and configured for QuizMaster.
- Java and the Maven wrapper dependencies required by the backend are available.
- Frontend dependencies have been installed with `npm install` or `npm ci`.
- The backend uses `http://localhost:8080` by default.
- The canonical frontend URL is `http://localhost:5173`.

Use `localhost:5173` for the frontend. `127.0.0.1:5173` is not part of the current allowed CORS origins and may fail unless the backend configuration is changed separately.

## 4. Start Backend With Demo Seed

```powershell
cd D:\QuizMaster\backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--app.seed-demo=true"
```

Expected behavior:

- The backend starts on port `8080`.
- `DemoDataSeeder` runs because `app.seed-demo=true` was supplied explicitly.
- Existing demo rows are reused or skipped.
- Missing demo rows are created without duplicating existing seeded data.

Starting the backend normally without this property does not run the demo seeder.

## 5. Start Frontend

```powershell
cd D:\QuizMaster\frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## 6. Build And Test Commands

Backend tests:

```powershell
cd D:\QuizMaster\backend
.\mvnw.cmd test
```

Frontend production build:

```powershell
cd D:\QuizMaster\frontend
npm run build
```

## 7. Demo Accounts

| Purpose | Email | Password | Role | Expected history |
| --- | --- | --- | --- | --- |
| Admin | `demo-admin@quizmaster.local` | `password123` | `ADMIN` | No seeded attempts required |
| Main user | `demo-user@quizmaster.local` | `password123` | `USER` | Two seeded submitted attempts |
| Empty user | `demo-empty@quizmaster.local` | `password123` | `USER` | Zero attempts |

These credentials are for local/demo use only. The seeder passes the passwords through the backend password encoder, so stored passwords are hashed rather than persisted as plaintext.

## 8. Expected Seeded Dataset

| Record type | Expected count |
| --- | ---: |
| Demo users | 3 |
| Categories | 6 |
| Public quizzes | 6 |
| Draft/locked quizzes | 3 |
| Total seeded quizzes | 9 |
| Total seeded questions | 53 |
| Total seeded options | 212 |
| Submitted seeded attempts | 2 |
| Locked quizzes | 1 |

Expected categories:

- Java Core
- Spring Boot
- SQL & Database
- Computer Networking
- Software Engineering
- English for IT

Expected public quizzes:

- Java Core Basics
- Spring Boot Essentials
- SQL Basics
- Networking Fundamentals
- Software Engineering Basics
- English for IT Basics

Expected admin-only draft or locked quizzes:

- Draft — Spring Security Practice
- Draft — Empty Quiz For Publish Validation
- Locked Demo Quiz

Expected submitted attempts for `demo-user@quizmaster.local`:

1. Java Core Basics: `7/8` correct.
2. Locked Demo Quiz: `2/4` correct. The quiz finishes unpublished and reports `structuralEditingLocked=true`.

A local database may contain older manual QA records. For example, attempt `309` on SQL Basics was created manually during Phase 6.4 and is not part of the seeded dataset.

## 9. Expected Visibility Rules

In a fresh demo database, the public catalog shows the six public quizzes. It must not show:

- Draft — Spring Security Practice
- Draft — Empty Quiz For Publish Validation
- Locked Demo Quiz

Public quiz detail behavior:

- Public quiz details return HTTP `200`.
- Correct answers are not exposed before submission.
- Explanations are not exposed before submission.
- Draft and locked quiz details return HTTP `404`.

Admin behavior:

- Admin sees all nine seeded quizzes.
- Correct-answer and explanation data is available in the authorized admin context.
- Locked Demo Quiz is unpublished and reports `structuralEditingLocked=true`.

## 10. Demo Flow Checklist

Guest:

- [ ] Open the landing page.
- [ ] Open the public catalog.
- [ ] Open a public quiz detail.
- [ ] Confirm that starting a quiz redirects to login.

`demo-user@quizmaster.local`:

- [ ] Log in successfully as `USER`.
- [ ] Confirm My Attempts is not empty.
- [ ] Open the seeded Java Core Basics result and review.
- [ ] Open the seeded Locked Demo Quiz result and review.
- [ ] Confirm explanations are visible after submission.

`demo-empty@quizmaster.local`:

- [ ] Log in successfully as `USER`.
- [ ] Confirm My Attempts is empty.
- [ ] Confirm no attempts owned by the main demo user are visible.

`demo-admin@quizmaster.local`:

- [ ] Log in successfully as `ADMIN`.
- [ ] Confirm the admin list contains all nine seeded quizzes.
- [ ] Confirm the empty draft contains zero questions.
- [ ] Confirm publishing the empty draft is rejected.
- [ ] Confirm Locked Demo Quiz is unpublished and structurally locked.

## 11. Idempotency Check

1. Start the backend with demo seed enabled.
2. Record seeded quiz titles, question/option counts, and seeded attempt IDs or counts.
3. Stop the backend cleanly.
4. Start it again with the same seed-enabled command.
5. Repeat the checks.

Expected after the second run:

- No duplicate demo users.
- No duplicate demo categories.
- No duplicate demo quizzes.
- No duplicate seeded questions or options.
- No duplicate seeded attempts or attempt answers.
- Locked Demo Quiz remains unpublished.
- The empty demo user still has zero attempts.

Do not use a global database row count as the only assertion when the local database contains older QA records. Identify demo seed rows by their stable email, category slug, quiz title, and submitted user/quiz relationship.

## 12. Reset Guidance

Normal demo use does not require a database reset. Re-run the idempotent seed instead.

If a reset is genuinely required, use only a disposable local database. Back up anything important first and verify the database name, connection URL, and environment before taking any destructive action. Never reset a production or shared database.

Reset is intentionally not automated in this runbook because the repository does not currently provide an established safe reset procedure, and a casual reset command could destroy unrelated local or real data.

## 13. Troubleshooting

### Port 8080 Is Already In Use

First verify whether the process is the real QuizMaster backend:

```powershell
curl.exe -i http://localhost:8080/api/categories
netstat -ano | findstr ":8080"
tasklist /FI "PID eq <PID>"
```

Only after identifying a wrong process should it be stopped:

```powershell
taskkill /PID <PID> /F
```

An HTTP Basic Authentication `401` response from `/api/categories` usually means another application is using port `8080`; the QuizMaster public categories endpoint does not require Basic Auth.

### Seed Appears To Do Nothing

- Confirm the startup command includes `--app.seed-demo=true`.
- Review backend logs for `DemoDataSeeder` messages.
- Existing demo rows may be skipped because the seed is idempotent.

### Frontend CORS Error

- Open `http://localhost:5173`.
- Do not rely on `http://127.0.0.1:5173` unless the backend CORS configuration explicitly supports it.

### Duplicate Data Concern

- Check demo quizzes by expected title and category.
- Check demo users by their `.local` email addresses.
- Treat older local Phase/QA data as separate from the stable demo seed identities.

## 14. Quick API Checks

```powershell
curl.exe http://localhost:8080/api/categories
curl.exe http://localhost:8080/api/quizzes
```

Authenticated attempt and admin checks require a valid token obtained through the normal demo-account login flow. Do not print or store full JWTs in shared logs or documentation.

## 15. References

- [Demo data scope and plan](demo-data-plan.md)
- [Curated demo content source](demo-content-source.md)
- [Backend API summary](backend-api.md)
