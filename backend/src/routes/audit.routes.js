const express = require('express');
const auditController = require('../controllers/audit.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/rbac.middleware');

const router = express.Router();

router.use(protect);
router.get('/', authorize('admin'), auditController.list);

module.exports = router;
