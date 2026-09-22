import type { LesionCounts } from "@/types";
import { Progress } from "./ui/progress";

export function LesionEvidence({ lesions }: { lesions: LesionCounts }) {
  const rows = [
    { name: "Microaneurysms", count: lesions.microaneurysm, conf: 0.91 },
    { name: "Hemorrhages", count: lesions.hemorrhage, conf: 0.86 },
    { name: "Hard Exudates", count: lesions.hardExudate, conf: 0.82 },
  ];
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-6">
      <h3 className="font-semibold">Detected Retinal Lesions</h3>
      <ul className="mt-4 space-y-4">
        {rows.map((r) => (
          <li key={r.name}>
            <div className="flex items-center justify-between text-sm">
              <span>{r.name}</span>
              <span className="font-semibold tabular-nums">{r.count} detected</span>
            </div>
            <Progress value={r.conf * 100} className="mt-2" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ConfidenceBar({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-ink-500">
        <span>{label}</span>
        <span>{Math.round(value * 100)}%</span>
      </div>
      <Progress value={value * 100} />
    </div>
  );
}

export function QualityIndicator({
  score,
  focus,
  illumination,
  fov,
  gradable,
  reason,
}: {
  score: number;
  focus: number;
  illumination: number;
  fov: number;
  gradable: boolean;
  reason?: string;
}) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-6">
      <h3 className="font-semibold">Image Quality</h3>
      <p className="mt-1 text-3xl font-semibold tabular-nums">{Math.round(score * 100)}%</p>
      <p className="text-sm text-ink-500">{gradable ? "Gradable" : "Not gradable"}</p>
      <div className="mt-4 space-y-3">
        <ConfidenceBar value={focus} label="Focus" />
        <ConfidenceBar value={illumination} label="Illumination" />
        <ConfidenceBar value={fov / 100} label="Field of view" />
      </div>
      {!gradable && (
        <div className="mt-4 rounded-xl bg-ink-50 p-3 text-sm">
          <p className="font-medium">Image not suitable for analysis</p>
          <p className="text-ink-500">{reason}</p>
        </div>
      )}
    </div>
  );
}

export function MedicalDisclaimer() {
  return (
    <p className="rounded-xl bg-ink-50 p-3 text-xs leading-relaxed text-ink-500">
      DRISHTI AI is a screening and decision-support tool, not a replacement for professional medical diagnosis. Final
      clinical decisions should be made by a qualified ophthalmologist.
    </p>
  );
}
