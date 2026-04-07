import express from 'express'
import { forgotPassword, insertUser, resendCode, resetPassword, userLogin, verifyEmail } from '../controllers/auth.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js'
import { loginLimiter, forgotPassLimiter, resendCodeLimiter } from '../middlewares/rateLimiter.middleware.js'

const router = express.Router()

router.post('/login', loginLimiter, userLogin)
router.post('/signup', upload.fields([{ name: 'profile_picture' }]), insertUser)
router.post('/verify', verifyEmail)

router.post('/forgot-pass', forgotPassLimiter, forgotPassword)
router.post('/reset-pass', resetPassword)
router.post('/resendCode', resendCodeLimiter, resendCode)

export default router