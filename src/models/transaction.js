const mongoose = require('mongoose');
const transactionTypes = require('../utils/enums');

const { debit, credit } = transactionTypes;

const transactionSchema = new mongoose.Schema({
    accountId: {
        type: String,
        required: true,
        ref: 'User'
    },
    type: {
        type: String,
        enum: [debit, credit],
        required: true
    },
    cost: {
        type: Number,
        required: function () {
            return this.type === debit;
        }
    },
    amount: {
        type: Number,
        required: function () {
            return this.type === credit;
        }
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Create indexes for most searched props
transactionSchema.index({ accountId: 1 });
transactionSchema.index({ type: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
