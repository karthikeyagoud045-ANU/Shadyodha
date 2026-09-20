const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/responseHelper');
const AuditLog = require('../models/AuditLog');

const list = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
  const [logs, total] = await Promise.all([
    AuditLog.find()
      .populate('userId', 'name role')
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit),
    AuditLog.countDocuments()
  ]);
  return success(res, { logs, total, limit, offset });
});

module.exports = { list };
