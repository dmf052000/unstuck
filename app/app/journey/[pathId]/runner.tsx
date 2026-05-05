"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import type { PathDefinition } from "@/lib/path-types";
import { mergeProfileFacts, saveJourneyProgress } from "@/app/app/actions";

type Props = {
  path: PathDefinition;
  initialStepIndex: number;
  initialCompleted: number[];
};

export default function JourneyRunner({
  path,
  initialStepIndex,
  initialCompleted,
}: Props) {
  const [stepIndex, setStepIndex] = useState(initialStepIndex);
  const [completed, setCompleted] = useState<number[]>(initialCompleted);
  const [reflection, setReflection] = useState("");
  const [assistReply, setAssistReply] = useState<string | null>(null);
  const [proposedPatch, setProposedPatch] =
    useState<Record<string, unknown> | null>(null);
  const [traceId, setTraceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [assistLoading, setAssistLoading] = useState(false);

  const step = path.steps[stepIndex];
  const progressLabel = useMemo(
    () => `Step ${stepIndex + 1} of ${path.steps.length}`,
    [path.steps.length, stepIndex],
  );

  function persist(nextIndex: number, nextCompleted: number[]) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("pathId", path.id);
      fd.set("stepIndex", String(nextIndex));
      fd.set("completed", JSON.stringify(nextCompleted));
      await saveJourneyProgress(fd);
    });
  }

  function finishOrAdvance() {
    const nextCompleted = completed.includes(stepIndex)
      ? completed
      : [...completed, stepIndex];
    if (stepIndex >= path.steps.length - 1) {
      setCompleted(nextCompleted);
      setStepIndex(path.steps.length);
      persist(path.steps.length, nextCompleted);
      return;
    }
    const nextIndex = stepIndex + 1;
    setCompleted(nextCompleted);
    setStepIndex(nextIndex);
    setReflection("");
    setAssistReply(null);
    setProposedPatch(null);
    setTraceId(null);
    persist(nextIndex, nextCompleted);
  }

  async function runAssist() {
    if (!step) return;
    setAssistLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: step.kind === "profiler" ? "profiler" : "chat",
          message: reflection || step.body,
          pathId: path.id,
          stepId: step.id,
        }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Assist failed");
      }
      const data = (await res.json()) as {
        message: string;
        proposedProfilePatch?: Record<string, unknown>;
        traceId: string;
      };
      setAssistReply(data.message);
      setProposedPatch(data.proposedProfilePatch ?? null);
      setTraceId(data.traceId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setAssistLoading(false);
    }
  }

  if (!step) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="font-medium">Path complete</p>
        <p className="mt-2 text-sm text-muted">
          Nice work. Pick another path or keep exploring in open chat.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/app/paths"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            All paths
          </Link>
          <Link
            href="/app/chat"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-accent"
          >
            Open chat
          </Link>
        </div>
      </div>
    );
  }

  const isLast = stepIndex === path.steps.length - 1;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-accent">{path.title}</p>
          <h1 className="text-2xl font-semibold tracking-tight">{step.title}</h1>
          <p className="text-sm text-muted">{progressLabel}</p>
        </div>
        <Link
          href="/app/chat"
          className="text-sm font-medium text-accent hover:underline"
        >
          Escape to open chat →
        </Link>
      </div>

      <ol className="flex flex-wrap gap-2">
        {path.steps.map((s, i) => {
          const done = completed.includes(i);
          const active = i === stepIndex;
          return (
            <li
              key={s.id}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
                active
                  ? "border-accent bg-accent/10 text-foreground"
                  : done
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-border text-muted"
              }`}
            >
              <span className="font-semibold">{i + 1}</span>
              <span>{s.kind}</span>
            </li>
          );
        })}
      </ol>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {step.body}
        </p>

        {step.kind === "reflection" || step.kind === "profiler" ? (
          <div className="mt-4 flex flex-col gap-2">
            <label className="text-sm text-muted" htmlFor="reflection">
              Your notes
            </label>
            <textarea
              id="reflection"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="Write freely—we’ll only structure what you confirm."
            />
          </div>
        ) : null}

        {step.kind === "profiler" ? (
          <div className="mt-4 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => void runAssist()}
              disabled={assistLoading || !reflection.trim()}
              className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
            >
              {assistLoading ? "Thinking…" : "Run coach on this step"}
            </button>
            {error ? (
              <p className="text-sm text-warm" role="alert">
                {error}
              </p>
            ) : null}
            {assistReply ? (
              <div className="rounded-lg border border-border bg-background p-4 text-sm">
                <p className="text-muted">Coach reply</p>
                <p className="mt-2 whitespace-pre-wrap">{assistReply}</p>
                {traceId ? (
                  <p className="mt-2 text-xs text-muted">
                    Trace ID: <span className="font-mono">{traceId}</span>
                  </p>
                ) : null}
              </div>
            ) : null}
            {proposedPatch ? (
              <form action={mergeProfileFacts} className="space-y-2">
                <input
                  type="hidden"
                  name="patch"
                  value={JSON.stringify(proposedPatch)}
                />
                <button
                  type="submit"
                  className="rounded-lg border border-success px-4 py-2 text-sm font-medium text-success hover:bg-success/10"
                >
                  Save suggested profile notes
                </button>
              </form>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={finishOrAdvance}
            disabled={isPending}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {isLast ? "Finish path" : "Mark complete & continue"}
          </button>
          <Link
            href="/app/paths"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-accent"
          >
            Pick a different path
          </Link>
        </div>
      </div>
    </div>
  );
}
