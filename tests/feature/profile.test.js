require('dotenv').config()
const { StatusCodes } = require('http-status-codes')
const request = require('supertest')
const { User } = require('../../src/models/User')
const { server, setupDatabase, tearDown, userOne, userOneToken, userTwoToken } = require('../setup')
const { OK, BAD_REQUEST, UNAUTHORIZED } = StatusCodes

beforeEach(setupDatabase)
afterEach(tearDown)

describe('profile feature tests', () => {
    describe('if profile update request is correct.', () => {
        it('should update the profile', async () => {
            await request(server).patch('/api/profile')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({ name: 'update' })
                .expect(OK)
            const updatedUser = await User.findOne({ email: userOne.email })
            expect(updatedUser).not.toBeNull()
            expect(updatedUser.name).toBe('update')
        })
    })

    describe('if profile update request is not correct.', () => {
        it('should not do anything without authenticated user.', async () => {
            await request(server).patch('/api/profile')
                .send()
                .expect(UNAUTHORIZED)
        })

        it('should not update if no data is passed.', async () => {
            await request(server).patch('/api/profile')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(BAD_REQUEST)
        })

        it('should not update is email is already in use.', async () => {
            await request(server).patch('/api/profile')
                .set('Authorization', `Bearer ${userTwoToken}`)
                .send({ email: userOne.email })
                .expect(BAD_REQUEST)
        })

        it('should not be able to pass an invalid password.', async () => {
            await request(server).patch('/api/profile')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    password: '123ABC',
                    confirmPassword: '123ABC'
                })
                .expect(BAD_REQUEST)
            
            await request(server).patch('/api/profile')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    password: '123abc',
                    confirmPassword: '123abc'
                })
                .expect(BAD_REQUEST)
            
            await request(server).patch('/api/profile')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    password: 'abcABC',
                    confirmPassword: 'abcABC'
                })
                .expect(BAD_REQUEST)
            
            await request(server).patch('/api/profile')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    password: 'abCD1',
                    confirmPassword: 'abCD1'
                })
                .expect(BAD_REQUEST)
        })

        it('should not update if passwords don\'t match.', async () => {
            await request(server).patch('/api/profile')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({
                    password: 'abcDEF123',
                    confirmPassword: 'abcDEf123'
                })
                .expect(BAD_REQUEST)
        })

        it('should not update if data is invalid.', async () => {
            await request(server).patch('/api/profile')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({ name: 'a' })
                .expect(BAD_REQUEST)
            
            const longValue = 'a'.repeat(51)
            await request(server).patch('/api/profile')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send({ name: longValue })
                .expect(BAD_REQUEST)
        })
    })

    describe('if delete profile request is correct.', () => {
        it('should delete a profile', async () => {
            await request(server).delete('/api/profile')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            const deletedUser = await User.findOne({ email: userOne.email })
            expect(deletedUser).toBeNull()
        })
    })

    describe('if delete profile request is not correct.', () => {
        it('should not do anything without an authenticated user.', async () => {
            await request(server).delete('/api/profile')
                .send()
                .expect(UNAUTHORIZED)
        })
    })

    describe('if get profile request is correct.', () => {
        it('should return the users profile', async () => {
            const res = await request(server).get('/api/profile')
                .set('Authorization', `Bearer ${userOneToken}`)
                .send()
                .expect(OK)
            
            expect(res.body.user.name).toBe(userOne.name)
        })
    })

    describe('if get profile request is not correct', () => {
        it('should not do anything without an authenticated user.', async () => {
            await request(server).get('/api/profile')
                .send()
                .expect(UNAUTHORIZED)
        })
    })
})