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
| Start Command | `npx prisma migrate deploy && npm run prisma:seed && npm start` |
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

`prisma migrate deploy` applies committed migrations safely (does not reset data).  
`prisma:seed` upserts the admin user; if the admin already exists, the password is **not** changed.

## Netlify

```
VITE_API_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com/api
```

Then clear cache and redeploy.
