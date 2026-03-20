import query from "../database/db.js";

export const getSubjects = async () => {
    const sql = `SELECT * FROM subjects`
    const { rows } = await query(sql)
    return rows
}

export const getTopicsBySubject = async (id) => {
    const sql = `SELECT * FROM topics WHERE subject_id = $1`
    const { rows } = await query(sql, [id])
    return rows
}

export const createSession = async (topic_id) => {
    const sql = `
        INSERT INTO quiz_sessions (topic_id, started_at, ends_at, status)
        VALUES ($1, NOW(), NOW() + INTERVAL '10 minutes', 'active')
        RETURNING *`
    const { rows } = await query(sql, [topic_id])
    return rows[0]
}

export const insertQuestions = async (session_id, questionIds) => {
    const sql = `
        INSERT INTO quiz_session_questions (session_id, question_id)
        VALUES ($1, $2)`
    for (const question_id of questionIds) {
        await query(sql, [session_id, question_id])
    }
}

export const getSessionWithQuestions = async (session_id) => {
    const sql = `
        SELECT 
            qs.id AS session_id,
            qs.topic_id,
            qs.started_at,
            qs.ends_at,
            qs.status,
            q.question_id,
            q.question_text,
            q.option_a,
            q.option_b,
            q.option_c,
            q.option_d
        FROM quiz_sessions qs
        JOIN quiz_session_questions qsq ON qs.id = qsq.session_id
        JOIN questions q ON qsq.question_id = q.question_id
        WHERE qs.id = $1`
    const { rows } = await query(sql, [session_id])
    return rows
}

export const saveAttempt = async (userId, session_id) => {
    const sql = `
        INSERT INTO quiz_attempts (user_id, session_id, score, time_taken)
        VALUES ($1, $2, 0, 0)
        RETURNING *`
    const { rows } = await query(sql, [userId, session_id])
    return rows[0]
}

export const saveAnswers = async (attemptId, answers) => {
    const sql = `
        INSERT INTO quiz_answers (attempt_id, question_id, selected_answer, is_correct)
        VALUES ($1, $2, $3, $4)`
    for (const answer of answers) {
        const result = await query(
            `SELECT option_a, option_b, option_c, option_d, correct_answer 
             FROM questions WHERE question_id = $1`,
            [answer.question_id]
        )
        const q = result.rows[0]
        const selectedText = q[answer.selected_answer]
        const is_correct = selectedText === q.correct_answer
        await query(sql, [attemptId, answer.question_id, answer.selected_answer, is_correct])
    }
}

export const updateAttemptScore = async (attemptId, score, timeTaken) => {
    const sql = `
        UPDATE quiz_attempts 
        SET score = $1, time_taken = $2 
        WHERE id = $3 
        RETURNING *`
    const { rows } = await query(sql, [score, timeTaken, attemptId])
    return rows[0]
}

export const getAttemptWithLeaderboard = async (attemptId) => {
    const attemptSql = `
        SELECT qa.*, u.name, u.profile_url
        FROM quiz_attempts qa
        JOIN users u ON qa.user_id = u.id
        WHERE qa.id = $1`
    const { rows: attempt } = await query(attemptSql, [attemptId])

    const leaderboardSql = `
        SELECT 
            qa.score, qa.time_taken, qa.submitted_at,
            u.name, u.profile_url,
            t.name AS topic_name,
            s.name AS subject_name
        FROM quiz_attempts qa
        JOIN users u ON qa.user_id = u.id
        JOIN quiz_sessions qs ON qa.session_id = qs.id
        JOIN topics t ON qs.topic_id = t.topic_id
        JOIN subjects s ON t.subject_id = s.subject_id
        WHERE qa.session_id = $1
        ORDER BY qa.score DESC, qa.time_taken ASC`
    const { rows: leaderboard } = await query(leaderboardSql, [attempt[0]?.session_id])

    const answerKeySql = `
        SELECT 
            qans.question_id,
            qans.selected_answer,
            qans.is_correct,
            q.question_text,
            q.option_a,
            q.option_b,
            q.option_c,
            q.option_d,
            q.correct_answer
        FROM quiz_answers qans
        JOIN questions q ON qans.question_id = q.question_id
        WHERE qans.attempt_id = $1`
    const { rows: answerKey } = await query(answerKeySql, [attemptId])

    return { attempt: attempt[0], leaderboard, answerKey }
}

export const getGlobalLeaderboard = async () => {
    const sql = `
        SELECT 
            u.name,
            u.profile_url,
            qa.score,
            qa.time_taken,
            qa.submitted_at,
            t.name AS topic_name,
            s.name AS subject_name
        FROM quiz_attempts qa
        JOIN users u ON qa.user_id = u.id
        JOIN quiz_sessions qs ON qa.session_id = qs.id
        JOIN topics t ON qs.topic_id = t.topic_id
        JOIN subjects s ON t.subject_id = s.subject_id
        ORDER BY qa.score DESC, qa.time_taken ASC
        LIMIT 50`
    const { rows } = await query(sql)
    return rows
}

export const createScheduledSession = async (topic_id, scheduled_at, created_by) => {
    const sql = `
        INSERT INTO quiz_sessions (topic_id, scheduled_at, created_by, status, started_at, ends_at)
        VALUES ($1, $2, $3, 'upcoming', NULL, NULL)
        RETURNING *`
    const { rows } = await query(sql, [topic_id, scheduled_at, created_by])
    return rows[0]
}

// ✅ fixed: removed duplicate ORDER BY, added registered_count
export const getUpcomingSessions = async () => {
    const sql = `
        SELECT 
            qs.id,
            qs.scheduled_at,
            qs.status,
            qs.created_by,
            t.name AS topic_name,
            t.topic_id,
            s.name AS subject_name,
            s.subject_id,
            COUNT(qr.id)::int AS registered_count
        FROM quiz_sessions qs
        JOIN topics t ON qs.topic_id = t.topic_id
        JOIN subjects s ON t.subject_id = s.subject_id
        LEFT JOIN quiz_registrations qr ON qs.id = qr.session_id
       WHERE qs.status IN ('upcoming', 'active')
AND (qs.ends_at IS NULL OR qs.ends_at > NOW())
        GROUP BY qs.id, t.name, t.topic_id, s.name, s.subject_id
        ORDER BY qs.scheduled_at ASC`
    const { rows } = await query(sql)
    return rows
}

export const registerForSession = async (session_id, user_id) => {
    const sql = `
        INSERT INTO quiz_registrations (session_id, user_id)
        VALUES ($1, $2)
        RETURNING *`
    const { rows } = await query(sql, [session_id, user_id])
    return rows[0]
}

export const isRegistered = async (session_id, user_id) => {
    const sql = `
        SELECT * FROM quiz_registrations
        WHERE session_id = $1 AND user_id = $2`
    const { rows } = await query(sql, [session_id, user_id])
    return rows[0]
}

// ✅ fixed: added missing sessionResult query, moved setTimeout to after activation
export const openSession = async (session_id) => {
    // ✅ fetch topic_id first
    const sessionResult = await query(
        `SELECT topic_id FROM quiz_sessions WHERE id = $1`,
        [session_id]
    )

    const topic_id = sessionResult.rows[0]?.topic_id
    if (!topic_id) throw new Error("Session not found")

    const { rows: questions } = await query(
        `SELECT question_id FROM questions 
         WHERE topic_id = $1 AND status = 'approved'
         ORDER BY RANDOM() LIMIT 10`,
        [topic_id]
    )

    if (questions.length < 10) throw new Error("Not enough questions")

    for (const q of questions) {
        await query(
            `INSERT INTO quiz_session_questions (session_id, question_id) VALUES ($1, $2)`,
            [session_id, q.question_id]
        )
    }

 const { rows } = await query(
   `UPDATE quiz_sessions 
    SET status = 'active', started_at = NOW(), ends_at = NOW() + INTERVAL '210 seconds'
    WHERE id = $1
    RETURNING *`,
    [session_id]  // ✅ this was missing
)
setTimeout(async () => {
    await query(
        `UPDATE quiz_sessions SET status = 'completed' WHERE id = $1`,
        [session_id]
    )
}, 210 * 1000)

    return rows[0]
}

export const getUserRegistrations = async (user_id) => {
    const sql = `SELECT session_id FROM quiz_registrations WHERE user_id = $1`
    const { rows } = await query(sql, [user_id])
    return rows.map(r => r.session_id)
}