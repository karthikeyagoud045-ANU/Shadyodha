"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/SeverityBadge";
import { ErrorState, Spinner } from "@/components/ui/feedback";
import { patientService } from "@/services/patientService";
import { screeningService } from "@/services/screeningService";
import { formatDate } from "@/lib/utils";

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const p = useQuery({ queryKey: ["patient", id], queryFn: () => patientService.get(id) });
  const s = useQuery({ queryKey: ["screenings"], queryFn: screeningService.list });
  if (p.isLoading) return <Spinner className="mx-auto mt-20 h-8 w-8" />;
  if (!p.data) return <ErrorState message="Patient not found." />;
  const patient = p.data;
  const cases = (s.data ?? []).filter((x) => x.patientId === patient.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{patient.name}</h1>
          <p className="text-sm text-ink-500">{patient.id} · {patient.village}, {patient.district}</p>
        </div>
        <Link href={`/screening/new?patient=${patient.id}`}>
          <Button>Start Screening</Button>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-ink-200 bg-white p-5 text-sm">
          <p className="text-ink-500">Demographics</p>
          <p className="mt-2">{patient.age} years · {patient.gender}</p>
          <p>{patient.phone}</p>
        </div>
        <div className="rounded-2xl border border-ink-200 bg-white p-5 text-sm">
          <p className="text-ink-500">Diabetes</p>
          <p className="mt-2">{patient.diabetesStatus} · {patient.diabetesDurationYears} years</p>
        </div>
        <div className="rounded-2xl border border-ink-200 bg-white p-5 text-sm">
          <p className="text-ink-500">Status</p>
          <div className="mt-2"><StatusBadge status={patient.status} /></div>
        </div>
      </div>
      <div className="rounded-2xl border border-ink-200 bg-white p-6">
        <h2 className="font-semibold">Screenings</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {cases.length === 0 && <li className="text-ink-500">No screenings yet.</li>}
          {cases.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-xl bg-ink-50 px-3 py-2">
              <span>{c.id} · {formatDate(c.date)}</span>
              <Link href={`/screening/${c.id}`} className="underline-offset-2 hover:underline">Open</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
