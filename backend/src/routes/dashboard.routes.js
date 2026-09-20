const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/rbac.middleware');

const router = express.Router();

router.use(protect);
router.get('/stats', dashboardController.stats);
router.get('/priority', authorize('ophthalmologist', 'admin'), dashboardController.priorityCases);

module.exports = router;
