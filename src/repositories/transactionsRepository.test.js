const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Transaction = require('../models/transaction');
const transactionRepo = require('../repositories/transactionsRepository');
const transactionTypes = require('../utils/enums');

const { debit, credit } = transactionTypes;

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const localUri = mongoServer.getUri();
    await mongoose.connect(localUri);
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

describe('Transaction repository', () => {
    const accountId = 'account1';

    beforeEach(async () => {
        await Transaction.deleteMany({});
    });

    it('Get all transactions for an account with sorting and filtering options', async () => {
        await Transaction.create({ accountId, type: 'credit', amount: 500 });
        await Transaction.create({ accountId, type: 'debit', cost: 10.5 });
        await Transaction.create({ accountId, type: 'debit', cost: 7 });

        const filterProps = {
            type: 'debit',
            minAmount: 5,
            maxAmount: 15
        };
        const sortingProps = {
            sortField: 'cost',
            sortOrder: 'asc'
        };

        const transactions = await transactionRepo.getAllTransactions(accountId, filterProps, sortingProps);

        expect(transactions.length).toBe(2);
        expect(transactions[0].cost).toBe(7);
        expect(transactions[1].cost).toBe(10.5);
    });

    it('Get the information of a single transaction', async () => {
        const newCreditTransaction = await Transaction.create({ accountId, type: credit, amount: 27 });
        const transactionJustCreated = await transactionRepo.getTransactionById(newCreditTransaction._id);
        expect(transactionJustCreated.amount).toBe(newCreditTransaction.amount);
    });

    it('Get the total balance of an account', async () => {
        await Transaction.create({ accountId, type: credit, amount: 1000 });
        await Transaction.create({ accountId, type: debit, cost: 500 });
        const balance = await transactionRepo.getTotalBalance(accountId);
        expect(balance).toBe(500);
    });

    it('Create a transaction', async () => {
        const transaction = { accountId, type: credit, amount: 500 };
        const createdTransaction = await transactionRepo.createTransaction(transaction);
        expect(createdTransaction).toHaveProperty('_id');
        expect(createdTransaction.amount).toBe(500);
    });

    it('Update a transaction', async () => {
        const transaction = await Transaction.create({ accountId, type: credit, amount: 500 });
        const updatedTransaction = await transactionRepo.updateTransaction(transaction._id, { amount: 600 });
        expect(updatedTransaction.amount).toBe(600);
    });

    it('Delete a transaction', async () => {
        const transaction = await Transaction.create({ accountId, type: credit, amount: 500 });
        await transactionRepo.deleteTransaction(transaction._id);
        const transactions = await Transaction.find();
        expect(transactions.length).toBe(0);
    });
});