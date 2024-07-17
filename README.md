# Banking account transactions API

Within the description of this API will be found endpoints for performing transactions against a specific banking account. Even though in the requirements of this exercise it wasn't specified to handle multiple accounts, defining the model and endpoints to receive an account ID seemed the best scenario thinking on scalling the application.

A **live demo** can be found at: https://bank-account.onrender.com/ (hosted on [render](https://render.com/)).

> **Note:** If this URL hasn't been accessed in a while, there will be a cold start from ~50 secs, since the instance spins down with inactivity.

## Tech stack used

- Node.js and `express`.
- MongoDB and `mongoose`.
- `nodemon` for development purposes.
- `jest` for unit tests (the MongoDB connection was mocked using the package `mongodb-memory-server`).

## Endpoints

### 1. Get all transactions

-   **URL:** `GET /transactions`
-   **Description:** Retrieves all transactions for a specific account, with optional filtering and sorting params.
-   **Parameters:**
    -   `accountId` (query): **string** - The ID of the account to retrieve transactions for (optional, if not provided this will list the whole list of transactions).
    -   `type` (query): **string** - The type of transactions to retrieve (optional, can be `debit` or `credit`).
    -   `sortField` (query): **string** - The field to sort by (optional).
    -   `sortOrder` (query): **string** - The order of sorting, can be `asc` or `desc` (optional).
    -   `minAmount` (query): **number** - The minimum transaction amount to filter by (optional).
    -   `maxAmount` (query): **number** - The maximum transaction amount to filter by (optional).

**Example Request:**
```
curl -X GET "http://localhost:3000/?accountId=12345&type=debit&sortField=date&sortOrder=asc&minAmount=10&maxAmount=100"
```
**Response:**
```
[ { "accountId": "12345", "type": "debit", "cost": 50, "date": "2023-01-01T00:00:00.000Z" }, ... ]
```
### 2. Get total balance

-   **URL:** `GET /transactions/balance/:accountId`
-   **Description:** Retrieves the total balance for a specific account.
-   **Parameters:**
    -   `accountId` (path): **string** - The ID of the account to retrieve the balance for.

**Example Request:**
```
`curl -X GET "http://localhost:3000/balance/12345"`
```
**Response:**
```
{ "balance": 250.75 }
```
### 3. Debit transaction

-   **URL:** `POST /transactions/debit`
-   **Description:** Creates a new debit transaction for a specific account.
-   **Parameters:**
    -   `accountId` (body): **string** - The ID of the account to debit from.
    -   `cost` (body): **number** - The amount to debit.

**Special considerations:**
   - If the current balance for the account is lower than the cost for the debit, this endpoint will throw a HTTP `400` error code with the message `Insufficient funds`.

**Example Request:**
```
`curl -X POST "http://localhost:3000/debit" -H "Content-Type: application/json" -d '{"accountId": "12345", "cost": 50}'`
```
**Response:**
```
{ "accountId": "12345", "type": "debit", "cost": 50, "date": "2023-01-01T00:00:00.000Z" }
```
### 4. Credit transaction

-   **URL:** `POST /transactions/credit`
-   **Description:** Creates a new credit transaction for a specific account.
-   **Parameters:**
    -   `accountId` (body): **string** - The ID of the account to credit to.
    -   `amount` (body): **number** - The amount to credit.

**Example Request:**
```
`curl -X POST "http://localhost:3000/credit" -H "Content-Type: application/json" -d '{"accountId": "12345", "amount": 100}'`
```
**Response:**
```
{ "accountId": "12345", "type": "credit", "amount": 100, "date": "2023-01-01T00:00:00.000Z" }
```
### 5. Edit transaction

-   **URL:** `PUT /transactions/:id`
-   **Description:** Edits an existing transaction.
-   **Parameters:**
    -   `id` (path): **string** - The ID of the transaction to edit.
    -   `cost` (body): **number** - The cost of the debit transaction (optional).
    -   `amount` (body): **number** - The amount of the credit transaction (optional).
    
**Special considerations:**
 - If a `debit` transaction is being updated and the current balance for the account is lower than the cost for the debit, this endpoint will throw a HTTP `400` error code with the message `This update cannot be processed, otherwise balance will be negative`.
 - This endpoint doesn't allow to update the `type` of a transaction (security and data integrity purposes).
 - This endpoint doesn't allow to update the `accountId` of a transaction (security and data integrity purposes).
 - If the `transactionId` provided in the URL doesn't exist in the database, this endpoint will throw a HTTP `404` error code with the message `This transaction ID is not valid`.

**Example Request:**
```
`curl -X PUT "http://localhost:3000/12345" -H "Content-Type: application/json" -d '{"cost": 60}'`
```
**Response:**
```
{ "accountId": "12345", "type": "debit", "cost": 60, "date": "2023-01-01T00:00:00.000Z" }
```
### 6. Delete transaction

-   **URL:** `DELETE /transactions/:id`
-   **Description:** Deletes an existing transaction.
-   **Parameters:**
    -   `id` (path): **string** - The ID of the transaction to delete.

**Special considerations:**
   - If a `credit` transaction is being deleted and the current balance for the account is lower than the amount for the credit, this endpoint will throw a HTTP `400` error code with the message `This deletion cannot be processed, otherwise balance will be negative`.
   - If the `transactionId` provided in the URL doesn't exist in the database, this endpoint will throw a HTTP `404` error code with the message `This transaction ID is not valid`.

**Example Request:**
```
`curl -X DELETE "http://localhost:3000/12345"`
```
**Response:**
```
{}
```
## MongoDB schema

### Schema fields:

-   `accountId`: The ID of the account associated with the transaction (required).
-   `type`: The type of the transaction, either `debit` or `credit` (required).
-   `cost`: The amount debited from the account (required if `type` is `debit`).
-   `amount`: The amount credited to the account (required if `type` is `credit`).
-   `date`: The date of the transaction (defaults to the current date).

### Indexes:

A couple of indexes were defined for faster searches using these fields:
-   `accountId`
-   `type`

### Seed database:

This is the collection used to seed the database with some basic records:

```
[

{ accountId:  'account1', type:  'debit', cost:  10.00 },

{ accountId:  'account1', type:  'credit', amount:  1000 }

];
```

### Mongo Atlas for deploying the database

A Mongo Atlas cluster was created in order to simplify the deployment and configuration of this application. See the images below to see the cluster and database.

## Configuration and execution

In order to run this application locally, a `.env` file needs to be created within the `/src` folder (excluded from the Github repo for security reasons). Please use as an example the `.env.example` file, which contains the following variables:

```
PORT=3000

## Mongo auth
MONGO_USER=""
MONGO_PASSWORD=""
MONGO_CLUSTER_URL=""
MONGO_DATABASE_NAME=""
```
Consider that this configuration expects a MongoDB cluster URL, since Mongo Atlas was used for deploying the database and avoid any issue and get rid of dependencies with a MongoDB instance running locally.

### Commands available:
- `npm start`: Starts the application (used for production purposes).
- `npm run dev`: Stars the application using `nodemon`, in order to quickly apply new changes.
- `npm test`: Run the unit tests for the application using `jest`.