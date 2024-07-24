const express = require('express');
const router = express.Router();
const transactionController = require('./accountTransactions.controller');
const authMiddleware = require('../middlewares/auth');

router.get('/', authMiddleware, transactionController.getAllTransactions);
router.get('/balance/:accountId', authMiddleware, transactionController.getTotalBalance);
router.post('/debit', authMiddleware, transactionController.debitTransaction);
router.post('/credit', authMiddleware, transactionController.creditTransaction);
router.put('/:id', authMiddleware, transactionController.editTransaction);
router.delete('/:id', authMiddleware, transactionController.deleteTransaction);

module.exports = router;