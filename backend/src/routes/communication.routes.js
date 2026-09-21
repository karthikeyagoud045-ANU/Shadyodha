const express = require('express');
const protect = require('../middleware/auth.middleware');
const communicationController = require('../controllers/communication.controller');

const router = express.Router();

router.get('/', protect, communicationController.list);

module.exports = router;
