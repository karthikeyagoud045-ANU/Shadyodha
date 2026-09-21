const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
  {
    deviceId: { type: String, unique: true, required: true },
    healthWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    os: String,
    appVersion: String,
    offlineQueueSize: { type: Number, default: 0 },
    lastGps: {
      lat: Number,
      lng: Number,
    },
    lastSyncAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Device', deviceSchema);
