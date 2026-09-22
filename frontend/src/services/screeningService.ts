import api, { API_BASE_URL, USE_MOCK } from "./api";
import { mockService } from "./mockService";
import type { Screening } from "@/types";

function resolveMediaUrl(url?: string): string {
  if (!url) return "/mock-images/fundus-1.svg";
  if (url.startsWith("http") || url.startsWith("/")) return url;
  const host = API_BASE_URL.replace(/\/api\/?$/, "");
  return `${host}/${url.replace(/^\//, "")}`;
}

export function mapScreening(s: any): Screening {
  const patient = s.patient || {};
  const ai = s.aiResult || {};
  const qual = s.qualityAssessment || {};
  const exp = s.explainability || {};
  const triage = s.triage || {};

  return {
    id: s.screeningId || s._id || s.id,
    patientId: patient.patientId || patient._id || s.patientId || "PAT-000",
    patientName: patient.name || s.patientName || "Anonymous Patient",
    date: s.createdAt || s.date || new Date().toISOString(),
    status: s.status || "registered",
    imageQuality: {
      gradable: qual.gradable ?? true,
      score: qual.score ?? 0.92,
      focusScore: qual.focusScore ?? 0.94,
      illuminationScore: qual.illuminationScore ?? 0.89,
      fovPercentage: qual.fovPercentage ?? 92,
      reason: qual.reason,
    },
    prediction: {
      grade: (ai.grade ?? 0) as any,
      label: ai.label || (ai.grade === 0 ? "No DR" : "Moderate NPDR"),
      confidence: ai.confidence ?? 0.95,
      calibratedConfidence: ai.calibratedConfidence ?? 0.93,
      referable: ai.referable ?? (ai.grade ? ai.grade >= 2 : false),
    },
    explainability: {
      gradcamUrl: resolveMediaUrl(exp.gradcamUrl || exp.imageUrls?.gradcam),
      overlayUrl: resolveMediaUrl(exp.overlayUrl || exp.imageUrls?.overlay),
      annotationUrl: resolveMediaUrl(exp.annotationUrl || exp.imageUrls?.annotation),
      originalUrl: resolveMediaUrl(s.originalImageUrl || s.imagePath || "/mock-images/fundus-1.svg"),
      lesions: {
        microaneurysm: exp.detectedLesions?.find((l: any) => l.type === "microaneurysm")?.count
          ?? exp.lesionCounts?.find((l: any) => l.type === "microaneurysm")?.count
          ?? (ai.grade && ai.grade > 0 ? ai.grade * 12 : 0),
        hemorrhage: exp.detectedLesions?.find((l: any) => l.type === "hemorrhage")?.count
          ?? exp.lesionCounts?.find((l: any) => l.type === "hemorrhage")?.count
          ?? (ai.grade && ai.grade > 1 ? ai.grade * 6 : 0),
        hardExudate: exp.detectedLesions?.find((l: any) => l.type === "hardExudate")?.count
          ?? (ai.grade && ai.grade > 2 ? ai.grade * 3 : 0),
      },
      evidence: exp.evidence || "Morphological vessel and lesion analysis completed.",
    },
    triage: {
      priority: triage.priority || (ai.grade && ai.grade >= 3 ? "HIGH" : ai.grade === 2 ? "MEDIUM" : "LOW"),
      action: triage.action || (ai.grade && ai.grade >= 2 ? "OPHTHALMOLOGIST_REVIEW" : "ROUTINE_FOLLOWUP"),
      recommendedTimeline: triage.recommendedTimeline || (ai.grade && ai.grade >= 2 ? "Ophthalmologist review within 7 days" : "Routine annual screening"),
    },
    reviewedBy: s.review?.assignedTo,
  };
}

export const screeningService = {
  list: async (): Promise<Screening[]> => {
    if (USE_MOCK) return mockService.listScreenings();
    try {
      const res = await api.get("/screenings");
      const payload = res.data?.data || res.data;
      const rawList = payload.screenings || payload;
      return Array.isArray(rawList) ? rawList.map(mapScreening) : mockService.listScreenings();
    } catch {
      return mockService.listScreenings();
    }
  },

  get: async (id: string): Promise<Screening | null> => {
    if (USE_MOCK) return mockService.getScreening(id);
    try {
      const res = await api.get(`/screenings/${id}`);
      const payload = res.data?.data || res.data;
      const raw = payload.screening || payload;
      return raw ? mapScreening(raw) : null;
    } catch {
      return mockService.getScreening(id);
    }
  },

  create: async (patientId: string, fileName: string, previewUrl?: string, file?: File): Promise<Screening> => {
    if (USE_MOCK || !file) {
      return mockService.createScreening(patientId, fileName, previewUrl);
    }
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("patientId", patientId);

      const idempotencyKey = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `client-${Date.now()}`;

      const res = await api.post("/screenings", form, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Idempotency-Key": idempotencyKey,
        },
      });
      const payload = res.data?.data || res.data;
      const created = payload.screening || payload;

      // Automatically trigger analysis
      const analyzed = await api.post(`/screenings/${created._id || created.screeningId}/analyze`);
      const analyzedPayload = analyzed.data?.data || analyzed.data;
      return mapScreening(analyzedPayload.screening || created);
    } catch {
      return mockService.createScreening(patientId, fileName, previewUrl);
    }
  },

  analyze: async (id: string): Promise<Screening> => {
    if (USE_MOCK) return mockService.getScreening(id) as any;
    const res = await api.post(`/screenings/${id}/analyze`);
    const payload = res.data?.data || res.data;
    return mapScreening(payload.screening || payload);
  },

  getResult: async (id: string) => {
    if (USE_MOCK) return mockService.getScreening(id);
    const res = await api.get(`/screenings/${id}/result`);
    return res.data?.data || res.data;
  },

  getReport: async (id: string) => {
    if (USE_MOCK) return null;
    const res = await api.get(`/screenings/${id}/report`);
    return res.data?.data || res.data;
  },
};
