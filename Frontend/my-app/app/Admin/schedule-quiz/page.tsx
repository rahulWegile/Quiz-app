"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const API = process.env.NEXT_PUBLIC_API_URL

interface Subject { subject_id: string; name: string }
interface Topic { topic_id: string; name: string }

export default function ScheduleQuiz() {
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [topics, setTopics] = useState<Topic[]>([])
    const [selectedSubject, setSelectedSubject] = useState("")
    const [selectedTopic, setSelectedTopic] = useState("")
    const [scheduledAt, setScheduledAt] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(null)
    const router = useRouter()

    const getToken = () => document.cookie.split(";").find((r) => r.trim().startsWith("session_token="))?.split("=")[1]

    const showToast = (msg: string, error = false) => {
        setToast({ msg, error })
        setTimeout(() => setToast(null), 3000)
    }

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const token = getToken()
                if (!token) { router.push("/Auth/signIn"); return }
                const res = await fetch(`${API}/api/subjects`, { headers: { Authorization: `Bearer ${token}` } })
                const data = await res.json()
                setSubjects(data.data)
            } catch { setError("Failed to fetch subjects") }
        }
        fetchSubjects()
    }, [])

    useEffect(() => {
        if (!selectedSubject) return
        const fetchTopics = async () => {
            try {
                const token = getToken()
                const res = await fetch(`${API}/api/subjects/${selectedSubject}/topics`, { headers: { Authorization: `Bearer ${token}` } })
                const data = await res.json()
                setTopics(data.data)
                setSelectedTopic("")
            } catch { setError("Failed to fetch topics") }
        }
        fetchTopics()
    }, [selectedSubject])

    const handleSubmit = async () => {
        if (!selectedTopic || !scheduledAt) { showToast("Please select a topic and time", true); return }
        setLoading(true)
        try {
            const token = getToken()
            const res = await fetch(`${API}/api/quiz/schedule`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ topic_id: selectedTopic, scheduled_at: scheduledAt + "+05:30" })
            })
            const data = await res.json()
            if (!data.success) { showToast(data.message || "Failed to schedule", true); setLoading(false); return }
            showToast("Quiz scheduled successfully! 🎉")
            setSelectedSubject(""); setSelectedTopic(""); setScheduledAt(""); setTopics([])
        } catch { showToast("Something went wrong", true) }
        setLoading(false)
    }

    if (error) return <div style={{ textAlign: "center", padding: 60, background: "#eef2ff", minHeight: "60vh" }}><p style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 800, color: "#1e1b4b" }}>{error}</p></div>

    const selectedSubjectName = subjects.find(s => s.subject_id === selectedSubject)?.name
    const selectedTopicName = topics.find(t => t.topic_id === selectedTopic)?.name

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,700&display=swap');
                .sq{font-family:'Outfit',sans-serif;background:#eef2ff;min-height:100vh;color:#1e1b4b;}
                .sq *{box-sizing:border-box;margin:0;padding:0;}

                .sq-header{background:linear-gradient(160deg,#e0e7ff 0%,#f5f3ff 100%);padding:48px 60px 40px;border-bottom:1px solid #c7d2fe;position:relative;overflow:hidden;}
                .sq-header::before{content:'';position:absolute;inset:0;background-image:radial-gradient(circle,rgba(99,102,241,0.06) 1.5px,transparent 1.5px);background-size:24px 24px;pointer-events:none;}
                .sq-header-inner{max-width:640px;margin:0 auto;position:relative;z-index:1;}
                .sq-tag{display:inline-flex;align-items:center;gap:7px;background:#fff;border:1.5px solid #c7d2fe;color:#6366f1;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:5px 12px;border-radius:100px;margin-bottom:14px;box-shadow:0 2px 8px rgba(99,102,241,.1);}
                .sq-title{font-family:'Fraunces',serif;font-size:clamp(28px,4vw,42px);font-weight:900;color:#1e1b4b;letter-spacing:-.02em;line-height:1.05;}
                .sq-title em{font-style:italic;background:linear-gradient(135deg,#6366f1,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
                .sq-sub{font-size:14px;color:#6b7280;margin-top:6px;}

                .sq-body{max-width:640px;margin:0 auto;padding:40px 60px 80px;}

                /* FORM CARD */
                .sq-card{background:#fff;border-radius:24px;border:1.5px solid #e0e7ff;box-shadow:0 4px 20px rgba(99,102,241,.08);overflow:hidden;}
                .sq-card-top{height:4px;background:linear-gradient(90deg,#6366f1,#ec4899,#14b8a6);}
                .sq-card-body{padding:32px;}

                .sq-field{margin-bottom:22px;}
                .sq-label{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;margin-bottom:8px;}
                .sq-label-icon{font-size:14px;}

                .sq-select, .sq-input {
                    width:100%;padding:13px 16px;
                    border:1.5px solid #e0e7ff;border-radius:12px;
                    font-family:'Outfit',sans-serif;font-size:15px;font-weight:500;
                    color:#1e1b4b;background:#fafbff;
                    transition:all .18s;outline:none;
                    appearance:none;-webkit-appearance:none;
                }
                .sq-select:focus,.sq-input:focus{border-color:#a5b4fc;background:#fff;box-shadow:0 0 0 3px rgba(99,102,241,.1);}
                .sq-select:disabled{opacity:.5;cursor:not-allowed;background:#f9fafb;}

                .sq-select-wrap{position:relative;}
                .sq-select-wrap::after{content:'▾';position:absolute;right:14px;top:50%;transform:translateY(-50%);color:#9ca3af;pointer-events:none;font-size:14px;}

                /* PREVIEW */
                .sq-preview{background:#fafbff;border:1.5px solid #e0e7ff;border-radius:14px;padding:16px 18px;margin-bottom:22px;}
                .sq-preview-label{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9ca3af;margin-bottom:10px;}
                .sq-preview-row{display:flex;align-items:center;gap:10px;margin-bottom:6px;}
                .sq-preview-row:last-child{margin-bottom:0;}
                .sq-preview-chip{font-size:12px;font-weight:700;padding:3px 10px;border-radius:100px;border:1px solid;}
                .sq-preview-val{font-size:13px;color:#6b7280;}

                /* SUBMIT */
                .sq-submit{width:100%;padding:15px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:14px;font-family:'Fraunces',serif;font-size:17px;font-weight:900;cursor:pointer;transition:all .2s;box-shadow:0 6px 18px rgba(99,102,241,.3);letter-spacing:-.01em;}
                .sq-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 26px rgba(99,102,241,.4);}
                .sq-submit:disabled{opacity:.6;cursor:not-allowed;}

                /* TOAST */
                .sq-toast{position:fixed;top:24px;right:24px;padding:12px 20px;border-radius:12px;font-size:13px;font-weight:600;z-index:100;animation:sqtin .3s ease;border:1.5px solid;}
                @keyframes sqtin{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);}}
                .sq-toast.ok{background:#f0fdf4;color:#0d9488;border-color:#99f6e4;}
                .sq-toast.err{background:#fdf2f8;color:#ec4899;border-color:#fbcfe8;}

                /* INFO CARDS */
                .sq-info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;}
                .sq-info-card{background:#fff;border-radius:16px;padding:18px;border:1.5px solid #e0e7ff;box-shadow:0 2px 8px rgba(99,102,241,.05);}
                .sq-info-icon{font-size:22px;margin-bottom:8px;}
                .sq-info-title{font-family:'Fraunces',serif;font-size:14px;font-weight:800;color:#1e1b4b;margin-bottom:3px;}
                .sq-info-desc{font-size:12px;color:#9ca3af;line-height:1.4;}

                @media(max-width:680px){.sq-header,.sq-body{padding:32px 24px;}.sq-info-grid{grid-template-columns:1fr;}}
            `}</style>

            <div className="sq">
                {toast && <div className={`sq-toast ${toast.error ? "err" : "ok"}`}>{toast.error ? "⚠️ " : "✅ "}{toast.msg}</div>}

                <div className="sq-header">
                    <div className="sq-header-inner">
                        <div className="sq-tag">⚙️ Admin Panel</div>
                        <h1 className="sq-title">Schedule a <em>Quiz</em></h1>
                        <p className="sq-sub">Pick a topic and set a time — players will be notified</p>
                    </div>
                </div>

                <div className="sq-body">
                    {/* INFO CARDS */}
                    <div className="sq-info-grid">
                        {[
                            { icon: "📅", title: "Live Sessions", desc: "Scheduled quizzes go live automatically at the set time" },
                            { icon: "🔒", title: "Registration Closes", desc: "Players can't join 2 minutes before the session starts" },
                            { icon: "⏱️", title: "20s Per Question", desc: "Each player gets 20 seconds to answer each question" },
                            { icon: "🏆", title: "Auto Leaderboard", desc: "Results appear 2 minutes after the session ends" },
                        ].map((c, i) => (
                            <div key={i} className="sq-info-card">
                                <div className="sq-info-icon">{c.icon}</div>
                                <div className="sq-info-title">{c.title}</div>
                                <div className="sq-info-desc">{c.desc}</div>
                            </div>
                        ))}
                    </div>

                    {/* FORM */}
                    <div className="sq-card">
                        <div className="sq-card-top" />
                        <div className="sq-card-body">

                            <div className="sq-field">
                                <div className="sq-label"><span className="sq-label-icon">📚</span>Subject</div>
                                <div className="sq-select-wrap">
                                    <select className="sq-select" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                                        <option value="">Choose a subject…</option>
                                        {subjects.map(s => <option key={s.subject_id} value={s.subject_id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="sq-field">
                                <div className="sq-label"><span className="sq-label-icon">🎯</span>Topic</div>
                                <div className="sq-select-wrap">
                                    <select className="sq-select" value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)} disabled={!selectedSubject}>
                                        <option value="">{selectedSubject ? "Choose a topic…" : "Select a subject first"}</option>
                                        {topics.map(t => <option key={t.topic_id} value={t.topic_id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="sq-field">
                                <div className="sq-label"><span className="sq-label-icon">⏰</span>Date & Time (IST)</div>
                                <input className="sq-input" type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
                            </div>

                            {/* PREVIEW */}
                            {(selectedSubjectName || selectedTopicName || scheduledAt) && (
                                <div className="sq-preview">
                                    <div className="sq-preview-label">Quiz Preview</div>
                                    {selectedSubjectName && (
                                        <div className="sq-preview-row">
                                            <span className="sq-preview-chip" style={{ background: "#eef2ff", color: "#6366f1", borderColor: "#c7d2fe" }}>Subject</span>
                                            <span className="sq-preview-val">{selectedSubjectName}</span>
                                        </div>
                                    )}
                                    {selectedTopicName && (
                                        <div className="sq-preview-row">
                                            <span className="sq-preview-chip" style={{ background: "#fdf2f8", color: "#ec4899", borderColor: "#fbcfe8" }}>Topic</span>
                                            <span className="sq-preview-val">{selectedTopicName}</span>
                                        </div>
                                    )}
                                    {scheduledAt && (
                                        <div className="sq-preview-row">
                                            <span className="sq-preview-chip" style={{ background: "#f0fdf4", color: "#14b8a6", borderColor: "#99f6e4" }}>Time</span>
                                            <span className="sq-preview-val">{new Date(scheduledAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button className="sq-submit" onClick={handleSubmit} disabled={loading}>
                                {loading ? "Scheduling…" : "🗓️ Schedule Quiz"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}