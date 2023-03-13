import { Router } from "express"
import { deleteProfile, getProfile, updateProfile } from "../controllers/profileController"

const router = Router()

router.get('/', getProfile)
router.patch('/', updateProfile)
router.delete('/', deleteProfile)

export default router