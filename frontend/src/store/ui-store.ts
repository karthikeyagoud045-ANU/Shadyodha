"use client";

import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  demoPanel: boolean;
  setDemoPanel: (v: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  demoPanel: false,
  setDemoPanel: (demoPanel) => set({ demoPanel }),
}));
