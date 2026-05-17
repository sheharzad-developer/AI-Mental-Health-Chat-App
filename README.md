# AuraAi — AI Mental Wellness Companion

A calm, judgment-free space to share what you're feeling. AuraAi pairs an emotionally intelligent AI companion with a peer community room and licensed-therapist bookings, so users can move from a quick check-in to real human support when they're ready.

> Not a substitute for professional care. AuraAi provides emotional support and wellness guidance — it does not diagnose, prescribe, or replace therapy.

## Features

- **AI Wellness Chat** — A premium companion built on a safety-first system prompt with crisis-language detection and graceful escalation.
- **Multi-model AI** — Pluggable across Google Gemini, Anthropic Claude, and OpenAI.
- **Community Room** — A shared space for peer support.
- **Therapist Bookings** — Browse licensed doctors and book sessions.
- **Auth** — Email/password and OAuth via NextAuth v5.
- **Subscriptions** — Stripe-powered upgrade flow with checkout, success, and cancel pages.
- **Persistent Chats** — Per-user chat history stored in Supabase with a sidebar for navigating past conversations.
- **Crisis Safety Layer** — Detects high-risk language and surfaces appropriate resources.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Auth**: NextAuth v5 (beta)
- **Database**: Supabase (Postgres)
- **AI**: `@google/generative-ai`, `@anthropic-ai/sdk`, `openai`
- **Payments**: Stripe
- **Runtime**: Node.js (Express side server for Stripe webhooks)

## Project Structure

```
app/
  actions/            # Server actions (auth, etc.)
  api/
    auth/[...nextauth]   # NextAuth route handlers
    chat/route.ts        # AI chat endpoint
    stripe/              # Checkout session creation
  bookings/           # Therapist booking pages
  chat/               # Main chat experience
  community/          # Community room
  doctors/            # Doctor directory
  pricing/            # Plans and upgrade
  success/ cancel/    # Stripe redirect targets
  page.tsx            # Landing page
  layout.tsx          # Root layout
components/
  AppHeader.tsx
  AuthForm.tsx
  ChatSidebar.tsx
  CommunityRoom.tsx
  UpgradeButton.tsx
  WellnessChat.tsx
lib/
  chats.ts                  # Chat persistence
  crisis.ts                 # Crisis keyword detection
  gemini-chat.ts            # Gemini integration
  stripe.ts                 # Stripe helpers
  supabase.ts               # Supabase client
  users.ts                  # User data access
  wellness-system-prompt.ts # AI persona & safety rules
scripts/
  generate-training-data.mjs
  topics.mjs
server.js             # Express server for Stripe
auth.ts               # NextAuth config
proxy.ts              # Local dev proxy
*.sql                 # Schema for users, chats, doctors, bookings
training-data/        # Generated training samples
```

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project
- API keys for at least one model provider (Gemini, Anthropic, or OpenAI)
- A Stripe account (test mode is fine for local dev)

### 1. Install

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
# Next.js / Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-long-random-string

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# AI providers (provide at least one)
GOOGLE_GENERATIVE_AI_API_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Set up the database

Apply the SQL schemas to your Supabase project (Supabase SQL editor or `psql`):

```bash
# Run in order
users.sql
chats.sql
doctors.sql
bookings.sql
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. (Optional) Run the Stripe server

The Stripe webhook handler runs as a separate Node process:

```bash
npm run stripe-server
```

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint with ESLint |
| `npm run stripe-server` | Start the local Stripe webhook server |
| `npm run generate-data` | Generate training-data samples (uses `.env`) |

## Safety & Crisis Handling

`lib/crisis.ts` scans messages for high-risk language. The wellness system prompt in `lib/wellness-system-prompt.ts` enforces:

- No diagnosis, medication, or medical advice
- Active-listening tone with reflection over prescription
- Escalation to professional or emergency resources when risk is detected

If you fork this project, review both files before deploying — these guardrails are the difference between a helpful companion and a harmful one.

## Deployment

The app deploys cleanly to [Vercel](https://vercel.com). Remember to:

1. Set every environment variable above in your Vercel project.
2. Host the Stripe webhook server separately (Fly, Render, Railway, or a serverless function) and point Stripe's webhook to it.
3. Run the SQL migrations against your production Supabase project.

## License

Private project. All rights reserved unless a `LICENSE` file is added.
