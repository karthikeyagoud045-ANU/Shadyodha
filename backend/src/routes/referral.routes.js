const express = require('express');
const referralController = require('../controllers/referral.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { createReferralSchema } = require('../validators/screening.validator');

const router = express.Router();

router.use(protect);
router.post('/', authorize('ophthalmologist', 'admin'), validate(createReferralSchema), referralController.create);
router.get('/', authorize('ophthalmologist', 'admin'), referralController.list);
router.patch('/:id', authorize('ophthalmologist', 'admin'), referralController.update);

module.exports = router;
