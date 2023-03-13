require('dotenv').config()
const { User } = require('../../src/models/User')
const { setupDatabase, tearDown, userOne, userOneID } = require('../setup')

beforeEach(setupDatabase)
afterEach(tearDown)

describe('profile unit tests', () => {
    it('should be able to update a profile', async () => {
        const user = await User.findById(userOneID)
        await User.updateProfile(user, { name: 'update' })
        const updatedUser = await User.findOne({ name: 'update' })
        expect(updatedUser).not.toBeNull()
        expect(updatedUser.email).toBe(userOne.email)
    })

    it('should be able to delete a profile', async () => {
        const user = await User.findById(userOneID)
        await User.deleteProfile(user)
        const deletedUser = await User.findById(userOneID)
        expect(deletedUser).toBeNull()
    })

    it('should be able to get a profile', async () => {
        const user = await User.findById(userOneID)
        await User.deleteProfile(user)
        expect(user.email).toBe(userOne.email)
    })
})