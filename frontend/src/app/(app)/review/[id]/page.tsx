"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GradCamViewer } from "@/components/GradCamViewer";
import { ConfidenceBar, LesionEvidence, MedicalDisclaimer } from "@/components/ClinicalCards";
import { SeverityBadge } from "@/components/SeverityBadge";
import { ErrorState, Spinner } from "@/components/ui/feedback";
import { screeningService } from "@/services/screeningService";
import { reviewService } from "@/services/reviewService";
import type { DrGrade } from "@/types";

export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const q = useQuery({ queryKey: ["screening", id], queryFn: () => screeningService.get(id) });
  const [mode, setMode] = useState<"confirm" | "override">("confirm");
  const [grade, setGrade] = useState<DrGrade>(2);
  const [note, setNote] = useState("");

  const mut = useMutation({
    mutationFn: (decision: "confirm" | "override" | "recapture") =>
      reviewService.submit(id, decision, decision === "override" ? grade : undefined, note),
    onSuccess: (res) => {
      if (res.next === "referral") router.push("/referrals");
      else if (res.next === "followup") router.push("/followups");
      else router.push("/screening/new");
    },
  });

  if (q.isLoading) return <Spinner className="mx-auto mt-24 h-8 w-8" />;
  if (!q.data) return <ErrorState message="Case not found." />;
  const s = q.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Clinical review</h1>
        <p className="text-sm text-ink-500">{s.patientName} · {s.id}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-ink-200 bg-white p-5">
          <GradCamViewer original={s.explainability.originalUrl} gradcam={s.explainability.gradcamUrl} annotation={s.explainability.annotationUrl} />
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-ink-200 bg-white p-6">
            <p className="text-xs text-ink-400">AI prediction</p>
            <div className="mt-2"><SeverityBadge grade={s.prediction.grade} /></div>
            <div className="mt-4 space-y-3">
              <ConfidenceBar value={s.prediction.confidence} label="Confidence" />
              <ConfidenceBar value={s.prediction.calibratedConfidence} label="Calibrated" />
            </div>
          </div>
          <LesionEvidence lesions={s.explainability.lesions} />
          <p className="rounded-2xl bg-ink-50 p-4 text-sm">{s.explainability.evidence}</p>
        </div>
      </div>
      <div className="rounded-2xl border border-ink-200 bg-white p-6 space-y-4">
        <h3 className="font-semibold">Decision panel</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant={mode === "confirm" ? "default" : "outline"} onClick={() => setMode("confirm")}>Confirm AI Finding</Button>
          <Button variant={mode === "override" ? "default" : "outline"} onClick={() => setMode("override")}>Override AI</Button>
        </div>
        {mode === "override" && (
          <div className="flex flex-wrap gap-2">
            {([0, 1, 2, 3, 4] as DrGrade[]).map((g) => (
              <button key={g} onClick={() => setGrade(g)} className={`btn-attract h-10 rounded-xl px-3 text-xs ${grade === g ? "bg-ink-900 text-white" : "border border-ink-200"}`}>
                Level {g}
              </button>
            ))}
          </div>
        )}
        <Textarea placeholder="Add clinical note…" value={note} onChange={(e) => setNote(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <Button loading={mut.isPending} onClick={() => mut.mutate(mode)}>Submit Decision</Button>
          <Button variant="outline" onClick={() => mut.mutate("recapture")}>Request Recapture</Button>
        </div>
      </div>
      <MedicalDisclaimer />
    </div>
  );
}
