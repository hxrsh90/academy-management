# Development Workflow Guide

## Branching Strategy

```
main (production)
  ↑
staging (pre-production)
  ↑
dev (development)
```

## Git Branches

| Branch | Purpose | Deployment |
|--------|---------|------------|
| `main` | Production code | Vercel Production |
| `staging` | Pre-production testing | Vercel Staging |
| `dev` | Daily development | Vercel Preview + Local |

## Neon Database Branches

| Neon Branch | Environment | Connection String |
|-------------|-------------|-------------------|
| `neondb` | Production | `.env.production` |
| `neondb-staging` | Staging | `.env.staging` |
| `neondb-dev` | Development | `.env.dev` |

## Environment Setup

### Local Development

```bash
# Copy dev environment file
cp .env.dev .env

# Install dependencies
npm install
cd client && npm install && cd ..

# Run migrations against dev DB
npm run db:migrate
npm run db:seed

# Start development server
npm run dev:full
```

### Switching Environments

```bash
# To use dev environment
cp .env.dev .env

# To use staging environment (for testing staging DB locally)
cp .env.staging .env

# To use production environment (NOT recommended locally)
cp .env.production .env
```

## Development Workflow

### 1. Feature Development

```bash
# Switch to dev branch
git checkout dev

# Create feature branch
git checkout -b feature/student-progress

# Make changes
# ... code changes ...

# Test locally
npm run dev:full

# Commit changes
git add .
git commit -m "Feature: add student progress tracking"

# Push feature branch
git push origin feature/student-progress

# Create PR to dev branch
```

### 2. Deploy to Staging

```bash
# Merge feature to dev
git checkout dev
git merge feature/student-progress
git push origin dev

# Vercel auto-deploys dev branch to staging URL
# Test on staging URL

# If tests pass, merge to staging
git checkout staging
git merge dev
git push origin staging
```

### 3. Deploy to Production

```bash
# After staging testing passes
git checkout main
git merge staging
git push origin main

# Vercel auto-deploys main branch to production
```

## Neon Database Management

### Creating Neon Branches

1. Go to [Neon Dashboard](https://console.neon.tech)
2. Select your project
3. Click "Branches" → "Create Branch"
4. Create `dev` branch (copy from `main`)
5. Create `staging` branch (copy from `main`)
6. Update connection strings in `.env.dev`, `.env.staging`, `.env.production`

### Running Migrations

```bash
# Against dev database (local)
DATABASE_URL=... npm run db:migrate

# Against staging database
DATABASE_URL=... npm run db:migrate

# Against production database
DATABASE_URL=... npm run db:migrate
```

### Resetting Dev Database

```bash
# In Neon Dashboard:
# 1. Delete neondb-dev branch
# 2. Recreate neondb-dev from main
# 3. Update .env.dev with new connection string
# 4. Run migrations
npm run db:migrate
npm run db:seed
```

## Vercel Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

### Production (main branch)
```
DATABASE_URL=postgresql://.../neondb?sslmode=require
JWT_SECRET=<strong-production-secret>
JWT_REFRESH_SECRET=<strong-production-secret>
CLIENT_URL=https://academy.vercel.app
NODE_ENV=production
```

### Staging (staging branch)
```
DATABASE_URL=postgresql://.../neondb-staging?sslmode=require
JWT_SECRET=<staging-secret>
JWT_REFRESH_SECRET=<staging-secret>
CLIENT_URL=https://academy-staging.vercel.app
NODE_ENV=staging
```

### Preview (dev branch)
```
DATABASE_URL=postgresql://.../neondb-dev?sslmode=require
JWT_SECRET=<dev-secret>
JWT_REFRESH_SECRET=<dev-secret>
CLIENT_URL=https://academy-dev.vercel.app
NODE_ENV=development
```

## Quick Reference

### Commands

| Command | Purpose |
|---------|---------|
| `git checkout dev` | Switch to dev branch |
| `git checkout staging` | Switch to staging branch |
| `git checkout main` | Switch to main branch |
| `git merge dev` | Merge dev into current branch |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with initial data |
| `npm run dev` | Start backend dev server |
| `npm run dev:full` | Start backend + frontend |

### URLs

| Environment | URL |
|-------------|-----|
| Local | http://localhost:3000 |
| Staging | https://academy-staging.vercel.app |
| Production | https://academy.vercel.app |

## Best Practices

1. **Never commit secrets** - Use environment variables
2. **Test on staging first** - Always test on staging before production
3. **Use feature branches** - Create branches for each feature
4. **Reset dev DB regularly** - Keep dev data clean
5. **Run migrations locally first** - Test migrations on dev DB
6. **Review PRs** - Have someone review before merging to main
7. **Tag releases** - Use git tags for production releases
