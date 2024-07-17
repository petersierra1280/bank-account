const Transaction = require('./models/transaction');
const transactionTypes = require('./utils/enums');

const { debit, credit } = transactionTypes;
const account1 = 'account1';

const initialInfo = [
    { accountId: account1, type: debit, cost: 10.00 },
    { accountId: account1, type: credit, amount: 1000 }
];

const seedDatabase = async () => {
    try {
        // Deletes all data and seeds initial info
        await Transaction.deleteMany({});
        await Transaction.insertMany(initialInfo);
        console.log('Seed completed');
    } catch (error) {
        console.error('Error trying to seed database', error);
    }
};

module.exports = seedDatabase;