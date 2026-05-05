import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

async function recordIdempotentEvent(eventId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("stripe_webhook_events")
    .insert({ event_id: eventId });
  if (error?.code === "23505") return "duplicate" as const;
  if (error) throw error;
  return "ok" as const;
}

function mapSubscriptionToRow(sub: Stripe.Subscription) {
  const status = sub.status;
  const tier =
    status === "active" || status === "trialing" ? "plus" : "free";
  let subscriptionStatus: "inactive" | "active" | "past_due" | "canceled" =
    "inactive";
  if (status === "active" || status === "trialing") subscriptionStatus = "active";
  else if (status === "past_due") subscriptionStatus = "past_due";
  else if (
    status === "canceled" ||
    status === "unpaid" ||
    status === "incomplete_expired"
  )
    subscriptionStatus = "canceled";
  else subscriptionStatus = "inactive";

  const endTs = (sub as unknown as { current_period_end?: number | null })
    .current_period_end;

  return {
    subscription_status: subscriptionStatus,
    entitlement_tier: tier,
    subscription_price_id: sub.items.data[0]?.price?.id ?? null,
    current_period_end: endTs
      ? new Date(endTs * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };
}

async function applySubscription(
  userId: string,
  customerId: string | null,
  sub: Stripe.Subscription,
) {
  const admin = createAdminClient();
  const row = mapSubscriptionToRow(sub);
  await admin
    .from("profiles")
    .update({
      ...row,
      stripe_customer_id: customerId ?? undefined,
    })
    .eq("id", userId);
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json(
      { error: "Missing webhook configuration" },
      { status: 500 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const idResult = await recordIdempotentEvent(event.id);
  if (idResult === "duplicate") {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        if (userId && session.customer) {
          const admin = createAdminClient();
          await admin
            .from("profiles")
            .update({
              stripe_customer_id: String(session.customer),
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);
        }
        if (userId && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            session.subscription as string,
          );
          await applySubscription(
            userId,
            session.customer ? String(session.customer) : null,
            sub,
          );
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id;
        if (!userId) break;
        await applySubscription(userId, String(sub.customer), sub);
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
