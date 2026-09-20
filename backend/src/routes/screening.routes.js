const express = require('express');
const screeningController = require('../controllers/screening.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/rbac.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.use(protect);
router.post('/', authorize('health_worker', 'admin'), upload.single('image'), screeningController.create);
router.get('/', screeningController.list);
router.get('/:id', screeningController.getById);
router.post('/:id/analyze', authorize('health_worker', 'admin'), screeningController.analyze);
router.get('/:id/result', screeningController.getResult);
router.get('/:id/report', screeningController.getReport);

module.exports = router;
