"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const supabase = createClient();
    const origin = window.location.origin;
    const next =
      nextPath && nextPath.startsWith("/") ? nextPath : "/app";
    const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo },
    });

    setStatus(
      error
        ? error.message
        : "Check your email—we sent you a sign-in link.",
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm text-muted">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </label>
      <button
        type="submit"
        className="rounded-lg bg-accent px-4 py-2 font-medium text-white hover:bg-accent-hover"
      >
        Send magic link
      </button>
      {status ? (
        <p className="text-sm text-muted" role="status">
          {status}
        </p>
      ) : null}
    </form>
  );
}
