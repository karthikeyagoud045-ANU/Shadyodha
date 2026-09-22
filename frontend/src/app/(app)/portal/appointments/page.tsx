"use client";

import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Plus,
  Stethoscope,
  X,
} from "lucide-react";
import { SEED_APPOINTMENTS, SEED_DOCTORS } from "@/services/seed";
import type { Appointment, Doctor } from "@/types";

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(SEED_APPOINTMENTS);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(SEED_DOCTORS[0].id);
  const [appointmentDate, setAppointmentDate] = useState("2026-09-28");
  const [appointmentSlot, setAppointmentSlot] = useState("11:00 AM");
  const [appointmentReason, setAppointmentReason] = useState("Dilated Retinal Fundus Examination");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  function handleScheduleAppointment(e: React.FormEvent) {
    e.preventDefault();
    const doc = SEED_DOCTORS.find((d) => d.id === selectedDoctorId) || SEED_DOCTORS[0];

    const apt: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: "PT-2024-001",
      patientName: "Kamala Naik",
      doctorId: doc.id,
      doctorName: doc.name,
      specialty: doc.specialty,
      date: appointmentDate,
      timeSlot: appointmentSlot,
      status: "confirmed",
      reason: appointmentReason,
      hospital: doc.hospital,
    };

    setAppointments([apt, ...appointments]);
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setScheduleModalOpen(false);
    }, 1400);
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
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/15 via-[#EFF3FD]/75 to-[#EFF3FD]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#EFF3FD]/80 via-transparent to-[#EFF3FD]/80" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                Specialist Doctors & Scheduled Visits
              </h1>
              <p className="text-xs text-slate-500">
                Direct tele-ophthalmology consultation and clinic appointments under Odisha NPCB network.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setScheduleModalOpen(true)}
          className="btn-attract flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/25 hover:brightness-105 transition active:scale-95"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>+ Schedule New Visit</span>
        </button>
      </div>

      {/* Booked Appointments Section */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald-600" />
          <span>My Upcoming Clinic Appointments ({appointments.length})</span>
        </h2>

        <div className="mt-4 divide-y divide-slate-100">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 font-bold">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{apt.doctorName}</h3>
                  <p className="text-xs text-indigo-600 font-semibold">{apt.specialty}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{apt.hospital}</p>
                  <span className="mt-1 inline-block text-[11px] font-medium text-slate-600">
                    Reason: <strong className="text-slate-700">{apt.reason}</strong>
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 capitalize">
                    {apt.status}
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold text-slate-800">
                  {new Date(apt.date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-slate-500 font-medium">{apt.timeSlot}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Specialist Doctor Profiles */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3">
          Available Vitreo-Retinal & Diabetes Specialists
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {SEED_DOCTORS.map((doc) => (
            <div
              key={doc.id}
              className="hover-lift flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-lg">
                    {doc.name.split(" ")[1]?.charAt(0) || "D"}
                  </div>
                  <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                    ★ {doc.rating}
                  </span>
                </div>

                <h3 className="mt-4 text-base font-bold text-slate-900">{doc.name}</h3>
                <p className="text-xs font-semibold text-indigo-600">{doc.specialty}</p>
                <p className="mt-1 text-xs text-slate-500">{doc.qualifications}</p>
                <p className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{doc.hospital}</span>
                </p>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Available Clinic Days:
                </p>
                <p className="text-xs font-medium text-slate-700 mt-0.5">{doc.availableDays.join(", ")}</p>
                <button
                  onClick={() => {
                    setSelectedDoctorId(doc.id);
                    setScheduleModalOpen(true);
                  }}
                  className="mt-3.5 w-full rounded-xl bg-indigo-50 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition active:scale-95"
                >
                  Book with {doc.name.split(" ")[1]}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Appointment Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleScheduleAppointment}
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-fadeUp space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Schedule Specialist Visit</h3>
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="mt-3 text-base font-bold text-slate-900">Appointment Confirmed!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Your clinic appointment has been added to your schedule.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Select Specialist</label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-indigo-400 focus:outline-none"
                  >
                    {SEED_DOCTORS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} &bull; {d.specialty}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Preferred Date</label>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Time Slot</label>
                    <select
                      value={appointmentSlot}
                      onChange={(e) => setAppointmentSlot(e.target.value)}
                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-indigo-400 focus:outline-none"
                    >
                      <option value="09:30 AM">09:30 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="02:30 PM">02:30 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Reason for Consultation</label>
                  <input
                    type="text"
                    value={appointmentReason}
                    onChange={(e) => setAppointmentReason(e.target.value)}
                    placeholder="e.g. Dilated Fundus Exam, Blurred Vision, Medication Review"
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs focus:border-indigo-400 focus:outline-none"
                  />
                </div>

                <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setScheduleModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
                  >
                    Confirm Booking
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
