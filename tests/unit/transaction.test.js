require('dotenv').config()
const { Item } = require('../../src/models/Item')
const { Transaction } = require('../../src/models/Transaction')
const { User } = require('../../src/models/User')
const { setupDatabase, tearDown, itemOneID, userOneID, itemOne, userOne, transactionOneID } = require('../setup')

beforeEach(setupDatabase)
afterEach(tearDown)

describe('transactions unit tests', () => {
    it('should be able to create a transaction', async () => {
        const user = await User.getUser(userOneID)
        const transaction = await Transaction.createTransaction(itemOneID, user)
        expect(transaction).not.toBe(null)
        expect(transaction.name).toBe(itemOne.name)
    })

    it('should be able to get a transaction', async () => {
        const user = await User.getUser(userOneID)
        const transaction = await Transaction.getTransaction(transactionOneID, user)
        expect(transaction).not.toBe(null)
    })

    it('should be able to get all transactions', async () => {
        const user = await User.getUser(userOneID)
        const transactions = await Transaction.getTransactions(user, {})
        expect(transactions.length).toBe(2)
    })

    it('should be able to return all sales', async () => {
        const user = await User.getUser(userOneID)
        const transactions = await Transaction.getTransactions(user, { type: 'sales'})
        expect(transactions.length).toBe(1)
    })

    it('should be able to return all purchases', async () => {
        const user = await User.getUser(userOneID)
        const transactions = await Transaction.getTransactions(user, { type: 'purchases'})
        expect(transactions.length).toBe(1)
    })

    it('should belong to an item', async () => {
        const transaction = await Transaction.findById(transactionOneID).populate('item')
        expect(transaction.item instanceof Item).toBe(true)
    })

    it('should have a user as buyer', async () => {
        const transaction = await Transaction.findById(transactionOneID).populate('buyer')
        expect(transaction.buyer instanceof User).toBe(true)
    })

    it('should have a user as seller', async () => {
        const transaction = await Transaction.findById(transactionOneID).populate('seller')
        expect(transaction.seller instanceof User).toBe(true)
    })
})