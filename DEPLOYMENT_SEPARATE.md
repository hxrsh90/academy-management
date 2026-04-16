# Separate Deployment Guide (Backend + Frontend)

This project is configured for **separate deployments** - backend and frontend are deployed as independent Vercel projects.

## Architecture

```
Backend API: academy-api.vercel.app
├── Express server
├── API endpoints
└── Neon database

Frontend: academy.vercel.app
├── React application
├── Static assets
└── Calls backend API
```

## Deployment URLs

| Environment | Backend URL | Frontend URL |
|-------------|-------------|--------------|
| Production | `academy-api.vercel.app` | `academy.vercel.app` |
| Staging | `academy-api-staging.vercel.app` | `academy-staging.vercel.app` |
| Development | `localhost:5001` | `localhost:3000` |

## Setup Steps

### 1. Create Two Vercel Projects

In Vercel Dashboard:

**Backend Project:**
1. Click "Add New Project"
2. Import GitHub repo: `hxrsh90/academy-management`
3. Project name: `academy-api`
4. Root directory: `/` (uses root vercel.json)
5. Set environment variables (see below)
6. Deploy

**Frontend Project:**
1. Click "Add New Project"
2. Import GitHub repo: `hxrsh90/academy-management`
3. Project name: `academy-frontend`
4. Root directory: `client/` (uses client/vercel.json)
5. Set environment variables (see below)
6. Deploy

### 2. Configure Environment Variables

#### Backend Environment Variables (Vercel → Settings → Environment Variables)

**Production (academy-api):**
```
DATABASE_URL=postgresql://.../neondb?sslmode=require
ALLOWED_ORIGINS=https://academy.vercel.app
CLIENT_URL=https://academy.vercel.app
NODE_ENV=production
JWT_SECRET=<strong-secret>
JWT_REFRESH_SECRET=<strong-secret>
```

**Staging (academy-api-staging):**
```
DATABASE_URL=postgresql://.../neondb-staging?sslmode=require
ALLOWED_ORIGINS=https://academy-staging.vercel.app
CLIENT_URL=https://academy-staging.vercel.app
NODE_ENV=staging
JWT_SECRET=<staging-secret>
JWT_REFRESH_SECRET=<staging-secret>
```

#### Frontend Environment Variables (Vercel → Settings → Environment Variables)

**Production (academy-frontend):**
```
REACT_APP_API_URL=https://academy-api.vercel.app/api/v1
```

**Staging (academy-frontend-staging):**
```
REACT_APP_API_URL=https://academy-api-staging.vercel.app/api/v1
```

### 3. Configure Neon Database Branches

Create Neon branches for each environment:

1. Go to [Neon Dashboard](https://console.neon.tech)
2. Select your project
3. Create branches:
   - `neondb` (main) - for production
   - `neondb-staging` - for staging
   - `neondb-dev` - for local development

4. Update connection strings in Vercel environment variables

### 4. Run Database Migrations

For each environment, run migrations against the corresponding Neon branch:

```bash
# Production
DATABASE_URL=postgresql://.../neondb npm run db:migrate

# Staging
DATABASE_URL=postgresql://.../neondb-staging npm run db:migrate

# Local Dev
DATABASE_URL=postgresql://.../neondb-dev npm run db:migrate
```

## Local Development

### Setup

```bash
# Use dev environment
cp .env.dev .env

# Use frontend dev environment
cd client
cp .env.development .env
cd ..

# Install dependencies
npm install
cd client && npm install && cd ..

# Run migrations
npm run db:migrate
npm run db:seed

# Start both backend and frontend
npm run dev:full
```

### Development Workflow

1. **Backend**: Runs on `http://localhost:5001`
2. **Frontend**: Runs on `http://localhost:3000`
3. **Frontend calls backend**: Via proxy or environment variable

## Deployment Workflow

### Deploy Backend

```bash
# Make changes to backend code
git add .
git commit -m "Update backend"
git push origin main

# Vercel auto-deploys backend to academy-api.vercel.app
```

### Deploy Frontend

```bash
# Make changes to frontend code
git add .
git commit -m "Update frontend"
git push origin main

# Vercel auto-deploys frontend to academy-frontend.vercel.app
```

### Deploy Both Together

```bash
# Make changes to both
git add .
git commit -m "Update both backend and frontend"
git push origin main

# Both projects auto-deploy independently
```

## CORS Configuration

Backend is configured to allow requests from specific origins:

- **Development**: `http://localhost:3000`
- **Staging**: `https://academy-staging.vercel.app`
- **Production**: `https://academy.vercel.app`

To add more origins, update `ALLOWED_ORIGINS` in environment variables (comma-separated):
```
ALLOWED_ORIGINS=https://academy.vercel.app,https://academy-staging.vercel.app,http://localhost:3000
```

## Benefits of Separate Deployments

✅ **No cold starts** - Backend always running
✅ **Independent scaling** - Scale backend separately from frontend
✅ **Separate deployments** - Deploy backend without redeploying frontend
✅ **Better performance** - Consistent API response times
✅ **Future-proof** - Can add real-time features (WebSockets)
✅ **Flexibility** - Can move backend to different hosting provider

## Troubleshooting

### CORS Errors

If you see CORS errors in browser console:
1. Check `ALLOWED_ORIGINS` in backend environment variables
2. Ensure frontend URL is in the allowed origins list
3. Restart backend after updating environment variables

### API Connection Failed

If frontend can't connect to backend:
1. Check `REACT_APP_API_URL` in frontend environment variables
2. Verify backend is deployed and accessible
3. Check backend logs in Vercel dashboard

### Database Connection Failed

If backend can't connect to database:
1. Verify `DATABASE_URL` is correct for the environment
2. Ensure Neon database branch exists
3. Check Neon dashboard for connection issues

## Migration from Monorepo

If you previously had both in one project:

1. Create new Vercel project for frontend
2. Move `client/vercel.json` configuration
3. Set `REACT_APP_API_URL` environment variable
4. Delete old combined vercel.json from root
5. Deploy both projects separately
