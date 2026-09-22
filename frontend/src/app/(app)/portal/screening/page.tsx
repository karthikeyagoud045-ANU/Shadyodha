"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  FileCheck,
  FileText,
  HelpCircle,
  Info,
  Layers,
  Plus,
  ScanEye,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { SEED_SCREENINGS } from "@/services/seed";
import { generatePdfReport } from "@/lib/pdfReportService";

export default function PatientScreeningPage() {
  const patientScreening = SEED_SCREENINGS[0];
  const [downloading, setDownloading] = useState(false);

  function handleDownload() {
    setDownloading(true);
    generatePdfReport(patientScreening);
    setTimeout(() => setDownloading(false), 800);
  }

  return (
    <div className="relative space-y-6 pb-16">
      {/* Eye Ambient HUD Artwork Banner matching Doctor Portal */}
      <div className="pointer-events-none absolute -left-8 -right-8 -top-6 h-80 overflow-hidden z-0 rounded-b-3xl">
        <img
          src="/drishti_hero_bg.jpg"
          alt="AI Retinal Scan"
          className="h-full w-full object-cover object-center opacity-45 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-500/15 via-[#EFF3FD]/75 to-[#EFF3FD]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#EFF3FD]/80 via-transparent to-[#EFF3FD]/80" />
      </div>

      {/* Top Header Card */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-sky-200/80 bg-white/95 p-6 shadow-card backdrop-blur-md md:p-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-700 border border-sky-200">
              {patientScreening.id}
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500 font-medium">
              Screened on {new Date(patientScreening.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            My Retinal AI Screening & Diagnostic Report
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            AI Diagnosis: <strong className="text-amber-600">Level 2 (Moderate NPDR)</strong> &bull; Referral:{" "}
            <span className="font-semibold text-rose-600">Ophthalmologist Review Required</span>
          </p>
        </div>

        {/* 1-Click PDF Report Download Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="btn-attract flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#5B4EFF] to-[#8659F6] px-6 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:brightness-105 transition active:scale-95"
          >
            <Download className="h-4 w-4" />
            <span>{downloading ? "Generating PDF..." : "Download PDF Report"}</span>
          </button>
        </div>
      </div>

      {/* Retinal Fundus & Grad-CAM Heatmap Visualizer */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: Original Fundus Photo */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Eye className="h-4 w-4 text-sky-600" />
              <span>Retinal Fundus Photograph</span>
            </h2>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              Quality: 92% Gradable
            </span>
          </div>

          <div className="relative h-72 overflow-hidden rounded-2xl bg-black shadow-inner">
            <img
              src={patientScreening.explainability.originalUrl}
              alt="Retinal Fundus"
              className="h-full w-full object-cover"
            />
          </div>
          <p className="mt-3 text-xs text-slate-500 leading-relaxed">
            High-resolution macular centered fundus view taken at Gajapati Field Health Camp showing retinal vessels and disc margins.
          </p>
        </div>

        {/* Right: Grad-CAM Neural Attention Heatmap */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-600" />
              <span>Explainable Grad-CAM Heatmap</span>
            </h2>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200">
              AI Attention Regions
            </span>
          </div>

          <div className="relative h-72 overflow-hidden rounded-2xl bg-black shadow-inner">
            <img
              src={patientScreening.explainability.gradcamUrl}
              alt="Grad-CAM Heatmap"
              className="h-full w-full object-cover"
            />
          </div>
          <p className="mt-3 text-xs text-slate-500 leading-relaxed">
            Highlighted red and yellow zones signify where DRISHTI neural network identified vascular leaks, microaneurysms, and lipid exudates.
          </p>
        </div>
      </div>

      {/* Quantified Biomarkers Detected */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card">
        <h2 className="text-base font-bold text-slate-900 mb-4">
          Quantified Retinal Biomarkers Detected by AI
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
            <p className="text-xs text-slate-500 font-medium">Microaneurysms</p>
            <p className="mt-1 text-3xl font-black text-indigo-700">
              {patientScreening.explainability.lesions.microaneurysm}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Capillary outpouchings</p>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
            <p className="text-xs text-slate-500 font-medium">Intraretinal Hemorrhages</p>
            <p className="mt-1 text-3xl font-black text-rose-600">
              {patientScreening.explainability.lesions.hemorrhage}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Dot and blot bleeds</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
            <p className="text-xs text-slate-500 font-medium">Hard Exudates</p>
            <p className="mt-1 text-3xl font-black text-amber-600">
              {patientScreening.explainability.lesions.hardExudate}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Lipid deposits</p>
          </div>
        </div>
      </div>

      {/* Clinical Guidance Box */}
      <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50/80 via-white to-purple-50/50 p-6 shadow-card">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-sky-600" />
          <h3 className="text-sm font-bold text-slate-900">
            What Your Results Mean & Next Steps
          </h3>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs text-slate-700">
          <div className="rounded-2xl bg-white/80 p-4 border border-slate-100">
            <p className="font-bold text-slate-900 mb-1">1. Schedule Ophthalmologist Visit</p>
            <p className="text-slate-500 leading-relaxed">
              Moderate NPDR requires clinical verification with slit-lamp biomicroscopy within 3 to 4 weeks.
            </p>
          </div>
          <div className="rounded-2xl bg-white/80 p-4 border border-slate-100">
            <p className="font-bold text-slate-900 mb-1">2. Strict Glycemic & BP Control</p>
            <p className="text-slate-500 leading-relaxed">
              Target HbA1c below 7.0% and blood pressure under 130/80 mmHg to prevent advancement to severe NPDR.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
