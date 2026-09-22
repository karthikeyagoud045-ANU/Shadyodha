import type {
  FollowUp,
  Paginated,
  Patient,
  Referral,
  ReviewCase,
  Screening,
  SimulationParams,
  SimulationResult,
  SyncItem,
} from "@/types";
import {
  SEED_FOLLOWUPS,
  SEED_PATIENTS,
  SEED_REFERRALS,
  SEED_REVIEWS,
  SEED_SCREENINGS,
} from "./seed";
import { delay, DR_LABELS } from "@/lib/utils";

const KEY = "drishti.mock.v1";

interface Db {
  patients: Patient[];
  screenings: Screening[];
  reviews: ReviewCase[];
  referrals: Referral[];
  followups: FollowUp[];
  queue: SyncItem[];
}

function load(): Db {
  if (typeof window === "undefined") {
    return {
      patients: [...SEED_PATIENTS],
      screenings: [...SEED_SCREENINGS],
      reviews: [...SEED_REVIEWS],
      referrals: [...SEED_REFERRALS],
      followups: [...SEED_FOLLOWUPS],
      queue: [],
    };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Db;
  } catch {
    /* ignore */
  }
  const fresh: Db = {
    patients: [...SEED_PATIENTS],
    screenings: [...SEED_SCREENINGS],
    reviews: [...SEED_REVIEWS],
    referrals: [...SEED_REFERRALS],
    followups: [...SEED_FOLLOWUPS],
    queue: [],
  };
  localStorage.setItem(KEY, JSON.stringify(fresh));
  return fresh;
}

function save(db: Db) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(db));
}

export const mockService = {
  async listPatients(params?: {
    q?: string;
    status?: string;
    sort?: string;
    page?: number;
    pageSize?: number;
  }): Promise<Paginated<Patient>> {
    await delay(280);
    const db = load();
    let items = [...db.patients];
    if (params?.q) {
      const q = params.q.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.village.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q),
      );
    }
    if (params?.status && params.status !== "all") {
      items = items.filter((p) => p.status === params.status);
    }
    if (params?.sort === "name") items.sort((a, b) => a.name.localeCompare(b.name));
    if (params?.sort === "age") items.sort((a, b) => a.age - b.age);
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 8;
    const total = items.length;
    return { items: items.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize };
  },

  async getPatient(id: string) {
    await delay(180);
    return load().patients.find((p) => p.id === id) ?? null;
  },

  async createPatient(input: Omit<Patient, "id" | "registeredAt" | "lastScreeningAt" | "status">) {
    await delay(400);
    const db = load();
    const id = `PT-2024-${String(db.patients.length + 1).padStart(3, "0")}`;
    const patient: Patient = {
      ...input,
      id,
      status: "active",
      lastScreeningAt: null,
      registeredAt: new Date().toISOString(),
    };
    db.patients.unshift(patient);
    save(db);
    return patient;
  },

  async listScreenings() {
    await delay(240);
    return load().screenings;
  },

  async getScreening(id: string) {
    await delay(120);
    const db = load();
    const found = db.screenings.find((s) => s.id === id);
    if (found) return found;
    const seed = SEED_SCREENINGS.find((s) => s.id === id);
    if (seed) return seed;
    // Fallback template for dynamically routed IDs
    return {
      ...SEED_SCREENINGS[0],
      id,
    };
  },

  async createScreening(patientId: string, fileName: string, previewUrl?: string) {
    await delay(300);
    const db = load();
    const patient = db.patients.find((p) => p.id === patientId) ?? db.patients[0];
    const n = db.screenings.length + 1;
    const id = `SCR-2024-${String(n).padStart(3, "0")}`;
    const screening: Screening = {
      id,
      patientId: patient.id,
      patientName: patient.name,
      date: new Date().toISOString(),
      status: "completed",
      imageQuality: {
        gradable: true,
        score: 0.94,
        focusScore: 0.91,
        illuminationScore: 0.92,
        fovPercentage: 96.5,
      },
      prediction: {
        grade: 2,
        label: "Moderate NPDR",
        confidence: 0.89,
        calibratedConfidence: 0.86,
        referable: true,
      },
      explainability: {
        originalUrl: previewUrl || "/mock-images/fundus-1.svg",
        gradcamUrl: "/mock-images/gradcam-1.svg",
        overlayUrl: "/mock-images/gradcam-1.svg",
        annotationUrl: "/mock-images/annotation-1.svg",
        lesions: { microaneurysm: 42, hemorrhage: 15, hardExudate: 8 },
        evidence:
          "The model identified retinal microvascular lesions indicative of moderate diabetic retinopathy. Detected microaneurysms in the temporal quadrant, retinal blot hemorrhages, and focal hard exudates.",
      },
      triage: {
        priority: "HIGH",
        action: "OPHTHALMOLOGIST_REVIEW",
        recommendedTimeline: "Within 7 days",
      },
    };
    void fileName;
    db.screenings.unshift(screening);
    db.reviews.unshift({
      id: `REV-${id}`,
      screeningId: id,
      patientName: patient.name,
      date: screening.date,
      grade: 2,
      confidence: 0.87,
      priority: "HIGH",
      imageQuality: 0.92,
      timeSinceUpload: "just now",
      status: "pending",
    });
    patient.lastScreeningAt = screening.date;
    patient.status = "referred";
    save(db);
    return screening;
  },

  async listReviews(filter?: string, sort?: string) {
    await delay(220);
    let items = load().reviews.filter((r) => r.status === "pending");
    if (filter && filter !== "all") items = items.filter((r) => r.priority === filter);
    if (sort === "priority") {
      const o = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      items.sort((a, b) => o[a.priority] - o[b.priority]);
    }
    if (sort === "date") items.sort((a, b) => +new Date(b.date) - +new Date(a.date));
    if (sort === "confidence") items.sort((a, b) => b.confidence - a.confidence);
    return items;
  },

  async submitReview(
    screeningId: string,
    decision: "confirm" | "override" | "recapture",
    grade?: number,
    note?: string,
  ) {
    await delay(380);
    const db = load();
    const s = db.screenings.find((x) => x.id === screeningId);
    const r = db.reviews.find((x) => x.screeningId === screeningId);
    if (!s) throw new Error("Screening not found");
    if (decision === "recapture") {
      s.status = "needs_recapture";
      if (r) r.status = "completed";
      save(db);
      return { next: "recapture" as const };
    }
    s.status = "reviewed";
    s.clinicalNote = note;
    if (decision === "override" && grade !== undefined) {
      s.overrideGrade = grade as Screening["overrideGrade"];
      s.prediction.grade = grade as Screening["prediction"]["grade"];
      s.prediction.label = DR_LABELS[grade];
      s.prediction.referable = grade >= 2;
    }
    if (r) r.status = "completed";
    const finalGrade = s.overrideGrade ?? s.prediction.grade;
    if (finalGrade >= 2) {
      const ref: Referral = {
        id: `REF-${String(db.referrals.length + 1).padStart(3, "0")}`,
        patientId: s.patientId,
        patientName: s.patientName,
        screeningId: s.id,
        priority: s.triage.priority,
        referredTo: "District Hospital Eye OPD",
        status: "pending",
        date: new Date().toISOString().slice(0, 10),
        notes: note,
      };
      db.referrals.unshift(ref);
      save(db);
      return { next: "referral" as const, referralId: ref.id };
    }
    const fu: FollowUp = {
      id: `FU-${String(db.followups.length + 1).padStart(3, "0")}`,
      patientId: s.patientId,
      patientName: s.patientName,
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString().slice(0, 10),
      priority: "LOW",
      doctor: "Dr. Suresh Patnaik",
      status: "upcoming",
    };
    db.followups.unshift(fu);
    save(db);
    return { next: "followup" as const, followupId: fu.id };
  },

  async listReferrals(status?: string) {
    await delay(200);
    const items = load().referrals;
    if (!status || status === "all") return items;
    return items.filter((r) => r.status === status);
  },

  async createReferral(screeningId: string, referredTo: string) {
    await delay(320);
    const db = load();
    const s = db.screenings.find((x) => x.id === screeningId);
    if (!s) throw new Error("Screening not found");
    const ref: Referral = {
      id: `REF-${String(db.referrals.length + 1).padStart(3, "0")}`,
      patientId: s.patientId,
      patientName: s.patientName,
      screeningId,
      priority: s.triage.priority,
      referredTo,
      status: "pending",
      date: new Date().toISOString().slice(0, 10),
    };
    db.referrals.unshift(ref);
    const p = db.patients.find((x) => x.id === s.patientId);
    if (p) p.status = "referred";
    save(db);
    return ref;
  },

  async listFollowups() {
    await delay(200);
    return load().followups;
  },

  async updateFollowup(id: string, status: FollowUp["status"], date?: string) {
    await delay(260);
    const db = load();
    const f = db.followups.find((x) => x.id === id);
    if (!f) throw new Error("Follow-up not found");
    f.status = status;
    if (date) f.date = date;
    save(db);
    return f;
  },

  async simulate(p: SimulationParams): Promise<SimulationResult> {
    await delay(450);
    const cameraCapacity = p.cameras * ((8 * 3600) / 90);
    const aiCapacity = (8 * 3600) / p.aiSeconds;
    const bandwidthCap = (p.bandwidthMbps * 1024) / 2.5;
    const doctorCap = p.ophthalmologists * ((8 * 3600) / p.reviewSeconds);
    const demand = p.patientsPerDay;
    const capture = Math.min(demand, cameraCapacity, bandwidthCap);
    const analyzed = Math.min(capture, aiCapacity);
    const reviewsNeeded = analyzed * (p.referableRate / 100);
    const reviewed = Math.min(reviewsNeeded, doctorCap);
    const dailyThroughput = Math.round(analyzed);
    const doctorUtilization = Math.min(1, reviewsNeeded / Math.max(1, doctorCap));
    const aiUtilization = Math.min(1, capture / Math.max(1, aiCapacity));
    const cameraUtil = Math.min(1, demand / Math.max(1, cameraCapacity));
    const wait =
      doctorUtilization > 0.9
        ? 45 + doctorUtilization * 80
        : cameraUtil > 0.9
          ? 25
          : 8 + aiUtilization * 12;
    const backlog = Math.max(0, Math.round(reviewsNeeded - reviewed));
    let bottleneck = "No critical bottleneck";
    let recommendation = "Capacity is balanced for the current district load.";
    if (doctorUtilization >= cameraUtil && doctorUtilization >= aiUtilization && doctorUtilization > 0.75) {
      bottleneck = "Ophthalmologist review capacity is currently the primary bottleneck.";
      recommendation = "Add one remote reviewer or reduce average review time with structured templates.";
    } else if (cameraUtil > 0.8) {
      bottleneck = "Fundus camera throughput is the primary bottleneck.";
      recommendation = "Add a camera at the highest-volume PHC or stagger camp hours.";
    } else if (aiUtilization > 0.85) {
      bottleneck = "AI processing queue is the primary bottleneck.";
      recommendation = "Batch uploads overnight or provision a second inference worker.";
    } else if (p.bandwidthMbps < 1.5) {
      bottleneck = "Network bandwidth is constraining image upload.";
      recommendation = "Enable offline capture with delayed sync at the nearest 4G tower.";
    }
    const queue = Array.from({ length: 9 }, (_, i) => ({
      hour: 8 + i,
      length: Math.max(0, Math.round(8 + i * (demand / 40) - reviewed / 9 + (i % 3) * 4)),
    }));
    return {
      dailyThroughput,
      averageWaitMinutes: Math.round(wait),
      aiUtilization,
      doctorUtilization,
      referralBacklog: backlog,
      bottleneck,
      recommendation,
      queue,
      utilization: [
        { name: "Cameras", value: Math.round(cameraUtil * 100) },
        { name: "AI", value: Math.round(aiUtilization * 100) },
        { name: "Doctors", value: Math.round(doctorUtilization * 100) },
        { name: "Network", value: Math.round(Math.min(1, demand / Math.max(1, bandwidthCap)) * 100) },
      ],
      flow: [
        { stage: "Registered", patients: demand },
        { stage: "Captured", patients: Math.round(capture) },
        { stage: "AI graded", patients: dailyThroughput },
        { stage: "Reviewed", patients: Math.round(reviewed) },
        { stage: "Referred", patients: Math.round(reviewed * 0.7) },
      ],
    };
  },

  enqueue(type: string, payload: unknown) {
    const db = load();
    db.queue.push({ id: `Q-${Date.now()}`, type, payload, createdAt: new Date().toISOString() });
    save(db);
    return db.queue.length;
  },

  pendingCount() {
    return load().queue.length;
  },

  async flushQueue() {
    await delay(600);
    const db = load();
    db.queue = [];
    save(db);
  },
};
