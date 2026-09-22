export type UserRole = "health_worker" | "ophthalmologist" | "admin" | "patient";

export type ConnectionStatus = "online" | "offline" | "syncing";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  facility: string;
  district: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export type Gender = "female" | "male" | "other";
export type DiabetesStatus = "type1" | "type2" | "gestational" | "none" | "unknown";
export type PatientStatus = "active" | "referred" | "follow_up" | "completed";

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  village: string;
  district: string;
  diabetesStatus: DiabetesStatus;
  diabetesDurationYears: number;
  lastScreeningAt: string | null;
  status: PatientStatus;
  registeredAt: string;
}

export type DrGrade = 0 | 1 | 2 | 3 | 4;
export type ScreeningStatus =
  | "registered"
  | "image_captured"
  | "quality_check"
  | "ai_analysis"
  | "completed"
  | "needs_recapture"
  | "reviewed";
export type Priority = "HIGH" | "MEDIUM" | "LOW";
export type TriageAction = "OPHTHALMOLOGIST_REVIEW" | "ROUTINE_FOLLOWUP" | "NO_REFERRAL";

export interface ImageQuality {
  gradable: boolean;
  score: number;
  focusScore: number;
  illuminationScore: number;
  fovPercentage: number;
  reason?: string;
}

export interface Prediction {
  grade: DrGrade;
  label: string;
  confidence: number;
  calibratedConfidence: number;
  referable: boolean;
}

export interface LesionCounts {
  microaneurysm: number;
  hemorrhage: number;
  hardExudate: number;
  cottonWool?: number;
}

export interface Explainability {
  gradcamUrl: string;
  overlayUrl: string;
  annotationUrl: string;
  originalUrl: string;
  lesions: LesionCounts;
  evidence: string;
}

export interface Triage {
  priority: Priority;
  action: TriageAction;
  recommendedTimeline: string;
}

export interface Screening {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  status: ScreeningStatus;
  imageQuality: ImageQuality;
  prediction: Prediction;
  explainability: Explainability;
  triage: Triage;
  reviewedBy?: string;
  clinicalNote?: string;
  overrideGrade?: DrGrade;
}

export type ReviewDecision = "confirm" | "override" | "recapture";

export interface ReviewCase {
  id: string;
  screeningId: string;
  patientName: string;
  date: string;
  grade: DrGrade;
  confidence: number;
  priority: Priority;
  imageQuality: number;
  timeSinceUpload: string;
  status: "pending" | "completed";
}

export type ReferralStatus = "pending" | "scheduled" | "completed" | "missed";

export interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  screeningId: string;
  priority: Priority;
  referredTo: string;
  status: ReferralStatus;
  date: string;
  notes?: string;
}

export type FollowUpStatus = "upcoming" | "overdue" | "completed";

export interface FollowUp {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  priority: Priority;
  doctor: string;
  status: FollowUpStatus;
}

export interface SimulationParams {
  patientsPerDay: number;
  cameras: number;
  aiSeconds: number;
  ophthalmologists: number;
  reviewSeconds: number;
  bandwidthMbps: number;
  referableRate: number;
}

export interface SimulationResult {
  dailyThroughput: number;
  averageWaitMinutes: number;
  aiUtilization: number;
  doctorUtilization: number;
  referralBacklog: number;
  bottleneck: string;
  recommendation: string;
  queue: { hour: number; length: number }[];
  utilization: { name: string; value: number }[];
  flow: { stage: string; patients: number }[];
}

export interface SyncItem {
  id: string;
  type: string;
  payload: unknown;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timing: "before_food" | "after_food" | "with_food";
  timeSlots: string[]; // e.g. ["08:00 AM", "08:00 PM"]
  instructions: string;
  active: boolean;
}

export interface MedicineReminder {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  time: string;
  timing: string;
  takenToday: boolean;
  alertSound?: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualifications: string;
  hospital: string;
  experienceYears: number;
  availableDays: string[];
  slots: string[];
  avatar: string;
  rating: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  timeSlot: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  reason: string;
  hospital: string;
}

export interface FoodAnalysisResult {
  dishName: string;
  verdict: "diabetic_friendly" | "moderate" | "avoid";
  sugarGrams: number;
  totalCarbsGrams: number;
  fiberGrams: number;
  glycemicIndex: number;
  glycemicCategory: "Low" | "Medium" | "High";
  explanation: string;
  recommendations: string[];
  safePortionGuide: string;
}
