
const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/usersRepository');

const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Missing authentication token' });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.AUTH_SECRET_KEY);
        const user = await userRepo.getUserByAccountId(decodedToken.accountId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = authenticate;