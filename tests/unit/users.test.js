require('dotenv').config()
const { Item } = require('../../src/models/Item')
const { Transaction } = require('../../src/models/Transaction')
const { User } = require('../../src/models/User')
const { setupDatabase, tearDown, userOne, userOneID } = require('../setup')

beforeEach(setupDatabase)
afterEach(tearDown)

describe('users unit tests', () => {
    it('should be able to return a user', async () => {
        const user = await User.getUser(userOneID)
        expect(user.email).toBe(userOne.email)
    })

    it('should be able to return users', async () => {
        const { users, page, limit } = await User.getUsers()
        expect(users.length).toBe(3)
        expect(limit).toBe(5)
        expect(page).toBe(1)
    })

    it('should be able to search for users', async () => {
        const { users } = await User.getUsers({ q: userOne.name })
        expect(users.length).toBe(1)
    })

    it('should be able to set the page and limit', async () => {
        const { page, limit } = await User.getUsers({ page: 2, limit: 1 })
        expect(page).toBe(2)
        expect(limit).toBe(1)
    })

    it('can have items', async () => {
        const user = await User.findById(userOneID).populate('items')
        expect(user.items[0] instanceof Item).toBe(true)
    })

    it('can have sales transactions', async () => {
        const user = await User.findById(userOneID).populate('sales')
        expect(user.sales[0] instanceof Transaction).toBe(true)
    })

    it('can have purchase transactions', async () => {
        const user = await User.findById(userOneID).populate('purchases')
        expect(user.purchases[0] instanceof Transaction).toBe(true)
    })
})