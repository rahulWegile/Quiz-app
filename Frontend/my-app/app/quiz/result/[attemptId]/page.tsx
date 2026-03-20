// ============================================================
// RESULT PAGE  →  app/quiz/result/[attemptId]/page.tsx
// ============================================================
"use client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const API = process.env.NEXT_PUBLIC_API_URL

interface Attempt { id: string; score: number; time_taken: number; name: string; profile_url: string | null }
interface LeaderboardEntry { name: string; profile_url: string | null; score: number; time_taken: number }
interface AnswerKey {
  question_id: string; question_text: string; selected_answer: string; is_correct: boolean;
  option_a: string; option_b: string; option_c: string; option_d: string; correct_answer: string;
}

const getScoreInfo = (score: number) => {
  if (score >= 8) return { color: "#14b8a6", bg: "rgba(20,184,166,0.1)", border: "rgba(20,184,166,0.25)", label: "Excellent! 🔥", top: "linear-gradient(90deg,#14b8a6,#34d399)" }
  if (score >= 6) return { color: "#6366f1", bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.2)", label: "Good Job! 👍", top: "linear-gradient(90deg,#6366f1,#a78bfa)" }
  if (score >= 4) return { color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.2)", label: "Keep Going! 💪", top: "linear-gradient(90deg,#f97316,#fb923c)" }
  return { color: "#ec4899", bg: "rgba(236,72,153,0.1)", border: "rgba(236,72,153,0.2)", label: "Practice More! 📚", top: "linear-gradient(90deg,#ec4899,#f472b6)" }
}

export default function Result() {
  const { attemptId } = useParams()
  const router = useRouter()
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [answerKey, setAnswerKey] = useState<AnswerKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAnswerKey, setShowAnswerKey] = useState(false)
  const [leaderboardLoading, setLeaderboardLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(120)

  const getToken = () => {
    if (typeof document === "undefined") return undefined
    return document.cookie.split(";").find((r) => r.trim().startsWith("session_token="))?.split("=")[1]
  }

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = getToken()
        if (!token) { router.push("/Auth/signIn"); return }
        const res = await fetch(`${API}/api/quiz/result/${attemptId}`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (!data.success) { setError(data.message || "Failed to load result"); setLoading(false); return }
        setAttempt(data.data.attempt); setLeaderboard(data.data.leaderboard); setAnswerKey(data.data.answerKey)
        setLoading(false)
      } catch { setError("Something went wrong"); setLoading(false) }
    }
    fetchResult()
  }, [attemptId])

  useEffect(() => {
    if (!attemptId) return
    const key = `leaderboard_timer_${attemptId}`
    const saved = localStorage.getItem(key)
    const now = Date.now()
    if (saved) {
      const remaining = 120 - Math.floor((now - parseInt(saved)) / 1000)
      if (remaining <= 0) { setLeaderboardLoading(false); setTimeLeft(0); return }
      setTimeLeft(remaining)
    } else { localStorage.setItem(key, now.toString()); setTimeLeft(120) }
  }, [attemptId])

  useEffect(() => {
    if (!leaderboardLoading) return
    if (timeLeft <= 0) { setLeaderboardLoading(false); return }
    const interval = setInterval(() => {
      setTimeLeft((prev) => { if (prev <= 1) { clearInterval(interval); setLeaderboardLoading(false); return 0 } return prev - 1 })
    }, 1000)
    return () => clearInterval(interval)
  }, [timeLeft, leaderboardLoading])

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#eef2ff" }}><div className="res-spinner" /></div>
  if (error) return <div style={{ textAlign: "center", padding: 60, background: "#eef2ff", minHeight: "100vh" }}><div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div><p style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 800, color: "#1e1b4b" }}>{error}</p></div>

  const si = getScoreInfo(attempt?.score ?? 0)
  const myRank = leaderboard.findIndex(e => e.name === attempt?.name) + 1
  const pct = Math.round(((attempt?.score ?? 0) / 10) * 100)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,700&display=swap');
        .respage { font-family: 'Outfit', sans-serif; background: #eef2ff; min-height: 100vh; color: #1e1b4b; }
        .respage * { box-sizing: border-box; margin: 0; padding: 0; }

        .res-header { background: linear-gradient(160deg,#e0e7ff 0%,#f5f3ff 100%); padding: 40px 60px 36px; border-bottom: 1px solid #c7d2fe; position: relative; overflow: hidden; }
        .res-header::before { content:''; position:absolute; inset:0; background-image:radial-gradient(circle, rgba(99,102,241,0.06) 1.5px, transparent 1.5px); background-size:24px 24px; pointer-events:none; }
        .res-header-inner { max-width: 800px; margin: 0 auto; position: relative; z-index: 1; }
        .res-back { display:inline-flex; align-items:center; gap:6px; color:#6b7280; font-size:13px; font-weight:500; cursor:pointer; margin-bottom:14px; background:none; border:none; transition:color 0.15s; }
        .res-back:hover { color:#6366f1; }
        .res-header-title { font-family:'Fraunces',serif; font-size:clamp(26px,4vw,42px); font-weight:900; color:#1e1b4b; letter-spacing:-0.02em; }
        .res-header-title em { font-style:italic; background:linear-gradient(135deg,#6366f1,#ec4899); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

        .res-body { max-width: 800px; margin: 0 auto; padding: 40px 60px 80px; }

        /* SCORE CARD */
        .res-score-card {
          background: #fff; border-radius: 24px; border: 1.5px solid #e0e7ff;
          box-shadow: 0 4px 20px rgba(99,102,241,0.08);
          padding: 36px; margin-bottom: 16px;
          display: grid; grid-template-columns: 1fr auto; gap: 28px; align-items: center;
          position: relative; overflow: hidden;
        }
        .res-score-card::before { content:''; position:absolute; top:0; left:0; right:0; height:5px; border-radius:24px 24px 0 0; }
        .res-score-lbl { font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#9ca3af; margin-bottom:8px; }
        .res-score-badge { display:inline-flex; align-items:center; gap:6px; padding:5px 14px; border-radius:100px; font-size:13px; font-weight:700; margin-bottom:14px; border:1.5px solid; }
        .res-score-num { font-family:'Fraunces',serif; font-size:clamp(48px,8vw,76px); font-weight:900; line-height:1; letter-spacing:-0.03em; }
        .res-score-denom { font-family:'Fraunces',serif; font-size:26px; font-weight:700; color:#d1d5db; margin-left:4px; }
        .res-meta { margin-top:14px; display:flex; flex-direction:column; gap:6px; }
        .res-meta-row { display:flex; align-items:center; gap:7px; font-size:13px; color:#6b7280; }

        /* circle */
        .res-circle { position:relative; width:110px; height:110px; flex-shrink:0; }
        .res-circle svg { transform:rotate(-90deg); }
        .res-circle-bg { fill:none; stroke:#f3f4f6; stroke-width:8; }
        .res-circle-fill { fill:none; stroke-width:8; stroke-linecap:round; }
        .res-circle-label { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
        .res-circle-pct { font-family:'Fraunces',serif; font-size:22px; font-weight:900; line-height:1; }
        .res-circle-sub { font-size:9px; color:#9ca3af; font-weight:700; letter-spacing:0.06em; margin-top:2px; }

        /* PILLS ROW */
        .res-pills { display:flex; gap:12px; margin-bottom:28px; flex-wrap:wrap; }
        .res-pill { flex:1; min-width:100px; background:#fff; border:1.5px solid #e5e7eb; border-radius:16px; padding:16px 18px; box-shadow:0 2px 8px rgba(0,0,0,0.04); }
        .res-pill-lbl { font-size:10px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#9ca3af; margin-bottom:4px; }
        .res-pill-val { font-family:'Fraunces',serif; font-size:24px; font-weight:900; line-height:1; }

        .res-eyebrow { font-size:10px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#6366f1; margin-bottom:6px; }
        .res-sec-title { font-family:'Fraunces',serif; font-size:22px; font-weight:900; color:#1e1b4b; margin-bottom:16px; }

        /* LEADERBOARD WAITING */
        .res-lb-wait {
          background: linear-gradient(160deg,#e0e7ff,#f5f3ff);
          border-radius: 20px; padding: 48px 32px; text-align: center;
          border: 1.5px solid #c7d2fe; margin-bottom: 24px;
        }
        .res-lb-wait-title { font-family:'Fraunces',serif; font-size:22px; font-weight:900; color:#1e1b4b; margin-bottom:8px; }
        .res-lb-wait-sub { font-size:13px; color:#6b7280; margin-bottom:28px; }
        .res-timer { font-family:'Fraunces',serif; font-size:56px; font-weight:900; font-variant-numeric:tabular-nums; line-height:1; transition:color 0.3s; }
        .res-timer-sub { font-size:11px; color:#9ca3af; margin-top:6px; letter-spacing:0.1em; text-transform:uppercase; }

        /* LEADERBOARD TABLE */
        .res-lb-table { background:#fff; border-radius:20px; border:1.5px solid #e5e7eb; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.05); margin-bottom:24px; }
        .res-lb-head { display:grid; grid-template-columns:56px 1fr 80px 90px; padding:12px 20px; border-bottom:1px solid #f3f4f6; font-size:10px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#9ca3af; }
        .res-lb-row { display:grid; grid-template-columns:56px 1fr 80px 90px; padding:14px 20px; align-items:center; border-bottom:1px solid #fafafa; transition:background 0.15s; }
        .res-lb-row:last-child { border-bottom:none; }
        .res-lb-row:hover { background:#fafafa; }
        .res-lb-row.me { background:#eef2ff; border-left:3px solid #6366f1; }
        .res-lb-rank { font-family:'Fraunces',serif; font-size:17px; font-weight:900; }
        .res-lb-name { font-size:14px; font-weight:600; color:#1e1b4b; }
        .res-lb-score { font-family:'Fraunces',serif; font-size:16px; font-weight:800; color:#6366f1; }
        .res-lb-time { font-size:13px; color:#9ca3af; font-variant-numeric:tabular-nums; }
        .res-you { margin-left:6px; font-size:10px; color:#6366f1; font-weight:700; background:#eef2ff; padding:2px 7px; border-radius:100px; }

        /* ANSWER KEY */
        .res-ak-btn { width:100%; padding:14px; border-radius:14px; border:none; cursor:pointer; font-family:'Outfit',sans-serif; font-size:15px; font-weight:700; transition:all 0.2s; margin-bottom:20px; }
        .res-ak-btn.open { background:#f3f4f6; color:#374151; }
        .res-ak-btn.closed { background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; box-shadow:0 6px 18px rgba(99,102,241,0.3); }
        .res-ak-btn:hover { transform:translateY(-1px); }

        .res-ak-item { border-radius:18px; padding:20px; margin-bottom:12px; border:1.5px solid; }
        .res-ak-item.correct { background:rgba(20,184,166,0.05); border-color:rgba(20,184,166,0.2); }
        .res-ak-item.wrong   { background:rgba(236,72,153,0.05); border-color:rgba(236,72,153,0.2); }
        .res-ak-q { font-family:'Fraunces',serif; font-size:15px; font-weight:800; color:#1e1b4b; margin-bottom:12px; }
        .res-ak-opt { padding:8px 12px; border-radius:8px; margin-bottom:6px; font-size:13px; font-weight:400; }
        .res-ak-opt.correct-opt { background:rgba(20,184,166,0.12); color:#0d9488; font-weight:700; }
        .res-ak-opt.wrong-opt   { background:rgba(236,72,153,0.1); color:#be185d; font-weight:600; }

        /* BOTTOM BUTTONS */
        .res-btns { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:8px; }
        .res-btn { padding:14px; border-radius:14px; border:none; font-family:'Outfit',sans-serif; font-size:15px; font-weight:700; cursor:pointer; transition:all 0.2s; }
        .res-btn-dark { background:#1e1b4b; color:#fff; }
        .res-btn-dark:hover { background:#312e81; transform:translateY(-1px); box-shadow:0 6px 20px rgba(30,27,75,0.25); }
        .res-btn-accent { background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; box-shadow:0 6px 18px rgba(99,102,241,0.3); }
        .res-btn-accent:hover { transform:translateY(-1px); box-shadow:0 10px 26px rgba(99,102,241,0.4); }

        .res-spinner { width:36px; height:36px; border:3px solid #e0e7ff; border-top-color:#6366f1; border-radius:50%; animation:resspin 0.8s linear infinite; }
        @keyframes resspin { to { transform:rotate(360deg); } }

        @media (max-width: 680px) {
          .res-header { padding:32px 24px 28px; }
          .res-body { padding:28px 24px 60px; }
          .res-score-card { grid-template-columns:1fr; }
          .res-circle { display:none; }
          .res-btns { grid-template-columns:1fr; }
          .res-lb-head, .res-lb-row { grid-template-columns:50px 1fr 70px; }
        }
      `}</style>

      <div className="respage">
        <div className="res-header">
          <div className="res-header-inner">
            <button className="res-back" onClick={() => router.push("/quiz")}>← Back to Quizzes</button>
            <h1 className="res-header-title">Your <em>Results</em></h1>
          </div>
        </div>

        <div className="res-body">
          {/* SCORE CARD */}
          <div className="res-score-card">
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: si.top, borderRadius: "24px 24px 0 0" }} />
            <div>
              <div className="res-score-lbl">Final Score</div>
              <div className="res-score-badge" style={{ background: si.bg, color: si.color, borderColor: si.border }}>{si.label}</div>
              <div style={{ display: "flex", alignItems: "baseline" }}>
                <span className="res-score-num" style={{ color: si.color }}>{attempt?.score}</span>
                <span className="res-score-denom">/ 10</span>
              </div>
              <div className="res-meta">
                <div className="res-meta-row">⏱️ {Math.floor((attempt?.time_taken ?? 0) / 60)}m {String((attempt?.time_taken ?? 0) % 60).padStart(2, "0")}s</div>
                {!leaderboardLoading && myRank > 0 && <div className="res-meta-row">🏅 Rank #{myRank} of {leaderboard.length}</div>}
              </div>
            </div>
            <div className="res-circle">
              <svg width="110" height="110" viewBox="0 0 110 110">
                <circle className="res-circle-bg" cx="55" cy="55" r="47" />
                <circle className="res-circle-fill" cx="55" cy="55" r="47" stroke={si.color}
                  strokeDasharray={`${2 * Math.PI * 47}`}
                  strokeDashoffset={`${2 * Math.PI * 47 * (1 - pct / 100)}`} />
              </svg>
              <div className="res-circle-label">
                <span className="res-circle-pct" style={{ color: si.color }}>{pct}%</span>
                <span className="res-circle-sub">Score</span>
              </div>
            </div>
          </div>

          {/* LEADERBOARD */}
          <div className="res-eyebrow">Competition</div>
          <div className="res-sec-title">Leaderboard</div>

          {leaderboardLoading ? (
            <div className="res-lb-wait">
              <div className="res-lb-wait-title">Waiting for players…</div>
              <div className="res-lb-wait-sub">Leaderboard reveals when the session closes</div>
              <div className="res-timer" style={{ color: timeLeft < 30 ? "#ec4899" : "#6366f1" }}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
              </div>
              <div className="res-timer-sub">remaining</div>
            </div>
          ) : (
            <div className="res-lb-table">
              <div className="res-lb-head"><span>Rank</span><span>Player</span><span>Score</span><span>Time</span></div>
              {leaderboard.map((entry, i) => (
                <div key={i} className={`res-lb-row${entry.name === attempt?.name ? " me" : ""}`}>
                  <span className="res-lb-rank">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</span>
                  <span className="res-lb-name">
                    {entry.name}
                    {entry.name === attempt?.name && <span className="res-you">YOU</span>}
                  </span>
                  <span className="res-lb-score">{entry.score}/10</span>
                  <span className="res-lb-time">{Math.floor(entry.time_taken / 60)}m {String(entry.time_taken % 60).padStart(2, "0")}s</span>
                </div>
              ))}
            </div>
          )}

          {/* ANSWER KEY */}
          <button className={`res-ak-btn ${showAnswerKey ? "open" : "closed"}`} onClick={() => setShowAnswerKey(!showAnswerKey)}>
            {showAnswerKey ? "▲ Hide Answer Key" : "📋 Show Answer Key"}
          </button>

          {showAnswerKey && (
            <>
              <div className="res-eyebrow">Review</div>
              <div className="res-sec-title">Answer Key</div>
              {answerKey.map((item, index) => (
                <div key={item.question_id} className={`res-ak-item ${item.is_correct ? "correct" : "wrong"}`}>
                  <div className="res-ak-q">{item.is_correct ? "✅" : "❌"} {index + 1}. {item.question_text}</div>
                  {(["option_a", "option_b", "option_c", "option_d"] as const).map((opt) => {
                    const isCorrect = item[opt] === item.correct_answer
                    const isWrong = opt === item.selected_answer && !item.is_correct
                    return <div key={opt} className={`res-ak-opt${isCorrect ? " correct-opt" : isWrong ? " wrong-opt" : ""}`}>{item[opt]}{isCorrect ? " ✓" : isWrong ? " ✗" : ""}</div>
                  })}
                </div>
              ))}
            </>
          )}

          <div className="res-btns">
            <button className="res-btn res-btn-dark" onClick={() => router.push("/quiz")}>⚡ Try Another Quiz</button>
            <button className="res-btn res-btn-accent" onClick={() => router.push("/")}>🏠 Return Home</button>
          </div>
        </div>
      </div>
    </>
  )
}