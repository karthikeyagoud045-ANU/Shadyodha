const express = require('express');
const simulationController = require('../controllers/simulation.controller');
const protect = require('../middleware/auth.middleware');
const authorize = require('../middleware/rbac.middleware');
const validate = require('../middleware/validate.middleware');
const { simulationSchema } = require('../validators/screening.validator');

const router = express.Router();

router.use(protect);
router.post('/run', authorize('admin'), validate(simulationSchema), simulationController.run);
router.get('/results', authorize('admin'), simulationController.latest);

module.exports = router;
