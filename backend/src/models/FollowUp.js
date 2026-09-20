const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema(
  {
    screeningId: { type: mongoose.Schema.Types.ObjectId, ref: 'Screening' },
    screening: { type: mongoose.Schema.Types.ObjectId, ref: 'Screening' },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    nextDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'overdue', 'missed'],
      default: 'scheduled'
    },
    notes: String,
    completedDate: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

followUpSchema.pre('save', async function preSave(next) {
  if (this.screeningId && !this.screening) this.screening = this.screeningId;
  if (this.patientId && !this.patient) this.patient = this.patientId;
  return next();
});

module.exports = mongoose.model('FollowUp', followUpSchema);
