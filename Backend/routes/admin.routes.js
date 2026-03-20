import { questionStatus,updateStatusApprove,updateStatusReject,getAllQuestionsAdmin,updateBulk, questionStatusRejected, getQues,deleteQuestions, editQuestion } from '../controllers/Admin.controller.js';

import express from 'express'
import { verifyToken } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/verifyAdmin.middleware.js";
import { verifySuperAdmin } from '../middlewares/verifySuperAdmin.middleware.js';


const router = express.Router();


//SuperAdmin


router.get('/questionStatusPending',verifyAdmin,verifySuperAdmin,questionStatus)//pending questions
router.get('/questionStatusRejected',verifyAdmin,questionStatusRejected)//pending questions
router.post('/updateApprove/:id',verifySuperAdmin,updateStatusApprove)
router.post('/updateReject/:id',verifyToken,verifySuperAdmin,updateStatusReject)
router.post('/getQuestions',verifyToken,getAllQuestionsAdmin)
router.post('/updateBulk',verifyToken,updateBulk)
router.get('/allquestion',verifyToken,getQues)
router.delete('/deleteQuestions/:id',verifyToken,deleteQuestions)
router.delete('/deleteQuestions/:id',verifyToken,deleteQuestions)
router.put('/updateQuestion/:id', verifyToken, editQuestion)

export default router