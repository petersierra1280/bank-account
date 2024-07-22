const mongoose = require('mongoose');
const { comparePasswords } = require('../utils/passwords');

const userSchema = new mongoose.Schema(
    {
        accountId: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }
);

// Compare the given password with the hashed password in the database
userSchema.methods.comparePassword = async function (password) {
    return await comparePasswords(password, this.password);
};

// Create indexes for most searched props
userSchema.index({ accountId: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;