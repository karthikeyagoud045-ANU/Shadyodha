"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const TABS = ["Original", "Grad-CAM", "Lesion Map", "Overlay"] as const;

export function GradCamViewer({
  original,
  gradcam,
  annotation,
}: {
  original: string;
  gradcam: string;
  annotation: string;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Grad-CAM");
  const [opacity, setOpacity] = useState(0.65);
  const [boxes, setBoxes] = useState(true);
  const src = tab === "Original" ? original : tab === "Lesion Map" ? annotation : gradcam;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "btn-attract h-9 rounded-full px-4 text-xs font-semibold transition-colors",
              tab === t ? "bg-ink-900 text-white shadow-sm" : "border border-ink-200 bg-white hover:bg-ink-50",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="relative overflow-hidden rounded-2xl bg-black shadow-inner">
        {tab === "Overlay" ? (
          <div className="relative aspect-square w-full">
            {/* Base anatomical fundus */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={original}
              alt="Original Fundus"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Blended Grad-CAM activation heatmap */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gradcam}
              alt="Grad-CAM Activation"
              style={{ opacity }}
              className="absolute inset-0 h-full w-full object-cover mix-blend-screen transition-opacity duration-200"
            />
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={src}
            alt={tab}
            className="aspect-square w-full object-cover transition duration-300"
          />
        )}

        {tab === "Lesion Map" && boxes && (
          <>
            <span className="absolute left-[38%] top-[40%] h-8 w-8 rounded-full border-2 border-rose-400 bg-rose-500/20 shadow-xs ring-2 ring-white/50" />
            <span className="absolute left-[55%] top-[46%] h-10 w-12 rounded-md border-2 border-amber-400 bg-amber-500/20 shadow-xs ring-2 ring-white/50" />
            <span className="absolute left-[48%] top-[58%] h-6 w-6 rounded-full border-2 border-rose-400 bg-rose-500/20 shadow-xs ring-2 ring-white/50" />
            <span className="absolute left-[24%] top-[32%] h-5 w-5 rounded-full border-2 border-amber-400 bg-amber-500/20 shadow-xs ring-2 ring-white/50" />
          </>
        )}
      </div>

      {(tab === "Grad-CAM" || tab === "Overlay") && (
        <div className="rounded-xl border border-ink-100 bg-ink-50/50 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-ink-900">Heatmap Blend & Opacity</p>
            <span className="text-xs font-mono text-ink-600">{Math.round(opacity * 100)}%</span>
          </div>
          <label className="mt-2 flex items-center gap-3 text-xs text-ink-500">
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.05}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="flex-1 accent-indigo-600 cursor-pointer"
            />
          </label>
          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-500">
            <span>Low Activation (Anatomy)</span>
            <span className="font-semibold text-rose-600">High Activation (Pathology Focus)</span>
          </div>
          <p className="mt-2 text-[10px] text-ink-400 italic">
            Grad-CAM shows feature-attribution weights on ResNet101 feature maps to assist clinician explainability.
          </p>
        </div>
      )}

      {tab === "Lesion Map" && (
        <label className="flex items-center gap-2 text-xs font-medium text-ink-800">
          <input
            type="checkbox"
            checked={boxes}
            onChange={(e) => setBoxes(e.target.checked)}
            className="rounded border-ink-300 text-indigo-600 focus:ring-indigo-500"
          />
          Show morphological microaneurysm & hemorrhage bounding boxes
        </label>
      )}
    </div>
  );
}
