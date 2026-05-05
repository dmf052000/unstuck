import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listPaths } from "@/lib/paths";

export default async function PathsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("entitlement_tier")
        .eq("id", user.id)
        .single()
    : { data: null };

  const tier = profile?.entitlement_tier ?? "free";
  const paths = listPaths();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Choose a path</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Paths are designed to create momentum. You can pause anytime and pick
          up where you left off.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {paths.map((p) => {
          const locked = p.requiresTier === "plus" && tier !== "plus";
          return (
            <div
              key={p.id}
              className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-semibold">{p.title}</h2>
                {p.requiresTier === "plus" ? (
                  <span className="rounded-full bg-warm/15 px-2 py-0.5 text-xs font-medium text-warm">
                    Plus
                  </span>
                ) : (
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                    Free
                  </span>
                )}
              </div>
              <p className="mt-2 flex-1 text-sm text-muted">{p.description}</p>
              <ul className="mt-3 space-y-1 text-xs text-muted">
                {p.outcomes.map((o) => (
                  <li key={o}>• {o}</li>
                ))}
              </ul>
              {locked ? (
                <Link
                  href="/app/billing"
                  className="mt-4 inline-flex items-center justify-center rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:border-accent"
                >
                  Unlock with Plus
                </Link>
              ) : (
                <Link
                  href={`/app/journey/${p.id}`}
                  className="mt-4 inline-flex items-center justify-center rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover"
                >
                  Start path
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
