"use client"
import { useEffect, useState, useMemo } from "react"

const API = process.env.NEXT_PUBLIC_API_URL

interface Entry {
    name: string; profile_url: string | null; score: number
    time_taken: number; topic_name: string; subject_name: string; submitted_at: string
}
interface Subject { subject_id: string; name: string }

const AVATAR_COLORS = [
    { bg: "#eef2ff", color: "#6366f1", border: "#c7d2fe" },
    { bg: "#fdf2f8", color: "#ec4899", border: "#fbcfe8" },
    { bg: "#f0fdf4", color: "#14b8a6", border: "#99f6e4" },
    { bg: "#fff7ed", color: "#f97316", border: "#fed7aa" },
    { bg: "#fffbeb", color: "#f59e0b", border: "#fde68a" },
    { bg: "#f5f3ff", color: "#8b5cf6", border: "#ddd6fe" },
]

function getInitials(name: string) {
    const parts = name.trim().split(" ").filter(Boolean)
    if (parts.length === 1) return parts[0][0]?.toUpperCase()
    return (parts[0][0] || "").toUpperCase() + (parts[parts.length - 1][0] || "").toUpperCase()
}

export default function Leaderboard() {
    const [entries, setEntries] = useState<Entry[]>([])
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [selectedSubject, setSelectedSubject] = useState("All")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetch(`${API}/api/leaderboard`).then(r => r.json()).then(d => { setEntries(d.data || []); setLoading(false) })
            .catch(() => { setError("Failed to load leaderboard"); setLoading(false) })
    }, [])

    useEffect(() => {
    const token = document.cookie
        .split(";")
        .find(r => r.trim().startsWith("session_token="))
        ?.split("=")[1]

    fetch(`${API}/api/getSubjects`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
        .then(r => r.json())
        .then(d => setSubjects(d.data || []))
        .catch(console.error)
}, [])
    const filtered = useMemo(() => selectedSubject === "All" ? entries : entries.filter(e => e.subject_name === selectedSubject), [entries, selectedSubject])
    const top3 = filtered.slice(0, 3)

    if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", background: "#eef2ff" }}><div className="lb-spinner" /></div>
    if (error) return <div style={{ textAlign: "center", padding: 60, background: "#eef2ff", minHeight: "60vh" }}><div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div><p style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 800, color: "#1e1b4b" }}>{error}</p></div>

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,700&display=swap');
                .lb{font-family:'Outfit',sans-serif;background:#eef2ff;min-height:100vh;color:#1e1b4b;}
                .lb *{box-sizing:border-box;margin:0;padding:0;}

                .lb-header{background:linear-gradient(160deg,#e0e7ff 0%,#f5f3ff 100%);padding:48px 60px 40px;border-bottom:1px solid #c7d2fe;position:relative;overflow:hidden;}
                .lb-header::before{content:'';position:absolute;inset:0;background-image:radial-gradient(circle,rgba(99,102,241,0.06) 1.5px,transparent 1.5px);background-size:24px 24px;pointer-events:none;}
                .lb-header-inner{max-width:960px;margin:0 auto;position:relative;z-index:1;display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap;}

                .lb-tag{display:inline-flex;align-items:center;gap:7px;background:#fff;border:1.5px solid #c7d2fe;color:#6366f1;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:5px 12px;border-radius:100px;margin-bottom:14px;box-shadow:0 2px 8px rgba(99,102,241,.1);}
                .lb-tag-dot{width:6px;height:6px;background:#6366f1;border-radius:50%;animation:lbp 2s infinite;}
                @keyframes lbp{0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.4);}50%{box-shadow:0 0 0 5px rgba(99,102,241,0);}}
                .lb-title{font-family:'Fraunces',serif;font-size:clamp(28px,4vw,44px);font-weight:900;color:#1e1b4b;letter-spacing:-.02em;line-height:1.05;}
                .lb-title em{font-style:italic;background:linear-gradient(135deg,#6366f1,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
                .lb-sub{font-size:14px;color:#6b7280;margin-top:6px;}

                .lb-filters{display:flex;gap:8px;flex-wrap:wrap;}
                .lb-fbtn{padding:8px 16px;border-radius:100px;font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;border:1.5px solid #e0e7ff;background:#fff;color:#6b7280;cursor:pointer;transition:all .18s;}
                .lb-fbtn:hover{border-color:#a5b4fc;color:#6366f1;}
                .lb-fbtn.on{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-color:transparent;box-shadow:0 4px 12px rgba(99,102,241,.3);}

                .lb-body{max-width:960px;margin:0 auto;padding:40px 60px 80px;}

                /* PODIUM */
                .lb-podium{display:grid;grid-template-columns:1fr 1.15fr 1fr;gap:12px;margin-bottom:36px;align-items:end;}
                .lb-pod{background:#fff;border-radius:20px;padding:24px 16px;text-align:center;border:1.5px solid #e0e7ff;box-shadow:0 2px 12px rgba(99,102,241,.08);position:relative;overflow:hidden;transition:all .2s;}
                .lb-pod::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;border-radius:20px 20px 0 0;}
                .lb-pod:hover{transform:translateY(-3px);box-shadow:0 12px 28px rgba(99,102,241,.14);}
                .lb-pod.p1{padding:34px 16px;}
                .lb-pod-emoji{font-size:28px;margin-bottom:10px;}
                .lb-pod.p1 .lb-pod-emoji{font-size:38px;}
                .lb-pod-av{width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-size:15px;font-weight:900;margin:0 auto 10px;border:2.5px solid;}
                .lb-pod.p1 .lb-pod-av{width:58px;height:58px;font-size:18px;}
                .lb-pod-name{font-family:'Fraunces',serif;font-size:14px;font-weight:900;color:#1e1b4b;margin-bottom:4px;}
                .lb-pod.p1 .lb-pod-name{font-size:17px;}
                .lb-pod-score{font-family:'Fraunces',serif;font-size:20px;font-weight:900;}
                .lb-pod.p1 .lb-pod-score{font-size:26px;}
                .lb-pod-time{font-size:11px;color:#9ca3af;margin-top:3px;}

                /* TABLE */
                .lb-eyebrow{font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#6366f1;margin-bottom:6px;}
                .lb-sec-title{font-family:'Fraunces',serif;font-size:22px;font-weight:900;color:#1e1b4b;margin-bottom:16px;}
                .lb-table{background:#fff;border-radius:20px;border:1.5px solid #e0e7ff;overflow:hidden;box-shadow:0 2px 12px rgba(99,102,241,.06);}
                .lb-thead{display:grid;grid-template-columns:60px 1fr 130px 120px 80px 90px;padding:12px 20px;border-bottom:1px solid #f3f4f6;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9ca3af;background:#fafbff;}
                .lb-row{display:grid;grid-template-columns:60px 1fr 130px 120px 80px 90px;padding:14px 20px;align-items:center;border-bottom:1px solid #f9fafb;transition:background .15s;position:relative;}
                .lb-row:last-child{border-bottom:none;}
                .lb-row:hover{background:#fafbff;}
                .lb-row.gold{background:rgba(245,158,11,.04);}
                .lb-row.silver{background:rgba(156,163,175,.04);}
                .lb-row.bronze{background:rgba(249,115,22,.04);}
                .lb-rank{font-family:'Fraunces',serif;font-size:17px;font-weight:900;}
                .lb-player{display:flex;align-items:center;gap:10px;}
                .lb-av{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;font-family:'Fraunces',serif;flex-shrink:0;border:2px solid;}
                .lb-name{font-size:14px;font-weight:600;color:#1e1b4b;}
                .lb-chip{display:inline-flex;align-items:center;font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;border:1px solid;}
                .lb-topic{font-size:13px;color:#6b7280;}
                .lb-score{font-family:'Fraunces',serif;font-size:16px;font-weight:900;color:#6366f1;}
                .lb-time{font-size:13px;color:#9ca3af;font-variant-numeric:tabular-nums;}

                .lb-empty{text-align:center;padding:56px;background:#fff;border-radius:20px;border:1.5px solid #e0e7ff;}
                .lb-empty-icon{font-size:48px;margin-bottom:14px;}
                .lb-empty-title{font-family:'Fraunces',serif;font-size:22px;font-weight:900;color:#1e1b4b;margin-bottom:8px;}
                .lb-empty-sub{font-size:14px;color:#9ca3af;}

                .lb-spinner{width:36px;height:36px;border:3px solid #e0e7ff;border-top-color:#6366f1;border-radius:50%;animation:lbs .8s linear infinite;}
                @keyframes lbs{to{transform:rotate(360deg);}}

                @media(max-width:800px){
                    .lb-header,.lb-body{padding:32px 24px;}
                    .lb-podium{grid-template-columns:1fr;}
                    .lb-thead,.lb-row{grid-template-columns:50px 1fr 80px 80px;}
                    .lb-chip,.lb-topic{display:none;}
                }
            `}</style>

            <div className="lb">
                <div className="lb-header">
                    <div className="lb-header-inner">
                        <div>
                            <div className="lb-tag"><span className="lb-tag-dot" />Global Rankings</div>
                            <h1 className="lb-title">The <em>Leaderboard</em></h1>
                            <p className="lb-sub">Top players sorted by score & speed</p>
                        </div>
                        <div className="lb-filters">
                            <button className={`lb-fbtn${selectedSubject === "All" ? " on" : ""}`} onClick={() => setSelectedSubject("All")}>All</button>
                            {subjects.map(s => (
                                <button key={s.subject_id} className={`lb-fbtn${selectedSubject === s.name ? " on" : ""}`} onClick={() => setSelectedSubject(s.name)}>{s.name}</button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lb-body">
                    {/* PODIUM */}
                    {top3.length >= 3 && (
                        <div className="lb-podium">
                            {/* 2nd */}
                            <div className="lb-pod">
                                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,#9ca3af,#d1d5db)", borderRadius: "20px 20px 0 0" }} />
                                <div className="lb-pod-emoji">🥈</div>
                                <div className="lb-pod-av" style={{ background: "#f9fafb", color: "#9ca3af", borderColor: "#e5e7eb" }}>{getInitials(top3[1]?.name)}</div>
                                <div className="lb-pod-name">{top3[1]?.name}</div>
                                <div className="lb-pod-score" style={{ color: "#9ca3af" }}>{top3[1]?.score}/10</div>
                                <div className="lb-pod-time">{Math.floor(top3[1]?.time_taken / 60)}m {top3[1]?.time_taken % 60}s</div>
                            </div>
                            {/* 1st */}
                            <div className="lb-pod p1">
                                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,#f59e0b,#fcd34d)", borderRadius: "20px 20px 0 0" }} />
                                <div className="lb-pod-emoji">🥇</div>
                                <div className="lb-pod-av" style={{ background: "#fffbeb", color: "#f59e0b", borderColor: "#fde68a" }}>{getInitials(top3[0]?.name)}</div>
                                <div className="lb-pod-name">{top3[0]?.name}</div>
                                <div className="lb-pod-score" style={{ color: "#f59e0b" }}>{top3[0]?.score}/10</div>
                                <div className="lb-pod-time">{Math.floor(top3[0]?.time_taken / 60)}m {top3[0]?.time_taken % 60}s</div>
                            </div>
                            {/* 3rd */}
                            <div className="lb-pod">
                                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,#f97316,#fb923c)", borderRadius: "20px 20px 0 0" }} />
                                <div className="lb-pod-emoji">🥉</div>
                                <div className="lb-pod-av" style={{ background: "#fff7ed", color: "#f97316", borderColor: "#fed7aa" }}>{getInitials(top3[2]?.name)}</div>
                                <div className="lb-pod-name">{top3[2]?.name}</div>
                                <div className="lb-pod-score" style={{ color: "#f97316" }}>{top3[2]?.score}/10</div>
                                <div className="lb-pod-time">{Math.floor(top3[2]?.time_taken / 60)}m {top3[2]?.time_taken % 60}s</div>
                            </div>
                        </div>
                    )}

                    <div className="lb-eyebrow">Rankings</div>
                    <div className="lb-sec-title">All Entries</div>

                    {filtered.length > 0 ? (
                        <div className="lb-table">
                            <div className="lb-thead"><span>Rank</span><span>Player</span><span>Subject</span><span>Topic</span><span>Score</span><span>Time</span></div>
                            {filtered.map((entry, i) => {
                                const ac = AVATAR_COLORS[i % AVATAR_COLORS.length]
                                const rc = i === 0 ? " gold" : i === 1 ? " silver" : i === 2 ? " bronze" : ""
                                return (
                                    <div key={i} className={`lb-row${rc}`}>
                                        <span className="lb-rank">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</span>
                                        <div className="lb-player">
                                            <div className="lb-av" style={{ background: ac.bg, color: ac.color, borderColor: ac.border }}>{getInitials(entry.name)}</div>
                                            <span className="lb-name">{entry.name}</span>
                                        </div>
                                        <span><span className="lb-chip" style={{ background: ac.bg, color: ac.color, borderColor: ac.border }}>{entry.subject_name}</span></span>
                                        <span className="lb-topic">{entry.topic_name}</span>
                                        <span className="lb-score">{entry.score}/10</span>
                                        <span className="lb-time">{Math.floor(entry.time_taken / 60)}m {String(entry.time_taken % 60).padStart(2, "0")}s</span>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="lb-empty">
                            <div className="lb-empty-icon">🏆</div>
                            <div className="lb-empty-title">No entries yet</div>
                            <p className="lb-empty-sub">Be the first to complete a quiz and claim the top spot!</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}