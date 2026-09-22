"use client";

import { create } from "zustand";
import type { ConnectionStatus } from "@/types";
import { mockService } from "@/services/mockService";

interface OfflineState {
  status: ConnectionStatus;
  pending: number;
  setStatus: (s: ConnectionStatus) => void;
  setPending: (n: number) => void;
  enqueue: (type: string, payload: unknown) => void;
  sync: () => Promise<void>;
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  status: "online",
  pending: 0,
  setStatus: (status) => set({ status }),
  setPending: (pending) => set({ pending }),
  enqueue: (type, payload) => {
    const n = mockService.enqueue(type, payload);
    set({ pending: n });
  },
  sync: async () => {
    if (get().pending === 0) return;
    set({ status: "syncing" });
    await mockService.flushQueue();
    set({ pending: 0, status: navigator.onLine ? "online" : "offline" });
  },
}));
