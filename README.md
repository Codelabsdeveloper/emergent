# Emergent Technologies

Production-ready full-stack web application for **Emergent Technologies**: public marketing site, user registration with PostgreSQL persistence, and a secure admin portal.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, React Router, React Hook Form, Zod, Axios |
| Backend | Node.js, Express, TypeScript, Prisma |
| Database | PostgreSQL |
| Auth | Server-side sessions (HTTP-only cookies), bcrypt password hashing |
| Tests | Vitest, React Testing Library, Supertest, Playwright |

## Project structure

```
emergent/
├── backend/                 # Express API + Prisma
│   ├── prisma/              # Schema, migrations, seed
│   └── src/                 # Routes, services, middleware
├── frontend/                # React SPA
│   ├── src/                 # Pages, components, forms
│   └── e2e/                 # Playwright smoke tests
├── docker-compose.yml       # Local PostgreSQL
├── .env.example             # Placeholder environment variables
└── README.md
```

## Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop (for local PostgreSQL) — the daemon must be running before `docker compose`

Local development uses **PostgreSQL**. Use `docker compose up -d` for a local database, or point `DATABASE_URL` at any Postgres instance (including Render).

## Quick start (local)

### 1. Open the project folder

```bash
cd emergent
```

### 2. Start PostgreSQL, install, and seed

Prisma CLI reads `backend/.env`. Copy the example file to the repo root **and** into `backend/`.

```bash
docker compose up -d
npm install
npm --prefix backend install
npm --prefix frontend install
copy .env.example .env
copy .env backend\.env
cd backend
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
cd ..
```

On macOS or Linux, use `cp .env.example .env` and `cp .env backend/.env` instead of `copy`.

Wait until the `emergent-postgres` container is healthy (`docker compose ps`) before running migrations.

Root `npm install` is required so `npm run dev` can start both servers with `concurrently`.

### 3. Run both servers

```bash
npm run dev
```

Open:

- Public site: http://localhost:5173
- Admin login: http://localhost:5173/admin
- Health check: http://localhost:4000/api/health

Default bootstrap admin (development only):

- Username: `Emergent`
- Password: `Password1`

## Environment variables

Copy `.env.example` to `.env` (repo root) and `backend/.env`, then set values for your environment. Prisma CLI uses `backend/.env`; the API also loads the root `.env`.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | API port (default `4000`) |
| `CORS_ORIGIN` | Allowed frontend origin |
| `SESSION_SECRET` | Long random secret for signing sessions |
| `COOKIE_SECURE` | `true` in production (HTTPS) |
| `COOKIE_SAME_SITE` | `lax` locally; `none` when the API and frontend are on different domains |
| `TRUST_PROXY` | `true` behind reverse proxies / PaaS |
| `SESSION_MAX_AGE_MS` | Session lifetime |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Used **only** by the seed script |
| `VITE_API_BASE_URL` | Frontend API base (use `/api` with Vite proxy locally) |

Never commit real production secrets.

## Admin credentials

1. Seed creates the initial admin from `ADMIN_USERNAME` / `ADMIN_PASSWORD`.
2. Password is stored as a **bcrypt** hash — never plaintext.
3. After login, the admin goes directly to `/admin/dashboard`.
4. Public admin registration is not available.

For production, set strong unique values in the hosting environment **before** running the seed.

## API overview

### Public

- `POST /api/registrations` — create registration
- `GET /api/health` — health check

### Auth

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/me`

### Protected admin

- `GET /api/admin/dashboard/stats`
- `GET /api/admin/registrations`
- `GET /api/admin/registrations/:id`
- `GET /api/admin/registrations/export`

## Testing

```bash
# Backend unit/integration tests
cd backend && npm test

# Frontend unit/component tests
cd frontend && npm test

# Playwright smoke tests (apps must be running)
cd frontend && npx playwright install chromium && npm run test:e2e
```

## Production deployment

Suggested architecture:

- **Frontend**: Vercel / Netlify / static hosting behind same domain
- **Backend**: Render / Railway / any Node host
- **Database**: Managed PostgreSQL

### Backend deploy checklist

1. Set production env vars (`DATABASE_URL`, `SESSION_SECRET`, `CORS_ORIGIN`, `COOKIE_SECURE=true`, `TRUST_PROXY=true`, `NODE_ENV=production`).
2. Run `npx prisma migrate deploy`.
3. Run `npm run prisma:seed` once (with strong `ADMIN_PASSWORD`), then remove or rotate seed credentials.
4. Start with `npm run build && npm start`.
5. Confirm `GET /api/health` returns healthy.

### Deploy frontend on Netlify

Netlify only hosts the **frontend**. Requests to `https://your-site.netlify.app/api/...` will **404** — that is expected until the API is hosted elsewhere.

**Full steps:** see [DEPLOY.md](./DEPLOY.md) (Netlify + Render).

Summary:

1. Deploy the Express API on **Render** (not Netlify).
2. On Netlify set `VITE_API_BASE_URL=https://YOUR-RENDER-URL/api` and redeploy.
3. On Render set `CORS_ORIGIN=https://emergenttechnologies.netlify.app`, `COOKIE_SECURE=true`, `COOKIE_SAME_SITE=none`.

### Frontend deploy checklist

1. Set `VITE_API_BASE_URL` to the public API URL (for example `https://api.yourdomain.com/api`) **or** reverse-proxy `/api` to the backend on the same domain.
2. Build with `npm run build` and deploy `dist/`.
3. Ensure SPA fallback routes serve `index.html` for `/admin` and `/admin/dashboard`.

### Same-domain routing

Configure the reverse proxy so:

- `/` → frontend
- `/admin` and `/admin/*` → frontend SPA
- `/api/*` → backend

This keeps cookies first-party and simplifies CORS (`CORS_ORIGIN=https://yourdomain.com`).

### Security notes

- HTTPS required in production
- HTTP-only, Secure, SameSite cookies
- Helmet security headers
- Rate limits on registration and login
- Account lockout after repeated failed logins
- CSV export escapes formula injection characters
- Logs redact passwords, phone numbers, and addresses

## Database backup and recovery

### Backup

```bash
pg_dump "$DATABASE_URL" --format=custom --file=emergent-$(date +%F).dump
```

### Restore

```bash
pg_restore --clean --if-exists --dbname="$DATABASE_URL" emergent-YYYY-MM-DD.dump
```

Store dumps encrypted and off-host. Test restores periodically.

## Features implemented

- Responsive public site with sticky header, compact hero, swipeable work carousel
- Registration form with frontend + backend Zod validation and privacy consent
- UUID registration IDs persisted via Prisma (PostgreSQL)
- Secure admin login, logout, and session checks
- Dashboard stats, searchable/filterable/paginated table, detail view, CSV export
- Automated tests and deployment documentation

## Acceptance path

1. Register on the public form → receive a unique registration ID.
2. Confirm the record is saved in the database.
3. Sign in at `/admin` with seeded credentials.
4. View users on `/admin/dashboard`, search/filter, open details, export CSV.
