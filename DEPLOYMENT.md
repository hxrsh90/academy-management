# Vercel + Neon Deployment Guide

## Current Deployment Status

- **GitHub Repository**: Private repo at `https://github.com/hxrsh90/academy-management` ✅
- **Vercel Configuration**: `vercel.json` configured for serverless deployment ✅
- **Neon DB Connection**: Configured for serverless with connection pooling ✅
- **Environment Variables**: Template in `.env.example`, needs production secrets ⚠️
- **Live Deployment**: Not yet deployed - needs Vercel project setup ⚠️

### Next Steps for Production Deployment
1. Create Vercel project and import GitHub repo
2. Link Neon database to Vercel (or add DATABASE_URL manually)
3. Set production environment variables in Vercel dashboard
4. Run database migrations against Neon DB
5. Push to trigger auto-deployment

## How Vercel + Neon Integration Works

When you connect your GitHub repo to Vercel and link a Neon database:

### 1. **Automatic Environment Variables**
Vercel automatically creates these environment variables when you link Neon:
```
DATABASE_URL=postgresql://username:password@host-pooler.neon.tech/database?sslmode=require
POSTGRES_URL=postgresql://username:password@host-pooler.neon.tech/database?sslmode=require
POSTGRES_PRISMA_URL=postgresql://username:password@host-pooler.neon.tech/database?sslmode=require&pgbouncer=true
```

The `-pooler` in the hostname means Neon uses connection pooling (PgBouncer), which is optimized for serverless.

### 2. **Auto-Deployment Flow**
```
GitHub Push → Vercel Build → Neon DB Connection → Live
```

Each serverless function gets the `DATABASE_URL` env var automatically.

### 3. **Connection Pooling**
Neon's pooler manages connections so you don't hit connection limits with Vercel's serverless functions.

## Setup Steps

### 1. Create Neon Project
1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy the connection string with **PgBouncer** (has `-pooler` in hostname)

### 2. Connect to Vercel
1. In Neon dashboard, click "Add to Vercel"
2. Select your Vercel project
3. Neon automatically adds `DATABASE_URL` to Vercel env vars

Or manually:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `DATABASE_URL` with value from Neon

### 3. Deploy
```bash
# Push to GitHub triggers auto-deploy
git push origin main
```

Vercel automatically:
- Detects Node.js project
- Runs `npm install`
- Uses `vercel.json` config
- Sets environment variables
- Deploys to edge network

## Environment Variables in Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

### Required:
```
DATABASE_URL=postgresql://...-pooler.neon.tech/...?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
```

### Optional:
```
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
```

## Database Migrations on Deploy

Since Vercel is serverless, you need to run migrations separately:

### Option 1: Local (Recommended)
```bash
# Run locally against Neon DB
npm run db:migrate
npm run db:seed
```

### Option 2: Build Script (Advanced)
Add to `vercel.json` build step (not recommended for production DBs):
```json
{
  "buildCommand": "npm run db:migrate && npm run build"
}
```

### Option 3: GitHub Actions
Create `.github/workflows/migrate.yml`:
```yaml
name: Database Migration
on:
  push:
    branches: [main]
jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run db:migrate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Important Notes

1. **Connection Pooling**: Neon provides PgBouncer automatically via the `-pooler` hostname
2. **Cold Starts**: First request may be slower (500ms-2s) due to DB connection
3. **Connection Limits**: Neon free tier: 10,000 connections/month
4. **SSL**: Always enabled for Neon, `ssl: { rejectUnauthorized: false }` handles self-signed certs
5. **File Uploads**: Use external storage (AWS S3/Cloudinary) since Vercel is ephemeral

## Troubleshooting

### "Connection terminated unexpectedly"
- This is normal in serverless; connection closes after idle
- Code already handles reconnection via `allowExitOnIdle: true`

### "Too many connections"
- Use the `-pooler` URL from Neon (has connection pooling)
- Check `max: 1` in database.js (already configured)

### Cold start delays
- First API call after deploy may be slower
- Subsequent calls are fast
- Consider Vercel's Edge Functions for critical paths

## Testing Production Connection

```bash
# Test locally with production DATABASE_URL
DATABASE_URL=postgresql://... npm run dev
```

Or check Vercel function logs in dashboard.
