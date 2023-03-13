import { NextFunction, Response } from "express"
import { StatusCodes } from "http-status-codes"
import asyncHandler from "../errorHandlers/asyncHandler"
import { AuthRequest } from "../middleware/auth"
import { User } from "../models/User"
const { OK } = StatusCodes

// GET /api/profile
export const getProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await User.getProfile(req.user!)
    res.status(OK).json({ user })
})

// PATCH /api/profile
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await User.updateProfile(req.user!, req.body)
    res.status(OK).json({ user })
})

// DELETE /api/profile
export const deleteProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    await User.deleteProfile(req.user!)
    res.status(OK).json({ msg: 'Profile got deleted.'})
})