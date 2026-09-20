const express = require('express');
const patientController = require('../controllers/patient.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { createPatientSchema, updatePatientSchema } = require('../validators/patient.validator');

const router = express.Router();

router.use(protect);
router.post('/', authorize('health_worker', 'admin'), validate(createPatientSchema), patientController.create);
router.get('/', authorize('health_worker', 'ophthalmologist', 'admin'), patientController.list);
router.get('/:id', patientController.getById);
router.patch('/:id', authorize('health_worker', 'admin'), validate(updatePatientSchema), patientController.update);

module.exports = router;
