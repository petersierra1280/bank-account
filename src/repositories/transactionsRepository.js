const Transaction = require('../models/transaction');
const transactionTypes = require('../utils/enums');

const { debit } = transactionTypes;

const getAllTransactions = async (accountId, filterProps = {}, sortingProps = {}) => {
    const { type, minAmount, maxAmount } = filterProps;
    const { sortField, sortOrder } = sortingProps;
    const query = {};
    if (accountId) { query.accountId = accountId };
    if (type) { query.type = type };
    if (minAmount && maxAmount) {
        const filterProp = type === debit ? 'cost' : 'amount';
        query[filterProp] = { $gte: minAmount, $lte: maxAmount };
    }

    const sortOptions = {};
    if (sortField) {
        sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
    }

    return await Transaction.find(query).sort(sortOptions);
}

const getTransactionById = async (id) => {
    return await Transaction.findById(id);
}

const createTransaction = async (transaction) => {
    const newTransaction = new Transaction(transaction);
    return await newTransaction.save();
}

const deleteTransaction = async (id) => {
    return await Transaction.findByIdAndDelete(id);
}

const updateTransaction = async (id, updateData) => {
    return await Transaction.findByIdAndUpdate(id, updateData, { new: true });
}

const getTotalBalance = async (accountId) => {
    const totalBalance = await Transaction.aggregate([
        { $match: { accountId } },
        {
            $group: {
                _id: null,
                total: {
                    $sum: {
                        $cond: [
                            { $eq: ['$type', debit] },
                            { $multiply: ['$cost', -1] },
                            '$amount'
                        ]
                    }
                }
            }
        }
    ]).hint({ accountId: 1 });

    return totalBalance[0] ? totalBalance[0].total : 0;
}

module.exports = {
    getAllTransactions,
    getTransactionById,
    createTransaction,
    deleteTransaction,
    updateTransaction,
    getTotalBalance
};