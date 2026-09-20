const Patient = require('../models/Patient');

async function createPatient(data, userId) {
  const patient = await Patient.create({ ...data, registeredBy: userId });
  return patient;
}

async function listPatients({ search, limit, page }) {
  const lim = Math.min(parseInt(limit, 10) || 20, 100);
  const pg = Math.max(parseInt(page, 10) || 1, 1);
  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { patientId: { $regex: search, $options: 'i' } },
      { village: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }
  const [patients, total] = await Promise.all([
    Patient.find(filter).sort({ createdAt: -1 }).skip((pg - 1) * lim).limit(lim),
    Patient.countDocuments(filter)
  ]);
  return { patients, total, page: pg, limit: lim };
}

async function findPatientById(id) {
  const byMongo = await Patient.findById(id).catch(() => null);
  if (byMongo) return byMongo;
  return Patient.findOne({ patientId: id });
}

module.exports = { createPatient, listPatients, findPatientById };
