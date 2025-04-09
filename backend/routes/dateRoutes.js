const express = require('express');
const router = express.Router();
const dateController = require('../controllers/dateController');
const checkUserAccess = require('../middlewares/checkUserAccess');

// Route to add or update dates
router.post('/add', dateController.addOrUpdateDates);
router.get('/calendar', dateController.getAllTransactionsCalendar);   

router.get('/:transaction_id', checkUserAccess, dateController.getTransactionDates);
router.get('/:transaction_id/:stage_id', checkUserAccess, dateController.getTransactionDatesByStage);

module.exports = router;
