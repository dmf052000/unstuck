/**
 * Local-only escape hatch for `/app` without magic-link login.
 * Requires `NODE_ENV === "development"` AND `AUTH_BYPASS=true`.
 * For DB + RLS to work, enable Anonymous sign-ins in the Supabase dashboard
 * (Authentication → Providers → Anonymous). The app layout calls
 * `signInAnonymously()` once per cold session.
 */
export function isLocalAuthBypass(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.AUTH_BYPASS === "true"
  );
}
