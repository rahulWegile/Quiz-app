import { postTopic,getTopics,TopicById,topicBySubject,delTopic,upTopic } from '../controllers/topics.controller.js';

import express from 'express'
import { verifyToken } from "../middlewares/auth.middleware.js";


const router = express.Router();

router.post('/insertTopic',verifyToken,postTopic)
router.get('/getTopics',verifyToken,getTopics)
router.get('/getTopic/:id',verifyToken,TopicById)
router.get('/topicBySUb/:id',verifyToken,topicBySubject)
router.delete('/delTopic/:id',verifyToken,delTopic)
router.put('/upTopic/:id',verifyToken,upTopic)

export default router