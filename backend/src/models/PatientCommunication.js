const mongoose = require('mongoose');

const commSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    screeningId: { type: mongoose.Schema.Types.ObjectId, ref: 'Screening' },
    referralId: { type: mongoose.Schema.Types.ObjectId, ref: 'Referral' },
    channel: { type: String, enum: ['WHATSAPP'], default: 'WHATSAPP' },
    type: { type: String, enum: ['REFERRAL_CREATED', 'FOLLOWUP_REMINDER'], required: true },
    language: { type: String, enum: ['hi', 'en', 'ta'], default: 'hi' },
    messageContent: { type: String, required: true },
    status: { type: String, enum: ['QUEUED', 'SENT'], default: 'QUEUED' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

commSchema.index({ patientId: 1, createdAt: -1 });
commSchema.index({ screeningId: 1 });

module.exports = mongoose.model('PatientCommunication', commSchema);
