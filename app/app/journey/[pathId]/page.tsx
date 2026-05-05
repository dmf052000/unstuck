import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPath } from "@/lib/paths";
import JourneyRunner from "./runner";

export default async function JourneyPage({
  params,
}: {
  params: Promise<{ pathId: string }>;
}) {
  const { pathId } = await params;
  const path = getPath(pathId);
  if (!path) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("entitlement_tier")
    .eq("id", user.id)
    .single();

  if (path.requiresTier === "plus" && profile?.entitlement_tier !== "plus") {
    redirect("/app/billing?required=plus");
  }

  const { data: progress } = await supabase
    .from("journey_progress")
    .select("step_index, completed_steps")
    .eq("user_id", user.id)
    .eq("path_id", pathId)
    .maybeSingle();

  const stepIndex = progress?.step_index ?? 0;
  const completed = progress?.completed_steps ?? [];

  return (
    <JourneyRunner
      path={path}
      initialStepIndex={stepIndex}
      initialCompleted={completed}
    />
  );
}
