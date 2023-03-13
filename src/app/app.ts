import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import cors from 'cors'
import rateLimiter from 'express-rate-limit'
import { errorHandler } from '../errorHandlers/errorHandler'
import notFoundHandler from '../errorHandlers/notFoundHandler'
const xss = require('xss-clean')
import authRoutes from '../routes/authRoutes'
import userRouter from '../routes/userRoutes'
import profileRouter from '../routes/profileRoutes'
import itemRouter from '../routes/itemRoutes'
import transactionRouter from '../routes/transactionRoutes'
import { auth } from '../middleware/auth'
export const app = express()

app.use(cors())
app.use(express.json())
app.use(helmet())
app.use(xss())
app.use(morgan('dev'))
app.use(rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100
}))

app.use('/api/auth', authRoutes)
app.use('/api/users', auth, userRouter)
app.use('/api/profile', auth, profileRouter)
app.use('/api/items', auth, itemRouter)
app.use('/api/transactions', auth, transactionRouter)

app.use(errorHandler)
app.use(notFoundHandler)