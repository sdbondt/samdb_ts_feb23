import { Router } from "express"
import { getUser, getUsers } from "../controllers/userController"
const router = Router()

router.get('/:userId', getUser)
router.get('/', getUsers)

export default router