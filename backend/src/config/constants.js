const GRADE_LABELS = {
  0: 'No DR',
  1: 'Mild NPDR',
  2: 'Moderate NPDR',
  3: 'Severe NPDR',
  4: 'Proliferative DR'
};

const REFERABLE_THRESHOLD = 2;

const TRIAGE_RULES = {
  0: { priority: 'ROUTINE', action: 'ROUTINE_SCREENING', recommendedTimeline: 'Next screening in 2 years', isReferable: false },
  1: { priority: 'LOW', action: 'ANNUAL_FOLLOWUP', recommendedTimeline: 'Annual follow-up recommended', isReferable: false },
  2: { priority: 'MEDIUM', action: 'OPHTHALMOLOGIST_REVIEW', recommendedTimeline: 'Ophthalmologist review within 7 days', isReferable: true },
  3: { priority: 'HIGH', action: 'OPHTHALMOLOGIST_REVIEW', recommendedTimeline: 'Ophthalmologist review within 48 hours', isReferable: true },
  4: { priority: 'URGENT', action: 'IMMEDIATE_REFERRAL', recommendedTimeline: 'Immediate ophthalmologist review required', isReferable: true }
};

const SCREENING_STATUSES = [
  'registered', 'image_uploaded', 'quality_check',
  'quality_passed', 'quality_failed', 'ai_processing',
  'ai_completed', 'review_pending', 'review_completed',
  'referred', 'follow_up', 'completed', 'error'
];

const VALID_TRANSITIONS = {
  registered: ['image_uploaded'],
  image_uploaded: ['quality_check'],
  quality_check: ['quality_passed', 'quality_failed'],
  quality_failed: ['image_uploaded'],
  quality_passed: ['ai_processing'],
  ai_processing: ['ai_completed', 'error'],
  ai_completed: ['review_pending', 'completed'],
  review_pending: ['review_completed'],
  review_completed: ['referred', 'completed'],
  referred: ['follow_up'],
  follow_up: ['completed'],
  quality_passed_alias: [],
  completed: [],
  error: []
};

const ROLES = ['health_worker', 'ophthalmologist', 'admin'];

module.exports = {
  GRADE_LABELS,
  REFERABLE_THRESHOLD,
  TRIAGE_RULES,
  SCREENING_STATUSES,
  VALID_TRANSITIONS,
  ROLES
};
