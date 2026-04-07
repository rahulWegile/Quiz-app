"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const API = process.env.NEXT_PUBLIC_API_URL

interface Subject { subject_id: string; name: string }
interface UpcomingSession {
  id: string; topic_name: string; subject_name: string;
  scheduled_at: string; status: string; registered_count: number; topic_id: string;
}

const subjectIcons: Record<string, string> = {
  science: "⚗️", mathematics: "📐", history: "🏛️", geography: "🌍",
  technology: "💻", sports: "⚽", entertainment: "🎬", literature: "📚",
  maths: "📐", ai: "🤖", default: "🧠",
}
const getIcon = (name: string) => subjectIcons[name.toLowerCase()] || subjectIcons.default

const SUBJECT_TOPS = [
  "linear-gradient(90deg,#6366f1,#a78bfa)",
  "linear-gradient(90deg,#ec4899,#f472b6)",
  "linear-gradient(90deg,#14b8a6,#34d399)",
  "linear-gradient(90deg,#f97316,#fb923c)",
  "linear-gradient(90deg,#f59e0b,#fcd34d)",
  "linear-gradient(90deg,#8b5cf6,#c084fc)",
]
const SUBJECT_BG = ["#eef2ff","#fdf2f8","#f0fdf4","#fff7ed","#fffbeb","#f5f3ff"]

export default function Quiz() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([])
  const [registering, setRegistering] = useState<string | null>(null)
  const [registered, setRegistered] = useState<string[]>([])
  const [attempted, setAttempted] = useState<Record<string, string>>({})
  const [now, setNow] = useState(new Date())
  const router = useRouter()

  const getToken = () => {
    if (typeof document === "undefined") return undefined
    return document.cookie.split(";").find((r) => r.trim().startsWith("session_token="))?.split("=")[1]
  }

  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(clock)
  }, [])

  useEffect(() => {
    const hasExpiring = upcomingSessions.some((s) => {
      if (s.status !== "upcoming") return false;
      return new Date(s.scheduled_at).getTime() - now.getTime() <= 0;
    });

    if (hasExpiring) {
      fetch(`${API}/api/quiz/upcomingQuizzes`)
        .then((r) => r.json())
        .then((data) => setUpcomingSessions(data.data || []));
    }
  }, [now, upcomingSessions]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch(`${API}/api/quiz/upcomingQuizzes`)
        const data = await res.json()
        setUpcomingSessions(data.data || [])
      } catch { setUpcomingSessions([]) }

      try {
        const token = getToken(); if (!token) return
        const res = await fetch(`${API}/api/quiz/myRegistrations`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (data.success) setRegistered(data.data)
      } catch {}

      try {
        const token = getToken(); if (!token) return
        const res = await fetch(`${API}/api/quiz/myAttempts`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (data.success) setAttempted(data.data)
      } catch {}
    }

    const interval = setInterval(fetchAll, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch(`${API}/api/getSubjects`)
        const data = await res.json()
        setSubjects(data.data || [])
      } catch { setError("Failed to fetch subjects") }
      finally { setLoading(false) }
    }
    const fetchUpcoming = async () => {
      try {
        const res = await fetch(`${API}/api/quiz/upcomingQuizzes`)
        const data = await res.json()
        setUpcomingSessions(data.data || [])
      } catch { setUpcomingSessions([]) }
    }
    const fetchMyRegistrations = async () => {
      try {
        const token = getToken(); if (!token) return
        const res = await fetch(`${API}/api/quiz/myRegistrations`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (data.success) setRegistered(data.data)
      } catch { console.error("Failed to fetch registrations") }
    }
    const fetchMyAttempts = async () => {
      try {
        const token = getToken(); if (!token) return
        const res = await fetch(`${API}/api/quiz/myAttempts`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (data.success) setAttempted(data.data)
      } catch { console.error("Failed to fetch attempts") }
    }
    fetchSubjects(); fetchUpcoming(); fetchMyRegistrations(); fetchMyAttempts()
  }, [])

  const getTimeUntil = (scheduledAt: string) => {
    const diff = new Date(scheduledAt).getTime() - now.getTime()
    if (diff <= 0) return "Starting soon..."
    const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000)
    if (h > 0) return `${h}h ${m}m ${s}s`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }

  // Registration is HARD CLOSED 2 minutes before scheduled time
  const isRegistrationClosed = (scheduledAt: string) =>
    now >= new Date(new Date(scheduledAt).getTime() - 2 * 60 * 1000)

  // "Closing Soon" warning shown between 10 minutes and 2 minutes before scheduled time
  const isClosingSoon = (scheduledAt: string) => {
    const t = new Date(scheduledAt).getTime()
    const nowMs = now.getTime()
    return nowMs >= t - 10 * 60 * 1000 && nowMs < t - 2 * 60 * 1000
  }

  const handleRegister = (session_id: string) => {
    const token = getToken()
    if (!token) { router.push("/Auth/signIn"); return }
    router.push(`/payment?session_id=${session_id}&mode=register`)
  }

  const handleJoin = async (sessionId: string) => {
    const token = getToken()
    if (!token) { router.push("/Auth/signIn"); return }
    try {
      const res = await fetch(`${API}/api/quiz/checkAttempt/${sessionId}`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (data.attempted) router.push(`/quiz/result/${data.attemptId}`)
      else router.push(`/quiz/play/${sessionId}`)
    } catch { router.push(`/quiz/play/${sessionId}`) }
  }

  const renderActionButton = (session: UpcomingSession) => {
    const isReg = registered.includes(session.id)
    const regClosed = isRegistrationClosed(session.scheduled_at)
    const closingSoon = isClosingSoon(session.scheduled_at)

    // --- ACTIVE (live) session ---
    if (session.status === "active") {
      if (attempted[session.id])
        return <button className="qz-btn qz-btn-blue" onClick={() => router.push(`/quiz/result/${attempted[session.id]}`)}>View Result</button>
      if (isReg)
        return <button className="qz-btn qz-btn-green" onClick={() => handleJoin(session.id)}>Join Now ⚡</button>
      return <span className="qz-chip qz-chip-red">Registration Closed</span>
    }

    // --- UPCOMING session ---
    if (isReg)
      return <span className="qz-chip qz-chip-green">✓ Registered</span>

    // Hard closed (within 2 min of start)
    if (regClosed)
      return <span className="qz-chip qz-chip-red">Registration Closed</span>

    // Soft warning (between 10 min and 2 min before start)
    if (closingSoon)
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <button
            className="qz-btn qz-btn-purple"
            onClick={() => handleRegister(session.id)}
            disabled={registering === session.id}
          >
            {registering === session.id ? "Registering…" : "Register →"}
          </button>
          <span className="qz-chip qz-chip-yellow" style={{ fontSize: 10, padding: "3px 8px" }}>⚠️ Closing Soon</span>
        </div>
      )

    // Normal open registration
    return (
      <button
        className="qz-btn qz-btn-purple"
        onClick={() => handleRegister(session.id)}
        disabled={registering === session.id}
      >
        {registering === session.id ? "Registering…" : "Register →"}
      </button>
    )
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", background: "#eef2ff" }}>
      <div className="qz-spinner" />
    </div>
  )
  if (error) return (
    <div style={{ textAlign: "center", padding: "60px", background: "#eef2ff", minHeight: "60vh" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
      <p style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 800, color: "#1e1b4b" }}>{error}</p>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,700&display=swap');

        .qzpage { font-family: 'Outfit', sans-serif; background: #eef2ff; min-height: 100vh; color: #1e1b4b; }
        .qzpage * { box-sizing: border-box; margin: 0; padding: 0; }

        /* HEADER */
        .qz-header {
          background: linear-gradient(160deg, #e0e7ff 0%, #f5f3ff 100%);
          padding: 48px 60px 40px;
          border-bottom: 1px solid #c7d2fe;
          position: relative; overflow: hidden;
        }
        .qz-header::before {
          content: ''; position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(99,102,241,0.06) 1.5px, transparent 1.5px);
          background-size: 24px 24px; pointer-events: none;
        }
        .qz-header-inner { max-width: 900px; margin: 0 auto; position: relative; z-index: 1; }
        .qz-header-tag {
          display: inline-flex; align-items: center; gap: 7px;
          background: #fff; border: 1.5px solid #c7d2fe; color: #6366f1;
          font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          padding: 5px 12px; border-radius: 100px; margin-bottom: 14px;
          box-shadow: 0 2px 8px rgba(99,102,241,0.1);
        }
        .qz-pulse { width: 6px; height: 6px; background: #6366f1; border-radius: 50%; animation: qzpulse 2s infinite; }
        @keyframes qzpulse { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.4);} 50%{box-shadow:0 0 0 5px rgba(99,102,241,0);} }
        .qz-header-title { font-family: 'Fraunces', serif; font-size: clamp(28px, 4vw, 44px); font-weight: 900; color: #1e1b4b; letter-spacing: -0.02em; margin-bottom: 8px; line-height: 1.05; }
        .qz-header-title em { font-style: italic; background: linear-gradient(135deg,#6366f1,#ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .qz-header-sub { font-size: 14px; color: #6b7280; }

        /* BODY */
        .qz-body { max-width: 900px; margin: 0 auto; padding: 48px 60px 80px; }
        .qz-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #6366f1; margin-bottom: 6px; }
        .qz-sec-title { font-family: 'Fraunces', serif; font-size: 22px; font-weight: 900; color: #1e1b4b; letter-spacing: -0.01em; margin-bottom: 18px; }

        /* SESSION CARDS */
        .qz-sessions { display: flex; flex-direction: column; gap: 12px; margin-bottom: 52px; }
        .qz-session-card {
          background: #fff; border-radius: 20px; padding: 20px 24px;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          border: 1.5px solid #e5e7eb;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
          transition: all 0.2s; position: relative; overflow: hidden;
        }
        .qz-session-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; border-radius: 20px 20px 0 0; }
        .qz-session-card.live::before { background: linear-gradient(90deg, #14b8a6, #34d399); }
        .qz-session-card.upcoming::before { background: linear-gradient(90deg, #6366f1, #a78bfa); }
        .qz-session-card:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(0,0,0,0.09); border-color: #c7d2fe; }

        .qz-session-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 10px; border-radius: 100px; margin-bottom: 8px; }
        .badge-live { background: rgba(20,184,166,0.1); color: #0d9488; border: 1px solid rgba(20,184,166,0.25); }
        .badge-up   { background: rgba(99,102,241,0.1); color: #6366f1; border: 1px solid rgba(99,102,241,0.2); }

        .qz-live-dot { width: 7px; height: 7px; background: #14b8a6; border-radius: 50%; animation: qzpulse 1.5s infinite; }
        .qz-topic { font-family: 'Fraunces', serif; font-size: 17px; font-weight: 800; color: #1e1b4b; margin-bottom: 3px; }
        .qz-subj { font-size: 11px; color: #d1d5db; margin-bottom: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; }
        .qz-meta { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .qz-time { font-size: 12px; color: #9ca3af; }
        .qz-countdown { font-size: 13px; color: #6366f1; font-weight: 700; font-variant-numeric: tabular-nums; }
        .qz-live-txt { font-size: 13px; color: #0d9488; font-weight: 700; }
        .qz-reg { font-size: 11px; color: #d1d5db; }

        /* BUTTONS */
        .qz-btn { font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 12px; border: none; cursor: pointer; transition: all 0.18s; white-space: nowrap; flex-shrink: 0; }
        .qz-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .qz-btn-purple { background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; box-shadow: 0 4px 14px rgba(99,102,241,0.3); }
        .qz-btn-purple:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(99,102,241,0.4); }
        .qz-btn-green { background: linear-gradient(135deg,#14b8a6,#10b981); color: #fff; box-shadow: 0 4px 14px rgba(20,184,166,0.3); }
        .qz-btn-green:hover { transform: translateY(-1px); }
        .qz-btn-blue { background: linear-gradient(135deg,#6366f1,#818cf8); color: #fff; box-shadow: 0 4px 14px rgba(99,102,241,0.25); }
        .qz-btn-blue:hover { transform: translateY(-1px); }

        .qz-chip { font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 700; padding: 8px 14px; border-radius: 10px; white-space: nowrap; }
        .qz-chip-green { background: rgba(20,184,166,0.1); color: #0d9488; border: 1px solid rgba(20,184,166,0.25); }
        .qz-chip-red   { background: rgba(239,68,68,0.08); color: #dc2626; border: 1px solid rgba(239,68,68,0.2); }
        .qz-chip-yellow{ background: rgba(245,158,11,0.1); color: #d97706; border: 1px solid rgba(245,158,11,0.25); }

        /* SUBJECT GRID */
        .qz-subjects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 12px; }
        .qz-subject-card {
          background: #fff; border-radius: 20px; padding: 24px 20px;
          cursor: pointer; transition: all 0.2s;
          border: 1.5px solid #f3f4f6;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          position: relative; overflow: hidden;
        }
        .qz-subject-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; border-radius: 20px 20px 0 0; }
        .qz-subject-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.1); }
        .qz-subject-icon { font-size: 28px; margin-bottom: 12px; display: block; }
        .qz-subject-name { font-family: 'Fraunces', serif; font-size: 16px; font-weight: 800; color: #1e1b4b; }
        .qz-subject-arrow { font-size: 14px; color: #d1d5db; margin-top: 8px; transition: all 0.2s; }
        .qz-subject-card:hover .qz-subject-arrow { color: #6366f1; transform: translateX(3px); }

        /* EMPTY */
        .qz-empty { text-align: center; padding: 56px 24px; background: #fff; border-radius: 22px; border: 1.5px solid #e5e7eb; }
        .qz-empty-icon { font-size: 48px; margin-bottom: 14px; }
        .qz-empty-title { font-family: 'Fraunces', serif; font-size: 22px; font-weight: 900; color: #1e1b4b; margin-bottom: 8px; }
        .qz-empty-sub { font-size: 14px; color: #9ca3af; }

        /* SPINNER */
        .qz-spinner { width: 36px; height: 36px; border: 3px solid #e0e7ff; border-top-color: #6366f1; border-radius: 50%; animation: qzspin 0.8s linear infinite; }
        @keyframes qzspin { to { transform: rotate(360deg); } }

        @media (max-width: 700px) {
          .qz-header { padding: 36px 24px 28px; }
          .qz-body { padding: 32px 24px 60px; }
          .qz-session-card { flex-direction: column; align-items: flex-start; }
          .qz-subjects-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="qzpage">
        {/* HEADER */}
        <div className="qz-header">
          <div className="qz-header-inner">
            <div className="qz-header-tag"><span className="qz-pulse" />BrainBolt Arena</div>
            <h1 className="qz-header-title">Pick Your <em>Challenge.</em></h1>
            <p className="qz-header-sub">Join a live battle or explore topics at your own pace</p>
          </div>
        </div>

        <div className="qz-body">
          {/* SESSIONS */}
          {upcomingSessions.length > 0 && (
            <div style={{ marginBottom: 52 }}>
              <div className="qz-eyebrow">Live & Scheduled</div>
              <div className="qz-sec-title">Upcoming Battles</div>
              <div className="qz-sessions">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className={`qz-session-card ${session.status === "active" ? "live" : "upcoming"}`}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className={`qz-session-badge ${session.status === "active" ? "badge-live" : "badge-up"}`}>
                        {session.status === "active" ? <><span className="qz-live-dot" />Live Now</> : "⏰ Upcoming"}
                      </div>
                      <div className="qz-topic">{session.topic_name}</div>
                      <div className="qz-subj">{session.subject_name}</div>
                      <div className="qz-meta">
                        <span className="qz-time">📅 {new Date(session.scheduled_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}</span>
                        {session.status === "upcoming" && <span className="qz-countdown">⏳ {getTimeUntil(session.scheduled_at)}</span>}
                        {session.status === "active" && <span className="qz-live-txt">🟢 In Progress</span>}
                        <span className="qz-reg">{session.registered_count} joined</span>
                      </div>
                    </div>
                    <div>{renderActionButton(session)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}