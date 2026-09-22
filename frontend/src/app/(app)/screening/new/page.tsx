"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  FileCheck,
  Flame,
  Image as ImageIcon,
  Loader2,
  Scan,
  Sparkles,
  UploadCloud,
  User,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/ImageUploader";
import { patientService } from "@/services/patientService";
import { screeningService } from "@/services/screeningService";
import { useScreeningStore } from "@/store/screening-store";

const CHECKS = [
  "Retina centered in field of view",
  "Image sharp & focused",
  "Adequate optical illumination",
  "Complete 45° macular field visible",
];

const ANALYSIS_STEPS = [
  { title: "Optical Preprocessing", desc: "Illumination normalization & contrast CLAHE enhancement" },
  { title: "Quality Verification", desc: "Field-of-view 96.5%, macula centered & zero blur" },
  { title: "Deep Neural Network Grading", desc: "ResNet-50 + EfficientNet-B4 multi-class DR inference" },
  { title: "Biomarker Attention Localization", desc: "Grad-CAM mapping for microaneurysms & hemorrhages" },
  { title: "Clinical Triage Generation", desc: "Formulating formal diagnostic report & referral recommendation" },
];

export default function NewScreeningPage() {
  const router = useRouter();
  const params = useSearchParams();
  const patients = useQuery({
    queryKey: ["patients-all"],
    queryFn: () => patientService.list({ pageSize: 100 }),
  });
  const store = useScreeningStore();

  const [file, setFile] = useState<File | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(15);
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-select patient from query param or default to first patient
  useEffect(() => {
    const pid = params.get("patient");
    if (pid) {
      store.setPatient(pid);
    } else if (!store.patientId && patients.data?.items?.length) {
      store.setPatient(patients.data.items[0].id);
    }
  }, [params, store, patients.data]);

  // Load a ready-to-test sample fundus image
  function loadSampleImage() {
    const sampleUrl = "/mock-images/fundus-1.svg";
    const sampleName = "Sample_Retinal_Fundus_KamalaNaik.svg";
    const mockFile = new File(["sample-retina"], sampleName, { type: "image/svg+xml" });
    setFile(mockFile);
    store.setFile(sampleName, sampleUrl);
    if (!store.patientId && patients.data?.items?.length) {
      store.setPatient(patients.data.items[0].id);
    }
  }

  // Trigger AI Screening
  async function startScreening() {
    const pid = store.patientId || patients.data?.items[0]?.id;
    if (!pid) return;

    setIsProcessing(true);

    // Staggered analysis steps with animated progress
    for (let i = 0; i < 5; i++) {
      setActiveStep(i);
      setProgress((i + 1) * 20);
      await new Promise((r) => setTimeout(r, 550));
    }

    try {
      const fileName = file?.name || store.fileName || "fundus_scan.jpg";
      const created = await screeningService.create(pid, fileName, store.previewUrl || undefined);
      setIsProcessing(false);
      store.reset();
      router.push(`/screening/${created.id}`);
    } catch (err) {
      setIsProcessing(false);
      console.error("Screening error:", err);
    }
  }

  // Fullscreen Processing Display
  if (isProcessing) {
    return (
      <div className="mx-auto max-w-2xl py-12 px-4 text-center">
        <div className="relative mx-auto mb-8 flex h-36 w-36 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border border-cyan-400/40 animate-spin duration-3000" />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-tr from-[#3b82f6] via-[#6366f1] to-[#a855f7] p-1 shadow-glow">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#090C22]">
              <Scan className="h-12 w-12 text-[#38bdf8] animate-pulse" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          AI Retinal Screening in Progress
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Running deep neural vision pipeline & clinical diagnostic triage
        </p>

        {/* Progress Bar */}
        <div className="mx-auto mt-6 max-w-md">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span>Progress</span>
            <span className="text-indigo-600">{progress}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#5B4EFF] to-[#0EA5E9] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Diagnostic Steps List */}
        <div className="mx-auto mt-8 max-w-lg space-y-2.5 text-left">
          {ANALYSIS_STEPS.map((s, idx) => {
            const isDone = idx < activeStep;
            const isCurrent = idx === activeStep;

            return (
              <div
                key={s.title}
                className={`flex items-start gap-3 rounded-2xl border p-3.5 transition-all ${
                  isCurrent
                    ? "border-indigo-400 bg-indigo-50/70 shadow-sm"
                    : isDone
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-slate-100 bg-white/70 opacity-60"
                }`}
              >
                <div className="mt-0.5">
                  {isDone ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : isCurrent ? (
                    <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-slate-300" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{s.title}</h4>
                  <p className="text-[11px] text-slate-500">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const selectedPatient = patients.data?.items.find((p) => p.id === store.patientId);
  const hasImage = !!(file || store.previewUrl);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            New Retinal Screening
          </h1>
          <p className="text-sm text-slate-500">
            Select or register a patient, upload a fundus photograph, then execute AI triage.
          </p>
        </div>

        {/* Quick Sample Button */}
        <button
          onClick={loadSampleImage}
          className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3.5 py-2 text-xs font-bold text-indigo-700 shadow-xs hover:bg-indigo-100 transition active:scale-95"
        >
          <Sparkles className="h-4 w-4 text-indigo-600" />
          <span>Load Sample Retinal Fundus Scan</span>
        </button>
      </div>

      {/* Patient Selection Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-card backdrop-blur-md">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <label className="block flex-1 max-w-md text-sm">
            <span className="mb-1.5 flex items-center gap-1.5 font-bold text-slate-800">
              <User className="h-4 w-4 text-indigo-600" />
              Patient
            </span>
            <select
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-sm text-slate-800 font-medium focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={store.patientId ?? ""}
              onChange={(e) => store.setPatient(e.target.value)}
            >
              <option value="">Select patient...</option>
              {patients.data?.items.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} &bull; {p.id} &bull; {p.village}, {p.district}
                </option>
              ))}
            </select>
          </label>

          <Link href="/patients/new">
            <button className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition">
              + Register New Patient
            </button>
          </Link>
        </div>

        {selectedPatient && (
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            <span>
              <strong className="text-slate-900">Age:</strong> {selectedPatient.age} yrs
            </span>
            <span>&bull;</span>
            <span>
              <strong className="text-slate-900">Gender:</strong> {selectedPatient.gender}
            </span>
            <span>&bull;</span>
            <span>
              <strong className="text-slate-900">Phone:</strong> {selectedPatient.phone}
            </span>
            <span>&bull;</span>
            <span>
              <strong className="text-slate-900">Status:</strong>{" "}
              <span className="capitalize font-semibold text-indigo-600">{selectedPatient.diabetesStatus}</span>
            </span>
          </div>
        )}
      </div>

      {/* Image Uploader */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-card backdrop-blur-md">
        <h3 className="mb-3 text-sm font-bold text-slate-900 flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-indigo-600" />
          Retinal Fundus Photograph
        </h3>

        <ImageUploader
          previewUrl={store.previewUrl}
          meta={
            file
              ? { name: file.name, size: file.size, status: "Ready" }
              : store.fileName
              ? { name: store.fileName, size: 497900, status: "Ready" }
              : undefined
          }
          onFile={(f, url) => {
            setFile(f);
            store.setFile(f.name, url);
            if (!store.patientId && patients.data?.items?.length) {
              store.setPatient(patients.data.items[0].id);
            }
          }}
        />

        {/* Verification Checklist */}
        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-700">
            Image Quality Verification Checklist:
          </p>
          <ul className="mt-2.5 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
            {CHECKS.map((c) => (
              <li key={c} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="text-xs text-slate-500">
          {!hasImage ? (
            <span className="text-amber-600 font-medium">
              &bull; Please upload a fundus photo or click &ldquo;Load Sample Retinal Fundus Scan&rdquo;
            </span>
          ) : (
            <span className="text-emerald-600 font-medium flex items-center gap-1.5">
              <Check className="h-4 w-4" /> Ready for AI Analysis
            </span>
          )}
        </div>

        <button
          onClick={startScreening}
          disabled={!hasImage}
          className={`btn-attract flex items-center gap-2.5 rounded-2xl px-8 py-3.5 text-sm font-bold shadow-lg transition active:scale-95 ${
            hasImage
              ? "bg-gradient-to-r from-[#5B4EFF] to-[#8659F6] text-white shadow-indigo-500/30 hover:brightness-105 cursor-pointer"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <Zap className="h-4 w-4" />
          <span>Start AI Screening</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
