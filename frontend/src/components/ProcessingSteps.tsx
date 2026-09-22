"use client";

import { Progress } from "./ui/progress";

const STEPS = [
  "Image Uploaded",
  "Quality Check Passed",
  "AI Retinal Analysis",
  "Explainability Generation",
  "Preparing Clinical Report",
];

export function ProcessingSteps({ step }: { step: number }) {
  const pct = ((step + 1) / STEPS.length) * 100;
  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-3xl border border-ink-200 bg-white p-8 shadow-card">
      <div className="relative mx-auto h-40 w-40">
        <div className="absolute inset-0 animate-pulseRing rounded-full border border-ink-300" />
        <div className="absolute inset-4 animate-pulse rounded-full bg-ink-100" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="h-16 w-16 rounded-full border-[6px] border-ink-200 border-t-ink-900 animate-spin" />
        </div>
        <div className="absolute left-6 right-6 h-px bg-white/80 animate-scan" />
      </div>
      <div className="text-center">
        <p className="font-semibold">Analyzing retinal image…</p>
        <p className="mt-1 text-sm text-ink-500">Estimated time ~10 seconds</p>
      </div>
      <Progress value={pct} />
      <ul className="space-y-2 text-sm">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-3">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-ink-100 text-xs">
              {i < step ? "✓" : i === step ? "●" : "○"}
            </span>
            <span className={i <= step ? "text-ink-900" : "text-ink-400"}>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
