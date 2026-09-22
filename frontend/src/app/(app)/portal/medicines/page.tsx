"use client";

import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock,
  Pill,
  Plus,
  ShieldCheck,
  Trash2,
  Volume2,
  X,
} from "lucide-react";
import { SEED_MEDICINES } from "@/services/seed";
import type { Medicine } from "@/types";

export default function PatientMedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>(SEED_MEDICINES);
  const [addMedOpen, setAddMedOpen] = useState(false);
  const [newMedName, setNewMedName] = useState("");
  const [newMedDose, setNewMedDose] = useState("");
  const [newMedTiming, setNewMedTiming] = useState<"before_food" | "after_food" | "with_food">("after_food");
  const [newMedTime, setNewMedTime] = useState("08:00 PM");
  const [reminderBanner, setReminderBanner] = useState<string | null>(null);

  // Play audio chime tone
  function playAlarmChime() {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      /* ignore audio error */
    }
  }

  function handleAddMedicine(e: React.FormEvent) {
    e.preventDefault();
    if (!newMedName.trim()) return;

    const med: Medicine = {
      id: `med-${Date.now()}`,
      name: newMedName,
      dosage: newMedDose || "500 mg",
      frequency: "Daily",
      timing: newMedTiming,
      timeSlots: [newMedTime],
      instructions: "Take consistently at the scheduled hour with water.",
      active: true,
    };

    setMedicines([med, ...medicines]);
    setNewMedName("");
    setNewMedDose("");
    setAddMedOpen(false);

    setReminderBanner(`Reminder successfully activated! You will receive an alarm daily at ${newMedTime} for ${med.name}.`);
    playAlarmChime();
    setTimeout(() => setReminderBanner(null), 6000);
  }

  function triggerReminderAlarm(medName: string, time: string) {
    playAlarmChime();
    setReminderBanner(`⏰ ON-TIME ALARM: It is ${time}. Please take your prescribed ${medName} now!`);
    setTimeout(() => setReminderBanner(null), 8000);
  }

  function toggleMedicineActive(id: string) {
    setMedicines(
      medicines.map((m) => (m.id === id ? { ...m, active: !m.active } : m))
    );
  }

  return (
    <div className="relative space-y-6 pb-16">
      {/* Eye Ambient HUD Artwork Banner matching Doctor Portal */}
      <div className="pointer-events-none absolute -left-8 -right-8 -top-6 h-80 overflow-hidden z-0 rounded-b-3xl">
        <img
          src="/drishti_hero_bg.jpg"
          alt="AI Retinal Scan"
          className="h-full w-full object-cover object-center opacity-40 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-500/15 via-[#EFF3FD]/75 to-[#EFF3FD]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#EFF3FD]/80 via-transparent to-[#EFF3FD]/80" />
      </div>

      {/* Live Alarm Banner */}
      {reminderBanner && (
        <div className="fixed bottom-6 right-6 z-50 flex max-w-md items-center justify-between gap-3 rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 shadow-2xl animate-fadeUp">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm animate-bounce">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">Active Medication Reminder</p>
              <p className="mt-0.5 text-xs text-amber-800 leading-snug">{reminderBanner}</p>
            </div>
          </div>
          <button
            onClick={() => setReminderBanner(null)}
            className="rounded-lg p-1 text-amber-600 hover:bg-amber-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                Prescription Medicines & On-Time Reminders
              </h1>
              <p className="text-xs text-slate-500">
                Keep blood sugar in target range to halt diabetic retinopathy progression. Set active alarm reminders.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setAddMedOpen(true)}
          className="btn-attract flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#5B4EFF] to-[#8659F6] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/25 hover:brightness-105 transition active:scale-95"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>+ Add Medicine</span>
        </button>
      </div>

      {/* Adherence Overview Card */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Prescriptions</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{medicines.length} Medicines</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">100% adherence this week</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Next Scheduled Dose</p>
          <p className="mt-1 text-2xl font-black text-indigo-600">08:00 PM</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Metformin 500mg (Post-dinner)</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Daily Eye Drops</p>
          <p className="mt-1 text-2xl font-black text-sky-600">3 Times / Day</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Retinal tear & corneal protection</p>
        </div>
      </div>

      {/* Medicines Grid */}
      <div className="grid gap-5 md:grid-cols-3">
        {medicines.map((med) => (
          <div
            key={med.id}
            className="hover-lift flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Pill className="h-5 w-5" />
                </div>
                <button
                  onClick={() => toggleMedicineActive(med.id)}
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition ${
                    med.active
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-slate-100 border-slate-200 text-slate-400"
                  }`}
                >
                  {med.active ? "Active" : "Paused"}
                </button>
              </div>

              <h3 className="mt-4 text-base font-bold text-slate-900">
                {med.name}
              </h3>
              <p className="text-xs font-semibold text-indigo-600">
                {med.dosage} &bull; {med.frequency}
              </p>
              <p className="mt-1 text-xs text-slate-600 capitalize">
                Timing: <strong className="text-slate-800">{med.timing.replace("_", " ")}</strong>
              </p>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                {med.instructions}
              </p>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Scheduled Daily Alarms:
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {med.timeSlots.map((time) => (
                  <span
                    key={time}
                    className="flex items-center gap-1 rounded-xl bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {time}
                  </span>
                ))}
              </div>

              {/* Test Alarm Button */}
              <button
                onClick={() => triggerReminderAlarm(med.name, med.timeSlots[0] || "Now")}
                className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50/70 py-2.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition active:scale-95 shadow-xs"
              >
                <Volume2 className="h-4 w-4" />
                <span>Test Reminder Alarm</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Medicine Modal */}
      {addMedOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleAddMedicine}
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-fadeUp space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New Prescription</h3>
              <button
                type="button"
                onClick={() => setAddMedOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Medicine Name</label>
              <input
                type="text"
                required
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                placeholder="e.g. Dapagliflozin, Sitagliptin, Eye Drops"
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-indigo-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Dosage</label>
                <input
                  type="text"
                  value={newMedDose}
                  onChange={(e) => setNewMedDose(e.target.value)}
                  placeholder="e.g. 500 mg / 1 drop"
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Daily Alarm Time</label>
                <input
                  type="text"
                  value={newMedTime}
                  onChange={(e) => setNewMedTime(e.target.value)}
                  placeholder="e.g. 08:30 PM"
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-indigo-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Meal Timing</label>
              <select
                value={newMedTiming}
                onChange={(e) => setNewMedTiming(e.target.value as "before_food" | "after_food" | "with_food")}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-indigo-400 focus:outline-none"
              >
                <option value="after_food">After Food (Post-meal)</option>
                <option value="before_food">Before Food (Empty stomach)</option>
                <option value="with_food">With Food</option>
              </select>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAddMedOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700"
              >
                Save & Activate Alarm
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
