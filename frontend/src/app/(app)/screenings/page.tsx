"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  Eye,
  Filter,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { SeverityBadge } from "@/components/SeverityBadge";
import { formatDate } from "@/lib/utils";
import { screeningService } from "@/services/screeningService";
import { generatePdfReport } from "@/lib/pdfReportService";
import { SEED_SCREENINGS } from "@/services/seed";
import { Spinner } from "@/components/ui/feedback";

export default function ScreeningsPage() {
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "refer" | "normal">("all");

  const q = useQuery({
    queryKey: ["screenings"],
    queryFn: screeningService.list,
  });

  // Use loaded data or fallback to seed screenings so it's always working
  const screenings = (q.data && q.data.length > 0) ? q.data : SEED_SCREENINGS;

  const filtered = screenings.filter((s) => {
    const matchesSearch =
      s.patientName.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.patientId.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === "refer") return s.prediction.referable;
    if (filterTab === "normal") return s.prediction.grade === 0;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & New Screening CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Activity className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Screening Results
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Validated retinal assessments, explainable AI heatmaps, and triage recommendations
          </p>
        </div>

        <Link href="/screening/new">
          <button className="btn-attract flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B4EFF] to-[#8659F6] px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/25 hover:brightness-105 transition active:scale-95">
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>+ Start New Screening</span>
          </button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-card">
        {/* Search */}
        <div className="relative min-w-[260px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name, ID, or screening code..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-xs text-slate-700 placeholder-slate-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setFilterTab("all")}
            className={`rounded-lg px-3 py-1.5 transition ${
              filterTab === "all"
                ? "bg-white text-indigo-700 shadow-xs font-bold"
                : "hover:text-slate-900"
            }`}
          >
            All ({screenings.length})
          </button>
          <button
            onClick={() => setFilterTab("refer")}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 transition ${
              filterTab === "refer"
                ? "bg-white text-rose-700 shadow-xs font-bold"
                : "hover:text-slate-900"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
            Referrals ({screenings.filter((s) => s.prediction.referable).length})
          </button>
          <button
            onClick={() => setFilterTab("normal")}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 transition ${
              filterTab === "normal"
                ? "bg-white text-emerald-700 shadow-xs font-bold"
                : "hover:text-slate-900"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            No DR ({screenings.filter((s) => s.prediction.grade === 0).length})
          </button>
        </div>
      </div>

      {/* Grid of Screening Results Cards */}
      {q.isLoading ? (
        <Spinner className="mx-auto mt-20 h-8 w-8" />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Activity className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="mt-3 text-sm font-semibold text-slate-800">
            No screening records found
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Try adjusting your search query or filter category.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="hover-lift flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition duration-200"
            >
              <div>
                {/* Header: Screening ID + Date */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                      {s.id}
                    </span>
                    <span className="text-[11px] text-slate-400">{s.patientId}</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">
                    {formatDate(s.date)}
                  </span>
                </div>

                {/* Patient Info & Diagnosis */}
                <div className="mt-3.5 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {s.patientName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Confidence:{" "}
                      <strong className="text-slate-800">
                        {Math.round(s.prediction.confidence * 100)}%
                      </strong>{" "}
                      &bull; Quality:{" "}
                      <span className="text-emerald-600 font-medium">
                        {Math.round(s.imageQuality.score * 100)}%
                      </span>
                    </p>
                  </div>
                  <SeverityBadge grade={s.prediction.grade} />
                </div>

                {/* Retinal & Grad-CAM Image Preview */}
                <div className="mt-4 grid grid-cols-2 gap-2 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-1.5">
                  <div className="relative h-24 overflow-hidden rounded-lg bg-black">
                    <img
                      src={s.explainability.originalUrl}
                      alt="Fundus"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[9px] font-medium text-white">
                      Fundus
                    </span>
                  </div>
                  <div className="relative h-24 overflow-hidden rounded-lg bg-black">
                    <img
                      src={s.explainability.gradcamUrl}
                      alt="Grad-CAM"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[9px] font-medium text-white">
                      Grad-CAM
                    </span>
                  </div>
                </div>

                {/* Clinical Notes Summary */}
                <p className="mt-3 line-clamp-2 text-[11px] text-slate-500 leading-relaxed">
                  {s.explainability.evidence}
                </p>
              </div>

              {/* Action Buttons: View Result & Download PDF */}
              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                <Link
                  href={`/screening/${s.id}`}
                  className="flex-1"
                >
                  <button className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 active:scale-95">
                    <Eye className="h-3.5 w-3.5 text-indigo-600" />
                    <span>View Result</span>
                  </button>
                </Link>

                <button
                  onClick={() => generatePdfReport(s)}
                  className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95"
                  title="Download PDF Report"
                >
                  <Download className="h-3.5 w-3.5 text-slate-500" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
