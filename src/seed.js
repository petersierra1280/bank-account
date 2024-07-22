const Transaction = require('./models/transaction');
const User = require('./models/user');
const transactionTypes = require('./utils/enums');
const { hashPassword } = require('./utils/passwords');

const { debit, credit } = transactionTypes;
const account1 = 'account1';

const initialUser = {
    accountId: account1
}

const initialTransactionsInfo = [
    { accountId: account1, type: debit, cost: 10.00 },
    { accountId: account1, type: credit, amount: 1000 }
];

const seedDatabase = async () => {
    try {
        // Deletes all data and seeds initial info
        await Transaction.deleteMany({});
        await Transaction.insertMany(initialTransactionsInfo);
        await User.deleteMany({});
        initialUser.password = await hashPassword('password');
        await User.create(initialUser);
        console.log('Seed completed');
    } catch (error) {
        console.error('Error trying to seed database', error);
    }
};

module.exports = seedDatabase;