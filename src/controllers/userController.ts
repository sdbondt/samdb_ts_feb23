import { NextFunction, Response } from "express"
import { StatusCodes } from "http-status-codes"
import asyncHandler from "../errorHandlers/asyncHandler"
import { AuthRequest } from "../middleware/auth"
import { User } from "../models/User"
const { OK } = StatusCodes

// GET /api/users/:userId
export const getUser = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { userId } = req.params
    const user = await User.getUser(userId)
    res.status(OK).json({ user })
})

// GET /api/users   api/users?q=...limit=...page=...
export const getUsers = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { users, page, limit } = await User.getUsers(req.query)
    res.status(OK).json({ users, page, limit })
})