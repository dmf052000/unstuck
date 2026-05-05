# Unstuck

Guided paths + open chat to build AI confidence and explore meaningful work. Stack: **Next.js 16** (App Router), **Supabase**, **Stripe**, **Vercel-ready**.

## Quick start

```bash
pnpm install
cp .env.example .env.local
```

Fill `.env.local` (see `.env.example`). Minimum for local UX: Supabase URL + anon key; optional: service role (webhooks/admin), Stripe, `OPENAI_API_KEY`.

```bash
pnpm dev
```

Health check: `GET /api/health`

## Supabase

1. Create a project (or use your existing ref).
2. Run SQL in `supabase/migrations/20260505000000_initial_unstuck.sql` if the DB is new.
3. **Authentication → URL configuration**: add redirect URLs  
   - `http://localhost:3000/auth/callback`  
   - `https://<your-production-domain>/auth/callback`
4. Enable **Email** (magic link) provider.

## Stripe (test mode)

1. Create a **Product** + recurring **Price** for “Plus”.
2. Set `STRIPE_PRICE_PLUS_MONTHLY` to that Price id.
3. Webhook endpoint: `https://<your-domain>/api/stripe/webhook`  
   Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Set `STRIPE_WEBHOOK_SECRET` from the webhook secret.

## Deploy (Vercel)

1. Import repo: `https://github.com/dmf052000/unstuck`
2. Add the same env vars as `.env.example` in the Vercel project (production + preview as needed).
3. Update Supabase redirect URLs and Stripe webhook URL to the production host.

## Conventions

- Auth proxy: root `proxy.ts` (replaces deprecated `middleware.ts` in Next.js 16).
- Path content: `content/paths/*.ts`, registry `lib/paths.ts`.
- Agent + safety: `lib/agent.ts`; HTTP entry: `app/api/assist/route.ts`.

See `AGENTS.md` for agent-oriented notes.
