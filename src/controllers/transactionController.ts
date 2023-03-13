import { NextFunction, Response } from "express"
import asyncHandler from "../errorHandlers/asyncHandler"
import { AuthRequest } from "../middleware/auth"
import { Transaction } from "../models/Transaction"
import { StatusCodes } from "http-status-codes"
const { CREATED, OK } = StatusCodes


// POST /api/items/:itemId/transactions
export const createTransaction = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const transaction = await Transaction.createTransaction(req.params.itemId, req.user!)
    res.status(CREATED).json({ transaction })
})

// GET /api/transactions/:transactionId
export const getTransaction = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const transaction = await Transaction.getTransaction(req.params.transactionId, req.user!)
    res.status(OK).json({ transaction })
})

// GET /api/transactions?type=sales/purchases
export const getTransactions = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const transactions = await Transaction.getTransactions(req.user!, req.query)
    res.status(OK).json({ transactions })
})
