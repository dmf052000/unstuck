export type PathStepKind = "lesson" | "reflection" | "profiler";

export type PathStep = {
  id: string;
  kind: PathStepKind;
  title: string;
  body: string;
  extractKeys?: string[];
};

export type PathTier = "free" | "plus";

export type PathDefinition = {
  id: string;
  title: string;
  description: string;
  requiresTier: PathTier;
  outcomes: string[];
  steps: PathStep[];
};
