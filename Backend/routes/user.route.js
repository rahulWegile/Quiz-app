import express from 'express'
import { getUserss,userById,upUser, updateProfilePic } from '../controllers/user.controller.js';
import { deleteUserById } from '../models/user.model.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {upload} from '../middlewares/multer.middleware.js'

const router =  express.Router();


router.get('/users',verifyToken,getUserss)
router.get('/user',verifyToken,userById)
router.put('/update',verifyToken,upUser)
router.delete('/delete/:id',deleteUserById)
router.put('/updateProfilePic', verifyToken, upload.single('profile_picture'), updateProfilePic)

export default router