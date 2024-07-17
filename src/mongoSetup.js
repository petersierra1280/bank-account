const mongoose = require('mongoose');

const { MONGO_USER: dbUser, MONGO_PASSWORD: dbPassword, MONGO_CLUSTER_URL: dbUrl, MONGO_DATABASE_NAME: dbName } = process.env;

const connection = async () => {
    try {
        await mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@${dbUrl}/?retryWrites=true&w=majority&appName=${dbName}`);
        console.log('MongoDB connected');
    } catch (error) {
        console.error(error);
    }
};

module.exports = connection;