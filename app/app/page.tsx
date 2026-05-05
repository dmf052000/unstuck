import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AppHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("about_me, entitlement_tier, profile_facts")
        .eq("id", user.id)
        .single()
    : { data: null };

  const tier = profile?.entitlement_tier ?? "free";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">You’re in.</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Unstuck helps you build AI confidence while staying honest about what
          you want next from work. Start with a guided path—then wander in open
          chat whenever you need.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/app/paths"
          className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:border-accent hover:shadow-md"
        >
          <p className="text-sm font-medium text-accent">Guided paths</p>
          <p className="mt-2 text-sm text-muted">
            Pick a focused arc with a clear outcome—progress saves automatically.
          </p>
        </Link>
        <Link
          href="/app/chat"
          className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:border-accent hover:shadow-md"
        >
          <p className="text-sm font-medium text-accent">Open chat</p>
          <p className="mt-2 text-sm text-muted">
            Go off-script with a coach that knows your saved profile facts.
          </p>
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm font-medium text-foreground">At a glance</p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted">
          <li>
            Plan: <span className="text-foreground">{tier}</span>
          </li>
          <li>
            Profile notes:{" "}
            <span className="text-foreground">
              {profile?.profile_facts
                ? Object.keys(profile.profile_facts as object).length
                : 0}{" "}
              keys saved
            </span>
          </li>
          <li>
            About me:{" "}
            <span className="text-foreground">
              {profile?.about_me ? "started" : "still blank"}
            </span>
          </li>
        </ul>
        <Link
          href="/app/profile"
          className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
        >
          Edit your profile →
        </Link>
      </div>

      <p className="text-xs text-muted">
        Unstuck is for learning and career exploration—not therapy. If you are
        in crisis, contact local emergency services or call/text 988 in the U.S.
      </p>
    </div>
  );
}
