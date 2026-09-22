import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "solid" | "muted" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone === "solid" && "bg-ink-900 text-white",
        tone === "muted" && "bg-ink-100 text-ink-600",
        tone === "neutral" && "border border-ink-200 bg-white text-ink-700",
        className,
      )}
      {...props}
    />
  );
}
