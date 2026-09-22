"use client";

import {
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  Heart,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  UserCheck,
} from "lucide-react";

export default function PatientRecordsPage() {
  const HBA1C_LOGS = [
    { date: "15 Aug 2026", value: 7.8, lab: "District Hospital Lab, Gajapati", status: "Improving" },
    { date: "10 May 2026", value: 8.1, lab: "District Hospital Lab, Gajapati", status: "Moderate" },
    { date: "02 Jan 2026", value: 8.4, lab: "Field Health Sub-center", status: "High" },
  ];

  return (
    <div className="relative space-y-6 pb-16">
      {/* Eye Ambient HUD Artwork Banner matching Doctor Portal */}
      <div className="pointer-events-none absolute -left-8 -right-8 -top-6 h-80 overflow-hidden z-0 rounded-b-3xl">
        <img
          src="/drishti_hero_bg.jpg"
          alt="AI Retinal Scan"
          className="h-full w-full object-cover object-center opacity-40 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/15 via-[#EFF3FD]/75 to-[#EFF3FD]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#EFF3FD]/80 via-transparent to-[#EFF3FD]/80" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            My Medical Records & Clinic Contacts
          </h1>
          <p className="text-xs text-slate-500">
            Official health passport, glycemic history, and district tele-ophthalmology clinic details.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Patient Medical Profile */}
        <div className="lg:col-span-7 space-y-6">
          {/* Vitals & Demographics Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Heart className="h-4 w-4 text-rose-500" />
              <span>Medical Profile & Demographics</span>
            </h2>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 text-xs">
              <div className="rounded-2xl bg-slate-50 p-3.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Full Name</span>
                <p className="font-bold text-slate-800 mt-0.5">Kamala Naik</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Patient ID</span>
                <p className="font-bold text-indigo-600 mt-0.5">PT-2024-001</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Age & Gender</span>
                <p className="font-bold text-slate-800 mt-0.5">52 yrs &bull; Female</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Blood Group</span>
                <p className="font-bold text-slate-800 mt-0.5">O Positive (O+)</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Primary Diagnosis</span>
                <p className="font-bold text-amber-700 mt-0.5">Type 2 Diabetes (7 yrs)</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Allergies</span>
                <p className="font-bold text-rose-600 mt-0.5">Sulfa Antibiotics</p>
              </div>
            </div>
          </div>

          {/* HbA1c Progression History */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>HbA1c Glycemic Progression History</span>
              <span className="text-xs text-indigo-600 font-semibold">Target: &lt; 7.0%</span>
            </h2>

            <div className="divide-y divide-slate-100">
              {HBA1C_LOGS.map((log) => (
                <div key={log.date} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{log.date}</p>
                    <p className="text-[11px] text-slate-400">{log.lab}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        log.value < 8.0
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {log.status}
                    </span>
                    <span className="text-sm font-black text-slate-900">{log.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Hospital Clinic & Emergency Support */}
        <div className="lg:col-span-5 space-y-6">
          {/* Clinic Details */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-indigo-600" />
              <span>Assigned District Eye Hospital</span>
            </h2>

            <div className="rounded-2xl bg-indigo-50/50 p-4 border border-indigo-100">
              <h3 className="text-sm font-bold text-slate-900">
                District Headquarters Hospital (DHH) Eye OPD
              </h3>
              <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                Odisha NPCB Tele-Ophthalmology Center
              </p>
              <p className="mt-2 text-xs text-slate-500 flex items-start gap-1.5 leading-relaxed">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>Hospital Road, Paralakhemundi, Gajapati, Odisha &ndash; 761200</span>
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>OPD Timings: Mon &ndash; Sat: 9:00 AM to 2:00 PM</span>
              </div>
            </div>

            {/* ASHA Worker Contact */}
            <div className="mt-4 rounded-2xl bg-emerald-50/50 p-4 border border-emerald-100">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-emerald-600" />
                <span>Field Health Worker (ASHA / HW)</span>
              </h3>
              <p className="text-xs text-slate-700 font-semibold mt-1">Anita Pradhan</p>
              <p className="text-[11px] text-slate-500">Luhagudi Sub-center, Gajapati</p>
              <p className="mt-2 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                <span>+91 94371 00234</span>
              </p>
            </div>
          </div>

          {/* Emergency Eye Help */}
          <div className="rounded-3xl border border-rose-100 bg-rose-50/60 p-6 shadow-card">
            <h2 className="text-sm font-bold text-rose-900 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              <span>Sudden Vision Loss Helpline</span>
            </h2>
            <p className="mt-1.5 text-xs text-rose-800 leading-relaxed">
              If you experience sudden curtain-like darkness, dense floaters, or sudden loss of sight, contact the 24x7 state emergency tele-retina helpline immediately.
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-white p-3 border border-rose-200 shadow-xs">
              <Phone className="h-4 w-4 text-rose-600" />
              <span className="text-xs font-black text-rose-700">Toll Free: 1800-345-0038</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
