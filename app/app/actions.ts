"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updateAboutMe(formData: FormData) {
  const about = String(formData.get("about") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await supabase
    .from("profiles")
    .update({
      about_me: about.slice(0, 8000),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  revalidatePath("/app/profile");
}

export async function mergeProfileFacts(formData: FormData) {
  const raw = String(formData.get("patch") ?? "{}");
  let patch: Record<string, unknown>;
  try {
    patch = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error("Invalid patch JSON");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: row } = await supabase
    .from("profiles")
    .select("profile_facts")
    .eq("id", user.id)
    .single();

  const prev = (row?.profile_facts as Record<string, unknown> | null) ?? {};
  const merged = { ...prev, ...patch };

  await supabase
    .from("profiles")
    .update({
      profile_facts: merged,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  revalidatePath("/app/profile");
  revalidatePath("/app");
}

export async function saveJourneyProgress(formData: FormData) {
  const pathId = String(formData.get("pathId") ?? "");
  const stepIndex = Number(formData.get("stepIndex") ?? 0);
  const completedRaw = String(formData.get("completed") ?? "[]");
  let completed: number[] = [];
  try {
    completed = JSON.parse(completedRaw) as number[];
  } catch {
    completed = [];
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await supabase.from("journey_progress").upsert(
    {
      user_id: user.id,
      path_id: pathId,
      step_index: stepIndex,
      completed_steps: completed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,path_id" },
  );

  revalidatePath(`/app/journey/${pathId}`);
  revalidatePath("/app/paths");
}
