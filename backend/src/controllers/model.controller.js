const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/responseHelper');
const ModelVersion = require('../models/ModelVersion');
const { logAudit } = require('../services/auditService');

// POST /api/model/metrics (admin): targets.met computed server-side, never trusted from client
const register = asyncHandler(async (req, res) => {
  const { sensitivity, specificity } = req.body.referableMetrics;
  const met = sensitivity >= 0.9 && specificity >= 0.85;
  const doc = await ModelVersion.create({
    ...req.body,
    referableMetrics: {
      ...req.body.referableMetrics,
      targets: { sensitivityMin: 0.9, specificityMin: 0.85, met },
    },
    registeredBy: req.user._id,
  });
  logAudit(req, 'MODEL_REGISTERED', 'ModelVersion', doc._id);
  return success(res, { model: doc }, 'Model metrics registered', 201);
});

// GET /api/model/metrics (any auth): latest by creation
const latest = asyncHandler(async (req, res) => {
  const doc = await ModelVersion.findOne().sort({ createdAt: -1 }).populate('registeredBy', 'name email role');
  if (!doc) {
    return res.status(404).json({ success: false, error: 'No model metrics registered', code: 'NOT_FOUND' });
  }
  return success(res, { model: doc });
});

// GET /api/model/metrics/:version (any auth)
const byVersion = asyncHandler(async (req, res) => {
  const doc = await ModelVersion.findOne({ modelVersion: req.params.version }).populate('registeredBy', 'name email role');
  if (!doc) {
    return res.status(404).json({ success: false, error: 'Model version not found', code: 'NOT_FOUND' });
  }
  return success(res, { model: doc });
});

module.exports = { register, latest, byVersion };
