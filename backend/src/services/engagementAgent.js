const PatientCommunication = require('../models/PatientCommunication');
const { draftMessage } = require('./templates');

// Mock transport: drafts + QUEUED, no network calls.
async function onReferralCreated({ patient, screening, referral }) {
  const lang = patient?.contactPreferences?.preferredLanguage || 'hi';
  const messageContent = draftMessage('REFERRAL_CREATED', lang, patient, referral);
  return PatientCommunication.create({
    patientId: patient._id,
    screeningId: screening._id,
    referralId: referral._id,
    channel: 'WHATSAPP',
    type: 'REFERRAL_CREATED',
    language: lang,
    messageContent,
    status: 'QUEUED',
  });
}

module.exports = { onReferralCreated };
