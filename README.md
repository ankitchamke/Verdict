# Verdict ⚖️ — AI Startup Idea Validator

> Get instant, structured, investor-grade feedback on your startup idea — with an optional brutal-honesty mode.

[![Clerk Buildathon](https://img.shields.io/badge/Built%20for-Clerk%20Buildathon-6C47FF?style=flat&logo=clerk)](https://clerk.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vitejs.dev)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express)](https://expressjs.com)
[![Gemini](https://img.shields.io/badge/Google-Gemini%202.5-8E75B2?logo=google)](https://deepmind.google/technologies/gemini/)
[![PostgreSQL](https://img.shields.io/badge/Database-Neon%20Postgres-00E599?logo=postgresql)](https://neon.tech)
[![Drizzle](https://img.shields.io/badge/ORM-Drizzle-C5F74F?logo=drizzle)](https://orm.drizzle.team)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Verdict-D4FC34?style=for-the-badge&logo=vercel&logoColor=black&labelColor=161B26)](https://verdict-api-server-lyart.vercel.app)

🌐 [**Live Application:**](https://verdict-ankitchamke.vercel.app/)

---

## 📸 Previews & Screenshots

> Place your screenshots in `./attached_assets/` matching the filenames below.

### 1. Landing Page & Idea Input
![Landing Page](./attached_assets/preview-hero.png)

---

### 2. Real-Time Gemini AI Verdict Analysis
![Verdict Result](./attached_assets/preview-verdict.png)

---

### 3. Roast Mode Activated 🔥
![Roast Mode](./attached_assets/preview-roast.png)

---

### 4. Seamless Clerk Authentication & User Profile 🔐
![Clerk Authentication](./attached_assets/preview-auth.png)
![Clerk Authentication](./attached_assets/preview-auth2.png)

---

### 5. User Idea History (Scoped per Clerk User)
![Idea History](./attached_assets/preview-history.png)

---

### 6. Public Shareable Verdict Links
![Shareable Verdict](./attached_assets/preview-share.png)

---

## 🔐 How Clerk Powers Verdict

Built specifically for the **Clerk Buildathon**, Verdict demonstrates how **Clerk** enables frictionless onboarding while maintaining enterprise-grade full-stack security:

- **Progressive Disclosure & Zero-Friction Browsing**: Visitors can explore the landing page, view sample analyses, and draft startup ideas freely without an immediate login wall.
- **Just-in-Time Authentication**: When a user clicks **"Get my verdict"** or accesses **"History"**, Clerk’s modal sign-in (`<SignInButton mode="modal">`) triggers smoothly without losing their drafted idea.
- **Full-Stack Authentication Architecture**:
  - **Frontend (`@clerk/clerk-react`)**: Seamlessly manages user identity, session state, and UI gating using `<SignedIn>`, `<SignedOut>`, `useAuth()`, and `<UserButton />`.
  - **Backend (`@clerk/express`)**: The Express 5 backend validates session tokens via `clerkMiddleware()` and extracts authenticated credentials with `getAuth(req)` to protect the verdict generation endpoint (`/api/verdict/analyze`).
- **Per-User Multi-Tenant History Isolation**: Past evaluations and scores are strictly scoped to the authenticated user ID (`verdict-history-{userId}`), ensuring complete data privacy and cross-session persistence across devices.
- **Embedded Account Management**: Founders can view and manage their account details, security settings, and active sessions directly from the custom-styled `<UserButton />` in the navbar.

---

## 🤔 Why Not Just Use ChatGPT?

Fair question — anyone *can* open ChatGPT and write a custom prompt asking it to critically evaluate a startup idea. But in practice, almost nobody does it well or consistently:

- **No one writes the same prompt twice.** Ask ChatGPT "is this a good idea?" and you get a vague, agreeable answer. Getting a genuinely critical, structured response requires prompt engineering most people won't bother with.
- **Consistency matters.** Verdict runs every idea through the *same* fixed framework — Score, Target Customer, Biggest Risk, Competitor Landscape, and a 10x Pivot Move — every single time. That means results are comparable across ideas, not just a one-off chat response.
- **Zero setup, zero prompt engineering.** Paste your idea, get a verdict. No system prompts to write, no follow-up questions to ask ChatGPT to get it to actually be critical instead of encouraging.
- **Built for repeat use, not a single chat.** Every verdict is saved to your history, comparable over time, and shareable via a public link — none of which a raw ChatGPT conversation gives you.

---

## ⚡ Core Features

- **🤖 Google Gemini AI Engine**: Powered by Google's latest Gemini models via `@google/genai`, utilizing structured JSON schemas for rock-solid parsing and consistent analysis.
- **🔥 Roast Mode Toggle**: Switch between an analytical, professional critique and a direct, witty, no-BS reality check that roasts the *idea*, not the founder.
- **🔐 Clerk Authentication Suite**: Complete identity stack with modal sign-in, token verification, and session lifecycle management.
- **📜 Scoped User History**: Verdict evaluations are automatically cached in browser storage isolated strictly per Clerk user ID (`verdict-history-{userId}`).
- **🔗 Cross-Device Public Sharing**: Publish any verdict into a permanent, read-only public URL (`/share/:shareId`) stored in Neon PostgreSQL and queryable without signing in.
- **🎨 Premium UI & Motion**: Built with React 19, Tailwind CSS, Lucide icons, and Framer Motion for smooth state transitions, responsive cards, and clean typography.
- **🚀 Dual Deployment Ready**: Single-command production build ready for both **Vercel** (Serverless functions) and **Render** (Node.js Web Service).

---

## 🛠️ Architecture & Monorepo Structure

```
Verdict/
├── api/                           # Vercel Serverless Function entry point
│   ├── index.ts                   # Lambda handler exporting Express app
│   └── tsconfig.json              # Vercel TypeScript configuration
├── artifacts/
│   ├── api-server/                # Express 5 backend API
│   │   ├── src/routes/            # /health, /api/verdict endpoints
│   │   ├── src/app.ts             # Express app setup, Clerk middleware & SPA fallback
│   │   └── build.mjs              # esbuild production bundler
│   └── verdict/                   # React 19 + Vite 7 frontend application
│       ├── src/pages/             # Landing, History, Share views
│       ├── src/components/        # Verdict cards, ScoreRing, modals, Clerk UI
│       └── vite.config.ts         # Vite build configuration & dev proxy
├── attached_assets/               # Screenshots and asset directory
├── lib/
│   ├── api-zod/                   # Shared Zod validation schemas
│   └── db/                        # Neon PostgreSQL connection & Drizzle schema
├── vercel.json                    # Vercel single-project routing & rewrites
├── pnpm-workspace.yaml            # Monorepo workspace configuration
└── package.json                   # Root build & start scripts
```

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| **Authentication** | **Clerk** (`@clerk/clerk-react`, `@clerk/express`) |
| **Frontend** | React 19, Vite 7, TypeScript, Tailwind CSS, Framer Motion, Wouter, Lucide Icons |
| **Backend** | Express 5, Node.js (ESM), `@google/genai`, Pino HTTP |
| **Database** | Neon Serverless PostgreSQL, Drizzle ORM |
| **Validation** | Zod schemas shared across client and server |
| **Deployment** | Vercel (Frontend CDN + Serverless Functions) / Render (Web Service) |

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
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
```

#### Backend (`artifacts/api-server/.env`):
```ini
PORT=5000
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require
```

### 3. Run Development Servers

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

```bash
# Typecheck all packages
pnpm run typecheck

# Build database, backend bundle, and frontend static files
pnpm run build

# Start production server (serves both API & Frontend on port 5000)
pnpm run start
```

---

## 🌐 Deployment to Vercel

1. Import the repository at **[vercel.com/new](https://vercel.com/new)**.
2. Select your production branch (e.g. `main` or `buildathon`).
3. Framework Preset: `Other` (detected from `vercel.json`).
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
