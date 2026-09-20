const mongoose = require('mongoose');

const simulationRunSchema = new mongoose.Schema(
  {
    parameters: {
      patientsPerDay: Number,
      numCameras: Number,
      aiProcessingTimeSec: Number,
      numOphthalmologists: Number,
      reviewTimeSec: Number,
      bandwidthMbps: Number,
      referableRate: Number
    },
    results: {
      dailyThroughput: Number,
      averageWaitTimeMin: Number,
      maxQueueLength: Number,
      aiUtilizationPct: Number,
      doctorUtilizationPct: Number,
      referralBacklog: Number,
      bottleneck: String
    },
    runBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SimulationRun', simulationRunSchema);
