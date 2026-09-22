import type {
  Appointment,
  Doctor,
  FollowUp,
  Medicine,
  Patient,
  Referral,
  ReviewCase,
  Screening,
  User,
} from "@/types";

export const DEMO_USERS: Record<string, { password: string; user: User }> = {
  "hw@drishti.ai": {
    password: "demo123",
    user: {
      id: "u-hw-1",
      name: "Anita Behera",
      email: "hw@drishti.ai",
      role: "health_worker",
      facility: "PHC R. Udayagiri",
      district: "Gajapati",
    },
  },
  "doctor@drishti.ai": {
    password: "demo123",
    user: {
      id: "u-op-1",
      name: "Dr. Suresh Patnaik",
      email: "doctor@drishti.ai",
      role: "ophthalmologist",
      facility: "District Hospital, Paralakhemundi",
      district: "Gajapati",
    },
  },
  "admin@drishti.ai": {
    password: "demo123",
    user: {
      id: "u-ad-1",
      name: "Meera Rao",
      email: "admin@drishti.ai",
      role: "admin",
      facility: "NPCB State Cell",
      district: "Bhubaneswar",
    },
  },
  "patient@drishti.ai": {
    password: "demo123",
    user: {
      id: "PT-2024-001",
      name: "Kamala Naik",
      email: "patient@drishti.ai",
      role: "patient",
      facility: "Luhagudi Sub-Center",
      district: "Gajapati",
    },
  },
};

const fundus = (n: number) => `/mock-images/fundus-${(n % 4) + 1}.svg`;
const cam = (n: number) => `/mock-images/gradcam-${(n % 4) + 1}.svg`;
const ann = (n: number) => `/mock-images/annotation-${(n % 4) + 1}.svg`;

const names = [
  ["Kamala Naik", "f", "Luhagudi", "Gajapati"],
  ["Rabi Gouda", "m", "Mohana", "Gajapati"],
  ["Saraswati Sabar", "f", "Rayagada", "Rayagada"],
  ["Dhanu Mandi", "m", "Bissamcuttack", "Rayagada"],
  ["Laxmi Jani", "f", "Koraput", "Koraput"],
  ["Gopal Khila", "m", "Jeypore", "Koraput"],
  ["Sita Majhi", "f", "Bhawanipatna", "Kalahandi"],
  ["Hari Pujari", "m", "Junagarh", "Kalahandi"],
  ["Bimala Tudu", "f", "Baripada", "Mayurbhanj"],
  ["Sunil Hembram", "m", "Rairangpur", "Mayurbhanj"],
  ["Nirmala Sahu", "f", "Berhampur", "Ganjam"],
  ["Prakash Behera", "m", "Chhatrapur", "Ganjam"],
  ["Manju Pradhan", "f", "Phulbani", "Kandhamal"],
  ["Arjun Mallick", "m", "Baliguda", "Kandhamal"],
  ["Padmini Das", "f", "Puri", "Puri"],
  ["Bijay Swain", "m", "Nimapada", "Puri"],
  ["Rekha Mohanty", "f", "Cuttack", "Cuttack"],
  ["Ashok Jena", "m", "Athagarh", "Cuttack"],
  ["Tulsi Dei", "f", "Keonjhar", "Keonjhar"],
  ["Manoj Naik", "m", "Champua", "Keonjhar"],
  ["Geeta Khandagiri", "f", "Khordha", "Khordha"],
  ["Santosh Rout", "m", "Jatni", "Khordha"],
  ["Anita Hansda", "f", "Rairangpur", "Mayurbhanj"],
  ["Kailash Bhoi", "m", "Nuapada", "Nuapada"],
] as const;

export const SEED_PATIENTS: Patient[] = names.map((row, i) => {
  const [name, g, village, district] = row;
  const statuses: Patient["status"][] = ["active", "referred", "follow_up", "completed"];
  return {
    id: `PT-2024-${String(i + 1).padStart(3, "0")}`,
    name,
    age: 38 + ((i * 7) % 32),
    gender: g === "f" ? "female" : "male",
    phone: `98${String(40000000 + i * 137).slice(0, 8)}`,
    village,
    district,
    diabetesStatus: i % 9 === 0 ? "type1" : "type2",
    diabetesDurationYears: 2 + (i % 14),
    lastScreeningAt: i % 5 === 0 ? null : new Date(2026, 7, 1 + i).toISOString(),
    status: statuses[i % 4],
    registeredAt: new Date(2026, 5, 4 + i).toISOString(),
  };
});

const grades: Screening["prediction"]["grade"][] = [0, 1, 2, 2, 3, 4, 1, 2, 0, 3, 2, 1, 4, 2, 0, 3, 1, 2, 2, 3];

export const SEED_SCREENINGS: Screening[] = SEED_PATIENTS.slice(0, 20).map((p, i) => {
  const grade = grades[i];
  const labels = ["No DR", "Mild NPDR", "Moderate NPDR", "Severe NPDR", "Proliferative DR"] as const;
  const conf = 0.72 + (i % 9) * 0.025;
  const referable = grade >= 2;
  const priority = grade >= 3 ? "HIGH" : grade === 2 ? "MEDIUM" : "LOW";
  const n = i + 1;
  return {
    id: `SCR-2024-${String(n).padStart(3, "0")}`,
    patientId: p.id,
    patientName: p.name,
    date: new Date(2026, 8, 1 + (i % 18), 9, (i * 11) % 50).toISOString(),
    status: i % 7 === 0 ? "reviewed" : "completed",
    imageQuality: {
      gradable: i !== 11,
      score: i === 11 ? 0.41 : 0.86 + (i % 5) * 0.02,
      focusScore: i === 11 ? 0.38 : 0.84 + (i % 6) * 0.02,
      illuminationScore: 0.88 + (i % 4) * 0.02,
      fovPercentage: i === 11 ? 62 : 91 + (i % 6),
      reason: i === 11 ? "Insufficient illumination and incomplete field of view." : undefined,
    },
    prediction: {
      grade,
      label: labels[grade],
      confidence: Number(conf.toFixed(2)),
      calibratedConfidence: Number((conf - 0.03).toFixed(2)),
      referable,
    },
    explainability: {
      originalUrl: fundus(i),
      gradcamUrl: cam(i),
      overlayUrl: cam(i),
      annotationUrl: ann(i),
      lesions: {
        microaneurysm: grade === 0 ? 0 : 8 + grade * 12 + (i % 5),
        hemorrhage: grade <= 1 ? (grade === 1 ? 3 : 0) : 6 + grade * 4,
        hardExudate: grade <= 1 ? 0 : 3 + grade * 2,
      },
      evidence:
        grade === 0
          ? "No referable diabetic retinopathy features were highlighted. Routine annual screening is appropriate."
          : `The model identified retinal regions associated with ${labels[grade].toLowerCase()}. The prediction is supported by detected microaneurysms${grade >= 2 ? ", hemorrhages, and hard exudates" : ""}.`,
    },
    triage: {
      priority,
      action: referable ? "OPHTHALMOLOGIST_REVIEW" : "ROUTINE_FOLLOWUP",
      recommendedTimeline:
        grade >= 4 ? "Within 24–48 hours" : grade === 3 ? "Within 7 days" : grade === 2 ? "Within 4 weeks" : "12 months",
    },
  };
});

// Canonical demo case matching the spec
SEED_SCREENINGS[0] = {
  ...SEED_SCREENINGS[0],
  id: "SCR-2024-001",
  prediction: {
    grade: 2,
    label: "Moderate NPDR",
    confidence: 0.87,
    calibratedConfidence: 0.84,
    referable: true,
  },
  imageQuality: {
    gradable: true,
    score: 0.92,
    focusScore: 0.88,
    illuminationScore: 0.91,
    fovPercentage: 94.5,
  },
  explainability: {
    ...SEED_SCREENINGS[0].explainability,
    lesions: { microaneurysm: 42, hemorrhage: 15, hardExudate: 8 },
    evidence:
      "The model identified retinal regions associated with moderate diabetic retinopathy. The prediction is supported by detected microaneurysms, hemorrhages, and hard exudates.",
  },
  triage: {
    priority: "HIGH",
    action: "OPHTHALMOLOGIST_REVIEW",
    recommendedTimeline: "Within 7 days",
  },
};

export const SEED_REVIEWS: ReviewCase[] = SEED_SCREENINGS.filter((s) => s.prediction.referable && s.status !== "reviewed").map(
  (s, i) => ({
    id: `REV-${s.id}`,
    screeningId: s.id,
    patientName: s.patientName,
    date: s.date,
    grade: s.prediction.grade,
    confidence: s.prediction.confidence,
    priority: s.triage.priority,
    imageQuality: s.imageQuality.score,
    timeSinceUpload: `${2 + i}h`,
    status: "pending",
  }),
);

export const SEED_REFERRALS: Referral[] = [
  { id: "REF-001", patientId: "PT-2024-001", patientName: "Kamala Naik", screeningId: "SCR-2024-001", priority: "HIGH", referredTo: "DH Paralakhemundi Eye OPD", status: "pending", date: "2026-09-18" },
  { id: "REF-002", patientId: "PT-2024-004", patientName: "Dhanu Mandi", screeningId: "SCR-2024-004", priority: "MEDIUM", referredTo: "SDH Gunupur", status: "scheduled", date: "2026-09-16" },
  { id: "REF-003", patientId: "PT-2024-005", patientName: "Laxmi Jani", screeningId: "SCR-2024-005", priority: "HIGH", referredTo: "MKCG Medical College", status: "completed", date: "2026-09-10" },
  { id: "REF-004", patientId: "PT-2024-006", patientName: "Gopal Khila", screeningId: "SCR-2024-006", priority: "HIGH", referredTo: "LVPEI Bhubaneswar", status: "missed", date: "2026-09-08" },
  { id: "REF-005", patientId: "PT-2024-010", patientName: "Sunil Hembram", screeningId: "SCR-2024-010", priority: "HIGH", referredTo: "DH Baripada", status: "pending", date: "2026-09-19" },
  { id: "REF-006", patientId: "PT-2024-013", patientName: "Manju Pradhan", screeningId: "SCR-2024-013", priority: "HIGH", referredTo: "SCB Medical College", status: "scheduled", date: "2026-09-14" },
  { id: "REF-007", patientId: "PT-2024-016", patientName: "Bijay Swain", screeningId: "SCR-2024-016", priority: "HIGH", referredTo: "DH Puri", status: "completed", date: "2026-09-05" },
  { id: "REF-008", patientId: "PT-2024-018", patientName: "Ashok Jena", screeningId: "SCR-2024-018", priority: "MEDIUM", referredTo: "DH Cuttack", status: "pending", date: "2026-09-17" },
];

export const SEED_FOLLOWUPS: FollowUp[] = [
  { id: "FU-001", patientId: "PT-2024-002", patientName: "Rabi Gouda", date: "2026-09-22", priority: "LOW", doctor: "Dr. Suresh Patnaik", status: "upcoming" },
  { id: "FU-002", patientId: "PT-2024-003", patientName: "Saraswati Sabar", date: "2026-09-24", priority: "MEDIUM", doctor: "Dr. Anita Mishra", status: "upcoming" },
  { id: "FU-003", patientId: "PT-2024-007", patientName: "Sita Majhi", date: "2026-09-12", priority: "HIGH", doctor: "Dr. Suresh Patnaik", status: "overdue" },
  { id: "FU-004", patientId: "PT-2024-008", patientName: "Hari Pujari", date: "2026-09-11", priority: "MEDIUM", doctor: "Dr. Anita Mishra", status: "overdue" },
  { id: "FU-005", patientId: "PT-2024-011", patientName: "Nirmala Sahu", date: "2026-08-28", priority: "LOW", doctor: "Dr. Suresh Patnaik", status: "completed" },
  { id: "FU-006", patientId: "PT-2024-015", patientName: "Padmini Das", date: "2026-09-26", priority: "LOW", doctor: "Dr. R. Mohanty", status: "upcoming" },
  { id: "FU-007", patientId: "PT-2024-017", patientName: "Rekha Mohanty", date: "2026-09-09", priority: "HIGH", doctor: "Dr. Suresh Patnaik", status: "overdue" },
  { id: "FU-008", patientId: "PT-2024-019", patientName: "Tulsi Dei", date: "2026-08-20", priority: "MEDIUM", doctor: "Dr. Anita Mishra", status: "completed" },
];

export const SEED_DOCTORS: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Suresh Patnaik, MD (Ophthal)",
    specialty: "Senior Vitreo-Retinal Surgeon",
    qualifications: "AIIMS New Delhi, Fellowship in Medical & Surgical Retina",
    hospital: "District Hospital Eye OPD, Paralakhemundi",
    experienceYears: 16,
    availableDays: ["Mon", "Wed", "Fri", "Sat"],
    slots: ["09:30 AM", "11:00 AM", "02:30 PM", "04:00 PM"],
    avatar: "/mock-images/doc-1.svg",
    rating: 4.9,
  },
  {
    id: "doc-2",
    name: "Dr. Ananya Sen, MD, DM (Endo)",
    specialty: "Consultant Diabetologist & Endocrinologist",
    qualifications: "SCB Medical College, CCEBDM Certified Diabetologist",
    hospital: "Metabolic Health & Diabetes Care Center",
    experienceYears: 12,
    availableDays: ["Tue", "Thu", "Sat"],
    slots: ["10:00 AM", "11:30 AM", "03:00 PM", "05:00 PM"],
    avatar: "/mock-images/doc-2.svg",
    rating: 4.8,
  },
  {
    id: "doc-3",
    name: "Dr. Rajesh Sharma, DO, DNB",
    specialty: "Comprehensive Eye Care & Laser Specialist",
    qualifications: "LV Prasad Eye Institute Fellow",
    hospital: "Community Health Center Tele-Clinic",
    experienceYears: 9,
    availableDays: ["Mon", "Tue", "Thu", "Fri"],
    slots: ["10:30 AM", "01:00 PM", "03:30 PM"],
    avatar: "/mock-images/doc-3.svg",
    rating: 4.7,
  },
];

export const SEED_MEDICINES: Medicine[] = [
  {
    id: "med-1",
    name: "Metformin Hydrochloride",
    dosage: "500 mg",
    frequency: "Twice daily",
    timing: "after_food",
    timeSlots: ["08:30 AM", "08:30 PM"],
    instructions: "Take with or right after meals to avoid gastrointestinal irritation.",
    active: true,
  },
  {
    id: "med-2",
    name: "Glimepiride",
    dosage: "1 mg",
    frequency: "Once daily",
    timing: "before_food",
    timeSlots: ["08:00 AM"],
    instructions: "Take 15-30 minutes before breakfast with a glass of water.",
    active: true,
  },
  {
    id: "med-3",
    name: "Carboxymethylcellulose Eye Drops",
    dosage: "1-2 drops",
    frequency: "3 times daily",
    timing: "with_food",
    timeSlots: ["09:00 AM", "02:00 PM", "09:00 PM"],
    instructions: "Lubricating eye drops to relieve dry eye and retinal strain.",
    active: true,
  },
];

export const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: "apt-1",
    patientId: "PT-2024-001",
    patientName: "Kamala Naik",
    doctorId: "doc-1",
    doctorName: "Dr. Suresh Patnaik, MD (Ophthal)",
    specialty: "Senior Vitreo-Retinal Surgeon",
    date: "2026-09-25",
    timeSlot: "11:00 AM",
    status: "confirmed",
    reason: "Diabetic Retinopathy Follow-up & Dilated Fundus Exam",
    hospital: "District Hospital Eye OPD, Paralakhemundi",
  },
  {
    id: "apt-2",
    patientId: "PT-2024-001",
    patientName: "Kamala Naik",
    doctorId: "doc-2",
    doctorName: "Dr. Ananya Sen, MD, DM (Endo)",
    specialty: "Consultant Diabetologist",
    date: "2026-10-08",
    timeSlot: "10:00 AM",
    status: "scheduled",
    reason: "Quarterly HbA1c Review and Medication Adjustment",
    hospital: "Metabolic Health & Diabetes Care Center",
  },
];
