const mongoose = require('mongoose');
const { SCREENING_STATUSES } = require('../config/constants');

const regionSchema = new mongoose.Schema(
  { x: Number, y: Number, w: Number, h: Number },
  { _id: false }
);

const lesionSchema = new mongoose.Schema(
  {
    type: String,
    count: Number,
    regions: [regionSchema]
  },
  { _id: false }
);

const auditEntrySchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: String,
    details: String
  },
  { _id: false }
);

const screeningSchema = new mongoose.Schema(
  {
    screeningId: { type: String, unique: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    healthWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: SCREENING_STATUSES, default: 'registered' },
    uploadedImage: {
      fileName: String,
      filePath: String,
      fileSize: Number,
      mimeType: String,
      uploadTimestamp: Date
    },
    qualityAssessment: {
      gradable: Boolean,
      score: Number,
      focusScore: Number,
      illuminationScore: Number,
      fovPercentage: Number,
      issues: [String],
      recommendation: String
    },
    aiResult: {
      grade: { type: Number, min: 0, max: 4 },
      label: String,
      confidence: Number,
      calibratedConfidence: Number,
      referable: Boolean,
      rawScores: [Number],
      modelVersion: String,
      processingTimeMs: Number
    },
    explainability: {
      gradcamUrl: String,
      overlayUrl: String,
      annotationUrl: String,
      detectedLesions: [lesionSchema]
    },
    triage: {
      priority: { type: String, enum: ['ROUTINE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
      action: String,
      isReferable: Boolean,
      recommendedTimeline: String
    },
    review: {
      assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: {
        type: String,
        enum: ['pending', 'confirmed', 'overridden', 'recapture_requested'],
        default: 'pending'
      },
      decision: String,
      correctGrade: Number,
      clinicalNote: String,
      reviewedAt: Date
    },
    auditTrail: [auditEntrySchema]
  },
  { timestamps: true }
);

screeningSchema.pre('save', async function preSave(next) {
  if (!this.screeningId) {
    const year = new Date().getFullYear();
    const rand = Math.floor(10000 + Math.random() * 90000);
    this.screeningId = `SCR-${year}-${rand}`;
  }
  if (this.patient && !this.patientId) this.patientId = this.patient;
  if (this.patientId && !this.patient) this.patient = this.patientId;
  return next();
});

screeningSchema.index({ healthWorkerId: 1, createdAt: -1 });
screeningSchema.index({ status: 1 });
screeningSchema.index({ 'triage.isReferable': 1, 'review.status': 1 });

module.exports = mongoose.model('Screening', screeningSchema);
