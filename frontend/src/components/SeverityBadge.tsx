import { cn } from "@/lib/utils";
import type { DrGrade } from "@/types";

const MAP: Record<DrGrade, { label: string; className: string }> = {
  0: { label: "Level 0 — No DR", className: "bg-ink-100 text-ink-600" },
  1: { label: "Level 1 — Mild", className: "bg-ink-200 text-ink-700" },
  2: { label: "Level 2 — Moderate", className: "bg-ink-400 text-white" },
  3: { label: "Level 3 — Severe", className: "bg-ink-700 text-white" },
  4: { label: "Level 4 — Proliferative", className: "bg-ink-900 text-white" },
};

export function SeverityBadge({ grade, compact }: { grade: DrGrade; compact?: boolean }) {
  const m = MAP[grade];
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", m.className)}>
      {compact ? `L${grade}` : m.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-2.5 py-0.5 text-xs capitalize text-ink-700">
      <span className="h-1.5 w-1.5 rounded-full bg-ink-900" />
      {status.replaceAll("_", " ")}
    </span>
  );
}

export function PriorityMark({ priority }: { priority: "HIGH" | "MEDIUM" | "LOW" }) {
  const w = priority === "HIGH" ? "w-2.5 bg-ink-900" : priority === "MEDIUM" ? "w-2 bg-ink-500" : "w-1.5 bg-ink-300";
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium">
      <span className={cn("h-2.5 rounded-full", w)} />
      {priority}
    </span>
  );
}
