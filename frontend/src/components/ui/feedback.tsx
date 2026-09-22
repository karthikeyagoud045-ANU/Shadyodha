"use client";

import { cn } from "@/lib/utils";

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal>
      <div className="w-full max-w-md animate-fadeUp rounded-2xl bg-white p-6 shadow-lift">
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-ink-500">{body}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-attract h-10 rounded-xl border border-ink-200 px-4 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-attract h-10 rounded-xl bg-ink-900 px-4 text-sm text-white" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Slider({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
}: {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <label className="block space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-ink-600">{label}</span>
        <span className="font-medium tabular-nums">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-ink-200 accent-ink-900"
      />
    </label>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center">
      <p className="font-semibold">{title}</p>
      {hint && <p className="mt-1 text-sm text-ink-500">{hint}</p>}
    </div>
  );
}

export function ErrorState({ message = "Something went wrong. Please try again." }: { message?: string }) {
  return (
    <div className="rounded-2xl border border-ink-300 bg-white p-8 text-center">
      <p className="font-semibold">Unable to load</p>
      <p className="mt-1 text-sm text-ink-500">{message}</p>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <div className={cn("h-5 w-5 animate-spin rounded-full border-2 border-ink-200 border-t-ink-900", className)} />;
}
