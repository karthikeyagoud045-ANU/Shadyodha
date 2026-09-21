const { TRIAGE_RULES, GRADE_LABELS, REFERABLE_THRESHOLD } = require('../config/constants');

function triage(grade) {
  const g = Math.min(4, Math.max(0, parseInt(grade, 10) || 0));
  const rule = TRIAGE_RULES[g];
  return {
    priority: rule.priority,
    action: rule.action,
    isReferable: rule.isReferable,
    recommendedTimeline: rule.recommendedTimeline,
    label: GRADE_LABELS[g]
  };
}

const PRIORITY_ORDER = ['ROUTINE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const escalate = (p) => PRIORITY_ORDER[Math.min(PRIORITY_ORDER.length - 1, PRIORITY_ORDER.indexOf(p) + 1)] || p;

// Context-aware layer (v1.2): history/load may change priority + routingFlag ONLY.
// INVARIANT: isReferable === (grade >= REFERABLE_THRESHOLD) always — never touched here.
function applyContext(base, ctx = {}) {
  const out = { ...base };
  const reasons = [];
  const { missedReferrals = 0, doctorUtilizationPct = null } = ctx;

  // Rule (a): prior missed referral + referable → escalate one step (cap URGENT)
  if (missedReferrals >= 1 && out.isReferable) {
    const before = out.priority;
    out.priority = escalate(out.priority);
    if (out.priority !== before) reasons.push(`ESCALATED ${before}->${out.priority}: ${missedReferrals} missed referral(s), referable case`);
  }
  // Rule (b): system overload + MEDIUM → suggest tele-ophthalmology routing, never downgrade
  if (doctorUtilizationPct !== null && doctorUtilizationPct > 95 && out.priority === 'MEDIUM') {
    out.routingFlag = 'TELEOPHTH_ROUTING_SUGGESTED';
    reasons.push(`ROUTING_FLAG: doctor utilization ${doctorUtilizationPct}% > 95, MEDIUM kept, tele-ophth suggested`);
  }
  return { triage: out, reasons };
}

module.exports = { triage, applyContext, REFERABLE_THRESHOLD };
