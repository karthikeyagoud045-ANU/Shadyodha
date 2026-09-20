const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/responseHelper');
const SimulationRun = require('../models/SimulationRun');

function computeResults(p) {
  const workHours = 8 * 3600;
  const cameraCapacity = p.numCameras * (workHours / Math.max(p.aiProcessingTimeSec, 0.1));
  const uploadPerPatientMB = 5;
  const bandwidthCapacity = (p.bandwidthMbps * workHours) / (uploadPerPatientMB * 8);
  const doctorCapacity = p.numOphthalmologists * (workHours / Math.max(p.reviewTimeSec, 1));
  const referableLoad = p.patientsPerDay * p.referableRate;

  const dailyThroughput = Math.floor(Math.min(p.patientsPerDay, cameraCapacity, bandwidthCapacity));
  const aiUtilizationPct = Number(Math.min(100, (p.patientsPerDay / Math.max(cameraCapacity, 1)) * 100).toFixed(1));
  const doctorUtilizationPct = Number(Math.min(100, (referableLoad / Math.max(doctorCapacity, 1)) * 100).toFixed(1));
  const referralBacklog = Math.max(0, Math.ceil(referableLoad - doctorCapacity));
  const maxQueueLength = Math.max(0, Math.ceil(p.patientsPerDay - dailyThroughput));
  const averageWaitTimeMin = Number(((maxQueueLength / Math.max(dailyThroughput, 1)) * 8 * 60).toFixed(1));

  let bottleneck = 'NONE';
  const caps = { CAMERA: cameraCapacity, BANDWIDTH: bandwidthCapacity, DOCTOR: doctorCapacity };
  if (dailyThroughput < p.patientsPerDay || referralBacklog > 0) {
    bottleneck = Object.entries(caps).sort((a, b) => a[1] - b[1])[0][0];
  }

  return { dailyThroughput, averageWaitTimeMin, maxQueueLength, aiUtilizationPct, doctorUtilizationPct, referralBacklog, bottleneck };
}

const run = asyncHandler(async (req, res) => {
  const results = computeResults(req.body);
  const runDoc = await SimulationRun.create({ parameters: req.body, results, runBy: req.user._id });
  return success(res, { results, runId: runDoc._id }, 'Simulation completed');
});

const latest = asyncHandler(async (req, res) => {
  const runs = await SimulationRun.find().sort({ createdAt: -1 }).limit(10);
  return success(res, { latest: runs[0] || null, runs });
});

module.exports = { run, latest, computeResults };
