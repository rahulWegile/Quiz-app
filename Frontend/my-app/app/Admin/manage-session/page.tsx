"use client"
import { useEffect, useState } from "react"

const API = process.env.NEXT_PUBLIC_API_URL

interface Session {
    id: string
    topic_name: string
    subject_name: string
    scheduled_at: string
    status: string
    registered_count: number
}

export default function ManageSessions() {
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [opening, setOpening] = useState<string | null>(null)

    const getToken = () =>
        document.cookie
            .split(";")
            .find((row) => row.trim().startsWith("session_token="))
            ?.split("=")[1]

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await fetch(`${API}/api/quiz/upcomingQuizzes`)
                const data = await res.json()
                if (!data.success) { setError(data.message || "Failed to load sessions"); setLoading(false); return }
                setSessions(data.data)
                setLoading(false)
            } catch { setError("Something went wrong"); setLoading(false) }
        }
        fetchSessions()
    }, [])

    const handleOpen = async (session_id: string) => {
        setOpening(session_id)
        try {
            const token = getToken()
            const res = await fetch(`${API}/api/quiz/open`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ session_id })
            })
            const data = await res.json()
            if (data.success) {
                setSessions((prev) => prev.map((s) => s.id === session_id ? { ...s, status: "active" } : s))
            } else {
                setError(data.message || "Failed to open session")
            }
        } catch { setError("Something went wrong") }
        setOpening(null)
    }

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", background: "#eef2ff" }}>
            <div className="ms-spinner" />
            <style>{`.ms-spinner{width:36px;height:36px;border:3px solid #e0e7ff;border-top-color:#6366f1;border-radius:50%;animation:msspin .8s linear infinite;}@keyframes msspin{to{transform:rotate(360deg);}}`}</style>
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
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,700&display=swap');

                .ms { font-family:'Outfit',sans-serif; background:#eef2ff; min-height:100vh; color:#1e1b4b; }
                .ms * { box-sizing:border-box; margin:0; padding:0; }

                .ms-header { background:linear-gradient(160deg,#e0e7ff 0%,#f5f3ff 100%); padding:40px 60px 36px; border-bottom:1px solid #c7d2fe; position:relative; overflow:hidden; }
                .ms-header::before { content:''; position:absolute; inset:0; background-image:radial-gradient(circle,rgba(99,102,241,0.06) 1.5px,transparent 1.5px); background-size:24px 24px; pointer-events:none; }
                .ms-header-inner { max-width:1000px; margin:0 auto; position:relative; z-index:1; }
                .ms-tag { display:inline-flex; align-items:center; gap:7px; background:#fff; border:1.5px solid #c7d2fe; color:#6366f1; font-size:10px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; padding:5px 12px; border-radius:100px; margin-bottom:14px; box-shadow:0 2px 8px rgba(99,102,241,.1); }
                .ms-tag-dot { width:6px; height:6px; background:#6366f1; border-radius:50%; animation:mspulse 2s infinite; }
                @keyframes mspulse { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.4);}50%{box-shadow:0 0 0 5px rgba(99,102,241,0);} }
                .ms-title { font-family:'Fraunces',serif; font-size:clamp(26px,4vw,40px); font-weight:900; color:#1e1b4b; letter-spacing:-.02em; line-height:1.05; }
                .ms-title em { font-style:italic; background:linear-gradient(135deg,#6366f1,#ec4899); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
                .ms-sub { font-size:14px; color:#6b7280; margin-top:6px; }

                .ms-body { max-width:1000px; margin:0 auto; padding:36px 60px 80px; }

                .ms-table-wrap { background:#fff; border-radius:20px; border:1.5px solid #e5e7eb; box-shadow:0 2px 12px rgba(99,102,241,.06); overflow:hidden; }
                .ms-thead { display:grid; grid-template-columns:140px 1fr 180px 110px 110px 120px; padding:12px 20px; border-bottom:1px solid #f3f4f6; font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#9ca3af; background:#fafbff; }
                .ms-row { display:grid; grid-template-columns:140px 1fr 180px 110px 110px 120px; padding:16px 20px; align-items:center; border-bottom:1px solid #f9fafb; transition:background .15s; }
                .ms-row:last-child { border-bottom:none; }
                .ms-row:hover { background:#fafbff; }

                .ms-subject { font-size:13px; font-weight:700; color:#1e1b4b; }
                .ms-topic { font-size:14px; font-weight:600; color:#1e1b4b; }
                .ms-date { font-size:13px; color:#6b7280; }
                .ms-reg { font-size:13px; color:#9ca3af; }

                .ms-badge { display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:700; padding:4px 11px; border-radius:100px; }
                .ms-badge.active { background:rgba(20,184,166,.1); color:#0d9488; border:1px solid rgba(20,184,166,.25); }
                .ms-badge.upcoming { background:rgba(99,102,241,.08); color:#6366f1; border:1px solid rgba(99,102,241,.2); }
                .ms-live-dot { width:6px; height:6px; background:#14b8a6; border-radius:50%; animation:mspulse 1.5s infinite; }

                .ms-btn { font-family:'Outfit',sans-serif; font-size:13px; font-weight:700; padding:9px 18px; border-radius:100px; border:none; cursor:pointer; transition:all .18s; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; box-shadow:0 4px 12px rgba(99,102,241,.28); }
                .ms-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 18px rgba(99,102,241,.38); }
                .ms-btn:disabled { opacity:.6; cursor:not-allowed; }
                .ms-opened { font-size:13px; font-weight:700; color:#0d9488; }

                .ms-empty { text-align:center; padding:56px; }
                .ms-empty-icon { font-size:44px; margin-bottom:12px; }
                .ms-empty-title { font-family:'Fraunces',serif; font-size:20px; font-weight:900; color:#1e1b4b; margin-bottom:6px; }
                .ms-empty-sub { font-size:14px; color:#9ca3af; }

                @media(max-width:800px){
                    .ms-header,.ms-body { padding:28px 20px; }
                    .ms-thead,.ms-row { grid-template-columns:1fr 1fr 100px; }
                    .ms-date,.ms-reg { display:none; }
                }
            `}</style>

            <div className="ms">
                {/* HEADER */}
                <div className="ms-header">
                    <div className="ms-header-inner">
                        <div className="ms-tag"><span className="ms-tag-dot" />Admin Panel</div>
                        <h1 className="ms-title">Manage <em>Sessions</em></h1>
                        <p className="ms-sub">{sessions.length} session{sessions.length !== 1 ? "s" : ""} found</p>
                    </div>
                </div>

                <div className="ms-body">
                    {sessions.length === 0 ? (
                        <div className="ms-table-wrap">
                            <div className="ms-empty">
                                <div className="ms-empty-icon">📭</div>
                                <div className="ms-empty-title">No sessions yet</div>
                                <p className="ms-empty-sub">Upcoming quiz sessions will appear here.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="ms-table-wrap">
                            <div className="ms-thead">
                                <span>Subject</span>
                                <span>Topic</span>
                                <span>Scheduled At</span>
                                <span>Registered</span>
                                <span>Status</span>
                                <span>Action</span>
                            </div>
                            {sessions.map((session) => (
                                <div key={session.id} className="ms-row">
                                    <span className="ms-subject">{session.subject_name}</span>
                                    <span className="ms-topic">{session.topic_name}</span>
                                    <span className="ms-date">
                                        {new Date(session.scheduled_at).toLocaleString("en-IN", {
                                            timeZone: "Asia/Kolkata",
                                            dateStyle: "medium",
                                            timeStyle: "short"
                                        })}
                                    </span>
                                    <span className="ms-reg">{session.registered_count} users</span>
                                    <span>
                                        {session.status === "active" ? (
                                            <span className="ms-badge active">
                                                <span className="ms-live-dot" />Live
                                            </span>
                                        ) : (
                                            <span className="ms-badge upcoming">⏰ Upcoming</span>
                                        )}
                                    </span>
                                    <span>
                                        {session.status === "upcoming" ? (
                                            <button
                                                className="ms-btn"
                                                onClick={() => handleOpen(session.id)}
                                                disabled={opening === session.id}
                                            >
                                                {opening === session.id ? "Opening…" : "Open Now →"}
                                            </button>
                                        ) : (
                                            <span className="ms-opened">✓ Opened</span>
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}