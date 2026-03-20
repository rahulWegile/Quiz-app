import { postQuestions,postQuestion } from "../controllers/questions.controller.js";

import express from 'express'
import { verifyToken } from "../middlewares/auth.middleware.js";


const router = express.Router();

router.post('/insertQuestions',verifyToken,postQuestions)
router.post('/insertQuestion',verifyToken,postQuestion)

export default router