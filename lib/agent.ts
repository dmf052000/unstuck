import { z } from "zod";

const crisisPatterns =
  /\b(kill myself|suicide|end my life|hurt myself|self[- ]harm)\b/i;
const medicalPatterns =
  /\b(diagnos|prescri|medication dosage|clinical depression|ptsd)\b/i;

export type SafetyResult =
  | { ok: true }
  | { ok: false; reason: "crisis" | "medical" | "other"; userMessage: string };

export function evaluateSafety(userText: string): SafetyResult {
  if (crisisPatterns.test(userText)) {
    return {
      ok: false,
      reason: "crisis",
      userMessage:
        "I’m not able to help with crisis situations. If you’re in immediate danger, call your local emergency number. In the U.S., you can call or text 988 for the Suicide & Crisis Lifeline.",
    };
  }
  if (medicalPatterns.test(userText)) {
    return {
      ok: false,
      reason: "medical",
      userMessage:
        "I can’t provide medical or mental-health diagnoses or treatment guidance. A licensed clinician is the right person for that. I can still help with career exploration and learning to use AI tools if you want to steer there.",
    };
  }
  return { ok: true };
}

export const ProfilePatchSchema = z.record(z.string(), z.any());

export type AssistInput = {
  intent: "chat" | "profiler";
  userMessage: string;
  pathId?: string;
  stepId?: string;
  profileFacts?: Record<string, unknown>;
};

export type AssistOutput = {
  traceId: string;
  assistantMessage: string;
  proposedProfilePatch?: Record<string, unknown>;
  modelUsed: string;
};

export async function runAssist(input: AssistInput): Promise<AssistOutput> {
  const traceId = crypto.randomUUID();
  const safety = evaluateSafety(input.userMessage);
  if (!safety.ok) {
    return {
      traceId,
      assistantMessage: safety.userMessage,
      modelUsed: "safety-filter",
    };
  }

  const system = [
    "You are Unstuck, a helpful coach for AI literacy and career exploration.",
    "Do not provide therapy, medical advice, or legal advice.",
    "Prefer evidence-seeking next steps over big life prescriptions.",
    "If intent is profiler, output JSON when asked by the user message wrapper.",
  ].join(" ");

  const userPayload =
    input.intent === "profiler"
      ? JSON.stringify({
          pathId: input.pathId,
          stepId: input.stepId,
          userReflection: input.userMessage,
          existingProfile: input.profileFacts ?? {},
          instruction:
            "Reply with a short encouraging message (2-4 sentences) plus a JSON object profilePatch merging extracted facts. Format exactly: MESSAGE: ... then a line JSON: {...}",
        })
      : input.userMessage;

  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPayload },
        ],
        temperature: 0.7,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenAI error: ${text}`);
    }
    const data = (await res.json()) as {
      choices: { message: { content: string } }[];
    };
    const content = data.choices[0]?.message?.content ?? "";
    return parseAssistResponse(content, traceId, "gpt-4o-mini");
  }

  if (input.intent === "profiler") {
    const patch: Record<string, unknown> = {
      last_reflection: input.userMessage.slice(0, 500),
      updated_at: new Date().toISOString(),
    };
    return {
      traceId,
      assistantMessage:
        "Here is a concise reflection you can build on next session. When you add an API key, I can extract richer structured notes automatically.",
      proposedProfilePatch: patch,
      modelUsed: "offline-fallback",
    };
  }

  return {
    traceId,
    assistantMessage:
      "Thanks for sharing. A practical next step: pick one small task this week and use AI only to speed up the boring parts—then jot down what worked. Add OPENAI_API_KEY for deeper guidance.",
    modelUsed: "offline-fallback",
  };
}

function parseAssistResponse(
  content: string,
  traceId: string,
  modelUsed: string,
): AssistOutput {
  const jsonMatch = content.match(/JSON:\s*(\{[\s\S]*\})\s*$/);
  let proposed: Record<string, unknown> | undefined;
  if (jsonMatch) {
    try {
      proposed = ProfilePatchSchema.parse(JSON.parse(jsonMatch[1])) as Record<
        string,
        unknown
      >;
    } catch {
      proposed = undefined;
    }
  }
  const messageMatch = content.match(/MESSAGE:\s*([\s\S]*?)(?=JSON:|$)/i);
  const assistantMessage =
    messageMatch?.[1]?.trim() ||
    content.trim() ||
    "I’m here when you want to continue.";

  return {
    traceId,
    assistantMessage,
    proposedProfilePatch: proposed,
    modelUsed,
  };
}
