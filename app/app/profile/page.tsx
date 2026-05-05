import { createClient } from "@/lib/supabase/server";
import { updateAboutMe } from "@/app/app/actions";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("about_me, profile_facts")
        .eq("id", user.id)
        .single()
    : { data: null };

  const facts = JSON.stringify(profile?.profile_facts ?? {}, null, 2);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">About me</h1>
        <p className="mt-2 text-muted">
          This is your living profile. Edit freely—nothing here is “final.”
        </p>
      </div>

      <form action={updateAboutMe} className="space-y-3 rounded-2xl border border-border bg-surface p-6">
        <label className="block text-sm text-muted" htmlFor="about">
          Your story (short is fine)
        </label>
        <textarea
          id="about"
          name="about"
          defaultValue={profile?.about_me ?? ""}
          rows={6}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Save
        </button>
      </form>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm font-medium text-foreground">Structured notes</p>
        <p className="mt-2 text-sm text-muted">
          Keys merge when you confirm coach suggestions on path steps.
        </p>
        <pre className="mt-4 max-h-64 overflow-auto rounded-lg bg-background p-4 text-xs text-foreground">
          {facts}
        </pre>
      </div>
    </div>
  );
}
