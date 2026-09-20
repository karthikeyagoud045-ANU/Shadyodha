const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/responseHelper');
const patientService = require('../services/patientService');

const create = asyncHandler(async (req, res) => {
  const patient = await patientService.createPatient(req.body, req.user._id);
  return success(res, { patient }, 'Patient registered', 201);
});

const list = asyncHandler(async (req, res) => {
  const { search, limit, page } = req.query;
  const result = await patientService.listPatients({ search, limit, page });
  return success(res, result);
});

const getById = asyncHandler(async (req, res) => {
  const patient = await patientService.findPatientById(req.params.id);
  if (!patient) {
    return res.status(404).json({ success: false, error: 'Patient not found', code: 'NOT_FOUND' });
  }
  return success(res, { patient });
});

const update = asyncHandler(async (req, res) => {
  const patient = await patientService.findPatientById(req.params.id);
  if (!patient) {
    return res.status(404).json({ success: false, error: 'Patient not found', code: 'NOT_FOUND' });
  }
  Object.assign(patient, req.body);
  await patient.save();
  return success(res, { patient }, 'Patient updated');
});

module.exports = { create, list, getById, update };
