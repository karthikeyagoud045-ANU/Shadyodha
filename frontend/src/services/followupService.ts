import api, { USE_MOCK } from "./api";
import { mockService } from "./mockService";
import type { FollowUp, FollowUpStatus, Priority } from "@/types";

function mapFollowUp(f: any): FollowUp {
  const patient = f.patient || f.patientId || {};
  return {
    id: f._id || f.id,
    patientId: patient.patientId || patient._id || "PAT-000",
    patientName: patient.name || f.patientName || "Unknown Patient",
    date: f.nextDate || f.date || new Date().toISOString(),
    priority: (f.priority as Priority) || "MEDIUM",
    doctor: f.doctor || "District Ophthalmologist",
    status: (f.status as FollowUpStatus) || "upcoming",
  };
}

export const followupService = {
  list: async (): Promise<FollowUp[]> => {
    if (USE_MOCK) return mockService.listFollowups();
    try {
      const res = await api.get("/followups");
      const payload = res.data?.data || res.data;
      const rawList = payload.followups || payload;
      return Array.isArray(rawList) ? rawList.map(mapFollowUp) : mockService.listFollowups();
    } catch {
      return mockService.listFollowups();
    }
  },

  create: async (screeningId: string, nextDate: string, notes?: string): Promise<FollowUp> => {
    if (USE_MOCK) return (await mockService.listFollowups())[0];
    const res = await api.post("/followups", { screeningId, nextDate, notes });
    const payload = res.data?.data || res.data;
    return mapFollowUp(payload.followup || payload);
  },

  update: async (id: string, status: FollowUp["status"], date?: string): Promise<FollowUp> => {
    if (USE_MOCK) return mockService.updateFollowup(id, status, date);
    try {
      const res = await api.patch(`/followups/${id}`, { status, nextDate: date });
      const payload = res.data?.data || res.data;
      return mapFollowUp(payload.followup || payload);
    } catch {
      return mockService.updateFollowup(id, status, date);
    }
  },
};
