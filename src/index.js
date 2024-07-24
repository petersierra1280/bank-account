require('dotenv').config({ path: `.env` });

const express = require('express');
const mongodbConnection = require('./mongoSetup');
const seedDatabase = require('./seed');
const helmet = require('helmet');

const accountTransactionsRoutes = require('./routes/accountTransactions.routes');
const usersRoutes = require('./routes/users.routes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(errorMiddleware);

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the bank account transactions API!' });
})
app.use('/transactions', accountTransactionsRoutes);
app.use('/users', usersRoutes);

(async () => {
    await mongodbConnection();
    await seedDatabase();

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
})();
