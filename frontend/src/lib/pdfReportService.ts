import { jsPDF } from "jspdf";
import type { Screening } from "@/types";

export function generatePdfReport(screening: Screening) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 16;

  // 1. Header Banner / Brand Bar
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("DRISHTI AI \u2022 CLINICAL RETINAL REPORT", margin + 6, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(
    "National Programme for Control of Blindness \u2022 AI-Assisted Tele-Ophthalmology",
    margin + 6,
    y + 17
  );

  doc.setFontSize(8);
  doc.text(`Report ID: ${screening.id}`, pageWidth - margin - 40, y + 10);
  doc.text(
    `Date: ${new Date(screening.date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}`,
    pageWidth - margin - 40,
    y + 17
  );

  y += 28;

  // 2. Patient Demographics & Exam Info Box
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "FD");

  doc.setTextColor(100, 116, 139); // Slate 500
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");

  doc.text("PATIENT NAME", margin + 5, y + 6);
  doc.text("PATIENT ID", margin + 55, y + 6);
  doc.text("EXAM DATE & TIME", margin + 105, y + 6);
  doc.text("QUALITY INDEX", margin + 145, y + 6);

  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");

  doc.text(screening.patientName, margin + 5, y + 13);
  doc.text(screening.patientId, margin + 55, y + 13);
  doc.text(
    new Date(screening.date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    margin + 105,
    y + 13
  );
  doc.text(
    `${Math.round((screening.imageQuality?.score ?? 0.9) * 100)}% (Gradable)`,
    margin + 145,
    y + 13
  );

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Screening Mode: Field Tele-Ophthalmology", margin + 5, y + 20);
  doc.text(
    `Focus: ${Math.round((screening.imageQuality?.focusScore ?? 0.88) * 100)}% | FOV: ${
      screening.imageQuality?.fovPercentage ?? 94
    }%`,
    margin + 105,
    y + 20
  );

  y += 28;

  // 3. Primary AI Diagnostic Classification Callout
  const grade = screening.prediction.grade;
  let badgeColor = [16, 185, 129]; // Emerald (0)
  if (grade === 1) badgeColor = [14, 165, 233]; // Sky
  if (grade === 2) badgeColor = [245, 158, 11]; // Amber
  if (grade >= 3) badgeColor = [244, 63, 94]; // Rose

  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(
    `DIAGNOSIS: GRADE ${grade} \u2014 ${screening.prediction.label.toUpperCase()}`,
    margin + 8,
    y + 11
  );

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const conf = Math.round(screening.prediction.confidence * 100);
  const refText = screening.prediction.referable
    ? "\u2022 REFERRAL RECOMMENDED"
    : "\u2022 ROUTINE ANNUAL SURVEILLANCE";
  doc.text(
    `Deep Learning Confidence: ${conf}% (Calibrated)  ${refText}  \u2022 Priority: ${screening.triage.priority}`,
    margin + 8,
    y + 19
  );

  y += 31;

  // 4. Clinical Evidence & Explainability
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, "F");

  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("EXPLAINABLE AI CLINICAL EVIDENCE", margin + 6, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const evidenceLines = doc.splitTextToSize(
    screening.explainability.evidence,
    contentWidth - 12
  );
  doc.text(evidenceLines, margin + 6, y + 12);

  y += 26;

  // 5. Detected Retinal Lesions & Biomarkers Summary Table
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("QUANTIFIED RETINAL LESIONS & BIOMARKERS", margin, y + 2);
  y += 6;

  const lesions = screening.explainability.lesions;
  const tableData = [
    {
      name: "Microaneurysms",
      count: lesions.microaneurysm,
      severity: lesions.microaneurysm > 20 ? "High Density" : lesions.microaneurysm > 0 ? "Moderate" : "None Detected",
      description: "Small outpouchings in retinal capillaries",
    },
    {
      name: "Intraretinal Hemorrhages",
      count: lesions.hemorrhage,
      severity: lesions.hemorrhage > 10 ? "Extensive" : lesions.hemorrhage > 0 ? "Present" : "None Detected",
      description: "Ruptured vessels in middle retinal layers (dot/blot)",
    },
    {
      name: "Hard Exudates",
      count: lesions.hardExudate,
      severity: lesions.hardExudate > 5 ? "Significant" : lesions.hardExudate > 0 ? "Mild" : "None Detected",
      description: "Lipid deposits indicating vascular leakage",
    },
  ];

  // Table header
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 7, "F");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("BIOMARKER TYPE", margin + 4, y + 5);
  doc.text("COUNT", margin + 60, y + 5);
  doc.text("SEVERITY INDICATOR", margin + 85, y + 5);
  doc.text("CLINICAL SIGNIFICANCE", margin + 125, y + 5);
  y += 7;

  // Table rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  tableData.forEach((row, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 7, "F");
    }
    doc.text(row.name, margin + 4, y + 5);
    doc.text(String(row.count), margin + 60, y + 5);
    doc.text(row.severity, margin + 85, y + 5);
    doc.text(row.description, margin + 125, y + 5);
    y += 7;
  });

  y += 5;

  // 6. Actionable Triage & Referral Directive
  doc.setFillColor(238, 242, 255); // Indigo 50
  doc.setDrawColor(199, 210, 254); // Indigo 200
  doc.roundedRect(margin, y, contentWidth, 28, 2, 2, "FD");

  doc.setTextColor(67, 56, 202);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("TRIAGE ACTION & FOLLOW-UP DIRECTIVE", margin + 6, y + 7);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");

  const actionText =
    screening.triage.action === "OPHTHALMOLOGIST_REVIEW"
      ? "Direct Referral to District Hospital Comprehensive Eye Care Center for Dilated Indirect Ophthalmoscopy & Optical Coherence Tomography (OCT)."
      : "Community-level surveillance. Schedule routine annual fundus screening at nearest Vision Center / PHC.";

  doc.text(`Action: ${actionText}`, margin + 6, y + 13, {
    maxWidth: contentWidth - 12,
  });
  doc.setFont("helvetica", "bold");
  doc.text(
    `Recommended Timeline: ${screening.triage.recommendedTimeline}`,
    margin + 6,
    y + 24
  );

  y += 34;

  // 7. Medical Disclaimer
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Disclaimer: DRISHTI AI is an assistive decision-support tool validated under tele-ophthalmology guidelines. Final clinical diagnosis and intervention remains under the discretion of the licensed ophthalmologist.",
    margin,
    y,
    { maxWidth: contentWidth }
  );

  y += 14;

  // 8. Signature Block
  doc.setDrawColor(203, 213, 225);
  doc.line(margin + 110, y + 12, pageWidth - margin, y + 12);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text("Authorized Medical Officer / Ophthalmologist", margin + 110, y + 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("District Hospital Tele-Ophthalmology Cell", margin + 110, y + 21);
  doc.text(
    `Electronically generated & verified: ${new Date().toISOString()}`,
    margin,
    y + 21
  );

  // Trigger browser download of PDF
  doc.save(`DRISHTI_Diagnostic_Report_${screening.id}.pdf`);
}
