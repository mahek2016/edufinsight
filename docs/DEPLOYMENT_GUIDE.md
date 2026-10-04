# EduFinSight Deployment Guide

Comprehensive instructions for deploying **EduFinSight** to production with separate frontend, backend, and PostgreSQL hosting.

---

## Architecture Deployment Topology

```
┌─────────────────────────────────┐
│     Vercel (Frontend SPA)       │
│     React + TypeScript + Vite   │
│     https://edufinsight.vercel.app
└───────────────┬─────────────────┘
                │ HTTPS API Calls (VITE_API_URL)
                ▼
┌─────────────────────────────────┐
│  Render / Railway (Backend API) │
│  Node.js + Express + Multer     │
│  https://edufinsight-api.onrender.com
└───────────────┬─────────────────┘
                │ Prisma Connection (DATABASE_URL)
                ▼
┌─────────────────────────────────┐
│ Neon / Supabase (PostgreSQL)    │
│ Managed Serverless PostgreSQL   │
└─────────────────────────────────┘
```

---

## 1. PostgreSQL Database Setup (Neon / Supabase)

### Option A: Neon Serverless PostgreSQL (Recommended & Instant)
1. Go to [neon.tech](https://neon.tech) and create a free account.
2. Click **Create Project** (Name: `edufinsight`, Postgres Version: 16).
3. Copy your Connection String:
   ```env
   DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-cool-sample.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```
4. In your local or deployment terminal, run the Prisma migration and seed:
   ```bash
   cd backend
   npx prisma db push
   npm run prisma:seed
   ```
   *Your PostgreSQL database is now fully initialized with the GradGuide source-of-truth lender dataset (BOI, BOB, SBI, Credila, Auxilo).*

---

## 2. Backend Deployment (Render / Railway)

### Deploying to Render
1. Push your repository to GitHub.
2. Go to [dashboard.render.com](https://dashboard.render.com) and click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Configure service settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run render-build
     ```
     *(Or: `npm install && npx prisma migrate deploy && npm run build`)*
     > [!IMPORTANT]
     > Ensure the Render "Build Command" field is completely cleared before pasting so Render's default `yarn install; yarn build` is not accidentally appended.
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Health Check Path**: `/api/health` (or `/health`)
5. Add Environment Variables under the **Environment** tab:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render will automatically bind or use PORT)
   - `DATABASE_URL`: `postgresql://neondb_owner:...@ep-...neon.tech/neondb?sslmode=require`
   - `JWT_SECRET`: `your_secure_jwt_secret_random_64_chars`
   - `CORS_ORIGIN`: `https://your-frontend.vercel.app` (or `*` during initial deployment)
   - `UPLOAD_DIR`: `./uploads`
6. Click **Deploy Web Service**.
7. Note down your backend URL (e.g., `https://edufinsight-api.onrender.com`).
8. Verify health endpoint: `https://edufinsight-api.onrender.com/api/health`.

---

## 3. Frontend Deployment (Vercel)

### Deploying to Vercel
1. Go to [vercel.com](https://vercel.com) and click **Add New** -> **Project**.
2. Select your repository.
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables:
   - `VITE_API_URL`: `https://edufinsight-api.onrender.com/api` (The URL of your deployed backend)
5. Click **Deploy**.
6. Once deployed, copy your production frontend URL (e.g., `https://edufinsight.vercel.app`).
7. Update the `CORS_ORIGIN` variable in your Render backend settings to match your Vercel domain.

---

## 4. Post-Deployment Verification Checklist

- [ ] Open production URL on mobile and desktop browsers.
- [ ] Register a new student account (`priya@example.com`).
- [ ] Log out and log back in to test JWT persistence.
- [ ] Complete **Study Details** form and verify base INR conversion.
- [ ] Complete **Funding Details** form and verify real-time loan gap computation.
- [ ] Add an asset and liability in **Net Worth** and verify balance sheet computation.
- [ ] Add a collateral property in **Collateral** and verify EC/OC compliance tags.
- [ ] Upload a PDF/PNG document in **Documents** (verify 5MB limit and MIME validation).
- [ ] Navigate to **Assessment** and click **Run Assessment Engine**.
- [ ] Verify dynamic lender matching against PostgreSQL (BOI girl concession 8.60%, BOB 8.45% Top 100 check, SBI 750 CIBIL threshold).
- [ ] Test the **Funding Gap Planner** interactive sliders and waterfall chart.
- [ ] Test the **Financial Readiness Snapshot** dimension-by-dimension explanations.
- [ ] Test the **Document Readiness Tracker** and verify document completion meter.
- [ ] Click **Print / Export PDF** in Assessment to verify clean print styling without UI artifacts.
