# GradGuide Education Loan Assessment Engine

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A production-ready full-stack web application designed for students and educational loan counsellors to calculate education costs, bridge funding gaps, assess financial profiles and collateral security, dynamically match candidate profiles against the GradGuide lender database, and generate an explainable, non-guaranteed loan assessment report.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Source of Truth & Lender Dataset](#source-of-truth--lender-dataset)
3. [Architecture Overview](#architecture-overview)
4. [The Three Original Features](#the-three-original-features)
5. [Core Modules](#core-modules)
6. [Tech Stack](#tech-stack)
7. [Database Schema (Prisma ORM)](#database-schema-prisma-orm)
8. [Local Development Setup](#local-development-setup)
9. [Automated Testing](#automated-testing)
10. [Production Deployment Guide](#production-deployment-guide)
11. [API Reference Overview](#api-reference-overview)
12. [2-4 Minute Video Walkthrough Script](#2-4-minute-video-walkthrough-script)
13. [Key Architectural Decisions](#key-architectural-decisions)
14. [Known Limitations](#known-limitations)

---

## Project Overview

Financing higher education abroad is one of the largest financial commitments students and families undertake. However, students frequently face ambiguous underwriting rules, conflicting CIBIL requirements, opaque collateral margins, and hidden lender restrictions.

**EduFinSight** addresses these challenges by transforming the official **GradGuide Education Loan Process Guide** into an explainable, deterministic decision-support tool. It avoids arbitrary black-box scoring or fake loan approval promises, instead providing transparent eligibility criteria, dynamic funding gap calculations, and lender-specific document checklists.

---

## Source of Truth & Lender Dataset

All lender rules, interest rates, gender concessions, ranking prerequisites, and document requirements are dynamically seeded and retrieved from PostgreSQL (relational tables: `Lender` and `LenderCriteria`), never hard-coded in frontend components:

| Lender | Loan Type | Interest Rate | Concessions / Conditions | Min CIBIL | Required Documents |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Bank of India (BOI)** | Collateral | 9.00% | **Girls: 8.60%** (0.40% concession) | 670 | Basic + Academic + Salaried/Self-Employed + Property |
| **Bank of India (BOI)** | Non-Collateral | *Not Possible* | Explicitly not offered under this scheme | 670 | N/A |
| **Bank of Baroda (BOB)** | Collateral | Boys: 8.95%, Girls: 8.75% | Concession for female applicants | 700 | Basic + Academic + Salaried/Self-Employed + Property |
| **Bank of Baroda (BOB)** | Non-Collateral | 8.45% | **Strictly Top 100 Global Universities** | 700 | Basic + Academic + Salaried/Self-Employed |
| **State Bank of India (SBI)** | Collateral | 8.40% | Market-leading public bank rate | 750 | Basic + Academic + Salaried/Self-Employed + Property |
| **State Bank of India (SBI)** | Non-Collateral | 9.40% | **Strictly Top 100 Global Universities** | 750 | Basic + Academic + Salaried/Self-Employed |
| **HDFC Credila** | Collateral | 9.25% – 9.75% | Flexible NBFC spread based on profile | Flexible (NBFC) | Basic + Academic + Salaried/Self-Employed + Property |
| **HDFC Credila** | Non-Collateral | 10.75% | Fast processing unsecured route | Flexible (NBFC) | Basic + Academic + Salaried/Self-Employed |
| **Auxilo Finserve** | Collateral | 10.00% | Specialized education financing | Flexible (NBFC) | Basic + Academic + Salaried/Self-Employed + Property |
| **Auxilo Finserve** | Non-Collateral | 10.25% | Higher sanction caps without physical collateral | Flexible (NBFC) | Basic + Academic + Salaried/Self-Employed |

---

## Architecture Overview

EduFinSight is organized as a decoupled monorepo supporting separate cloud deployment:

```
gradguide-loan-assessment/
├── backend/                  # Express.js + TypeScript + Prisma Engine
│   ├── prisma/
│   │   ├── schema.prisma     # Complete relational models & enums
│   │   └── seed.ts           # Dynamic seeding of GradGuide lender reference data
│   ├── src/
│   │   ├── config/           # Database & JWT configuration
│   │   ├── controllers/      # REST API handlers (Auth, Study, Funding, Financials, Lenders, Assessment)
│   │   ├── data/             # Typed source-of-truth lender dataset
│   │   ├── middleware/       # JWT auth, role guard, Multer file upload & validation
│   │   ├── routes/           # Express router endpoints
│   │   ├── services/
│   │   │   ├── financialCalculations.ts   # Pure deterministic calculation functions
│   │   │   ├── financialCalculations.test.ts # Calculation test suite
│   │   │   ├── lenderMatching.ts          # Dynamic explainable matching engine
│   │   │   └── lenderMatching.test.ts     # Matching test suite
│   │   └── index.ts          # Server entry point, CORS, error handling
│   ├── uploads/              # Encrypted, access-controlled document repository
│   └── package.json
├── frontend/                 # React + Vite + TypeScript + Tailwind SPA
│   ├── src/
│   │   ├── components/       # Navbar, StatCard, PrintableReport
│   │   ├── context/          # AuthContext (JWT session persistence)
│   │   ├── pages/            # 11 Dedicated views (Dashboard, Study, Funding, Net Worth, Collateral, etc.)
│   │   ├── services/         # API client with VITE_API_URL production binding
│   │   ├── types.ts          # Typed models
│   │   ├── App.tsx           # Router and main layout
│   │   └── main.tsx
│   └── package.json
├── docs/                     # Detailed architectural specifications
│   ├── API_DOCUMENTATION.md  # Complete REST API reference
│   ├── DATABASE_SCHEMA.md    # Prisma schema and relationship diagrams
│   └── DEPLOYMENT_GUIDE.md   # Step-by-step Vercel + Render + Neon setup
├── .env.example              # Documented environment variable template
├── package.json              # Monorepo task orchestration
└── README.md
```

---

## The Three Original Features

### Original Feature #1: "Funding Gap Planner"
- **Purpose**: Gives students an interactive capital simulator to understand how each rupee of scholarship or savings shrinks their debt requirement.
- **Implementation**:
  - Interactive live sliders for *Scholarships*, *Personal Savings*, *Family Contribution*, and *Tuition Fees Already Paid*.
  - Visual stacked capital waterfall breakdown:
    $$\text{Study Cost} \longrightarrow (-) \text{Scholarship} \longrightarrow (-) \text{Savings} \longrightarrow (-) \text{Family Contrib} \longrightarrow (-) \text{Fees Paid} = \text{Remaining Gap} \longrightarrow \text{Loan Requirement}$$
  - Live indicative post-moratorium monthly EMI estimation preview.
  - "Apply Simulation to Profile" button to synchronize simulated funding back to the master database.

### Original Feature #2: "Financial Readiness Snapshot"
- **Purpose**: A multi-dimensional health check categorized into **Strong**, **Moderate**, or **Needs Attention** with transparent reasoning for every category.
- **Zero Fake Precision**: Strictly avoids arbitrary "credit scores" or fake approval percentages; instead provides explainable feedback across 5 dimensions:
  1. *Funding Coverage Cushion*: Evaluates self-funded share ($>35\%$ Strong, $15\text{--}35\%$ Moderate, $<15\%$ Needs Attention).
  2. *Net Worth Backing*: Compares household net worth against loan requirement ($>1.5\times$ Strong, $0.75\text{--}1.5\times$ Moderate, $<0.75\times$ Needs Attention).
  3. *Co-Applicant Cashflow & Debt Burden*: Analyzes Debt-to-Income (DTI) ratio ($\le 30\%$ Strong, $30\text{--}50\%$ Moderate, $>50\%$ Needs Attention).
  4. *Collateral Positioning*: Verifies whether pledged collateral covers $100\%$ of the loan.
  5. *Document Evidence*: Validates uploaded evidence count.
- Actionable recommendations tailored to the student's profile gaps.

### Original Feature #3: "Document Readiness Tracker"
- **Purpose**: Dynamic lender-specific document checklist that adapts based on the candidate's chosen financing route (collateral vs non-collateral) and targeted lender.
- **Implementation**:
  - Target lender switcher (SBI, BOB, BOI, HDFC Credila, Auxilo) and route switcher (Collateral / Non-Collateral).
  - Status indicators: `Not Uploaded` (Rose), `Under Review` (Amber), `Uploaded` (Emerald).
  - Calculates a **Document Readiness Percentage** based strictly on evidence collection completeness, with prominent notice that $100\%$ document readiness does not constitute loan sanction.

---

## Core Modules

1. **Authentication**: Register, login, session restoration, JWT tokens, bcrypt password hashing. Roles: Student & Counsellor.
2. **Dashboard**: High-level KPI cards for all 9 required metrics + Recharts visual funding breakdown and balance sheet.
3. **Study Details**: Program parameters, multi-currency converter (USD, EUR, GBP, CAD, AUD, INR) with transparent exchange formulas, and Top 100 global university verification.
4. **Funding Details**: Capture savings, scholarships, fees paid, family contribution; dynamically calculates Available Funding, Funding Gap, and Loan Requirement.
5. **Financial Profile**: Income details, interactive Assets table, Liabilities table, and dynamic Net Worth calculation ($\text{Net Worth} = \text{Total Assets} - \text{Total Liabilities}$).
6. **Collateral**: Pledgeable immovable property and liquid security; clearly distinguishes gross market value from available unencumbered collateral; tracks 30-year EC and municipal approved layout compliance.
7. **Document Management**: Safe file upload with Multer (MIME type check: PDF/JPG/PNG, 5MB limit, random UUID filenames, authorized streaming).
8. **Explainable Assessment Engine**: Evaluates profile against lender criteria; enforces non-guaranteed objective wording (*"Potentially relevant"*, *"Requires lender verification"*; never guarantees approval or definite rejection).
9. **Lender Comparison**: Sortable and filterable matrix of all 5 lenders, collateral vs non-collateral options, interest rate concessions, and required documents modal.
10. **Printable / Downloadable Assessment Report**: Publication-grade printable report with `@media print` clean layout, formal tables, and legal regulatory disclaimers.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide React |
| **Backend** | Node.js (v20+), Express.js, TypeScript, Multer, Bcrypt.js, JSON Web Tokens (JWT) |
| **Database** | PostgreSQL (Neon / Supabase / Local) |
| **ORM** | Prisma ORM (v5.22) with relational migrations and typed client |
| **Testing** | Vitest (fast, native TypeScript unit test runner) |
| **Deployment** | Vercel (Frontend), Render / Railway (Backend API), Neon (Serverless PostgreSQL) |

---

## Database Schema (Prisma ORM)

The relational schema includes models for:
- `User`
- `StudentProfile`
- `StudyPlan`
- `FundingSource`
- `FinancialProfile`
- `Asset`
- `Liability`
- `Collateral`
- `Document`
- `Lender`
- `LenderCriteria`
- `Assessment`
- `AssessmentLenderMatch`

👉 Detailed schema documentation and relationship diagrams are available in [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md).

---

## Local Development Setup

### Prerequisites
- Node.js (v18.x or v20.x recommended)
- npm (v9.x or v10.x)
- PostgreSQL database (or free [Neon.tech](https://neon.tech) connection string)

### 1. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd gradguide-loan-assessment

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables
Copy the template in both directories:

**Backend Configuration (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super_secure_jwt_secret_gradguide_2026_dev_key
CORS_ORIGIN=http://localhost:5173
UPLOAD_DIR=./uploads

# PostgreSQL connection (e.g. Neon, Supabase, or local Postgres)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/edufinsight?schema=public
```

**Frontend Configuration (`frontend/.env`):**
```env
# Leave blank for local Vite proxy, or set backend URL:
VITE_API_URL=http://localhost:5000/api
```

### 3. Initialize Database & Seed Lender Data
```bash
cd backend
npx prisma generate
npx prisma db push
npm run prisma:seed
```

### 4. Run Development Servers
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
# Server runs at http://localhost:5000
# Health check: http://localhost:5000/api/health
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# Client runs at http://localhost:5173
```

### 5. Reviewer Quick Access (Demo Credentials)
On the Login screen, click **"Fill Student Demo"** or **"Fill Counsellor"** to autofill credentials:
- **Student**: `student@gradguide.demo` / `password123`
- **Counsellor**: `counsellor@gradguide.demo` / `password123`

---

## Automated Testing

EduFinSight features unit tests covering the core financial calculation engine and lender matching rules:
- Total study cost multi-currency conversion
- Funding gap and loan requirement formulas
- Net worth (assets minus liabilities) calculations
- Available collateral vs property value calculations
- Girl student interest rate concessions (BOI 8.60%, BOB 8.75%)
- Top 100 university requirements (SBI & BOB non-collateral)
- CIBIL score cutoffs (SBI 750, BOB 700, BOI 670)
- Regulatory non-guarantee phrasing validation

Run tests in the backend directory:
```bash
cd backend
npm test
```

Test Results: **16 passing unit tests (100% pass rate)**.

---

## Production Deployment Guide

Deploying EduFinSight to production takes under 10 minutes:

1. **Database**: Create a free PostgreSQL instance on [Neon](https://neon.tech) and push the Prisma schema with `npx prisma db push && npm run prisma:seed`.
2. **Backend**: Deploy `backend/` to [Render](https://render.com) or Railway with environment variables `DATABASE_URL`, `JWT_SECRET`, and `CORS_ORIGIN`.
3. **Frontend**: Deploy `frontend/` to [Vercel](https://vercel.com) with environment variable `VITE_API_URL=https://your-backend.onrender.com/api`.

👉 Comprehensive step-by-step instructions are available in [`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md).

---

## API Reference Overview

The backend exposes clean REST endpoints:
- `POST /api/auth/register` & `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/study` & `POST /api/study`
- `GET /api/funding` & `POST /api/funding`
- `GET /api/financial-profile` & `POST /api/financial-profile`
- `POST /api/assets` & `DELETE /api/assets/:id`
- `POST /api/liabilities` & `DELETE /api/liabilities/:id`
- `GET /api/collateral` & `POST /api/collateral` & `DELETE /api/collateral/:id`
- `GET /api/documents` & `POST /api/documents/upload` & `DELETE /api/documents/:id`
- `GET /api/lenders` & `GET /api/lenders/:id`
- `POST /api/assessment` (Generates explainable assessment)
- `GET /api/assessment/latest`

👉 Full request and response payloads are documented in [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md).

---

## 2-4 Minute Video Walkthrough Script

A clear guide for recording the 2–4 minute video presentation:

1. **0:00 - 0:30 (Login & Architecture Overview)**:
   - Introduce GradGuide Education Loan Assessment Engine.
   - Click "Fill Student Demo" to demonstrate instant reviewer access.
   - Show Dashboard with the 9 core KPI cards and Recharts funding breakdown.
2. **0:30 - 1:00 (Study Details & Funding Gap)**:
   - Navigate to Study Details: Show currency conversion ($35,000 USD $\to$ ₹29.2L INR) and Top 100 global university toggle.
   - Navigate to Funding Details: Show live calculation:
     $$\text{Funding Gap} = \text{Total Study Cost} - \text{Available Funding}$$
3. **1:00 - 1:30 (Net Worth & Collateral Assessment)**:
   - Navigate to Net Worth: Show assets, liabilities, and live Net Worth calculation.
   - Navigate to Collateral: Explain the distinction between gross property market value and net available pledgeable security (with 30-year EC and approved layout checklist).
4. **1:30 - 2:15 (The Three Original Features)**:
   - **Feature #1 (Funding Gap Planner)**: Adjust the Scholarship and Savings sliders to see real-time waterfall changes and indicative EMI recalculation.
   - **Feature #2 (Financial Readiness Snapshot)**: Walk through Strong / Moderate / Needs Attention status and explain the "WHY" for each dimension.
   - **Feature #3 (Document Readiness Tracker)**: Switch between SBI and Credila to show dynamic lender-specific checklists and document readiness meter.
5. **2:15 - 3:00 (Assessment Engine & Printable Report)**:
   - Navigate to Assessment and click "Run Assessment Engine".
   - Highlight explainable matching (e.g. BOI girl student concession 8.60%, BOB 8.45% Top 100 check, SBI 750 CIBIL threshold).
   - Point out non-guaranteed wording and mandatory legal disclaimers.
   - Click "Print / Export PDF" to preview the formal institutional report.

---

## Key Architectural Decisions

1. **Dynamic Database Seeding vs Hardcoded Rules**:
   All lender criteria and interest rates are stored in relational database tables. When a lender updates their interest rate spread or CIBIL cutoffs, changes are made in PostgreSQL via migration/seed without refactoring application code.
2. **Deterministic Financial Calculation Engine**:
   All financial formulas are isolated in pure TypeScript functions with zero side effects. This enables complete test isolation (16 passing tests) and code reuse between frontend simulators and backend underwriting services.
3. **Safe File Handling**:
   Financial documents are stored with random UUID filenames outside the web root. File access requires JWT authentication, preventing unauthorized access to sensitive financial records.
4. **Non-Guarantee Regulatory Phrasing**:
   The engine strictly enforces objective, legally compliant language (*"Potentially relevant"*, *"Requires lender verification"*). It never makes false promises of guaranteed loan sanction.

---

## Known Limitations

1. **Live Forex Rates**: Currently uses configurable currency presets (USD: 83.5, EUR: 91.2, GBP: 108.0) with custom input capability. Integration with a live API (e.g. OpenExchangeRates) can be enabled in a future iteration.
2. **Third-Party CIBIL Bureau Integration**: CIBIL scores are entered by the candidate/counsellor for decision support. Formal bureau pull requires lender API integration and candidate consent.
3. **Automated Document OCR**: Uploaded documents serve as supporting preliminary evidence for completeness tracking; automated OCR parsing is not performed.

---

## License

ISC License • Developed as a hiring assignment for GradGuide.
