const express = require('express');
const router = express.Router();
const transactionController = require('./accountTransactions.controller');

router.get('/', transactionController.getAllTransactions);
router.get('/balance/:accountId', transactionController.getTotalBalance);
router.post('/debit', transactionController.debitTransaction);
router.post('/credit', transactionController.creditTransaction);
router.put('/:id', transactionController.editTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
