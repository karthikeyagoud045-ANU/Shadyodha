const Screening = require('../models/Screening');
const Referral = require('../models/Referral');
const FollowUp = require('../models/FollowUp');
const SimulationRun = require('../models/SimulationRun');
const { assessQuality } = require('./qualityAgent');
const { analyzeImage } = require('./retinaAgent');
const { triage, applyContext } = require('./triageAgent');

function audit(screening, userId, action, details) {
  screening.auditTrail.push({ timestamp: new Date(), userId, action, details });
}

async function runPipeline(screeningId, userId) {
  const screening = await Screening.findById(screeningId);
  if (!screening) {
    const err = new Error('Screening not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  // 1-2. Quality check
  screening.status = 'quality_check';
  audit(screening, userId, 'STATUS_QUALITY_CHECK', 'Quality check started');
  await screening.save();

  const quality = assessQuality(
    { size: screening.uploadedImage && screening.uploadedImage.fileSize },
    screening
  );
  screening.qualityAssessment = quality;

  if (!quality.gradable) {
    screening.status = 'quality_failed';
    audit(screening, userId, 'STATUS_QUALITY_FAILED', quality.recommendation);
    await screening.save();
    return screening;
  }

  screening.status = 'quality_passed';
  audit(screening, userId, 'STATUS_QUALITY_PASSED', `Quality score ${quality.score}`);
  await screening.save();

  // 3. AI analysis
  screening.status = 'ai_processing';
  audit(screening, userId, 'STATUS_AI_PROCESSING', 'AI analysis started');
  await screening.save();

  let aiOutput;
  try {
    aiOutput = await analyzeImage(screening);
  } catch (e) {
    screening.status = 'error';
    audit(screening, userId, 'STATUS_ERROR', e.message);
    await screening.save();
    throw e;
  }

  const grade = aiOutput.prediction.grade;
  const t = triage(grade);

  // v1.2 context: patient history + system load (priority/routing only, never isReferable/grade)
  const patientRef = screening.patient || screening.patientId;
  const [missedRefs, overdueFus, latestSim] = await Promise.all([
    Referral.countDocuments({ $or: [{ patient: patientRef }, { patientId: patientRef }], status: 'missed' }),
    FollowUp.countDocuments({ $or: [{ patient: patientRef }, { patientId: patientRef }], status: 'overdue' }),
    SimulationRun.findOne().sort({ createdAt: -1 }).lean(),
  ]);
  const { triage: ctx, reasons } = applyContext(t, {
    missedReferrals: missedRefs + overdueFus,
    doctorUtilizationPct: latestSim?.results?.doctorUtilizationPct ?? null,
  });

  screening.aiResult = {
    grade,
    label: aiOutput.prediction.label,
    confidence: aiOutput.prediction.confidence,
    calibratedConfidence: aiOutput.prediction.calibratedConfidence,
    referable: aiOutput.prediction.referable,
    rawScores: aiOutput.prediction.rawScores,
    modelVersion: aiOutput.modelVersion,
    processingTimeMs: aiOutput.processingTimeMs
  };
  screening.explainability = {
    gradcamUrl: aiOutput.explainability.gradcamUrl,
    overlayUrl: aiOutput.explainability.overlayUrl,
    annotationUrl: aiOutput.explainability.annotationUrl,
    detectedLesions: aiOutput.explainability.detectedLesions
  };
  screening.triage = {
    priority: ctx.priority,
    action: ctx.action,
    isReferable: ctx.isReferable,
    recommendedTimeline: ctx.recommendedTimeline,
    ...(ctx.routingFlag ? { routingFlag: ctx.routingFlag } : {})
  };
  screening.status = 'ai_completed';
  audit(screening, userId, 'STATUS_AI_COMPLETED', `Grade ${grade} (${ctx.priority})`);
  reasons.forEach((r) => audit(screening, userId, 'TRIAGE_CONTEXT_RULE', r));
  await screening.save();

  // 4. Route by referability
  if (ctx.isReferable) {
    screening.status = 'review_pending';
    audit(screening, userId, 'STATUS_REVIEW_PENDING', 'Queued for ophthalmologist review');
  } else {
    screening.status = 'completed';
    audit(screening, userId, 'STATUS_COMPLETED', 'Non-referable, screening completed');
  }
  await screening.save();
  return screening;
}

module.exports = { runPipeline };
