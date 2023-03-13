require('dotenv').config()
const { StatusCodes } = require('http-status-codes')
const request = require('supertest')
const { User } = require('../../src/models/User')
const { server, setupDatabase, tearDown, userOne, } = require('../setup')
const { CREATED, OK, BAD_REQUEST } = StatusCodes
const multer = require('multer')
const upload = multer({ dest: 'images/' })

const createUser = {
    email: 'createuser@gmail.com',
    password: 'CREATEuser123',
    confirmPassword: 'CREATEuser123',
    name: 'createuser'
}

beforeEach(setupDatabase)
afterEach(tearDown)

describe('auth feature tests', () => {
    describe('signup tests: request ok', () => {
        it('should signup a user', async () => {
            const res = await request(server).post('/api/auth/signup')
                .send(createUser)
                .expect(CREATED)
            const user = await User.findOne({ email: createUser.email })
            expect(user).not.toBeNull()
            expect(res.body.token).toEqual(expect.any(String))
        })

        it('should save a hashed password', async () => {
            await request(server).post('/api/auth/signup')
                .send(createUser)
                .expect(CREATED)
            const user = await User.findOne({ email: createUser.email })
            expect(user.password).not.toBe(createUser.password)
        })

        it('should be able to upload a profile image', async() => {
            const res = await request(server).post('/api/auth/signup')
                .set('Content-Type', 'multipart/form-data')
                .field('email', createUser.email)
                .field('password', createUser.password)
                .field('confirmPassword', createUser.confirmPassword)
                .field('name', createUser.name)
                .attach('image', 'tests/testimages/testimage1.png')
                .expect(CREATED)
            
            const user = await User.findOne({ email: createUser.email })
            expect(user.imageUrl).not.toBeNull()
        })
    })

    describe('signup test: request not ok', () => {
        it('should not signup user if data is missing', async () => {
            await request(server).post('/api/auth/signup')
                .send({
                    ...createUser,
                    password: ''
                })
                .expect(BAD_REQUEST)
            await request(server).post('/api/auth/signup')
                .send({
                    ...createUser,
                    name: ''
                })
                .expect(BAD_REQUEST)
            await request(server).post('/api/auth/signup')
                .send({
                    ...createUser,
                    email: ''
                })
                .expect(BAD_REQUEST)
        })

        it('should not signup if data is incorrect', async () => {
            await request(server).post('/api/auth/signup')
                .send({
                    ...createUser,
                    email: '123456'
                })
                .expect(BAD_REQUEST)            
            await request(server).post('/api/auth/signup')
                .send({
                    ...createUser,
                    confirmPassword: '123456'
                })
                .expect(BAD_REQUEST)
            await request(server).post('/api/auth/signup')
                .send({
                    ...createUser,
                    password: '123456abc',
                    confirmPassword: '123456abc'
                })
                .expect(BAD_REQUEST)
            await request(server).post('/api/auth/signup')
                .send({
                    ...createUser,
                    password: '123456ABC',
                    confirmPassword: '123456ABC'
                })
                .expect(BAD_REQUEST)
            await request(server).post('/api/auth/signup')
                .send({
                    ...createUser,
                    password: 'ABCDabcd',
                    confirmPassword: 'ABCDabcd'
                })
                .expect(BAD_REQUEST)
            await request(server).post('/api/auth/signup')
                .send({
                    ...createUser,
                    password: 'ABab1',
                    confirmPassword: 'ABab1'
                })
                .expect(BAD_REQUEST)
            
            await request(server).post('/api/auth/signup')
                .send({
                    ...createUser,
                   name: 'a'
                })
                .expect(BAD_REQUEST)
            
            const longName = 'a'.repeat(51)
            await request(server).post('/api/auth/signup')
                .send({
                    ...createUser,
                   name: longName
                })
                .expect(BAD_REQUEST)
        })

        it('should make sure emails are unique', async () => {
            await request(server).post('/api/auth/signup')
                .send({
                    ...createUser,
                    email: userOne.email
                })
                .expect(BAD_REQUEST)
        })
    })

    describe('login test: request ok', () => {
        it('should login a user', async () => {
            const res = await request(server).post('/api/auth/login')
                .send({
                    email: userOne.email,
                    password: userOne.password
                })
                .expect(OK)
            expect(res.body.token).toEqual(expect.any(String))
        })
    })

    describe('login test: request not ok', () => {
        it('should not login if password is incorrect', async () => {
            await request(server).post('/api/auth/login')
                .send({
                    email: userOne.email,
                    password: 'userOne.password'
                })
                .expect(BAD_REQUEST)       
        })

        it('should not login if email has not signed up', async () => {
            await request(server).post('/api/auth/login')
                .send({
                    email: createUser.email,
                    password: createUser.password
                })
                .expect(BAD_REQUEST)  
        })
    })
})