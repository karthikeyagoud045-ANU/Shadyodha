"use client";

import { WifiOff } from "lucide-react";
import { useOfflineStore } from "@/store/offline-store";

export function OfflineBanner() {
  const status = useOfflineStore((s) => s.status);
  if (status !== "offline") return null;
  return (
    <div className="flex items-center justify-center gap-2 bg-ink-900 px-4 py-2 text-xs text-white">
      <WifiOff className="h-3.5 w-3.5" />
      You are offline. Data will sync when connection returns.
    </div>
  );
}
