import { Router } from "express"
import { createTransaction, getTransaction, getTransactions } from "../controllers/transactionController"
const router = Router({ mergeParams: true })

router.post('/', createTransaction)
router.get('/:transactionId', getTransaction)
router.get('/', getTransactions)


export default router