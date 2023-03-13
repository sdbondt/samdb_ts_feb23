require('dotenv').config()
const { StatusCodes } = require('http-status-codes')
const request = require('supertest')
const { server, setupDatabase, tearDown, userOne, userOneToken, fakeID, userTwoID, userTwo } = require('../setup')
const { OK, BAD_REQUEST, UNAUTHORIZED } = StatusCodes

beforeEach(setupDatabase)
afterEach(tearDown)

describe('users feature test', () => {
    describe('if get user request is correct', () => {
        it('should return a user', async () => {
            const res = await request(server).get(`/api/users/${userTwoID}`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            expect(res.body.user.email).toBe(userTwo.email)
        })
    })

    describe('if get user request is not correct', () => {
        it('should not return anything if there is no authenticated user', async () => {
            await request(server).get(`/api/users/${userTwoID}`)
                .send()
                .expect(UNAUTHORIZED)
        })

        it('should not work with an invalid user id', async () => {
            await request(server).get(`/api/users/123456`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(BAD_REQUEST)
            
            await request(server).get(`/api/users/${fakeID}`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(BAD_REQUEST)
        })
    })

    describe('if get users request is correct', () => {
        it('should return the users', async () => {
            const res = await request(server).get('/api/users')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            const { users, limit, page } = res.body
            expect(users.length).toBe(3)
            expect(page).toBe(1)
            expect(limit).toBe(5)
        })

        it('should be able to set page and limit', async () => {
            const res = await request(server).get(`/api/users?page=2&limit=1`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            const { limit, page } = res.body
            expect(limit).toBe(1)
            expect(page).toBe(2)
        })

        it('should be able so search for users', async () => {
            const res = await request(server).get(`/api/users?q=${userTwo.name}`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            const { users } = res.body
            expect(users.length).toBe(1)
        })
    })

    describe('if get users request is not correct', () => {
        it('should not work if there is no authenticated user', async () => {
            await request(server).get('/api/users')
                .send()
                .expect(UNAUTHORIZED)
        })

        it('should not be able to enter wrong query parameters', async () => {
            const res = await request(server).get(`/api/users?page=page&limit=-1`)
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            const { limit, page } = res.body
            expect(limit).toBe(5)
            expect(page).toBe(1)
        })
    })
})