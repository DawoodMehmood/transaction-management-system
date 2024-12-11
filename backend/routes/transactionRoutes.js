// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.get('/', transactionController.getAllTransactions);
router.post('/add', transactionController.addTransaction);
router.get('/dates', transactionController.getDates);
router.get('/stages', transactionController.getStages);
router.get('/price-summary', transactionController.getStageWisePrices);

// Get details of a particular transaction by ID
router.get('/:transaction_id', transactionController.getTransactionDetails);
router.get('/:transaction_id/details', transactionController.getChecklistDetails);
router.put('/:task_id/status', transactionController.updateTaskStatus);

router.patch('/:transaction_id/stage', transactionController.updateTransactionStage);

module.exports = router;