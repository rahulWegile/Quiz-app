import * as quiz from "../models/quiz.model.js";
import query from "../database/db.js";

export const getSubject = async (req, res) => {
    try {
        const subjects = await quiz.getSubjects()
        return res.status(200).json({ success: true, data: subjects })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}

export const getTopics = async (req, res) => {
    const { id } = req.params
    if (!id) return res.status(400).json({ success: false, message: "Subject id required" })
    try {
        const topics = await quiz.getTopicsBySubject(id)
        return res.status(200).json({ success: true, data: topics })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}

export const startQuiz = async (req, res) => {
    const { topic_id } = req.body
    if (!topic_id) return res.status(400).json({ success: false, message: "topic_id required" })
    try {
        const { rows: questions } = await query(
            `SELECT question_id FROM questions 
             WHERE topic_id = $1 AND status = 'approved' 
             ORDER BY RANDOM() LIMIT 10`,
            [topic_id]
        )
        if (questions.length < 10) {
            return res.status(400).json({ success: false, message: "Not enough questions available" })
        }
        const session = await quiz.createSession(topic_id)
        const questionIds = questions.map(q => q.question_id)
        await quiz.insertQuestions(session.id, questionIds)
        return res.status(200).json({ success: true, data: session })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}

export const getSession = async (req, res) => {
    const { session_id } = req.params
    const user_id = req.user.id

    try {
        const questions = await quiz.getSessionWithQuestions(session_id)
        if (!questions.length) {
            return res.status(404).json({ success: false, message: "Session not found" })
        }
        const session = questions[0]

        // ✅ completed
        if (session.status === 'completed') {
            return res.status(400).json({ success: false, message: "Session has ended" })
        }

        // ✅ not started yet
        if (session.status === 'upcoming') {
            return res.status(400).json({ 
                success: false, 
                message: "Session hasn't started yet",
                notStarted: true
            })
        }

        // ✅ expired
        if (session.ends_at && new Date(session.ends_at) < new Date()) {
            return res.status(400).json({ success: false, message: "Session expired" })
        }

        return res.status(200).json({ success: true, data: questions })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}

export const submitQuiz = async (req, res) => {
    const { session_id, answers, time_taken } = req.body
    const user_id = req.user.id

    try {
        // ✅ check if user already attempted this session
        const { rows: existing } = await query(
            `SELECT id FROM quiz_attempts WHERE user_id = $1 AND session_id = $2`,
            [user_id, session_id]
        )
        if (existing.length > 0) {
            return res.status(409).json({ 
                success: false, 
                message: "You have already attempted this quiz" 
            })
        }

        const attempt = await quiz.saveAttempt(user_id, session_id)
        const attemptId = attempt.id
        await quiz.saveAnswers(attemptId, answers)
        const { rows } = await query(
            `SELECT COUNT(*) FROM quiz_answers WHERE attempt_id = $1 AND is_correct = true`,
            [attemptId]
        )
        const score = parseInt(rows[0].count)
        await quiz.updateAttemptScore(attemptId, score, time_taken)
        return res.status(200).json({ success: true, data: { attemptId } })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}
export const getStats = async (req, res) => {
    try {
        const questions = await query(`SELECT COUNT(*) FROM questions WHERE status='approved'`)
        const attempts = await query(`SELECT COUNT(*) FROM quiz_attempts`)
        const users = await query(`SELECT COUNT(*) FROM users`)
        return res.json({
            success: true,
            data: {
                total_questions: questions.rows[0].count,
                total_attempts: attempts.rows[0].count,
                total_users: users.rows[0].count
            }
        })
    } catch(err) {
        console.error(err)
        return res.status(500).json({ success: false })
    }
}
export const getResult = async (req, res) => {
    const { attemptId } = req.params
    try {
        const result = await quiz.getAttemptWithLeaderboard(attemptId)
        return res.status(200).json({ success: true, data: result })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}

export const getLeaderboard = async (req, res) => {
    try {
        const data = await quiz.getGlobalLeaderboard()
        res.status(200).json({ success: true, data })
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" })
    }
}

export const createScheduleQuiz = async (req, res) => {
    const { topic_id, scheduled_at } = req.body
    const created_by = req.user.id
    if (!topic_id || !scheduled_at) {
        return res.status(400).json({ success: false, message: "topic_id and scheduled_at required" })
    }
    try {
        const session = await quiz.createScheduledSession(topic_id, scheduled_at, created_by)

        // ✅ auto-open at scheduled time
        const now = new Date()
        const openAt = new Date(scheduled_at)
        const delay = openAt.getTime() - now.getTime()

        if (delay > 0) {
            setTimeout(async () => {
                try {
                    await quiz.openSession(session.id)
                    console.log(`✅ Auto-opened session ${session.id}`)
                } catch (err) {
                    console.error(`❌ Failed to auto-open session ${session.id}:`, err)
                }
            }, delay)
            console.log(`⏳ Session ${session.id} scheduled to open in ${Math.round(delay / 1000)}s`)
        }

        return res.status(200).json({ success: true, data: session })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}

export const getUpcomingQuiz = async (req, res) => {
    try {
        const session = await quiz.getUpcomingSessions()
        return res.status(200).json({ success: true, data: session })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}

// ✅ fixed: check isRegistered BEFORE registering, return 409 if already registered
export const registerQuiz = async (req, res) => {
    const { session_id } = req.body
    const user_id = req.user.id
    if (!session_id || !user_id) {
        return res.status(400).json({ success: false, message: "session_id required" })
    }
    try {
        // ✅ fetch session to check scheduled_at
        const { rows } = await query(
            `SELECT scheduled_at, status FROM quiz_sessions WHERE id = $1`,
            [session_id]
        )
        const session = rows[0]
        if (!session) return res.status(404).json({ success: false, message: "Session not found" })

        // ✅ block registration 2 min before start
        const now = new Date()
        const scheduledAt = new Date(session.scheduled_at)
        const twoMinBefore = new Date(scheduledAt.getTime() - 2 * 60 * 1000)

        if (now >= twoMinBefore) {
            return res.status(400).json({ 
                success: false, 
                message: "Registration closed — starts in less than 5 minutes" 
            })
        }

        if (session.status !== "upcoming") {
            return res.status(400).json({ success: false, message: "Registration is closed" })
        }

        const existing = await quiz.isRegistered(session_id, user_id)
        if (existing) {
            return res.status(409).json({ success: false, message: "Already registered" })
        }

        await quiz.registerForSession(session_id, user_id)
        return res.status(200).json({ success: true, message: "Registered successfully" })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}

export const openQuiz = async (req, res) => {
    const { session_id } = req.body
    if (!session_id) {
        return res.status(400).json({ success: false, message: "session_id required" })
    }
    try {
        const session = await quiz.openSession(session_id)
        return res.status(200).json({ success: true, data: session })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: err.message || "Server error" })
    }
}

export const getMyRegistrations = async (req, res) => {
    const user_id = req.user.id
    try {
        const sessionIds = await quiz.getUserRegistrations(user_id)
        return res.status(200).json({ success: true, data: sessionIds })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}
export const checkAttempt = async (req, res) => {
    const { sessionId } = req.params
    const user_id = req.user.id
    try {
        const { rows } = await query(
            `SELECT id FROM quiz_attempts WHERE user_id = $1 AND session_id = $2`,
            [user_id, sessionId]
        )
        if (rows.length > 0) {
            return res.status(200).json({ attempted: true, attemptId: rows[0].id })
        }
        return res.status(200).json({ attempted: false })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}

//get attempted
export const getMyAttempts = async (req, res) => {
    const user_id = req.user.id
    try {
        const { rows } = await query(
            `SELECT session_id, id as attempt_id FROM quiz_attempts WHERE user_id = $1`,
            [user_id]
        )
        // return as { sessionId: attemptId } map
        const data = rows.reduce((acc, row) => {
            acc[row.session_id] = row.attempt_id
            return acc
        }, {})
        return res.status(200).json({ success: true, data })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}


// for user accuracy 
export const getAccuracy = async (req, res) => {
  const user_id = req.user.id

  try {
    const { rows } = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE qa.is_correct = true) AS correct,
        COUNT(*) AS total
      FROM quiz_answers qa
      JOIN quiz_attempts q ON qa.attempt_id = q.id
      WHERE q.user_id = $1
    `, [user_id])

    const correct = parseInt(rows[0].correct || 0)
    const total = parseInt(rows[0].total || 0)

    const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100)

    return res.json({
      success: true,
      data: { correct, total, accuracy }
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false })
  }
}