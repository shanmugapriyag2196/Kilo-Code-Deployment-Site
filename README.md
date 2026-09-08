# Deployment Platform

A deployment platform similar to Vercel, providing GitHub integration, project management, and deployment orchestration.

## Project Structure

```
deployment-platform/
├── api/           # Backend API (Express + TypeScript)
├── dashboard/     # Frontend Dashboard (React + Vite + Tailwind)
├── prisma/        # Database schema
├── .env           # Environment variables
└── AGENTS.md      # Development guidance
```

## Prerequisites

- Node.js >= 20
- npm >= 10
- Git

## Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd deployment-platform
```

### 2. Backend Setup

```bash
cd api
npm install
cp .env.example .env
# Update .env with your actual values
npm run prisma:push
npm run dev
```

The API will start on `http://localhost:3001`.

### 3. Frontend Setup

```bash
cd dashboard
npm install
cp .env.example .env
npm run dev
```

The dashboard will be available at `http://localhost:5173`.

## GitHub OAuth Setup

The dashboard uses GitHub OAuth with PKCE (Proof Key for Code Exchange) to authenticate users and access their GitHub data. This flow is handled entirely on the frontend — no backend is required.

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Set **Authorization callback URL** to your frontend URL, e.g. `http://localhost:5173`
4. Copy the **Client ID** (no client secret is needed with PKCE)
5. Paste it into `dashboard/.env` as `VITE_GITHUB_CLIENT_ID`
6. Set `VITE_GITHUB_REDIRECT_URI` to the same callback URL (e.g. `http://localhost:5173`)

Once configured, a **Connect with GitHub** button appears in the New Project modal and the sidebar. After connecting, the dashboard can fetch all commits (authenticated, 5000 req/hr rate limit) and display them as deployments.

## Development Commands

### Backend (api/)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema to database
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Frontend (dashboard/)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
