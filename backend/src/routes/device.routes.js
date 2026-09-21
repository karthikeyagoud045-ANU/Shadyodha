const express = require('express');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/rbac.middleware');
const deviceController = require('../controllers/device.controller');

const router = express.Router();

router.post('/heartbeat', protect, authorize('health_worker', 'admin'), deviceController.heartbeat);
router.get('/', protect, authorize('admin'), deviceController.list);

module.exports = router;
