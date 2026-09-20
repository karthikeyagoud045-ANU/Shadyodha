const { TRIAGE_RULES, GRADE_LABELS } = require('../config/constants');

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

module.exports = { triage };
