const User = require('../models/user');

const getUserByAccountId = async (accountId) => {
    return await User.findOne({ accountId });
}

const createUser = async (user) => {
    const newUser = new User(user);
    return await newUser.save();
}

module.exports = {
    getUserByAccountId,
    createUser
}