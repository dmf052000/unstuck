# Unstuck — agent notes

- **Remote:** `https://github.com/dmf052000/unstuck.git` — default branch `main`.
- **Stack:** Next.js 16 App Router (Vercel), Tailwind v4 tokens, Supabase (Auth + Postgres + RLS), Stripe Checkout + webhooks.
- **Auth edge:** Root **`proxy.ts`** refreshes Supabase session and redirects unauthenticated `/app/*` to `/login`. Shared logic: `lib/supabase/middleware.ts` (`updateSession`).
- **Theme:** Hope-forward palette in `app/globals.css` (CSS variables + `@theme inline`).
- **Content paths:** `content/paths/*.ts` + registry `lib/paths.ts`.
- **Milestones:** Scaffold → Supabase schema (`supabase/migrations/…`) → Auth (`/login`, `/auth/callback`) → Stripe (`app/app/billing`, `/api/stripe/webhook`) → Journeys (`/app/journey/[pathId]`) → Assist (`/api/assist`, `lib/agent.ts`).
- **Secrets:** Never commit real keys. Copy `.env.example` → `.env.local`. Service role + Stripe secrets are **server-only**.
- **Supabase project used for MCP bootstrap:** ref `zjifbgkjtjpnoabfxcft` (empty DB before migration). Replace with your own project ref as needed.
- **Local auth bypass:** When `NODE_ENV=development` and `AUTH_BYPASS=true`, `/app` skips the login redirect and the app shell calls `signInAnonymously()` (enable **Anonymous** provider in Supabase). Never use in production.

<!-- BEGIN:nextjs-agent-rules -->
## Next.js note

Next 16 differs from older docs—check `node_modules/next` or https://nextjs.org/docs when conventions look unfamiliar.
<!-- END:nextjs-agent-rules -->
