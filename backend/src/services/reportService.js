const Screening = require('../models/Screening');

function pushAudit(screening, userId, action, details) {
  screening.auditTrail.push({ timestamp: new Date(), userId, action, details });
}

async function addAuditTrail(screeningId, userId, action, details) {
  await Screening.findByIdAndUpdate(screeningId, {
    $push: { auditTrail: { timestamp: new Date(), userId, action, details } }
  });
}

function logReportGenerated(screening, userId) {
  pushAudit(screening, userId, 'REPORT_GENERATED', `Report generated for ${screening.screeningId}`);
}

module.exports = { pushAudit, addAuditTrail, logReportGenerated };
