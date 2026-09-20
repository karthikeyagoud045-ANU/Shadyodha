const express = require('express');
const reviewController = require('../controllers/review.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { reviewDecisionSchema } = require('../validators/screening.validator');

const router = express.Router();

router.use(protect);
router.get('/queue', authorize('ophthalmologist', 'admin'), reviewController.queue);
router.get('/:id', authorize('ophthalmologist', 'admin'), reviewController.getById);
router.post('/:id/decision', authorize('ophthalmologist', 'admin'), validate(reviewDecisionSchema), reviewController.decide);

module.exports = router;
