"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PriorityMark, StatusBadge } from "@/components/SeverityBadge";
import { EmptyState, Spinner } from "@/components/ui/feedback";
import { referralService } from "@/services/referralService";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function ReferralsPage() {
  const [status, setStatus] = useState("all");
  const q = useQuery({ queryKey: ["referrals", status], queryFn: () => referralService.list(status) });
  const all = useQuery({ queryKey: ["referrals", "all"], queryFn: () => referralService.list("all") });
  const counts = {
    pending: all.data?.filter((r) => r.status === "pending").length ?? 0,
    scheduled: all.data?.filter((r) => r.status === "scheduled").length ?? 0,
    completed: all.data?.filter((r) => r.status === "completed").length ?? 0,
    missed: all.data?.filter((r) => r.status === "missed").length ?? 0,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Referrals</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Object.entries(counts).map(([k, v]) => (
          <button key={k} onClick={() => setStatus(k)} className="btn-attract rounded-2xl border border-ink-200 bg-white p-4 text-left">
            <p className="text-xs capitalize text-ink-500">{k}</p>
            <p className="text-2xl font-semibold">{v}</p>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {["all", "pending", "scheduled", "completed", "missed"].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`btn-attract h-9 rounded-full px-4 text-xs capitalize ${status === s ? "bg-ink-900 text-white" : "border border-ink-200"}`}>{s}</button>
        ))}
      </div>
      {q.isLoading && <Spinner className="mx-auto h-8 w-8" />}
      {q.data && q.data.length === 0 && <EmptyState title="No referrals in this filter." />}
      <div className="hidden overflow-hidden rounded-2xl border border-ink-200 bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-xs text-ink-500">
            <tr>{["Patient", "Screening ID", "Priority", "Referred To", "Status", "Date", "Action"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {q.data?.map((r) => (
              <tr key={r.id} className="border-b border-ink-50">
                <td className="px-4 py-3">{r.patientName}</td>
                <td className="px-4 py-3">{r.screeningId}</td>
                <td className="px-4 py-3"><PriorityMark priority={r.priority} /></td>
                <td className="px-4 py-3">{r.referredTo}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3">{formatDate(r.date)}</td>
                <td className="px-4 py-3"><Link href={`/screening/${r.screeningId}`}><Button size="sm">Open</Button></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 md:hidden">
        {q.data?.map((r) => (
          <Link key={r.id} href={`/screening/${r.screeningId}`} className="rounded-2xl border border-ink-200 bg-white p-4">
            <p className="font-semibold">{r.patientName}</p>
            <p className="text-xs text-ink-500">{r.referredTo}</p>
            <StatusBadge status={r.status} />
          </Link>
        ))}
      </div>
    </div>
  );
}
