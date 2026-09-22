import api, { USE_MOCK } from "./api";
import { mockService } from "./mockService";
import type { Paginated, Patient } from "@/types";

function mapPatient(p: any): Patient {
  return {
    id: p.patientId || p._id || p.id,
    name: p.name,
    age: p.age,
    gender: p.gender,
    phone: p.phone,
    village: p.village,
    district: p.district,
    diabetesStatus: p.isDiabetic ? "type2" : (p.diabetesStatus || "none"),
    diabetesDurationYears: p.diabetesDurationYears || 0,
    lastScreeningAt: p.lastScreeningAt || null,
    status: p.status || "active",
    registeredAt: p.createdAt || p.registeredAt || new Date().toISOString(),
  };
}

export const patientService = {
  list: async (params?: Parameters<typeof mockService.listPatients>[0]): Promise<Paginated<Patient>> => {
    if (USE_MOCK) return mockService.listPatients(params);
    try {
      const res = await api.get("/patients", { params });
      const payload = res.data?.data || res.data;
      const rawList = payload.patients || [];
      return {
        items: rawList.map(mapPatient),
        total: payload.total ?? rawList.length,
        page: payload.page ?? 1,
        pageSize: payload.limit ?? payload.pageSize ?? 20,
      };
    } catch {
      return mockService.listPatients(params);
    }
  },

  get: async (id: string): Promise<Patient | null> => {
    if (USE_MOCK) return mockService.getPatient(id);
    try {
      const res = await api.get(`/patients/${id}`);
      const payload = res.data?.data || res.data;
      const raw = payload.patient || payload;
      return raw ? mapPatient(raw) : null;
    } catch {
      return mockService.getPatient(id);
    }
  },

  create: async (body: Omit<Patient, "id" | "registeredAt" | "lastScreeningAt" | "status">): Promise<Patient> => {
    if (USE_MOCK) return mockService.createPatient(body);
    try {
      const res = await api.post("/patients", {
        name: body.name,
        age: body.age,
        gender: body.gender,
        phone: body.phone,
        village: body.village,
        district: body.district,
        isDiabetic: body.diabetesStatus !== "none",
        diabetesDurationYears: body.diabetesDurationYears,
      });
      const payload = res.data?.data || res.data;
      return mapPatient(payload.patient || payload);
    } catch {
      return mockService.createPatient(body);
    }
  },
};
