import { NextResponse } from "next/server";
import { z } from "zod";
import { runAssist } from "@/lib/agent";
import { createClient } from "@/lib/supabase/server";

const BodySchema = z.object({
  intent: z.enum(["chat", "profiler"]),
  message: z.string().min(1).max(8000),
  pathId: z.string().optional(),
  stepId: z.string().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("profile_facts")
    .eq("id", user.id)
    .single();

  const facts =
    (profile?.profile_facts as Record<string, unknown> | null) ?? undefined;

  const result = await runAssist({
    intent: parsed.data.intent,
    userMessage: parsed.data.message,
    pathId: parsed.data.pathId,
    stepId: parsed.data.stepId,
    profileFacts: facts,
  });

  await supabase.from("chat_messages").insert({
    user_id: user.id,
    role: "user",
    content: parsed.data.message,
    trace_id: result.traceId,
  });
  await supabase.from("chat_messages").insert({
    user_id: user.id,
    role: "assistant",
    content: result.assistantMessage,
    trace_id: result.traceId,
  });

  return NextResponse.json({
    traceId: result.traceId,
    message: result.assistantMessage,
    proposedProfilePatch: result.proposedProfilePatch,
    modelUsed: result.modelUsed,
  });
}
