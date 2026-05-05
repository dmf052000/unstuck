import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/app/app/actions";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
            <Link href="/app" className="text-foreground hover:text-accent">
              Today
            </Link>
            <Link href="/app/paths" className="text-muted hover:text-accent">
              Paths
            </Link>
            <Link href="/app/chat" className="text-muted hover:text-accent">
              Open chat
            </Link>
            <Link href="/app/profile" className="text-muted hover:text-accent">
              About me
            </Link>
            <Link href="/app/billing" className="text-muted hover:text-accent">
              Billing
            </Link>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-muted hover:text-foreground"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
