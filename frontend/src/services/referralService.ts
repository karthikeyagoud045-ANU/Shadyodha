import api, { USE_MOCK } from "./api";
import { mockService } from "./mockService";
import type { Priority, Referral, ReferralStatus } from "@/types";

function mapReferral(r: any): Referral {
  const patient = r.patientId || r.patient || {};
  return {
    id: r.referralId || r._id || r.id,
    screeningId: r.screeningId || (r.screening?._id || r.screening),
    patientId: patient.patientId || patient._id || "PAT-000",
    patientName: patient.name || r.patientName || "Unknown Patient",
    priority: (r.priority as Priority) || "HIGH",
    referredTo: r.referredTo || "District Hospital",
    status: (r.status as ReferralStatus) || "pending",
    date: r.createdAt || r.scheduledDate || new Date().toISOString(),
    notes: r.notes,
  };
}

export const referralService = {
  list: async (status?: string): Promise<Referral[]> => {
    if (USE_MOCK) return mockService.listReferrals(status);
    try {
      const res = await api.get("/referrals", { params: { status } });
      const payload = res.data?.data || res.data;
      const rawList = payload.referrals || payload;
      return Array.isArray(rawList) ? rawList.map(mapReferral) : mockService.listReferrals(status);
    } catch {
      return mockService.listReferrals(status);
    }
  },

  create: async (
    screeningId: string,
    referredTo: string,
    priority: Priority = "HIGH",
    scheduledDate?: string,
    notes?: string,
  ): Promise<Referral> => {
    if (USE_MOCK) return mockService.createReferral(screeningId, referredTo);
    try {
      const res = await api.post("/referrals", {
        screeningId,
        referredTo,
        priority,
        scheduledDate: scheduledDate || null,
        notes: notes || "",
      });
      const payload = res.data?.data || res.data;
      return mapReferral(payload.referral || payload);
    } catch {
      return mockService.createReferral(screeningId, referredTo);
    }
  },

  update: async (id: string, updates: Partial<{ status: ReferralStatus; notes: string; scheduledDate: string }>) => {
    if (USE_MOCK) return;
    const res = await api.patch(`/referrals/${id}`, updates);
    return res.data?.data || res.data;
  },
};
