import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-20">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-lg font-semibold">Unstuck</p>
          <div className="flex gap-4 text-sm font-medium">
            <Link href="/login" className="text-accent hover:underline">
              Sign in
            </Link>
            <Link
              href="/app"
              className="rounded-lg bg-accent px-4 py-2 text-white hover:bg-accent-hover"
            >
              Go to app
            </Link>
          </div>
        </header>

        <section className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            Hope-forward coaching
          </p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Learn AI with confidence—and clarify the work you want next.
          </h1>
          <p className="max-w-2xl text-lg text-muted">
            Guided paths keep you moving. Open chat lets you wander. Your
            profile grows with you—not in the shadows.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login?next=/app/paths"
              className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              Start a path
            </Link>
            <Link
              href="/login?next=/app/chat"
              className="rounded-lg border border-border px-5 py-3 text-sm font-semibold hover:border-accent"
            >
              Jump into chat
            </Link>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <p className="text-sm font-semibold text-success">Guided paths</p>
            <p className="mt-2 text-sm text-muted">
              Small wins first, always with escape hatches to free-form chat.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <p className="text-sm font-semibold text-accent">About you</p>
            <p className="mt-2 text-sm text-muted">
              A visible profile artifact—you confirm what gets remembered.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <p className="text-sm font-semibold text-warm">Plus</p>
            <p className="mt-2 text-sm text-muted">
              Stripe-ready subscription for deeper career arcs when you are.
            </p>
          </div>
        </section>

        <footer className="border-t border-border pt-8 text-xs text-muted">
          Unstuck supports learning and career exploration—not therapy. If you
          are in crisis, call your local emergency number (988 in the U.S.).
        </footer>
      </div>
    </div>
  );
}
