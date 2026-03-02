import express from 'express'
import { getUserss,userById,upUser } from '../controllers/user.controller.js';
import { deleteUserById } from '../models/user.model.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router =  express.Router();


router.get('/users',getUserss)
router.get('/user/:id',userById)
router.put('/update',verifyToken,upUser)
router.delete('/delete/:id',deleteUserById)

export default router