const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    patientId: { type: String, unique: true },
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0, max: 130 },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    phone: { type: String },
    village: { type: String },
    district: { type: String },
    isDiabetic: { type: Boolean, default: true },
    diabetesDurationYears: { type: Number, min: 0 },
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

patientSchema.pre('save', async function preSave(next) {
  if (!this.patientId) {
    const rand = Math.floor(10000 + Math.random() * 90000);
    this.patientId = `PAT-${rand}`;
  }
  return next();
});

module.exports = mongoose.model('Patient', patientSchema);
