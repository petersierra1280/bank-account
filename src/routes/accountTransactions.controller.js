const transactionRepo = require('../repositories/transactionsRepository');
const transactionTypes = require('../utils/enums');

const { debit, credit } = transactionTypes;

const getAllTransactions = async (req, res) => {
    try {
        const { accountId, type, sortField, sortOrder } = req.query;
        let { minAmount, maxAmount } = req.query;
        if (minAmount) {
            minAmount = parseFloat(minAmount);
        }
        if (maxAmount) {
            maxAmount = parseFloat(maxAmount);
        }
        const filterProps = { type, minAmount, maxAmount };
        const sortingProps = { sortField, sortOrder };
        const transactions = await transactionRepo.getAllTransactions(accountId, filterProps, sortingProps);
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getTotalBalance = async (req, res) => {
    try {
        const { user } = req;
        const { accountId } = req.params;

        if (user.accountId !== accountId) {
            return res.status(400).json({ error: 'Not allowed to see transactions for a different account' });
        }

        const balance = await transactionRepo.getTotalBalance(accountId);
        // Truncate balance up to two decimal places without rounding
        res.json({ balance: Math.trunc(balance * 100) / 100 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const debitTransaction = async (req, res) => {
    try {
        const { user } = req;
        const { accountId, cost } = req.body;

        if (!accountId) {
            return res.status(400).json({ error: 'Need to specify the account ID' });
        }

        if (!cost) {
            return res.status(400).json({ error: 'Need to specify the cost of the debit transaction' });
        }

        if (user.accountId !== accountId) {
            return res.status(400).json({ error: 'Not allowed to debit transactions for a different account' });
        }

        const totalBalance = await transactionRepo.getTotalBalance(accountId);
        if (totalBalance - cost < 0) {
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        const newDebitTransaction = await transactionRepo.createTransaction({ accountId, type: debit, cost });
        res.status(201).json(newDebitTransaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const creditTransaction = async (req, res) => {
    try {
        const { user } = req;
        const { accountId, amount } = req.body;

        if (!accountId) {
            return res.status(400).json({ error: 'Need to specify the account ID' });
        }

        if (!amount) {
            return res.status(400).json({ error: 'Need to specify the amount of the credit transaction' });
        }

        if (user.accountId !== accountId) {
            return res.status(400).json({ error: 'Not allowed to credit transactions for a different account' });
        }

        const newCreditTransaction = await transactionRepo.createTransaction({ accountId, type: credit, amount });
        res.status(201).json(newCreditTransaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const editTransaction = async (req, res) => {
    try {
        const transactionId = req.params.id;
        const transactionToUpdate = req.body;
        const { type: newType = '', accountId: newAccountId = '', cost } = transactionToUpdate;
        const { user } = req;

        const transactionBeforeUpdate = await transactionRepo.getTransactionById(transactionId);

        if (!transactionBeforeUpdate) {
            return res.status(404).json({ error: 'This transaction ID is not valid' });
        }

        const { type, accountId } = transactionBeforeUpdate;

        if (newType && type !== newType) {
            return res.status(400).json({ error: 'Cannot update the type of a transaction' });
        }

        if (newAccountId && accountId !== newAccountId) {
            return res.status(400).json({ error: 'Cannot update the account ID of the transaction' });
        }

        if (user.accountId !== accountId) {
            return res.status(400).json({ error: 'Not allowed to edit transactions for a different account' });
        }

        const totalBalance = await transactionRepo.getTotalBalance(accountId);
        if (type === debit && cost && totalBalance - cost < 0) {
            return res.status(400).json({ message: 'This update cannot be processed, otherwise balance will be negative' });
        }

        const updatedTransaction = await transactionRepo.updateTransaction(transactionId, transactionToUpdate);
        res.json(updatedTransaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteTransaction = async (req, res) => {
    try {
        const transactionId = req.params.id;
        const { user } = req;
        const transactionBeforeDelete = await transactionRepo.getTransactionById(transactionId);

        if (!transactionBeforeDelete) {
            return res.status(404).json({ error: 'Invalid transaction ID provided' });
        }
        const { type, amount, accountId } = transactionBeforeDelete;

        if (user.accountId !== accountId) {
            return res.status(400).json({ error: 'Not allowed to delete transactions for a different account' });
        }

        const totalBalance = await transactionRepo.getTotalBalance(accountId);

        if (type === credit && totalBalance - amount < 0) {
            return res.status(400).json({ message: 'This deletion cannot be processed, otherwise balance will be negative' });
        }
        await transactionRepo.deleteTransaction(transactionId);
        res.status(204).json();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllTransactions,
    deleteTransaction,
    debitTransaction,
    creditTransaction,
    editTransaction,
    getTotalBalance
};