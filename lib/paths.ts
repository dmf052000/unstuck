import type { PathDefinition } from "@/lib/path-types";
import { pathAiFirstWin } from "@/content/paths/ai-first-win";
import { pathCareerPivotPlus } from "@/content/paths/career-pivot-plus";
import { pathStrengthsToWork } from "@/content/paths/strengths-to-work";

const ALL: PathDefinition[] = [
  pathAiFirstWin,
  pathStrengthsToWork,
  pathCareerPivotPlus,
];

export function listPaths(): PathDefinition[] {
  return ALL;
}

export function getPath(id: string): PathDefinition | undefined {
  return ALL.find((p) => p.id === id);
}
