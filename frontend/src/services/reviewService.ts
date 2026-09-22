import api, { USE_MOCK } from "./api";
import { mockService } from "./mockService";
import type { DrGrade, Priority, ReviewCase } from "@/types";

function mapReviewCase(s: any): ReviewCase {
  const patient = s.patient || {};
  const ai = s.aiResult || {};
  const triage = s.triage || {};
  const qual = s.qualityAssessment || {};

  return {
    id: s.screeningId || s._id || s.id,
    screeningId: s.screeningId || s._id || s.id,
    patientName: patient.name || s.patientName || "Unknown Patient",
    date: s.createdAt || s.date || new Date().toISOString(),
    grade: (ai.grade ?? 2) as DrGrade,
    confidence: ai.confidence ?? 0.88,
    priority: (triage.priority as Priority) || "MEDIUM",
    imageQuality: qual.score ? Math.round(qual.score * 100) : 90,
    timeSinceUpload: "Recently submitted",
    status: s.status === "review_completed" ? "completed" : "pending",
  };
}

export const reviewService = {
  list: async (filter?: string, sort?: string): Promise<ReviewCase[]> => {
    if (USE_MOCK) return mockService.listReviews(filter, sort);
    try {
      const res = await api.get("/reviews/queue");
      const payload = res.data?.data || res.data;
      const rawList = payload.screenings || payload;
      return Array.isArray(rawList) ? rawList.map(mapReviewCase) : mockService.listReviews(filter, sort);
    } catch {
      return mockService.listReviews(filter, sort);
    }
  },

  submit: async (
    screeningId: string,
    decision: "confirm" | "override" | "recapture",
    grade?: number,
    note?: string,
  ) => {
    if (USE_MOCK) return mockService.submitReview(screeningId, decision, grade, note);
    try {
      const statusMap: Record<string, string> = {
        confirm: "confirmed",
        override: "overridden",
        recapture: "recapture_requested",
      };
      const body: Record<string, any> = {
        status: statusMap[decision] || "confirmed",
        clinicalNote: note || "",
      };
      if (decision === "override" && grade !== undefined) {
        body.correctGrade = grade;
      }
      const res = await api.post(`/reviews/${screeningId}/decision`, body);
      return res.data?.data || res.data;
    } catch {
      return mockService.submitReview(screeningId, decision, grade, note);
    }
  },
};
