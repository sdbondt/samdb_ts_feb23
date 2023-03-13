import { Router } from "express"
import { login, signup } from "../controllers/authController"
import imageUpload from "../middleware/imageUpload"
import resizeImage from "../middleware/resizeImage"
const router = Router()

router.post('/signup', imageUpload.single('image'), resizeImage, signup)
router.post('/login', login)

export default router