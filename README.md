# Verdict ⚖️ — Brutally Honest AI Startup Idea Validator

> Get instant, unfiltered, investor-grade analysis on your startup ideas before spending months building something nobody wants.

[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vitejs.dev)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express)](https://expressjs.com)
[![Gemini](https://img.shields.io/badge/Google-Gemini%202.5-8E75B2?logo=google)](https://deepmind.google/technologies/gemini/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk)](https://clerk.com)
[![PostgreSQL](https://img.shields.io/badge/Database-Neon%20Postgres-00E599?logo=postgresql)](https://neon.tech)
[![Drizzle](https://img.shields.io/badge/ORM-Drizzle-C5F74F?logo=drizzle)](https://orm.drizzle.team)

---

## 📸 Previews & Screenshots

> *Placeholder sections ready for product screenshots and demo captures.*

### 1. Landing Page & Idea Input
<!-- ================================================================= -->
<!-- PREVIEW PLACEHOLDER: HERO & PROMPT INPUT                          -->
<!-- Replace this block with your screenshot: ![Hero Preview](path/to/img) -->
```text
+-------------------------------------------------------------------------+
|  [Logo] Verdict                     [Roast Mode: OFF]    [User Profile] |
|                                                                         |
|                Stop Building Ideas Nobody Wants.                        |
|        Get brutally honest, investor-grade feedback in seconds.         |
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   | Enter your startup idea in plain English...                     |   |
|   | "Uber for dog walkers with autonomous AI scheduling..."         |   |
|   +-----------------------------------------------------------------+   |
|                                                                         |
|                     [  ⚡ Get My Verdict  ]                             |
+-------------------------------------------------------------------------+
```
*(Insert your screenshot of the landing page hero and input box here)*

---

### 2. Real-Time Gemini AI Verdict Analysis
<!-- ================================================================= -->
<!-- PREVIEW PLACEHOLDER: 5-PART VERDICT RESULT                        -->
<!-- Replace this block with your screenshot: ![Verdict Preview](path) -->
```text
+-------------------------------------------------------------------------+
|  Verdict Score:  4.2 / 10  [High Risk / Crowded Market]                 |
|                                                                         |
|  1. Score Reason        Detailed critique on retention & economics      |
|  2. Target Customer     Hyper-specific ICP and willingness to pay      |
|  3. Biggest Risk        Customer acquisition cost & churn dynamics     |
|  4. Competitor Landscape Existing incumbents and indirect alternatives  |
|  5. 10x Pivot Move      The non-obvious angle that could make it work   |
+-------------------------------------------------------------------------+
```
*(Insert your screenshot of the comprehensive 5-section verdict breakdown here)*

---

### 3. Roast Mode Activated 🔥
<!-- ================================================================= -->
<!-- PREVIEW PLACEHOLDER: ROAST MODE COMPARISON                        -->
<!-- Replace this block with your screenshot: ![Roast Preview](path)   -->
```text
+-------------------------------------------------------------------------+
|  🔥 ROAST MODE ACTIVE                                                   |
|  "Your biggest threat isn't the competition. It's that nobody actually  |
|   wakes up in the morning wishing they had an AI-powered dog collar."   |
+-------------------------------------------------------------------------+
```
*(Insert your screenshot showing Roast Mode toggle active with witty commentary)*

---

### 4. User Idea History (Per-User Isolation)
<!-- ================================================================= -->
<!-- PREVIEW PLACEHOLDER: HISTORY PAGE                                 -->
<!-- Replace this block with your screenshot: ![History Preview](path) -->
```text
+-------------------------------------------------------------------------+
|  Your Verdict History                                                   |
|  ---------------------------------------------------------------------  |
|  • "AI Newsletter Curator"          7.8/10   Yesterday, 4:12 PM  [View] |
|  • "B2B SaaS for Construction"      8.5/10   3 days ago          [View] |
|  • "Decentralized Pet Food"         2.1/10   Last week           [View] |
+-------------------------------------------------------------------------+
```
*(Insert your screenshot of the authenticated idea history dashboard here)*

---

### 5. Public Shareable Verdict Links
<!-- ================================================================= -->
<!-- PREVIEW PLACEHOLDER: PUBLIC SHARE LINK & MODAL                    -->
<!-- Replace this block with your screenshot: ![Share Preview](path)   -->
```text
+-------------------------------------------------------------------------+
|  Share this Verdict:  https://verdict.app/share/xK9zL2p                  |
|  [ Copy Share Link ] - Anyone with this link can view this verdict      |
|  without signing in. Powered by Neon PostgreSQL + Drizzle ORM.          |
+-------------------------------------------------------------------------+
```
*(Insert your screenshot of the public share modal and public result view here)*

---

## ⚡ Core Features

- **🤖 Google Gemini AI Engine**: Powered by Google's latest Gemini models via `@google/genai`, utilizing structured JSON schemas for rock-solid parsing and consistent analysis.
- **🔥 Roast Mode Toggle**: Switch between an analytical, professional critique and a direct, witty, no-BS reality check that roasts the *idea*, not the founder.
- **🔐 Frictionless Clerk Authentication**: Explore and draft ideas freely as a guest. Authenticate seamlessly with Clerk when generating verdicts and preserving personal history.
- **📜 Scoped User History**: Verdict evaluations are automatically cached in browser storage isolated strictly per Clerk user ID.
- **🔗 Cross-Device Public Sharing**: Publish any verdict into a permanent, read-only public URL (`/share/:shareId`) stored in Neon PostgreSQL and queryable without authentication.
- **🎨 Premium UI & Motion**: Built with React 19, Tailwind CSS, Lucide icons, and Framer Motion for smooth state transitions, responsive cards, and clean typography.
- **🚀 Dual Deployment Ready**: Single-command production build ready for both **Vercel** (Serverless functions) and **Render** (Node.js Web Service).

---

## 🛠️ Architecture & Monorepo Structure

Verdict is organized as a high-performance **pnpm monorepo**:

```
Verdict/
├── api/                           # Vercel Serverless Function entry point
│   ├── index.ts                   # Lambda handler exporting Express app
│   └── tsconfig.json              # Vercel TypeScript compiler config
├── artifacts/
│   ├── api-server/                # Express 5 backend service
│   │   ├── src/
│   │   │   ├── routes/            # /health, /api/verdict endpoints
│   │   │   ├── lib/               # Logger (pino), utilities
│   │   │   ├── app.ts             # Express app setup & SPA fallback
│   │   │   └── index.ts           # Server bootstrap & port listener
│   │   └── build.mjs              # esbuild production bundler
│   └── verdict/                   # React 19 + Vite 7 frontend application
│       ├── src/
│       │   ├── pages/             # Landing, History, Share views
│       │   ├── components/        # Verdict cards, modals, gauges
│       │   └── hooks/             # Query & state hooks
│       └── vite.config.ts         # Vite build & development proxy
├── lib/
│   ├── api-zod/                   # Shared Zod schemas & type contracts
│   └── db/                        # Neon PostgreSQL connection & Drizzle ORM schema
├── vercel.json                    # Single-project Vercel deployment rewrites
├── pnpm-workspace.yaml            # Monorepo workspace declarations & catalog
└── package.json                   # Root scripts (build, start, typecheck)
```

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 7, TypeScript, Tailwind CSS, Framer Motion, Wouter, Lucide Icons |
| **Backend** | Express 5, Node.js (ESM), `@clerk/express`, `@google/genai`, Pino HTTP |
| **Database** | Neon Serverless PostgreSQL, Drizzle ORM, Drizzle Kit |
| **Authentication** | Clerk (`@clerk/clerk-react`, `@clerk/express`) |
| **Validation** | Zod schemas shared across client and server |
| **Monorepo** | pnpm workspaces |
| **Deployment** | Vercel (Frontend CDN + Serverless Functions) / Render (Docker/Node) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or later (tested on Node v24)
- **pnpm**: `v9.x` or later (`npm install -g pnpm`)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/ankitchamke/Verdict.git
cd Verdict
pnpm install
```

### 2. Environment Variables

Create local `.env` files for both frontend and backend:

#### Frontend (`artifacts/verdict/.env`):
```ini
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
```

#### Backend (`artifacts/api-server/.env`):
```ini
PORT=5000
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require
```

### 3. Run Development Servers

Run the backend and frontend development servers:

**Terminal 1 — Backend API:**
```bash
pnpm --filter @workspace/api-server run dev
# Running on http://localhost:5000
```

**Terminal 2 — Frontend App:**
```bash
pnpm --filter @workspace/verdict run dev
# Running on http://localhost:3000 (proxies /api requests to :5000)
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Testing & Production Build

Verify all packages and TypeScript compilation:

```bash
# Typecheck all packages
pnpm run typecheck

# Build database, backend bundle, and frontend static files
pnpm run build

# Start production server (serves both API & Frontend on port 5000)
pnpm run start
```

---

## 🌐 Deployment

### Deploy to Vercel (Single Project)

1. Import the repository at **[vercel.com/new](https://vercel.com/new)**.
2. Select branch `buildathon`.
3. Framework Preset: `Other`.
4. Build command: `pnpm run build`
5. Output directory: `artifacts/verdict/dist/public`
6. Add the 5 Environment Variables:
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `GEMINI_API_KEY`
   - `DATABASE_URL`
7. Click **Deploy**.

---

## 📄 License

MIT © [Ankit Chamke](https://github.com/ankitchamke)
