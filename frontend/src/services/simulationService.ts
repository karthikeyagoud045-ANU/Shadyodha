import api, { USE_MOCK } from "./api";
import { mockService } from "./mockService";
import type { SimulationParams, SimulationResult } from "@/types";

function mapSimulationResult(r: any, p: SimulationParams): SimulationResult {
  const queue = Array.from({ length: 8 }, (_, i) => ({
    hour: 9 + i,
    length: Math.max(0, Math.round((r.maxQueueLength || 10) * Math.sin(((i + 1) / 8) * Math.PI))),
  }));

  const recommendations: Record<string, string> = {
    CAMERA: "Acquire an additional portable fundus camera or optimize pupil dilation prep to clear queue bottlenecks.",
    BANDWIDTH: "Enable offline store-and-forward image batching during low tele-connectivity hours.",
    DOCTOR: "Add tele-ophthalmology rota hours or re-route referable cases to regional tertiary eye centres.",
    NONE: "Operations are running at optimal throughput capacity with minimal patient wait times.",
  };

  const throughput = r.dailyThroughput ?? p.patientsPerDay;
  const referableLoad = Math.round(throughput * (p.referableRate > 1 ? p.referableRate / 100 : p.referableRate));

  return {
    dailyThroughput: throughput,
    averageWaitMinutes: r.averageWaitTimeMin ?? 14.5,
    aiUtilization: r.aiUtilizationPct ?? 65,
    doctorUtilization: r.doctorUtilizationPct ?? 78,
    referralBacklog: r.referralBacklog ?? 0,
    bottleneck: r.bottleneck || "NONE",
    recommendation: recommendations[r.bottleneck] || recommendations.NONE,
    queue,
    utilization: [
      { name: "Cameras / Capture", value: Math.min(100, Math.round((p.patientsPerDay / (p.cameras * 80)) * 100)) },
      { name: "AI Screening Inference", value: r.aiUtilizationPct ?? 65 },
      { name: "Ophthalmologist Review", value: r.doctorUtilizationPct ?? 78 },
      { name: "Bandwidth Uplink", value: Math.min(100, Math.round((p.patientsPerDay * 5 * 8) / (p.bandwidthMbps * 8 * 36) * 10)) },
    ],
    flow: [
      { stage: "Registered", patients: p.patientsPerDay },
      { stage: "Captured", patients: throughput },
      { stage: "AI Graded", patients: throughput },
      { stage: "Reviewed", patients: referableLoad },
      { stage: "Referred", patients: Math.round(referableLoad * 0.7) },
    ],
  };
}

export const simulationService = {
  run: async (params: SimulationParams): Promise<SimulationResult> => {
    if (USE_MOCK) return mockService.simulate(params);
    try {
      const res = await api.post("/simulation/run", {
        patientsPerDay: params.patientsPerDay,
        numCameras: params.cameras,
        aiProcessingTimeSec: params.aiSeconds,
        numOphthalmologists: params.ophthalmologists,
        reviewTimeSec: params.reviewSeconds,
        bandwidthMbps: params.bandwidthMbps,
        referableRate: params.referableRate > 1 ? params.referableRate / 100 : params.referableRate,
      });
      const payload = res.data?.data || res.data;
      return mapSimulationResult(payload.results || payload, params);
    } catch {
      return mockService.simulate(params);
    }
  },

  latest: async () => {
    if (USE_MOCK) return null;
    try {
      const res = await api.get("/simulation/results");
      return res.data?.data || res.data;
    } catch {
      return null;
    }
  },
};
