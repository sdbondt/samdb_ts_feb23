import { NextFunction, Request, Response } from "express"
import asyncHandler from "../errorHandlers/asyncHandler"
import { User } from "../models/User"
import { StatusCodes } from 'http-status-codes'
const { CREATED, OK } = StatusCodes

// POST api/auth/signup
export const signup = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, name, password, confirmPassword } = req.body
    let imageUrl: string | null = null
    if (req.file) imageUrl = req.file.path
    const token = await User.signup(email, name, password, confirmPassword, imageUrl)
    res.status(CREATED).json({ token })
})

// POST api/auth/login
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body
    const token = await User.login(email, password)
    res.status(OK).json({ token })
})