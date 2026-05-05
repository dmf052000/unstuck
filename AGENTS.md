# Unstuck — agent notes

- **Stack:** Next.js 16 App Router (Vercel), Tailwind v4 tokens, Supabase (Auth + Postgres + RLS), Stripe Checkout + webhooks.
- **Theme:** Hope-forward palette lives in `app/globals.css` (CSS variables + `@theme inline`).
- **Content paths:** `content/paths/*.ts` + registry `lib/paths.ts`.
- **Milestones:** B0 scaffold ✅ → Supabase schema (`supabase/migrations/…`) → Auth (`/login`, `/auth/callback`) → Stripe (`app/app/billing`, `/api/stripe/webhook`) → Journeys (`/app/journey/[pathId]`) → Assist (`/api/assist`, `lib/agent.ts`).
- **Secrets:** Never commit real keys. Copy `.env.example` → `.env.local`. Service role + Stripe secrets are **server-only**.
- **Supabase project used for MCP bootstrap:** ref `zjifbgkjtjpnoabfxcft` (empty DB before migration). Replace with your own project ref as needed.
- **Redirect URLs:** In Supabase Auth settings, add `http://localhost:3000/auth/callback` and production `https://<domain>/auth/callback`.
