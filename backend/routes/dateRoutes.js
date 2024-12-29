const express = require('express');
const router = express.Router();
const dateController = require('../controllers/dateController');

// Route to add or update dates
router.post('/add', dateController.addOrUpdateDates);
router.get('/calendar', dateController.getAllTransactionsCalendar);   

router.get('/:transaction_id', dateController.getTransactionDates);
router.get('/:transaction_id/:stage_id', dateController.getTransactionDatesByStage);

module.exports = router;
