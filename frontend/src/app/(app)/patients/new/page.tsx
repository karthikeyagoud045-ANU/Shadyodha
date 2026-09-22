"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { patientService } from "@/services/patientService";
import { useScreeningStore } from "@/store/screening-store";
import type { DiabetesStatus, Gender } from "@/types";

export default function NewPatientPage() {
  const router = useRouter();
  const setPatient = useScreeningStore((s) => s.setPatient);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    age: 50,
    gender: "female" as Gender,
    phone: "",
    village: "",
    district: "",
    diabetesStatus: "type2" as DiabetesStatus,
    diabetesDurationYears: 5,
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function validate() {
    if (!form.name.trim()) return "Full name is required.";
    if (form.age < 18 || form.age > 100) return "Age must be between 18 and 100.";
    if (!/^[6-9]\d{9}$/.test(form.phone)) return "Enter a valid 10-digit Indian mobile number.";
    if (!form.village.trim() || !form.district.trim()) return "Village and district are required.";
    return "";
  }

  async function submit() {
    const v = validate();
    if (v) {
      setError(v);
      setStep(1);
      return;
    }
    setLoading(true);
    try {
      const p = await patientService.create(form);
      setPatient(p.id);
      router.push("/screening/new");
    } catch {
      setError("Unable to register. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Register Patient</h1>
        <p className="text-sm text-ink-500">Capture identity and diabetes history before screening.</p>
      </div>
      <div className="flex gap-2 text-xs">
        {["Patient Details", "Diabetes Information", "Confirmation"].map((l, i) => (
          <button
            key={l}
            onClick={() => setStep(i + 1)}
            className={`btn-attract flex-1 rounded-full py-2 ${step === i + 1 ? "bg-ink-900 text-white" : "bg-ink-100"}`}
          >
            {i + 1} {l}
          </button>
        ))}
      </div>
      {step === 1 && (
        <div className="space-y-4 rounded-2xl border border-ink-200 bg-white p-6">
          <div className="space-y-2"><Label>Full Name</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Age</Label><Input type="number" value={form.age} onChange={(e) => set("age", Number(e.target.value))} /></div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <select className="h-11 w-full rounded-xl border border-ink-200 px-3 text-sm" value={form.gender} onChange={(e) => set("gender", e.target.value as Gender)}>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="98XXXXXXXX" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Village</Label><Input value={form.village} onChange={(e) => set("village", e.target.value)} /></div>
            <div className="space-y-2"><Label>District</Label><Input value={form.district} onChange={(e) => set("district", e.target.value)} /></div>
          </div>
          <Button onClick={() => setStep(2)}>Continue</Button>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4 rounded-2xl border border-ink-200 bg-white p-6">
          <div className="space-y-2">
            <Label>Diabetes Status</Label>
            <select className="h-11 w-full rounded-xl border border-ink-200 px-3 text-sm" value={form.diabetesStatus} onChange={(e) => set("diabetesStatus", e.target.value as DiabetesStatus)}>
              <option value="type2">Type 2</option>
              <option value="type1">Type 1</option>
              <option value="gestational">Gestational</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Duration (years)</Label>
            <Input type="number" value={form.diabetesDurationYears} onChange={(e) => set("diabetesDurationYears", Number(e.target.value))} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)}>Review</Button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-4 rounded-2xl border border-ink-200 bg-white p-6">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt className="text-ink-500">Name</dt><dd>{form.name}</dd>
            <dt className="text-ink-500">Age / Gender</dt><dd>{form.age} · {form.gender}</dd>
            <dt className="text-ink-500">Phone</dt><dd>{form.phone}</dd>
            <dt className="text-ink-500">Location</dt><dd>{form.village}, {form.district}</dd>
            <dt className="text-ink-500">Diabetes</dt><dd>{form.diabetesStatus} · {form.diabetesDurationYears} years</dd>
          </dl>
          {error && <p className="text-sm text-ink-700">{error}</p>}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button loading={loading} onClick={submit}>Register & Start Screening</Button>
          </div>
        </div>
      )}
    </div>
  );
}
