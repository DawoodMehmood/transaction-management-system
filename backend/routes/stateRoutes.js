const express = require('express');
const router = express.Router();
const statesController = require('../controllers/stateController');
const checkUserAccess = require('../middlewares/checkUserAccess');

// Route to get all states
router.get('/', checkUserAccess, statesController.getStates);

module.exports = router;
