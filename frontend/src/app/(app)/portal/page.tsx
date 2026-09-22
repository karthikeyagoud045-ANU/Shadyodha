"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Heart,
  Pill,
  Plus,
  ScanEye,
  Sparkles,
  Stethoscope,
  Utensils,
} from "lucide-react";
import { SEED_APPOINTMENTS, SEED_DOCTORS, SEED_MEDICINES, SEED_SCREENINGS } from "@/services/seed";
import { generatePdfReport } from "@/lib/pdfReportService";

export default function PatientOverviewPage() {
  const patientScreening = SEED_SCREENINGS[0];
  const upcomingAppointment = SEED_APPOINTMENTS[0];

  const [medChecklist, setMedChecklist] = useState<Record<string, boolean>>({
    "med-1": true,
    "med-2": false,
    "med-3": false,
  });

  const toggleMed = (id: string) => {
    setMedChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="relative space-y-6 pb-12">
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

      {/* 1. Patient Profile Hero Card */}
      <div className="relative z-10 overflow-hidden rounded-3xl border border-sky-300/40 bg-gradient-to-r from-[#0C1236] via-[#151D56] to-[#1E1B4B] p-6 text-white shadow-xl backdrop-blur-md md:p-8">
        {/* Glow decorative background elements */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-40 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-600 text-2xl font-extrabold text-white shadow-md">
              KN
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                  Kamala Naik
                </h1>
                <span className="rounded-full bg-sky-400/20 px-2.5 py-0.5 text-[11px] font-semibold text-sky-200 border border-sky-400/30">
                  Patient Portal
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-300">
                Patient ID: <strong className="text-white">PT-2024-001</strong> &bull; 52 yrs &bull; Female &bull; Luhagudi, Gajapati
              </p>
              <p className="mt-0.5 text-xs text-sky-200">
                Diagnosis: <span className="font-semibold text-white">Type 2 Diabetes (7 yrs)</span> &bull; Last HbA1c: <strong className="text-amber-300">7.8%</strong> (Target: &lt; 7.0%)
              </p>
            </div>
          </div>

          {/* Quick Health Stats */}
          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-xs text-center">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Retinal Grade</p>
              <p className="mt-0.5 text-sm font-bold text-amber-300">Level 2 Moderate</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-xs text-center">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Target Blood Sugar</p>
              <p className="mt-0.5 text-sm font-bold text-emerald-300">110 &ndash; 140 mg/dL</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Clinical Alert Banner */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-900">
              Retinopathy Follow-up Required: Moderate NPDR Detected
            </p>
            <p className="mt-0.5 text-xs text-amber-800">
              AI detected microaneurysms and intraretinal hemorrhages. Please maintain strict blood glucose control and attend your scheduled dilated fundus exam.
            </p>
          </div>
        </div>
        <button
          onClick={() => generatePdfReport(patientScreening)}
          className="btn-attract hidden shrink-0 items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 sm:flex"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Download PDF</span>
        </button>
      </div>

      {/* 3. Quick Action Launchpads (Left Nav Features direct access) */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
          My Care Services & Tools
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: AI Food Sugar Analyzer */}
          <Link
            href="/portal/diet"
            className="group hover-lift flex flex-col justify-between rounded-3xl border border-sky-100 bg-white p-5 shadow-card transition"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 transition group-hover:bg-sky-600 group-hover:text-white">
                <Utensils className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-sky-600 transition">
                AI Food & Sugar Analyzer
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Take photo of your meal. AI estimates sugar grams, glycemic index & diabetic safety.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-sky-600">
              <span>Scan Food Plate</span>
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 2: Medicines & Reminders */}
          <Link
            href="/portal/medicines"
            className="group hover-lift flex flex-col justify-between rounded-3xl border border-indigo-100 bg-white p-5 shadow-card transition"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                <Pill className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                Medicines & Reminders
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Prescription tracker, add medicine modal & active daily alarm notifications.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-600">
              <span>Manage 3 Prescriptions</span>
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 3: Doctors & Appointments */}
          <Link
            href="/portal/appointments"
            className="group hover-lift flex flex-col justify-between rounded-3xl border border-emerald-100 bg-white p-5 shadow-card transition"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-emerald-600 transition">
                Doctors & Schedule Visit
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Specialist retinal surgeons & diabetologists. Book slot or view scheduled visits.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600">
              <span>Book Appointment</span>
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 4: Retinal AI Screening & PDF */}
          <Link
            href="/portal/screening"
            className="group hover-lift flex flex-col justify-between rounded-3xl border border-purple-100 bg-white p-5 shadow-card transition"
          >
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 transition group-hover:bg-purple-600 group-hover:text-white">
                <ScanEye className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-purple-600 transition">
                Retinal AI Scan & PDF
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                View retinal fundus photo, Grad-CAM neural attention heatmap & download official PDF report.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-purple-600">
              <span>View Scan & PDF</span>
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </div>

      {/* 4. Two Column Content: Today's Meds Checklist + Upcoming Doctor Visit */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Today's Medication Tracker */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Today's Medication Schedule</h3>
                <p className="text-[11px] text-slate-400">Mark taken doses to maintain steady blood glucose</p>
              </div>
            </div>
            <Link
              href="/portal/medicines"
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              View all &rarr;
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {SEED_MEDICINES.map((med) => {
              const taken = !!medChecklist[med.id];
              return (
                <div
                  key={med.id}
                  onClick={() => toggleMed(med.id)}
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3.5 transition ${
                    taken
                      ? "border-emerald-200 bg-emerald-50/40"
                      : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-lg transition ${
                        taken
                          ? "bg-emerald-600 text-white"
                          : "border-2 border-slate-300 bg-white"
                      }`}
                    >
                      {taken && <CheckCircle2 className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${taken ? "text-slate-500 line-through" : "text-slate-800"}`}>
                        {med.name} &bull; <span className="font-medium text-slate-500">{med.dosage}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 capitalize">
                        {med.timing.replace("_", " ")} &bull; {med.timeSlots.join(", ")}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      taken
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {taken ? "Completed" : "Due"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Upcoming Specialist Visit Card */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Next Clinic Appointment</h3>
              </div>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                Confirmed
              </span>
            </div>

            <div className="mt-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/50 p-4 border border-indigo-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                Specialist Doctor
              </p>
              <h4 className="mt-1 text-base font-bold text-slate-900">
                {upcomingAppointment?.doctorName || "Dr. Suresh Patnaik"}
              </h4>
              <p className="text-xs font-semibold text-indigo-600">
                {upcomingAppointment?.specialty || "Vitreo-Retinal Specialist"}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {upcomingAppointment?.hospital || "District Hospital Eye OPD, Gajapati"}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-indigo-100 pt-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Date</span>
                  <p className="font-bold text-slate-800">
                    {upcomingAppointment ? new Date(upcomingAppointment.date).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    }) : "Mon, 28 Sep"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Time Slot</span>
                  <p className="font-bold text-slate-800">{upcomingAppointment?.timeSlot || "11:00 AM"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Link
              href="/portal/appointments"
              className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-center text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition"
            >
              Manage Appointment
            </Link>
            <Link
              href="/portal/records"
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Clinic Info
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
