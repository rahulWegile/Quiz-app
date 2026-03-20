import { postSubject,getAllSubjects,getSubById,upSubject,delSubject } from '../controllers/subjects.controllers.js';

import express from 'express'
import { verifyToken } from "../middlewares/auth.middleware.js";


const router = express.Router();

router.post('/insertSubject',verifyToken,postSubject)
router.get('/getSubjects',verifyToken,getAllSubjects)
router.get('/getSubject/:id',verifyToken,getSubById)
router.put('/updateSubject/:id',verifyToken,upSubject)
router.delete('/delSubject/:id',verifyToken,delSubject)

export default router