const jwt = require('jsonwebtoken');
const { hashPassword } = require('../utils/passwords');
const userRepo = require('../repositories/usersRepository');

const register = async (req, res, next) => {
    const { accountId, password } = req.body;

    try {
        const existingUser = await userRepo.getUserByAccountId(accountId);
        if (existingUser) {
            return res.status(404).json({ error: 'User already exists' });
        }
        
        const hashedPassword = await hashPassword(password);
        const user = { accountId, password: hashedPassword };
        await userRepo.createUser(user);
        res.json({ accountId });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    const { accountId, password } = req.body;

    try {
        const user = await userRepo.getUserByAccountId(accountId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        const token = jwt.sign({ accountId: user.accountId }, process.env.AUTH_SECRET_KEY, {
            expiresIn: '15m'
        });
        res.json({ token });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login };