import type { PathDefinition } from "@/lib/path-types";

export const pathStrengthsToWork: PathDefinition = {
  id: "strengths-to-work",
  title: "Map strengths to paid work",
  description:
    "Clarify what you are good at and translate it into language others hire for.",
  requiresTier: "free",
  outcomes: ["3 strength bullets", "2 example problems you solve"],
  steps: [
    {
      id: "lesson-proof",
      kind: "lesson",
      title: "Evidence over labels",
      body:
        "Strengths are more believable when tied to outcomes: what changed because of you?",
    },
    {
      id: "reflect-wins",
      kind: "reflection",
      title: "Two wins",
      body: "Write two wins from the last 12 months (work or side projects).",
    },
    {
      id: "profiler-values",
      kind: "profiler",
      title: "Constraints",
      extractKeys: ["constraints", "values"],
      body:
        "What constraints matter for your next step (money, location, time, ethics)?",
    },
  ],
};
