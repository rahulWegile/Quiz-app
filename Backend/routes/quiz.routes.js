import express from "express"
import * as quiz from "../controllers/quiz.controller.js"
import { verifyToken } from "../middlewares/auth.middleware.js";

import { verifyAdmin } from "../middlewares/verifyAdmin.middleware.js";
const router = express.Router()

router.get("/subjects",verifyToken, quiz.getSubject)
router.get("/subjects/:id/topics",verifyToken, quiz.getTopics)
router.post("/quiz/start", verifyToken, quiz.startQuiz)
router.get("/quiz/session/:session_id", verifyToken, quiz.getSession)
router.post("/quiz/submit", verifyToken, quiz.submitQuiz)
router.get("/quiz/result/:attemptId", verifyToken, quiz.getResult)
router.get("/leaderboard", quiz.getLeaderboard)//get

router.post("/quiz/schedule", verifyAdmin,quiz.createScheduleQuiz)
router.get("/quiz/upcomingQuizzes", quiz.getUpcomingQuiz)
router.post("/quiz/register", verifyToken,quiz.registerQuiz)
router.post("/quiz/open", verifyAdmin,quiz.openQuiz)
router.get("/quiz/myRegistrations", verifyToken, quiz.getMyRegistrations)
router.get("/quiz/checkAttempt/:sessionId", verifyToken, quiz.checkAttempt)
router.get("/stats", quiz.getStats)  // no verifyToken
router.get("/quiz/myAttempts", verifyToken, quiz.getMyAttempts)

router.get("/accuracy", verifyToken, quiz.getAccuracy)

export default router