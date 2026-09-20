const path = require('path');
const Screening = require('../models/Screening');
const { VALID_TRANSITIONS } = require('../config/constants');

function canTransition(from, to) {
  return (VALID_TRANSITIONS[from] || []).includes(to);
}

async function transition(screening, to, userId, details) {
  if (!canTransition(screening.status, to)) {
    const err = new Error(`Invalid state transition: ${screening.status} -> ${to}`);
    err.statusCode = 400;
    err.code = 'STATE_ERROR';
    throw err;
  }
  screening.status = to;
  screening.auditTrail.push({
    timestamp: new Date(),
    userId,
    action: `STATUS_${to.toUpperCase()}`,
    details: details || `Transitioned to ${to}`
  });
  await screening.save();
  return screening;
}

async function createScreening({ patientDocId, healthWorkerId, file, idempotencyKey }) {
  const relPath = path.join('uploads', 'original', file.filename).replace(/\\/g, '/');
  const screening = await Screening.create({
    patient: patientDocId,
    patientId: patientDocId,
    healthWorkerId,
    status: 'registered',
    ...(idempotencyKey ? { idempotencyKey } : {}),
    uploadedImage: {
      fileName: file.originalname,
      filePath: relPath,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadTimestamp: new Date()
    },
    auditTrail: [
      { timestamp: new Date(), userId: healthWorkerId, action: 'SCREENING_CREATED', details: 'Screening registered' },
      { timestamp: new Date(), userId: healthWorkerId, action: 'STATUS_IMAGE_UPLOADED', details: `Image uploaded: ${file.originalname}` }
    ]
  });
  screening.status = 'image_uploaded';
  await screening.save();
  return screening;
}

module.exports = { canTransition, transition, createScreening };
