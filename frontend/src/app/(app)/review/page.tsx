"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PriorityMark, SeverityBadge } from "@/components/SeverityBadge";
import { EmptyState, Spinner } from "@/components/ui/feedback";
import { reviewService } from "@/services/reviewService";

export default function ReviewQueuePage() {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("priority");
  const q = useQuery({ queryKey: ["reviews", filter, sort], queryFn: () => reviewService.list(filter, sort) });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Review Queue</h1>
        <p className="text-sm text-ink-500">Ophthalmologist workspace for AI-triaged cases.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {["all", "HIGH", "MEDIUM", "LOW"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`btn-attract h-9 rounded-full px-4 text-xs ${filter === f ? "bg-ink-900 text-white" : "border border-ink-200"}`}>
            {f === "all" ? "All" : f === "HIGH" ? "High Priority" : f === "MEDIUM" ? "Medium" : "Low"}
          </button>
        ))}
        <select className="h-9 rounded-full border border-ink-200 px-3 text-xs" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="priority">Sort: Priority</option>
          <option value="date">Sort: Date</option>
          <option value="confidence">Sort: Confidence</option>
        </select>
      </div>
      {q.isLoading && <Spinner className="mx-auto h-8 w-8" />}
      {q.data && q.data.length === 0 && <EmptyState title="No cases pending review." />}
      <div className="grid gap-4 md:grid-cols-2">
        {q.data?.map((c) => (
          <div key={c.id} className="rounded-2xl border border-ink-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{c.patientName}</p>
                <p className="text-xs text-ink-500">{c.screeningId} · {c.timeSinceUpload}</p>
              </div>
              <PriorityMark priority={c.priority} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <SeverityBadge grade={c.grade} compact />
              <span className="text-xs text-ink-500">Conf {Math.round(c.confidence * 100)}%</span>
              <span className="text-xs text-ink-500">IQ {Math.round(c.imageQuality * 100)}%</span>
            </div>
            <Link href={`/review/${c.screeningId}`}>
              <Button className="mt-4 w-full">Review Case</Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
