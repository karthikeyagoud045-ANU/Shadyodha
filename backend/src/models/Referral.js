const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema(
  {
    referralId: { type: String, unique: true },
    screeningId: { type: mongoose.Schema.Types.ObjectId, ref: 'Screening', required: true },
    screening: { type: mongoose.Schema.Types.ObjectId, ref: 'Screening' },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], required: true },
    referredTo: { type: String, required: true },
    status: { type: String, enum: ['pending', 'scheduled', 'completed', 'missed'], default: 'pending' },
    scheduledDate: Date,
    completedDate: Date,
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

referralSchema.pre('save', async function preSave(next) {
  if (!this.referralId) {
    const rand = Math.floor(10000 + Math.random() * 90000);
    this.referralId = `REF-${rand}`;
  }
  if (this.screeningId && !this.screening) this.screening = this.screeningId;
  if (this.patientId && !this.patient) this.patient = this.patientId;
  return next();
});

module.exports = mongoose.model('Referral', referralSchema);
