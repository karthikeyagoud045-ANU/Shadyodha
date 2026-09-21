const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/responseHelper');
const Device = require('../models/Device');

// POST /api/devices/heartbeat (health_worker): upsert by deviceId
const heartbeat = asyncHandler(async (req, res) => {
  const { deviceId, os, appVersion, offlineQueueSize, lastGps } = req.body;
  if (!deviceId) {
    return res.status(400).json({ success: false, error: 'deviceId is required', code: 'VALIDATION_ERROR' });
  }
  const device = await Device.findOneAndUpdate(
    { deviceId },
    {
      deviceId,
      healthWorkerId: req.user._id,
      ...(os !== undefined ? { os } : {}),
      ...(appVersion !== undefined ? { appVersion } : {}),
      ...(offlineQueueSize !== undefined ? { offlineQueueSize } : {}),
      ...(lastGps !== undefined ? { lastGps } : {}),
      lastSyncAt: new Date(),
    },
    { new: true, upsert: true }
  );
  return success(res, { device }, 'Heartbeat recorded');
});

// GET /api/devices (admin)
const list = asyncHandler(async (req, res) => {
  const devices = await Device.find().populate('healthWorkerId', 'name email role').sort({ lastSyncAt: -1 }).limit(100);
  return success(res, { devices });
});

module.exports = { heartbeat, list };
