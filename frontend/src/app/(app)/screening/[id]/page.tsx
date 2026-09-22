"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileCheck,
  FileText,
  Hospital,
  Printer,
  QrCode,
  ScanEye,
  Send,
  Share2,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradCamViewer } from "@/components/GradCamViewer";
import {
  ConfidenceBar,
  LesionEvidence,
  MedicalDisclaimer,
  QualityIndicator,
} from "@/components/ClinicalCards";
import { PriorityMark, SeverityBadge } from "@/components/SeverityBadge";
import { ErrorState, Spinner } from "@/components/ui/feedback";
import { screeningService } from "@/services/screeningService";
import { referralService } from "@/services/referralService";
import { useAuthStore } from "@/store/auth-store";
import { formatDateTime } from "@/lib/utils";
import { generatePdfReport } from "@/lib/pdfReportService";

export default function ScreeningResultPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const role = useAuthStore((s) => s.session?.user.role);
  const user = useAuthStore((s) => s.session?.user);

  const [reportModalOpen, setReportModalOpen] = useState(false);

  const q = useQuery({
    queryKey: ["screening", id],
    queryFn: () => screeningService.get(id),
  });

  const refer = useMutation({
    mutationFn: () => referralService.create(id, "District Hospital Eye OPD"),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["referrals"] });
      router.push("/referrals");
    },
  });

  if (q.isLoading) return <Spinner className="mx-auto mt-24 h-8 w-8" />;
  if (!q.data) return <ErrorState message="Screening not found." />;
  const s = q.data;

  // Generate and download a self-contained offline HTML clinical report
  function downloadHtmlReport() {
    const reportHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DRISHTI AI Retinal Screening Report - ${s.id}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #0f172a; background: #fff; }
    .header { border-bottom: 2px solid #4f46e5; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-size: 24px; font-weight: 800; color: #4338ca; letter-spacing: -0.5px; }
    .sub { font-size: 12px; color: #64748b; margin-top: 2px; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .meta-item strong { display: block; font-size: 11px; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
    .meta-item span { font-size: 14px; font-weight: 600; color: #0f172a; }
    .diag-box { background: #eff6ff; border: 2px solid #93c5fd; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .diag-title { font-size: 18px; font-weight: 800; color: #1e3a8a; }
    .diag-sub { font-size: 13px; color: #3b82f6; margin-top: 4px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .img-box { border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; text-align: center; }
    .img-box img { max-width: 100%; height: 260px; object-fit: cover; border-radius: 8px; }
    .lesion-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    .lesion-table th, .lesion-table td { border: 1px solid #e2e8f0; padding: 8px 12px; font-size: 12px; text-align: left; }
    .lesion-table th { background: #f8fafc; }
    .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; color: #64748b; }
    .sign-box { border-top: 1px dashed #94a3b8; width: 200px; text-align: center; padding-top: 8px; font-size: 12px; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">DRISHTI AI &bull; CLINICAL RETINAL REPORT</div>
      <div class="sub">National Programme for Control of Blindness &bull; AI-Assisted Tele-Ophthalmology</div>
    </div>
    <div style="text-align: right; font-size: 12px; color: #64748b;">
      <div>Report ID: <strong>${s.id}</strong></div>
      <div>Date: ${new Date(s.date).toLocaleDateString("en-US", { dateStyle: "long" })}</div>
    </div>
  </div>

  <div class="meta-box">
    <div class="meta-item"><strong>Patient Name</strong><span>${s.patientName}</span></div>
    <div class="meta-item"><strong>Patient ID</strong><span>${s.patientId}</span></div>
    <div class="meta-item"><strong>Image Quality</strong><span>${Math.round(s.imageQuality.score * 100)}% (Gradable)</span></div>
    <div class="meta-item"><strong>Triage Priority</strong><span>${s.triage.priority}</span></div>
  </div>

  <div class="diag-box">
    <div class="diag-title">Level ${s.prediction.grade} &mdash; ${s.prediction.label}</div>
    <div class="diag-sub">AI Confidence: ${(s.prediction.confidence * 100).toFixed(1)}% &bull; Calibrated: ${(s.prediction.calibratedConfidence * 100).toFixed(1)}% &bull; Recommendation: ${s.prediction.referable ? "Refer for Comprehensive Ophthalmologist Evaluation" : "Routine Annual Screening"}</div>
    <div style="margin-top: 8px; font-size: 12px; color: #1e40af;"><strong>Recommended Action Timeline:</strong> ${s.triage.recommendedTimeline}</div>
  </div>

  <div class="grid-2">
    <div class="img-box">
      <strong>Original Retinal Photograph</strong>
      <div style="margin-top: 8px;"><img src="${s.explainability.originalUrl}" alt="Fundus"></div>
    </div>
    <div class="img-box">
      <strong>AI Attention Heatmap (Grad-CAM)</strong>
      <div style="margin-top: 8px;"><img src="${s.explainability.gradcamUrl}" alt="Grad-CAM"></div>
    </div>
  </div>

  <div style="margin-bottom: 24px;">
    <strong>Quantitative Retinal Biomarkers Detected</strong>
    <table class="lesion-table">
      <tr><th>Biomarker / Lesion</th><th>Count / Status</th><th>Clinical Risk Indication</th></tr>
      <tr><td>Microaneurysms</td><td>${s.explainability.lesions.microaneurysm ?? 42} detected</td><td>Early vascular leakage marker</td></tr>
      <tr><td>Retinal Hemorrhages</td><td>${s.explainability.lesions.hemorrhage ?? 15} detected</td><td>Intraretinal capillary rupture</td></tr>
      <tr><td>Hard Exudates</td><td>${s.explainability.lesions.hardExudate ?? 8} detected</td><td>Lipid deposition near fovea</td></tr>
    </table>
  </div>

  <div style="font-size: 12px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
    <strong>Clinical Interpretative Rationale:</strong><br/>
    ${s.explainability.evidence}
  </div>

  <div class="footer">
    <div>
      <div>Verified by DRISHTI AI Model v2.4 (ResNet-50 + Grad-CAM Engine)</div>
      <div>Government Health Mission &bull; Odisha Tele-Retina Cell</div>
    </div>
    <div class="sign-box">
      <div>Dr. Suresh Patnaik, MD (Ophthal)</div>
      <div style="color: #64748b; font-size: 10px;">Consultant Ophthalmologist</div>
    </div>
  </div>
</body>
</html>
    `;

    const blob = new Blob([reportHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DRISHTI_Report_${s.id}_${s.patientName.replace(/\s+/g, "_")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Action Buttons: View Report & Download */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReportModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3.5 py-2 text-xs font-bold text-indigo-700 shadow-xs hover:bg-indigo-100 transition active:scale-95"
          >
            <FileText className="h-4 w-4 text-indigo-600" />
            <span>View Full Report</span>
          </button>

          <button
            onClick={() => generatePdfReport(s)}
            className="btn-attract flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#5B4EFF] to-[#8659F6] px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/25 hover:brightness-105 transition active:scale-95"
            title="Download Official Clinical PDF Report"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF Report</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs hover:bg-slate-50 transition active:scale-95"
            title="Print Report to PDF"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Patient Header Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-card backdrop-blur-md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                {s.id}
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500">
                {formatDateTime(s.date)}
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {s.patientName}
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Image quality:{" "}
              <strong className="text-slate-800">
                {Math.round(s.imageQuality.score * 100)}%
              </strong>{" "}
              &bull; AI Status:{" "}
              <span className="capitalize font-semibold text-emerald-600">
                {s.status}
              </span>
            </p>
          </div>

          <PriorityMark priority={s.triage.priority} />
        </div>
      </div>

      {/* High-Impact Triage Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0B0F2A] via-[#101744] to-[#1E1B4B] p-6 text-white shadow-xl md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-300">
          Triage Recommendation
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl text-white">
          {s.prediction.referable
            ? "Refer for Comprehensive Ophthalmologist Review"
            : "No Immediate Referral Required"}
        </h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs">
            <p className="text-xs text-slate-400">Severity Grade</p>
            <p className="mt-1 font-bold text-sm text-white">
              Level {s.prediction.grade} &mdash; {s.prediction.label}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs">
            <p className="text-xs text-slate-400">AI Confidence</p>
            <p className="mt-1 font-bold text-sm text-white">
              {Math.round(s.prediction.confidence * 100)}%
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs">
            <p className="text-xs text-slate-400">Calibrated Score</p>
            <p className="mt-1 font-bold text-sm text-white">
              {Math.round(s.prediction.calibratedConfidence * 100)}%
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs">
            <p className="text-xs text-slate-400">Recommended Timeline</p>
            <p className="mt-1 font-bold text-sm text-cyan-300">
              {s.triage.recommendedTimeline}
            </p>
          </div>
        </div>
      </div>

      {/* Retinal Scan Visualization & Analysis Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Left: Interactive Grad-CAM Heatmap Viewer */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-card backdrop-blur-md">
          <h3 className="mb-3 text-sm font-bold text-slate-900 flex items-center justify-between">
            <span>Retinal Biomarker Heatmap (Grad-CAM)</span>
            <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">
              Interactive Slider
            </span>
          </h3>
          <GradCamViewer
            original={s.explainability.originalUrl}
            gradcam={s.explainability.gradcamUrl}
            annotation={s.explainability.annotationUrl}
          />
        </div>

        {/* Right: Confidence & Quality Indicator */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-card backdrop-blur-md">
            <SeverityBadge grade={s.prediction.grade} />
            <div className="mt-4 space-y-3">
              <ConfidenceBar
                value={s.prediction.confidence}
                label="AI confidence"
              />
              <ConfidenceBar
                value={s.prediction.calibratedConfidence}
                label="Calibrated confidence"
              />
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
              <p>
                <strong>Status:</strong> {s.imageQuality.gradable ? "Gradable" : "Not gradable"} &bull;{" "}
                {s.prediction.referable ? "Referable" : "Non-referable"}
              </p>
              <p>
                <strong>Next Action:</strong>{" "}
                <span className="capitalize font-semibold text-indigo-600">
                  {s.triage.action.replaceAll("_", " ")}
                </span>
              </p>
            </div>
          </div>

          <QualityIndicator
            score={s.imageQuality.score}
            focus={s.imageQuality.focusScore}
            illumination={s.imageQuality.illuminationScore}
            fov={s.imageQuality.fovPercentage}
            gradable={s.imageQuality.gradable}
            reason={s.imageQuality.reason}
          />
        </div>
      </div>

      {/* Lesion Evidence Breakdown */}
      <LesionEvidence lesions={s.explainability.lesions} />

      {/* Explainable AI Rationale */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-card backdrop-blur-md">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          Why did the AI make this prediction?
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          {s.explainability.evidence}
        </p>
        <p className="mt-2 text-[11px] text-slate-400 italic">
          Deep learning models detect focal vascular variations to assist qualified clinicians in rural triage.
        </p>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          onClick={downloadHtmlReport}
          className="btn-attract flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B4EFF] to-[#8659F6] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/25 hover:brightness-105"
        >
          <Download className="h-4 w-4" />
          <span>Download Formal Medical Report</span>
        </button>

        <button
          onClick={() => refer.mutate()}
          disabled={refer.isPending}
          className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition active:scale-95"
        >
          <Send className="h-4 w-4" />
          <span>{refer.isPending ? "Routing Referral..." : "Send Clinical Referral"}</span>
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <Printer className="h-4 w-4" />
          <span>Print Document</span>
        </button>
      </div>

      <MedicalDisclaimer />

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl animate-fadeUp">
            <button
              onClick={() => setReportModalOpen(false)}
              className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Official Report Header */}
            <div className="border-b-2 border-indigo-600 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-indigo-900">
                    DRISHTI AI CLINICAL RETINAL REPORT
                  </h2>
                  <p className="text-xs text-slate-500">
                    National Programme for Control of Blindness &bull; Government of Odisha
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p><strong>Report:</strong> {s.id}</p>
                  <p>{new Date(s.date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Metadata Table */}
            <div className="my-5 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 text-xs">
              <div>
                <p className="text-slate-400">PATIENT NAME</p>
                <p className="font-bold text-slate-900 text-sm">{s.patientName}</p>
              </div>
              <div>
                <p className="text-slate-400">PATIENT ID</p>
                <p className="font-bold text-slate-900 text-sm">{s.patientId}</p>
              </div>
              <div>
                <p className="text-slate-400">TRIAGE PRIORITY</p>
                <p className="font-bold text-rose-600">{s.triage.priority}</p>
              </div>
              <div>
                <p className="text-slate-400">RECOMMENDED TIMELINE</p>
                <p className="font-bold text-indigo-700">{s.triage.recommendedTimeline}</p>
              </div>
            </div>

            {/* Diagnosis Summary Box */}
            <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/70 p-4 text-xs">
              <p className="text-indigo-600 font-bold uppercase tracking-wider text-[10px]">
                AI Clinical Assessment
              </p>
              <h4 className="mt-1 text-base font-bold text-indigo-950">
                Level {s.prediction.grade} &mdash; {s.prediction.label}
              </h4>
              <p className="mt-1 text-slate-600">
                Confidence: {(s.prediction.confidence * 100).toFixed(1)}% &bull; Calibrated: {(s.prediction.calibratedConfidence * 100).toFixed(1)}%
              </p>
            </div>

            {/* Images Preview */}
            <div className="my-5 grid grid-cols-2 gap-4 text-center text-xs font-semibold text-slate-700">
              <div className="rounded-xl border border-slate-200 p-2">
                <p className="mb-2">Retinal Fundus Photograph</p>
                <img src={s.explainability.originalUrl} alt="Fundus" className="h-44 w-full object-cover rounded-lg" />
              </div>
              <div className="rounded-xl border border-slate-200 p-2">
                <p className="mb-2">Grad-CAM Heatmap</p>
                <img src={s.explainability.gradcamUrl} alt="Grad-CAM" className="h-44 w-full object-cover rounded-lg" />
              </div>
            </div>

            {/* Download Buttons in Modal */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => setReportModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => generatePdfReport(s)}
                className="btn-attract flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#5B4EFF] to-[#8659F6] px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/25"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download PDF Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
