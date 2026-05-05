import type { PathDefinition } from "@/lib/path-types";

export const pathCareerPivotPlus: PathDefinition = {
  id: "career-pivot-plus",
  title: "Career pivot deep dive",
  description:
    "A longer arc for exploring direction—with tighter personalization and premium support.",
  requiresTier: "plus",
  outcomes: ["Hypothesis for next role", "Next 2 experiments"],
  steps: [
    {
      id: "plus-intro",
      kind: "lesson",
      title: "Pivoting without melodrama",
      body:
        "Pivoting is a sequence of small experiments. We'll keep options wide early, then narrow with evidence.",
    },
    {
      id: "hypothesis",
      kind: "reflection",
      title: "Your hypothesis",
      body:
        "Complete: “I think my next chapter might lean toward ___ because ___.”",
    },
    {
      id: "profiler-next",
      kind: "profiler",
      title: "Next step hypothesis",
      extractKeys: ["next_step", "risk_tolerance"],
      body:
        "What is one low-risk experiment you could run in the next 14 days (conversation, project, learning sprint)?",
    },
  ],
};
