# Local setup

Verified on a clean machine against this repo.

## Requirements

- **Node.js 22 or newer.** On Node 20 the backend crashes at startup with
  `Error: Node.js detected but native WebSocket not found` from `@supabase/supabase-js`.
- PostgreSQL 16 (local install, or Docker).
- A Supabase project (for file uploads).

## 1. Database

Create a database named `cfsg`. With Docker:

```bash
docker run -d --name cfsg-pg -e POSTGRES_PASSWORD=<password> -e POSTGRES_DB=cfsg -p 5432:5432 postgres:16
```

## 2. backend/.env

Copy `backend/.env.example` to `backend/.env` and fill it in.

- `DB_URL` — percent-encode special characters in the password (`@` becomes `%40`).
- `SUPABASE_URL` — the project base URL only, e.g. `https://<project-ref>.supabase.co`.
  No `/rest/v1/` suffix; the client appends the path itself.
- `SUPABASE_SERVICE_ROLE_KEY` — copy from **Project Settings → API Keys** of that *same*
  project. A key from a different project fails with
  `Supabase upload failed: Invalid Compact JWS` on every upload.
- `SUPABASE_STORAGE_BUCKET` (default `documents`) and `SUPABASE_APPLICATIONS_BUCKET`
  (default `students-documents`) must exist in Supabase Storage.

## 3. Backend

```bash
cd backend
npm install
npm run db:push     # create tables from the Drizzle schema
npm run db:seed     # seed the nine staff accounts
npm run db:seed-downloads  # seed the five public PDF documents into the downloads table
npm run start:dev   # http://localhost:5000/api
```

Seeded logins — all 9 accounts use the same password **`admin12345`**:

| Role | Email | Dashboard |
|---|---|---|
| Admin | `admin@college.com` | `/dashboard/administrator` |
| Secondary Headmaster | `master@college.com` | `/dashboard/headmaster-secondary-tvet` |
| Primary Headmaster | `headmaster.primary@college.com` | `/dashboard/headmaster-primary` |
| DOS Secondary | `dos.secondary@college.com` | `/dashboard/dos-secondary` |
| DOS TVET | `dos.tvet@college.com` | `/dashboard/dos-tvet` |
| Bursar | `bursar@college.com` | `/dashboard/bursar` |
| Cashier | `cashier@college.com` | `/dashboard/cashier` |
| Store Manager | `store.manager@school.rw` | `/dashboard/store-manager` |
| Receptionist | `reception@college.com` | `/dashboard/requirement-collector` |

> If a fresh install is done with `npm run db:seed` (`src/seed/seed.ts`), the accounts
> use `@school.rw` emails with the password `Password123!` instead. To force the
> `@college.com` / `admin12345` accounts above, run:
> `npx tsx src/db/seed.ts`
> and then `npx tsx src/db/fix-master-password.ts` to normalize the Secondary
> Headmaster password.

Login is rate limited to 3 attempts per 30 seconds; repeated attempts return
`429 ThrottlerException`. Wait ~30 seconds.

## 4. Frontend

```bash
cd frontend
npm install
npm run dev         # http://localhost:3000
```

`NEXT_PUBLIC_API_URL` defaults to `http://localhost:5000`; `/api` is appended by
`frontend/lib/api.ts`. The backend only allows CORS from `http://localhost:3000`.

Sign in at `/staff-portal-v1`; each role is redirected to its own dashboard.

## Checks

```bash
cd backend  && npm run build && npm run lint
cd frontend && npx tsc --noEmit && npm run build
```
