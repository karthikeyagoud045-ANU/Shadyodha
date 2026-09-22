"use client";

import { create } from "zustand";

interface ScreeningUi {
  patientId: string | null;
  fileName: string | null;
  previewUrl: string | null;
  processing: boolean;
  setPatient: (id: string | null) => void;
  setFile: (name: string | null, url: string | null) => void;
  setProcessing: (v: boolean) => void;
  reset: () => void;
}

export const useScreeningStore = create<ScreeningUi>((set) => ({
  patientId: null,
  fileName: null,
  previewUrl: null,
  processing: false,
  setPatient: (patientId) => set({ patientId }),
  setFile: (fileName, previewUrl) => set({ fileName, previewUrl }),
  setProcessing: (processing) => set({ processing }),
  reset: () => set({ patientId: null, fileName: null, previewUrl: null, processing: false }),
}));
