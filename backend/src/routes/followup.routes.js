const express = require('express');
const followupController = require('../controllers/followup.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { createFollowUpSchema } = require('../validators/screening.validator');

const router = express.Router();

router.use(protect);
router.post('/', authorize('health_worker', 'ophthalmologist', 'admin'), validate(createFollowUpSchema), followupController.create);
router.get('/', followupController.list);
router.patch('/:id', followupController.update);

module.exports = router;
