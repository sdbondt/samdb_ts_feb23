require('dotenv').config()
const { Item } = require('../../src/models/Item')
const { Transaction } = require('../../src/models/Transaction.ts')
const { StatusCodes } = require('http-status-codes')
const request = require('supertest')
const { server, setupDatabase, tearDown, userOneToken, userTwoToken, userThreeToken, fakeID, itemOneID, itemOne, userTwoID, transactionOneID, transactionOne, transactionTwoID, transactionTwo } = require('../setup')
const { CREATED, OK, BAD_REQUEST, UNAUTHORIZED } = StatusCodes

beforeEach(setupDatabase)
afterEach(tearDown)

describe('transactions feature tests', () => {
    describe('if create transaction request is correct', () => {
        it('should create a transaction', async () => {
            await request(server).post(`/api/items/${itemOneID}/transactions`)
                .set('Authorization', `Bearer ${userTwoToken}`)
                .send()
                .expect(CREATED)
            const transaction = await Transaction.find({ buyer: userTwoID, seller: itemOne.seller, item: itemOneID })
            expect(transaction).not.toBeNull()
        })
    })

    describe('if create transaction request is not correct', () => {
        it('should not create transaction without authorized user', async () => {
            await request(server).post(`/api/items/${itemOneID}/transactions`)
                .send()
                .expect(UNAUTHORIZED)
        })

        it('should not create transaction without valid item', async () => {
            await request(server).post(`/api/items/${fakeID}/transactions`)
                .set('Authorization', `Bearer ${userTwoToken}`)
                .send()
                .expect(BAD_REQUEST)
        })

        it('should not create another transaction if item is already sold', async () => {
            await request(server).post(`/api/items/${itemOneID}/transactions`)
                .set('Authorization', `Bearer ${userTwoToken}`)
                .send()
                .expect(CREATED)
            
            await request(server).post(`/api/items/${itemOneID}/transactions`)
                .set('Authorization', `Bearer ${userTwoToken}`)
                .send()
                .expect(BAD_REQUEST)
        })
    })

    describe('if get transaction request is correct', () => {
        it('should return a transaction when user is the buyer', async () => {
            const res = await request(server).get(`/api/transactions/${transactionOneID}`)
                .set('Authorization', `Bearer ${userTwoToken}`)
                .send()
                .expect(OK)
            expect(res.body.transaction.name).toBe(transactionOne.name)
        })

        it('should return a transaction when user is the seller', async () => {
            const res = await request(server).get(`/api/transactions/${transactionOneID}`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            expect(res.body.transaction.name).toBe(transactionOne.name)
        })
    })

    describe('if get transaction request is not correct', () => {
        it('should not return transaction if user is not the buyer or seller', async () => {
            await request(server).get(`/api/transactions/${transactionOneID}`)
                .set('Authorization', `Bearer ${userThreeToken}`)
                .send()
                .expect(UNAUTHORIZED)
        })

        it('should not return anything if there is no valid transaction', async () => {
            await request(server).get(`/api/transactions/${fakeID}`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(BAD_REQUEST)
        })
    })

    describe('if get transactions request is correct', () => {
        it('should return all transactions', async () => {
            const res = await request(server).get('/api/transactions')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            expect(res.body.transactions.length).toBe(2)
        })

        it('should return all purchases', async () => {
            const res = await request(server).get('/api/transactions?type=purchases')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            expect(res.body.transactions.length).toBe(1)
        })

        it('should return all sales', async () => {
            const res = await request(server).get('/api/transactions?type=sales')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            expect(res.body.transactions.length).toBe(1)
        })
    })

    describe('if get transactions request is not correct', () => {
        it('should not work without authenticated user', async () => {
            await request(server).get('/api/transactions?type=sales')
                .send()
                .expect(UNAUTHORIZED)
        })
    })
})
