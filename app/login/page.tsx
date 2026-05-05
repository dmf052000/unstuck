import Link from "next/link";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-8 px-6 py-16">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-muted">
          Sign in with a magic link—no passwords on day one.
        </p>
      </div>
      {error ? (
        <p className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-warm">
          Something went wrong with authentication. Try again.
        </p>
      ) : null}
      <LoginForm nextPath={next} />
      <p className="text-sm text-muted">
        <Link href="/" className="text-accent hover:underline">
          ← Back home
        </Link>
      </p>
    </div>
  );
}
