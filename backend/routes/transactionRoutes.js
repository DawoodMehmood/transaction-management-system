// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const checkUserAccess = require('../middlewares/checkUserAccess');

router.get('/', checkUserAccess, transactionController.getAllTransactions);
router.post('/add', transactionController.addTransaction);
router.get('/dates', transactionController.getDates);
router.get('/stages', transactionController.getStages);
router.get('/price-summary', checkUserAccess, transactionController.getStageWisePrices);

// Get details of a particular transaction by ID
// router.get('/:transaction_id', transactionController.getTransactionDetails);
router.get('/:transaction_id/details', transactionController.getChecklistDetails);
router.put('/:transaction_detail_id/status', transactionController.updateTaskStatus);
router.put('/:transaction_detail_id/task', transactionController.updateTask);
router.post('/:transaction_detail_id/duplicate', transactionController.duplicateTask);
router.post('/addTask', transactionController.addTask);

router.patch('/:transaction_id/stage', transactionController.updateTransactionStage);
router.delete('/bulk-delete', transactionController.bulkDeleteTransactions);
router.put('/update-price', transactionController.updatePrice);

module.exports = router;