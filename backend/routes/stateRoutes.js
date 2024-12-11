const express = require('express');
const router = express.Router();
const statesController = require('../controllers/stateController');

// Route to get all states
router.get('/all', statesController.getStates);

module.exports = router;
