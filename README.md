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

Local development uses **SQLite** (no Docker/PostgreSQL required). For production you can point `DATABASE_URL` at managed PostgreSQL after adapting the Prisma provider if desired.

## Quick start (local)

No Docker required. The local database is a SQLite file.

### 1. Open the project folder

```bash
cd emergent
```

### 2. Install and initialize

```bash
npm --prefix backend install
npm --prefix frontend install
copy .env.example .env
cd backend
npx prisma migrate dev --name init
npm run prisma:seed
cd ..
```

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

On first login the admin **must** change this password before the dashboard is available.

## Environment variables

Copy `.env.example` to `.env` and set values for your environment.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | API port (default `4000`) |
| `CORS_ORIGIN` | Allowed frontend origin |
| `SESSION_SECRET` | Long random secret for signing sessions |
| `COOKIE_SECURE` | `true` in production (HTTPS) |
| `TRUST_PROXY` | `true` behind reverse proxies / PaaS |
| `SESSION_MAX_AGE_MS` | Session lifetime |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Used **only** by the seed script |
| `VITE_API_BASE_URL` | Frontend API base (use `/api` with Vite proxy locally) |

Never commit real production secrets.

## Admin credentials and password change

1. Seed creates the initial admin from `ADMIN_USERNAME` / `ADMIN_PASSWORD`.
2. Password is stored as a **bcrypt** hash — never plaintext.
3. `mustChangePassword` is `true` after seeding.
4. First successful login redirects to `/admin/change-password`.
5. After a successful change, the admin can access `/admin/dashboard`.
6. Public admin registration is not available.

For production, set strong unique values in the hosting environment **before** running the seed, then rotate immediately after first login.

## API overview

### Public

- `POST /api/registrations` — create registration
- `GET /api/health` — health check

### Auth

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/me`
- `POST /api/admin/change-password`

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
- UUID registration IDs persisted in PostgreSQL via Prisma
- Secure admin login, logout, session checks, forced password change
- Dashboard stats, searchable/filterable/paginated table, detail view, CSV export
- Automated tests and deployment documentation

## Acceptance path

1. Register on the public form → receive a unique registration ID.
2. Confirm the record exists in PostgreSQL (`registrations` table).
3. Sign in at `/admin` with seeded credentials.
4. Change the initial password.
5. View users on `/admin/dashboard`, search/filter, open details, export CSV.

responsively across desktop and mobile devices.

  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
True
True
True
True

The full-stack Emergent Technologies app is in emergent/ — React + Express + Prisma/PostgreSQL, with registration, secure admin auth, and dashboard.

What's included
Area	Details
Public site
Sticky header, ~200px hero, swipeable work carousel, registration form
Registration
Zod validation (front + back), UUID IDs, privacy consent, copyable success ID
Admin
/admin login, forced first password change, /admin/dashboard
Dashboard
Stats, search/filter/sort/pagination, detail view, CSV export (formula-safe)
Security
bcrypt hashes, HTTP-only sessions, Helmet, CORS, rate limits, lockout, CSRF origin checks, redacted logs
Docs
.env.example, README.md, docker-compose.yml
Setup (needs PostgreSQL)
Docker wasn't available on this machine, so start Postgres first (Docker Desktop recommended):

cd emergent
cp .env.example .env
docker compose up -d
cd backend
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run dev
# new terminal
cd frontend
npm install
npm run dev
Site: http://localhost:5173
Admin: http://localhost:5173/admin
Bootstrap: Emergent / Password1 (must change on first login)
Test results
Backend: 11 passed
Frontend: 12 passed
Production builds for both succeed
Project layout
emergent/
├── frontend/     # React + Vite + Tailwind
├── backend/      # Express + Prisma API
├── docker-compose.yml
├── .env.example
└── README.md     # local + production deployment guide
After Docker is installed, run the commands above and you can register a user, see the UUID, log into admin, and manage exports end-to-end.



That background step failed earlier for two reasons: Docker wasn’t installed (so Postgres couldn’t start), and the Prisma CLI was on an unusable RC (later pinned to stable 5.22).

The app itself is still in good shape — installs, builds, and unit tests already passed. To run the full stack locally, install Docker Desktop (or another PostgreSQL 16 instance), then:

cd emergent
docker compose up -d
cd backend
npx prisma migrate deploy
npm run prisma:seed