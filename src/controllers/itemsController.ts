import { NextFunction, Response, Request } from "express"
import { StatusCodes } from "http-status-codes"
import asyncHandler from "../errorHandlers/asyncHandler"
import { AuthRequest } from "../middleware/auth"
import { Item } from "../models/Item"
const { CREATED, OK } = StatusCodes

// POST /api/items
export const createItem = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    let images: Express.Multer.File[] = []
    if (req.files && Array.isArray(req.files)) images = req.files
    const item = await Item.createItem(req.body, req.user!, images)
    res.status(CREATED).json({ item })
})

// PATCH /api/items/:itemId
export const updateItem = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    let images: Express.Multer.File[] = []
    if (req.files && Array.isArray(req.files)) images = req.files
    const item = await Item.updateItem(req.body, req.params.itemId, req.user!, images)
    res.status(OK).json({ item })
})

// DELETE /api/items/:itemId
export const deleteItem = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    await Item.deleteItem(req.params.itemId, req.user!)
    res.status(OK).json({ msg: 'Item got deleted.'})
})

// GET /api/items/:itemId
export const getItem = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const item = await Item.getItem(req.params.itemId)
    res.status(OK).json({ item })
})

// GET /api/items?q=q&limit=limit&page=page&sortBy=price/name/updatedAt&price[gt/gte/in/lt/lte]=price&direction=asc/desc&category=cat&subcategory=subcat&group=group&colors=...
export const getItems = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { items, page, limit, totalItems } = await Item.getItems(req.query)
    res.status(OK).json({ items, page, limit, totalItems })
})