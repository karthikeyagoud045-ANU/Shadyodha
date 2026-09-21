const mongoose = require('mongoose');

const modelVersionSchema = new mongoose.Schema(
  {
    modelVersion: { type: String, unique: true, required: true },
    icdrScale: { type: [String], default: ['No DR', 'Mild NPDR', 'Moderate NPDR', 'Severe NPDR', 'Proliferative DR'] },
    referableDefinition: { type: String, default: 'Referable DR = ICDR Level 2+' },
    datasets: { type: Object, default: {} },
    referableMetrics: {
      sensitivity: Number,
      specificity: Number,
      ppv: Number,
      npv: Number,
      auc: Number,
      prevalence: Number,
      targets: {
        sensitivityMin: { type: Number, default: 0.9 },
        specificityMin: { type: Number, default: 0.85 },
        met: { type: Boolean, default: false },
      },
    },
    operatingPoint: {
      score: Number,
      threshold: Number,
      tunedOn: String,
    },
    perClass: { type: [Object], default: [] },
    confusionMatrix: { type: [[Number]], default: [] },
    calibration: {
      method: String,
      eceBefore: Number,
      eceAfter: Number,
    },
    artifacts: {
      confusionMatrixUrl: String,
      rocUrl: String,
      calibrationUrl: String,
    },
    evaluatedAt: Date,
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ModelVersion', modelVersionSchema);
