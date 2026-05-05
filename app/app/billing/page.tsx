import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { openPortal, startCheckout } from "./actions";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{
    success?: string;
    canceled?: string;
    required?: string;
    error?: string;
  }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select(
          "entitlement_tier, subscription_status, stripe_customer_id, current_period_end",
        )
        .eq("id", user.id)
        .single()
    : { data: null };

  const canPortal = Boolean(profile?.stripe_customer_id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-2 text-muted">
          Plus unlocks the deeper career pivot path. Test mode is fine for MVP
          demos.
        </p>
      </div>

      {sp.required === "plus" ? (
        <p className="rounded-lg border border-warm/40 bg-warm/10 px-4 py-3 text-sm text-foreground">
          That path requires Plus. Subscribe below to unlock it.
        </p>
      ) : null}
      {sp.success ? (
        <p className="rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
          Payment succeeded—your plan should update within a few seconds.
        </p>
      ) : null}
      {sp.canceled ? (
        <p className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
          Checkout canceled—no worries, you can try again anytime.
        </p>
      ) : null}
      {sp.error === "config" ? (
        <p className="rounded-lg border border-warm/40 bg-warm/10 px-4 py-3 text-sm">
          Billing is not configured yet. Add Stripe keys and{" "}
          <code className="font-mono">STRIPE_PRICE_PLUS_MONTHLY</code> to{" "}
          <code className="font-mono">.env.local</code>.
        </p>
      ) : null}
      {sp.error === "stripe" ? (
        <p className="rounded-lg border border-warm/40 bg-warm/10 px-4 py-3 text-sm">
          Stripe request failed. Check keys, price id, and logs.
        </p>
      ) : null}
      {sp.error === "nocustomer" ? (
        <p className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
          Start a subscription first, then you can manage billing.
        </p>
      ) : null}

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-sm text-muted">Current plan</p>
        <p className="mt-1 text-2xl font-semibold capitalize">
          {profile?.entitlement_tier ?? "free"}
        </p>
        <p className="mt-2 text-sm text-muted">
          Subscription status:{" "}
          <span className="text-foreground">
            {profile?.subscription_status ?? "inactive"}
          </span>
        </p>
        {profile?.current_period_end ? (
          <p className="mt-1 text-sm text-muted">
            Current period ends:{" "}
            <span className="text-foreground">
              {new Date(profile.current_period_end).toLocaleDateString()}
            </span>
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <form action={startCheckout}>
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
            >
              Start Plus (Stripe Checkout)
            </button>
          </form>
          {canPortal ? (
            <form action={openPortal}>
              <button
                type="submit"
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-accent"
              >
                Manage billing
              </button>
            </form>
          ) : null}
        </div>

        <p className="mt-6 text-xs text-muted">
          Webhook endpoint:{" "}
          <code className="font-mono text-foreground">/api/stripe/webhook</code>
        </p>
      </div>

      <Link href="/app/paths" className="text-sm text-accent hover:underline">
        ← Paths
      </Link>
    </div>
  );
}
