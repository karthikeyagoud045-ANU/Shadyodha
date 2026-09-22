"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/SeverityBadge";
import { EmptyState, ErrorState, Spinner } from "@/components/ui/feedback";
import { patientService } from "@/services/patientService";
import { formatDate } from "@/lib/utils";

export default function PatientsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["patients", q, status, sort, page],
    queryFn: () => patientService.list({ q, status, sort, page, pageSize: 8 }),
  });

  if (query.isLoading) return <div className="grid place-items-center py-20"><Spinner className="h-8 w-8" /></div>;
  if (query.isError) return <ErrorState />;
  const data = query.data!;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Patients</h1>
          <p className="text-sm text-ink-500">Search, filter and register camp attendees.</p>
        </div>
        <Link href="/patients/new">
          <Button>+ Register Patient</Button>
        </Link>
      </div>
      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search name, ID, village…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="max-w-sm" />
        <select className="h-11 rounded-xl border border-ink-200 px-3 text-sm" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          {["all", "active", "referred", "follow_up", "completed"].map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
        <select className="h-11 rounded-xl border border-ink-200 px-3 text-sm" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="name">Sort: Name</option>
          <option value="age">Sort: Age</option>
        </select>
      </div>
      {data.total === 0 ? (
        <EmptyState title="No patients registered yet." hint="Register a patient to start screening." />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-ink-200 bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-100 text-xs text-ink-500">
                <tr>
                  {["Patient ID", "Name", "Age", "Gender", "Village", "District", "Diabetes", "Last Screening", "Status", "Action"].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.items.map((p) => (
                  <tr key={p.id} className="border-b border-ink-50">
                    <td className="px-4 py-3 font-medium">{p.id}</td>
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3">{p.age}</td>
                    <td className="px-4 py-3 capitalize">{p.gender}</td>
                    <td className="px-4 py-3">{p.village}</td>
                    <td className="px-4 py-3">{p.district}</td>
                    <td className="px-4 py-3">{p.diabetesStatus} · {p.diabetesDurationYears}y</td>
                    <td className="px-4 py-3">{p.lastScreeningAt ? formatDate(p.lastScreeningAt) : "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3">
                      <Link href={`/patients/${p.id}`}><Button size="sm" variant="outline">View</Button></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 md:hidden">
            {data.items.map((p) => (
              <Link key={p.id} href={`/patients/${p.id}`} className="rounded-2xl border border-ink-200 bg-white p-4">
                <p className="font-semibold">{p.name}</p>
                <p className="text-xs text-ink-500">{p.id} · {p.village}, {p.district}</p>
                <div className="mt-2"><StatusBadge status={p.status} /></div>
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm">
            <p className="text-ink-500">{data.total} patients</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
              <Button variant="outline" size="sm" disabled={page * data.pageSize >= data.total} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
