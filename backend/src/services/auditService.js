const AuditLog = require('../models/AuditLog');

// Fire-and-forget: audit must never fail or slow down a request.
// ponytail: no await by design; failures are swallowed.
function logAudit(req, action, resourceType, resourceId, metadata) {
  AuditLog.create({
    userId: req && req.user ? req.user._id : undefined,
    action,
    resourceType,
    resourceId: resourceId ? String(resourceId) : undefined,
    ipAddress: req && req.ip,
    metadata,
    timestamp: new Date()
  }).catch(() => {});
}

module.exports = { logAudit };
