# AGENTS.md - Deployment Platform

## Project Overview

This is a deployment platform similar to Vercel, with a backend API (Express + TypeScript + Prisma) and a frontend dashboard (React + Vite + Tailwind CSS).

## Architecture

- **API** (`api/`): Node.js/Express backend with RESTful endpoints
  - Auth via GitHub OAuth + JWT
  - Project CRUD operations
  - Deployment management
  - GitHub API integration
  - Simulated deployment engine

- **Dashboard** (`dashboard/`): React frontend
  - React Router v6 for routing
  - Context-based auth state management
  - Tailwind CSS for styling
  - Lucide React for icons
  - Axios for API calls

## Database Schema

Prisma schema lives in `api/prisma/schema.prisma`. Models:
- `User` - GitHub-authenticated users
- `Project` - Projects linked to GitHub repos
- `Deployment` - Deployment instances with status
- `DeploymentLog` - Build/deploy log entries

## Key Conventions

### Backend
- Express routes in `api/src/routes/`
- Services in `api/src/services/`
- Middleware in `api/middleware/`
- Auth middleware protects routes; uses Bearer token
- Prisma client at `api/src/prisma/client.ts`
- Run `npm run prisma:generate` after schema changes

### Frontend
- Components in `dashboard/src/components/`
- Pages in `dashboard/src/pages/`
- Services/API clients in `dashboard/src/services/`
- Shared types in `dashboard/src/types.ts`
- Auth context in `dashboard/src/stores/authContext.tsx`
- All authenticated pages are wrapped in Layout component with navigation

## Commands

| Task | Command |
|------|---------|
| Install backend deps | `cd api && npm install` |
| Start backend | `cd api && npm run dev` |
| Migrate DB | `cd api && npm run prisma:push` |
| Backend lint | `cd api && npm run lint` |
| Backend typecheck | `cd api && npm run typecheck` |
| Install frontend deps | `cd dashboard && npm install` |
| Start frontend | `cd dashboard && npm run dev` |
| Frontend lint | `cd dashboard && npm run lint` |
| Frontend typecheck | `cd dashboard && npm run typecheck` |

## Environment Variables

### Backend (.env)
- `DATABASE_URL` - SQLite database URL
- `JWT_SECRET` - JWT signing secret
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` - GitHub OAuth credentials
- `FRONTEND_URL` - Frontend URL for redirects
- `PORT` - API port (default: 3001)

### Frontend (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_GITHUB_CLIENT_ID` - GitHub OAuth client ID
