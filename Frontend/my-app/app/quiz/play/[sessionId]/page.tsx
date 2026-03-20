/* eslint-disable react-hooks/set-state-in-effect */
"use client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState, useCallback, useRef } from "react"

const API = process.env.NEXT_PUBLIC_API_URL

interface Question { question_id: string; question_text: string; option_a: string; option_b: string; option_c: string; option_d: string }
interface Answer { question_id: string; selected_answer: string }

const OPTION_LABELS: Record<string, string> = { option_a: "A", option_b: "B", option_c: "C", option_d: "D" }
const OPTION_COLORS = ["#6366f1", "#ec4899", "#14b8a6", "#f97316"]

export default function Play() {
  const { sessionId } = useParams()
  const router = useRouter()

  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [questionTimeLeft, setQuestionTimeLeft] = useState(20)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timerKey, setTimerKey] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const timeTakenRef = useRef(0)
  const hasSubmittedRef = useRef(false)
  const answersRef = useRef<Answer[]>([])

  const getToken = () => {
    if (typeof document === "undefined") return undefined
    return document.cookie.split(";").find((r) => r.trim().startsWith("session_token="))?.split("=")[1]
  }

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const token = getToken()
        const checkRes = await fetch(`${API}/api/quiz/checkAttempt/${sessionId}`, { headers: { Authorization: `Bearer ${token}` } })
        const checkData = await checkRes.json()
        if (checkData.attempted) { router.push(`/quiz/result/${checkData.attemptId}`); return }
        const res = await fetch(`${API}/api/quiz/session/${sessionId}`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (!data.success && data.paymentRequired) { router.push(`/payment?session_id=${sessionId}`); return }
        if (!data.success) { setError(data.message || "Failed to load session"); setLoading(false); return }
        setQuestions(data.data); setLoading(false)
      } catch { setError("Something went wrong"); setLoading(false) }
    }
    fetchSession()
  }, [sessionId, router])

  useEffect(() => { answersRef.current = answers }, [answers])

  const handleSubmit = useCallback(async (finalAnswers?: Answer[]) => {
    if (hasSubmittedRef.current) return
    hasSubmittedRef.current = true; setSubmitting(true)
    try {
      const token = getToken()
      const res = await fetch(`${API}/api/quiz/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, answers: finalAnswers ?? answersRef.current, time_taken: timeTakenRef.current })
      })
      const data = await res.json()
      router.push(`/quiz/result/${data.data.attemptId}`)
    } catch { setError("Failed to submit quiz"); setSubmitting(false); hasSubmittedRef.current = false }
  }, [sessionId, router])

  useEffect(() => { setTimerKey(k => k + 1); setSelected(null) }, [currentIndex])

  useEffect(() => {
    if (loading || submitting) return
    setQuestionTimeLeft(20)
    const timer = setInterval(() => {
      timeTakenRef.current += 1
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setCurrentIndex((ci) => { if (ci + 1 >= questions.length) handleSubmit(); return ci + 1 < questions.length ? ci + 1 : ci })
          return 20
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [timerKey, loading, submitting, questions.length, handleSubmit])

  const handleAnswer = (option: string) => {
    if (submitting || selected) return
    setSelected(option)
    setTimeout(() => {
      const newAnswers = [...answers, { question_id: questions[currentIndex].question_id, selected_answer: option }]
      setAnswers(newAnswers); answersRef.current = newAnswers
      if (currentIndex + 1 === questions.length) handleSubmit(newAnswers)
      else setCurrentIndex(currentIndex + 1)
    }, 350)
  }

  const timerPct = (questionTimeLeft / 20) * 100
  const timerColor = questionTimeLeft <= 5 ? "#ec4899" : questionTimeLeft <= 10 ? "#f97316" : "#6366f1"

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#eef2ff" }}>
      <div className="play-spinner" />
    </div>
  )
  if (error) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#eef2ff" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div><p style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 800, color: "#1e1b4b" }}>{error}</p></div>
    </div>
  )
  if (submitting) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#eef2ff", gap: 18 }}>
      <div className="play-spinner" />
      <p style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 900, color: "#1e1b4b" }}>Submitting your answers…</p>
      <p style={{ color: "#6b7280", fontSize: 14 }}>Calculating your score</p>
    </div>
  )

  const q = questions[currentIndex]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,700&display=swap');

        .play-page {
          font-family: 'Outfit', sans-serif;
          background: linear-gradient(160deg, #e0e7ff 0%, #eef2ff 40%, #f0fdf4 100%);
          min-height: 100vh; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 40px 24px; position: relative; overflow: hidden;
        }
        .play-page * { box-sizing: border-box; margin: 0; padding: 0; }

        .play-bg-dots {
          position: fixed; inset: 0; pointer-events: none;
          background-image: radial-gradient(circle, rgba(99,102,241,0.06) 1.5px, transparent 1.5px);
          background-size: 28px 28px;
        }

        .play-card {
          position: relative; z-index: 1;
          width: 100%; max-width: 660px;
          background: #fff;
          border-radius: 28px;
          padding: 40px;
          border: 1.5px solid #e0e7ff;
          box-shadow: 0 8px 40px rgba(99,102,241,0.12), 0 2px 8px rgba(0,0,0,0.04);
          overflow: hidden;
        }
        .play-card-top { height: 5px; position: absolute; top: 0; left: 0; right: 0; border-radius: 28px 28px 0 0; transition: background 0.5s; }

        /* TOP BAR */
        .play-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .play-q-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #9ca3af; }
        .play-q-num { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 900; color: #1e1b4b; }
        .play-timer-chip {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 16px; border-radius: 100px;
          font-family: 'Fraunces', serif; font-size: 18px; font-weight: 900;
          font-variant-numeric: tabular-nums;
          border: 1.5px solid; transition: all 0.3s;
        }

        /* PROGRESS */
        .play-prog-track { width: 100%; height: 5px; background: #f3f4f6; border-radius: 100px; margin-bottom: 6px; overflow: hidden; }
        .play-prog-fill { height: 100%; border-radius: 100px; background: #e0e7ff; transition: width 0.3s ease; }
        .play-timer-track { width: 100%; height: 4px; background: #f3f4f6; border-radius: 100px; overflow: hidden; margin-bottom: 32px; }
        .play-timer-fill { height: 100%; border-radius: 100px; transition: width 1s linear, background 0.3s; }

        /* QUESTION */
        .play-q-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #c7d2fe; margin-bottom: 10px; }
        .play-q-text { font-family: 'Fraunces', serif; font-size: clamp(18px, 2.5vw, 23px); font-weight: 900; font-style: italic; color: #1e1b4b; line-height: 1.4; margin-bottom: 30px; letter-spacing: -0.01em; }

        /* OPTIONS */
        .play-options { display: flex; flex-direction: column; gap: 10px; }
        .play-option {
          display: flex; align-items: center; gap: 14px;
          padding: 15px 18px; background: #fafafa;
          border: 1.5px solid #f3f4f6; border-radius: 14px;
          cursor: pointer; transition: all 0.18s;
          text-align: left; width: 100%; font-family: 'Outfit', sans-serif;
        }
        .play-option:hover:not(:disabled):not(.selected) { background: #f5f3ff; border-color: #c7d2fe; transform: translateX(4px); }
        .play-option.selected { background: #eef2ff; border-color: #a5b4fc; transform: translateX(4px); }
        .play-option:disabled { cursor: not-allowed; }

        .play-opt-badge {
          width: 34px; height: 34px; flex-shrink: 0;
          border-radius: 10px; border: 1.5px solid #e5e7eb;
          background: #fff; display: flex; align-items: center; justify-content: center;
          font-family: 'Fraunces', serif; font-size: 13px; font-weight: 900;
          color: #9ca3af; transition: all 0.18s;
        }
        .play-option:hover:not(:disabled) .play-opt-badge, .play-option.selected .play-opt-badge { border-color: currentColor; }
        .play-opt-text { font-size: 15px; font-weight: 500; color: #374151; line-height: 1.4; transition: color 0.18s; }
        .play-option:hover:not(:disabled) .play-opt-text, .play-option.selected .play-opt-text { color: #1e1b4b; }

        /* DOTS */
        .play-dots-row { display: flex; justify-content: center; gap: 6px; margin-top: 28px; }
        .play-dot { height: 6px; border-radius: 3px; transition: all 0.25s; }
        .play-dot.done { width: 6px; background: #6366f1; border-radius: 50%; }
        .play-dot.current { width: 20px; }
        .play-dot.pending { width: 6px; background: #e5e7eb; border-radius: 50%; }

        .play-spinner { width: 38px; height: 38px; border: 3px solid #e0e7ff; border-top-color: #6366f1; border-radius: 50%; animation: plspin 0.8s linear infinite; }
        @keyframes plspin { to { transform: rotate(360deg); } }

        @media (max-width: 600px) { .play-card { padding: 28px 20px; } }
      `}</style>

      <div className="play-page">
        <div className="play-bg-dots" />
        <div className="play-card">
          <div className="play-card-top" style={{ background: timerColor }} />

          {/* TOP BAR */}
          <div className="play-topbar">
            <div>
              <div className="play-q-label">Question</div>
              <div className="play-q-num">{currentIndex + 1} <span style={{ color: "#d1d5db", fontWeight: 400, fontSize: 16 }}>/ {questions.length}</span></div>
            </div>
            <div className="play-timer-chip" style={{ color: timerColor, background: `${timerColor}15`, borderColor: `${timerColor}40` }}>
              ⏱ {questionTimeLeft}s
            </div>
          </div>

          {/* PROGRESS BARS */}
          <div className="play-prog-track">
            <div className="play-prog-fill" style={{ width: `${(currentIndex / questions.length) * 100}%`, background: `${timerColor}40` }} />
          </div>
          <div className="play-timer-track">
            <div className="play-timer-fill" style={{ width: `${timerPct}%`, background: timerColor }} />
          </div>

          {/* QUESTION */}
          <div className="play-q-eyebrow">Q{currentIndex + 1} of {questions.length}</div>
          <div className="play-q-text">{q?.question_text}</div>

          {/* OPTIONS */}
          <div className="play-options">
            {(["option_a", "option_b", "option_c", "option_d"] as const).map((opt, i) => (
              <button
                key={opt}
                className={`play-option${selected === opt ? " selected" : ""}`}
                onClick={() => handleAnswer(opt)}
                disabled={!!selected || submitting}
                style={selected === opt ? { borderColor: OPTION_COLORS[i], background: `${OPTION_COLORS[i]}10` } : {}}
              >
                <span className="play-opt-badge" style={selected === opt ? { borderColor: OPTION_COLORS[i], color: OPTION_COLORS[i], background: `${OPTION_COLORS[i]}15` } : { color: OPTION_COLORS[i] }}>
                  {OPTION_LABELS[opt]}
                </span>
                <span className="play-opt-text">{q?.[opt]}</span>
              </button>
            ))}
          </div>

          {/* DOTS */}
          <div className="play-dots-row">
            {questions.map((_, i) => (
              <div key={i} className={`play-dot ${i < currentIndex ? "done" : i === currentIndex ? "current" : "pending"}`}
                style={i === currentIndex ? { background: timerColor } : {}} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}