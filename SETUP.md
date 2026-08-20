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
npm run start:dev   # http://localhost:5000/api
```

Seeded logins are `admin@school.rw`, `bursar@school.rw`, `cashier@school.rw`,
`sec.headmaster@school.rw`, `prim.headmaster@school.rw`, `dos.secondary@school.rw`,
`dos.tvet@school.rw`, `store.manager@school.rw`, `receptionist@school.rw`,
all with the seed password in `backend/src/seed/seed.ts`.

Login is rate limited; repeated attempts return `429 ThrottlerException`. Wait a minute.

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
