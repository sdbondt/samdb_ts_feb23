import { Router } from "express"
import { createItem, deleteItem, getItem, getItems, updateItem } from "../controllers/itemsController"
import transactionRouter from './transactionRoutes'
import imageUpload from "../middleware/imageUpload"
const router = Router()

router.use('/:itemId/transactions', transactionRouter)
router.get('/:itemId', getItem)
router.get('/', getItems)
router.post('/', imageUpload.array('images', 10),  createItem)
router.patch('/:itemId', updateItem)
router.delete('/:itemId', deleteItem)

export default router