import type { PathDefinition } from "@/lib/path-types";

export const pathAiFirstWin: PathDefinition = {
  id: "ai-first-win",
  title: "Your first AI win",
  description:
    "Build confidence with a tiny, repeatable workflow you can use this week.",
  requiresTier: "free",
  outcomes: ["One concrete task you can do with AI", "A prompt you can reuse"],
  steps: [
    {
      id: "welcome",
      kind: "lesson",
      title: "Start small",
      body:
        "Pick one boring, well-bounded task (email outline, summary, brainstorm). Success is finishing—not perfecting.",
    },
    {
      id: "pick-task",
      kind: "reflection",
      title: "Name your task",
      body: "In one sentence: what will you use AI for on your next work session?",
    },
    {
      id: "profiler-strength",
      kind: "profiler",
      title: "What you enjoy",
      extractKeys: ["energy", "strength_signal"],
      body:
        "What part of work gives you energy—even a little? We will save this to your profile (you confirm on the next step).",
    },
  ],
};
