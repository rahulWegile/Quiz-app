import express from 'express'
import { forgotPassword, insertUser, resetPassword, userLogin, verifyEmail } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {upload} from '../middlewares/multer.middleware.js'

const router =  express.Router();


router.post('/login',userLogin)
router.post('/insert',upload.fields([
    { name: "profile_picture", maxCount: 1 }
  ]),insertUser)
router.post('/verify',verifyToken,verifyEmail)

router.post("/forgot-pass",forgotPassword)
router.post("/reset-pass",resetPassword)

export default router