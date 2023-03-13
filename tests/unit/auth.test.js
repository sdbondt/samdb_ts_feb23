require('dotenv').config()
const { User } = require('../../src/models/User')
const { setupDatabase, tearDown, userOne } = require('../setup')

const createUser = {
    email: 'createuser@gmail.com',
    password: 'CREATEuser123',
    confirmPassword: 'CREATEuser123',
    name: 'createuser'
}

beforeEach(setupDatabase)
afterEach(tearDown)

describe('auth unit tests', () => {
    it('should be able to signup a user', async () => {
        const token = await User.signup(createUser.email, createUser.name, createUser.password, createUser.confirmPassword)
        const user = await User.findOne({ email: createUser.email })
        expect(token).toEqual(expect.any(String))
        expect(user).not.toBeNull()
    })

    it('should be able to login a user', async () => {
        const token = await User.login(userOne.email, userOne.password)
        expect(token).toEqual(expect.any(String))
    })
})