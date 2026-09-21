const express = require('express');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { modelMetricsSchema } = require('../validators/model.validator');
const modelController = require('../controllers/model.controller');

const router = express.Router();

router.post('/metrics', protect, authorize('admin'), validate(modelMetricsSchema), modelController.register);
router.get('/metrics', protect, modelController.latest);
router.get('/metrics/:version', protect, modelController.byVersion);

module.exports = router;
