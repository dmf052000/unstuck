"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function startCheckout() {
  const price = process.env.STRIPE_PRICE_PLUS_MONTHLY;
  if (!price || !process.env.STRIPE_SECRET_KEY) {
    redirect("/app/billing?error=config");
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    const stripe = getStripe();
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: profile?.stripe_customer_id ?? undefined,
      customer_email: profile?.stripe_customer_id
        ? undefined
        : user.email ?? undefined,
      line_items: [{ price, quantity: 1 }],
      success_url: `${site}/app/billing?success=1`,
      cancel_url: `${site}/app/billing?canceled=1`,
      client_reference_id: user.id,
      metadata: { supabase_user_id: user.id },
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
    });

    if (session.url) redirect(session.url);
  } catch {
    redirect("/app/billing?error=stripe");
  }
}

export async function openPortal() {
  if (!process.env.STRIPE_SECRET_KEY) {
    redirect("/app/billing?error=config");
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      redirect("/app/billing?error=nocustomer");
    }

    const stripe = getStripe();
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${site}/app/billing`,
    });

    if (session.url) redirect(session.url);
  } catch {
    redirect("/app/billing?error=stripe");
  }
}
