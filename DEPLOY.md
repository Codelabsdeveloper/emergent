# Deploy: Netlify frontend + Render Web Service + Render PostgreSQL

## Database

This app uses **PostgreSQL** (Prisma provider `postgresql`).

1. In Render: **New → PostgreSQL**
2. Name: `emergent-db` (any name)
3. Plan: Free (or Starter)
4. After create, copy **Internal Database URL**
5. On the Web Service, set:
   ```
   DATABASE_URL=<Internal Database URL from Render Postgres>
   ```
   Prefer **Internal** URL when the API and DB are both on Render.

## Web Service

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Build Command | `npm install --include=dev && npx prisma generate && npm run build` |
| Start Command | `npm run start:render` |
| Health Check Path | `/api/health` |

### Required env vars on the Web Service

```
NODE_ENV=production
DATABASE_URL=<Render Postgres Internal URL>
CORS_ORIGIN=https://emergenttechnologies.netlify.app
SESSION_SECRET=<GENERATE_A_NEW_SECRET>
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
TRUST_PROXY=true
ADMIN_USERNAME=Emergent
ADMIN_PASSWORD=Password1
```

`start:render` marks the known-failed `20260920043000_init_postgresql` row as rolled back if needed, then runs `prisma migrate deploy` and seed.  
`prisma migrate deploy` applies committed migrations safely (does not reset data).  
`prisma:seed` upserts the admin user; if the admin already exists, the password is **not** changed.

### P3009: failed `20260920043000_init_postgresql`

If logs show `migrate found failed migrations` / `P3009`, an earlier deploy recorded that migration as failed (a UTF-8 BOM in the SQL). The current file is BOM-free; Prisma still refuses to continue until the failed row is cleared.

**Fix now (Render Shell on the web service):**

```bash
npx prisma migrate resolve --rolled-back 20260920043000_init_postgresql
npx prisma migrate deploy
npm run prisma:seed
```

Then **Manual Deploy** (or restart). After `start:render` is deployed, a restart is enough.

If resolve + deploy then errors that tables already exist, the SQL actually applied and only the bookkeeping failed. Use this instead of `--rolled-back`:

```bash
npx prisma migrate resolve --applied 20260920043000_init_postgresql
```

## Netlify

```
VITE_API_BASE_URL=https://emergent-api-vaiv.onrender.com/api
```

Then clear cache and redeploy.
