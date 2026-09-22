"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useOfflineStore } from "@/store/offline-store";
import { mockService } from "@/services/mockService";

function OfflineBridge() {
  const setStatus = useOfflineStore((s) => s.setStatus);
  const setPending = useOfflineStore((s) => s.setPending);
  const sync = useOfflineStore((s) => s.sync);
  useEffect(() => {
    const apply = () => setStatus(navigator.onLine ? "online" : "offline");
    apply();
    setPending(mockService.pendingCount());
    window.addEventListener("online", () => {
      apply();
      void sync();
    });
    window.addEventListener("offline", apply);
    return () => {
      window.removeEventListener("online", apply);
      window.removeEventListener("offline", apply);
    };
  }, [setPending, setStatus, sync]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 20_000, retry: 1, refetchOnWindowFocus: false } },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <OfflineBridge />
      {children}
    </QueryClientProvider>
  );
}
