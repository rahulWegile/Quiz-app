"use client"
import { useEffect, useState } from "react"
import { PieChart, Pie, Cell } from "recharts"

const API = process.env.NEXT_PUBLIC_API_URL

interface User {
  id: string
  name: string
  email: string
  profile_url: string | null
  verification_code: string | null
  gender: string
}

interface Stats {
  total_questions: number
  total_attempts: number
  total_users: number
}

interface AccuracyData {
  correct: number
  total: number
  accuracy: number
}

interface UpcomingSession {
  id: string
  topic_name: string
  subject_name: string
  scheduled_at: string
  status: string
  registered_count: number
}

const getInitials = (name: string) => {
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const formatCountdown = (scheduledAt: string, now: Date) => {
  const diff = new Date(scheduledAt).getTime() - now.getTime()
  if (diff <= 0) return "🚀 Starting now!"
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  if (h > 0) return `⏰ ${h}h ${m}m`
  if (m > 0) return `⏰ ${m}m ${s}s`
  return `⚡ ${s}s`
}

const EMOJIS = ["🦄", "🐸", "🐼", "🦊", "🐙", "🐬", "🦁", "🐨", "🐯", "🦋"]

function AccuracyDonut({ accuracy, correct, total }: { accuracy: number; correct: number; total: number }) {
  const [animated, setAnimated] = useState(0)

  useEffect(() => {
    if (accuracy === 0) return
    let frame = 0
    const steps = 60
    const timer = setInterval(() => {
      frame++
      setAnimated(Math.round((accuracy * frame) / steps))
      if (frame >= steps) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [accuracy])

  const data = [
    { name: "Correct", value: animated },
    { name: "Wrong", value: 100 - animated },
  ]

  const color = animated >= 80 ? "#6ee7b7" : animated >= 50 ? "#6ec6f5" : "#ff8a70"
  const label = animated >= 80 ? "🌟 Amazing!" : animated >= 60 ? "👍 Great!" : animated >= 40 ? "💪 Keep going!" : "🔥 Practice more!"

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <PieChart width={180} height={180}>
          <Pie data={data} cx={90} cy={90} innerRadius={58} outerRadius={82} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
            <Cell fill={color} />
            <Cell fill="#e2e8f0" />
          </Pie>
        </PieChart>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" }}>
          <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: "30px", color, lineHeight: 1, transition: "color 0.3s" }}>{animated}%</div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>accuracy</div>
        </div>
      </div>
      <div style={{ marginTop: "4px", fontSize: "15px", fontWeight: 800, color: "#475569" }}>{label}</div>
      <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "14px" }}>
        <div style={{ background: "linear-gradient(135deg,#d1fae5,#ecfdf5)", border: "2px solid #6ee7b7", borderRadius: "12px", padding: "8px 16px", textAlign: "center" }}>
          <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: "20px", color: "#059669" }}>{correct}</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#6ee7b7", textTransform: "uppercase", letterSpacing: "0.06em" }}>Correct ✅</div>
        </div>
        <div style={{ background: "linear-gradient(135deg,#fee2e2,#fff1f2)", border: "2px solid #fca5a5", borderRadius: "12px", padding: "8px 16px", textAlign: "center" }}>
          <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: "20px", color: "#dc2626" }}>{total - correct}</div>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#fca5a5", textTransform: "uppercase", letterSpacing: "0.06em" }}>Wrong ❌</div>
        </div>
      </div>
    </div>
  )
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --sky:#6ec6f5; --sky-dark:#45aee8;
    --mint:#6ee7b7; --mint-dark:#34d399;
    --lemon:#fde68a; --lemon-dark:#fbbf24;
    --coral:#ff8a70; --coral-dark:#f96a4a;
    --lilac:#c4b5fd; --lilac-dark:#a78bfa;
    --pink:#f9a8d4;
    --bg:#f0f9ff; --white:#ffffff;
    --ink:#1e293b; --ink-soft:#475569; --ink-light:#94a3b8;
    --radius-xl:24px; --radius-lg:18px; --radius-md:12px; --radius-pill:50px;
  }
  body { background: var(--bg); }
  .page { min-height:100vh; background:var(--bg); font-family:'Nunito',sans-serif; color:var(--ink); position:relative; overflow-x:hidden; }



  .rainbow-bar { height:8px; background:linear-gradient(90deg,#ff8a70,#fde68a,#6ee7b7,#6ec6f5,#c4b5fd,#f9a8d4,#ff8a70); background-size:200% 100%; animation:rainbowShift 4s linear infinite; }
  @keyframes rainbowShift { 0%{background-position:0%;}100%{background-position:200%;} }

  .topnav { position:relative; z-index:10; padding:16px 32px; display:flex; justify-content:space-between; align-items:center; }
  .logo { font-family:'Fredoka One',cursive; font-size:28px; background:linear-gradient(135deg,var(--coral),var(--lemon-dark),var(--mint-dark),var(--sky-dark)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .nav-badge { background:var(--coral); color:white; font-weight:800; font-size:13px; padding:6px 16px; border-radius:var(--radius-pill); box-shadow:0 4px 12px rgba(249,106,74,0.35); animation:pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{transform:scale(1);}50%{transform:scale(1.04);} }

  .main { position:relative; z-index:1; max-width:860px; margin:0 auto; padding:8px 24px 80px; }

  @keyframes cardIn { from{opacity:0;transform:translateY(20px) scale(0.96);}to{opacity:1;transform:translateY(0) scale(1);} }

  /* ── Hero ── */
  .hero-card { background:var(--white); border-radius:var(--radius-xl); padding:32px; margin-bottom:20px; box-shadow:0 8px 32px rgba(110,198,245,0.18),0 2px 8px rgba(0,0,0,0.06); border:3px solid var(--sky); position:relative; overflow:hidden; animation:cardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
  .hero-card::before { content:''; position:absolute; top:0; left:0; right:0; height:5px; background:linear-gradient(90deg,var(--sky),var(--mint),var(--lemon),var(--coral),var(--lilac)); }
  .hero-inner { display:flex; align-items:center; gap:28px; flex-wrap:wrap; }
  .avatar-wrap { position:relative; flex-shrink:0; }
  .avatar-circle { width:100px; height:100px; border-radius:50%; background:linear-gradient(135deg,var(--sky),var(--lilac)); display:flex; align-items:center; justify-content:center; overflow:hidden; border:4px solid var(--white); box-shadow:0 0 0 4px var(--sky),0 8px 24px rgba(110,198,245,0.4); transition:transform 0.2s; }
  .avatar-circle:hover { transform:scale(1.06) rotate(-3deg); }
  .avatar-initials-big { font-family:'Fredoka One',cursive; font-size:38px; color:white; }
  .avatar-emoji { position:absolute; bottom:-4px; right:-4px; width:34px; height:34px; background:var(--lemon); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; border:3px solid white; box-shadow:0 2px 8px rgba(0,0,0,0.1); }
  .hero-info { flex:1; min-width:200px; }
  .hero-name { font-family:'Fredoka One',cursive; font-size:30px; color:var(--ink); margin-bottom:4px; }
  .hero-email { font-size:14px; color:var(--ink-soft); margin-bottom:12px; font-weight:600; }
  .hero-actions { display:flex; gap:10px; flex-wrap:wrap; }

  .btn-primary { background:linear-gradient(135deg,var(--sky-dark),var(--lilac-dark)); color:white; border:none; padding:10px 22px; border-radius:var(--radius-pill); font-size:14px; font-weight:800; font-family:'Nunito',sans-serif; cursor:pointer; box-shadow:0 4px 14px rgba(110,198,245,0.4); transition:transform 0.15s,box-shadow 0.15s; }
  .btn-primary:hover { transform:translateY(-2px) scale(1.03); }
  .btn-ghost { background:transparent; color:var(--ink-soft); border:2.5px solid #e2e8f0; padding:10px 20px; border-radius:var(--radius-pill); font-size:14px; font-weight:700; font-family:'Nunito',sans-serif; cursor:pointer; transition:border-color 0.15s,color 0.15s,transform 0.15s; }
  .btn-ghost:hover { border-color:var(--sky); color:var(--sky-dark); transform:translateY(-1px); }
  .btn-upload-fun { background:linear-gradient(135deg,var(--mint),var(--sky)); color:white; border:none; padding:8px 18px; border-radius:var(--radius-pill); font-size:13px; font-weight:800; font-family:'Nunito',sans-serif; cursor:pointer; display:inline-block; transition:transform 0.15s; box-shadow:0 4px 12px rgba(110,231,183,0.4); }
  .btn-upload-fun:hover { transform:scale(1.05); }

  /* ── My Info — FULL WIDTH inline layout ── */
  .info-card-inner { display:grid; grid-template-columns:1fr 1fr 1fr; gap:24px; }
  @media (max-width:640px) { .info-card-inner { grid-template-columns:1fr; } }

  /* ── Two column grid for stats + upcoming + accuracy ── */
  .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; }
  @media (max-width:600px) { .grid-2 { grid-template-columns:1fr; } }

  /* ── Card base ── */
  .fun-card { background:var(--white); border-radius:var(--radius-xl); box-shadow:0 6px 24px rgba(0,0,0,0.07); overflow:hidden; animation:cardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
  .fun-card:nth-child(2) { animation-delay:0.08s; }
  .full-card { margin-bottom:20px; }
  .card-top { height:10px; }
  .card-top.sky   { background:linear-gradient(90deg,var(--sky),var(--mint)); }
  .card-top.coral { background:linear-gradient(90deg,var(--coral),var(--lemon)); }
  .card-top.lilac { background:linear-gradient(90deg,var(--lilac),var(--pink)); }
  .card-top.mint  { background:linear-gradient(90deg,var(--mint),var(--lemon)); }
  .card-top.peach { background:linear-gradient(90deg,#fbbf24,#f97316,#ec4899); }
  .card-pad { padding:22px 24px 24px; }
  .section-title { font-family:'Fredoka One',cursive; font-size:18px; color:var(--ink); margin-bottom:16px; display:flex; align-items:center; gap:8px; }

  /* ── Stats ── */
  .stat-row { display:flex; flex-direction:column; gap:12px; }
  .stat-bubble { display:flex; align-items:center; gap:14px; padding:14px 18px; border-radius:var(--radius-lg); transition:transform 0.15s; }
  .stat-bubble:hover { transform:translateX(4px); }
  .stat-bubble.blue   { background:linear-gradient(135deg,#dbeafe,#e0f2fe); }
  .stat-bubble.green  { background:linear-gradient(135deg,#d1fae5,#ecfdf5); }
  .stat-bubble.yellow { background:linear-gradient(135deg,#fef9c3,#fefce8); }
  .stat-icon { width:44px; height:44px; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
  .stat-icon.blue   { background:linear-gradient(135deg,var(--sky),var(--sky-dark)); }
  .stat-icon.green  { background:linear-gradient(135deg,var(--mint),var(--mint-dark)); }
  .stat-icon.yellow { background:linear-gradient(135deg,var(--lemon),var(--lemon-dark)); }
  .stat-num { font-family:'Fredoka One',cursive; font-size:26px; color:var(--ink); line-height:1; }
  .stat-lbl { font-size:12px; font-weight:700; color:var(--ink-soft); text-transform:uppercase; letter-spacing:0.06em; }

  /* ── Sessions ── */
  .session-pill { display:flex; justify-content:space-between; align-items:center; padding:14px 16px; border-radius:var(--radius-lg); margin-bottom:10px; background:linear-gradient(135deg,#fef3c7,#fffbeb); border:2px solid var(--lemon); transition:transform 0.15s; }
  .session-pill:hover { transform:scale(1.01); }
  .session-pill:last-child { margin-bottom:0; }
  .session-name { font-weight:800; font-size:14px; color:var(--ink); }
  .session-sub  { font-size:12px; color:var(--ink-soft); margin-top:2px; }
  .session-badge { background:var(--coral); color:white; font-size:12px; font-weight:800; padding:5px 12px; border-radius:var(--radius-pill); white-space:nowrap; box-shadow:0 3px 8px rgba(249,106,74,0.35); }
  .no-sessions { text-align:center; padding:20px; color:var(--ink-light); font-size:14px; font-weight:700; }

  /* ── Fields ── */
  .field { margin-bottom:0; }
  .field-lbl { font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; color:var(--ink-soft); margin-bottom:7px; display:block; }
  .field-val { font-size:16px; font-weight:700; color:var(--ink); }
  .field-val.normal-case { text-transform:none; }
  .fun-input { width:100%; padding:12px 16px; border:2.5px solid #e2e8f0; border-radius:var(--radius-md); font-size:15px; font-family:'Nunito',sans-serif; font-weight:600; color:var(--ink); background:#f8fafc; outline:none; transition:border-color 0.2s,box-shadow 0.2s; }
  .fun-input:focus { border-color:var(--sky); box-shadow:0 0 0 4px rgba(110,198,245,0.2); background:white; }
  .fun-input.err { border-color:var(--coral); }
  .fun-select { width:100%; padding:12px 16px; border:2.5px solid #e2e8f0; border-radius:var(--radius-md); font-size:15px; font-family:'Nunito',sans-serif; font-weight:600; color:var(--ink); background:#f8fafc url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236ec6f5' stroke-width='2.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 16px center; outline:none; cursor:pointer; appearance:none; padding-right:42px; transition:border-color 0.2s; }
  .fun-select:focus { border-color:var(--sky); box-shadow:0 0 0 4px rgba(110,198,245,0.2); }
  .verify-btn { background:none; border:none; color:var(--sky-dark); font-size:13px; font-weight:800; font-family:'Nunito',sans-serif; cursor:pointer; padding:0; margin-top:6px; display:inline-flex; align-items:center; gap:4px; text-decoration:underline; text-underline-offset:3px; }
  .pw-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .err-msg { color:#f96a4a; font-size:13px; font-weight:700; margin-top:8px; }

  /* ── Save / Logout ── */
  .save-bar { display:flex; justify-content:flex-end; padding-top:20px; border-top:2px dashed #e2e8f0; margin-top:20px; }
  .btn-save { background:linear-gradient(135deg,var(--coral),var(--lemon-dark)); color:white; border:none; padding:12px 36px; border-radius:var(--radius-pill); font-size:16px; font-weight:900; font-family:'Nunito',sans-serif; cursor:pointer; box-shadow:0 6px 20px rgba(255,138,112,0.45); transition:transform 0.15s,box-shadow 0.15s,opacity 0.15s; }
  .btn-save:hover:not(:disabled) { transform:translateY(-2px) scale(1.04); box-shadow:0 10px 28px rgba(255,138,112,0.55); }
  .btn-save:disabled { opacity:0.6; cursor:not-allowed; }
  .logout-row { display:flex; justify-content:space-between; align-items:center; }
  .logout-info p:first-child { font-weight:800; font-size:15px; margin-bottom:3px; }
  .logout-info p:last-child  { font-size:13px; color:var(--ink-light); font-weight:600; }
  .btn-logout { background:#fff1f2; color:#e11d48; border:2.5px solid #fecdd3; padding:10px 22px; border-radius:var(--radius-pill); font-size:14px; font-weight:800; font-family:'Nunito',sans-serif; cursor:pointer; transition:background 0.15s,transform 0.15s; }
  .btn-logout:hover { background:#ffe4e6; transform:scale(1.04); }

  /* ── Toast / OTP ── */
  .toast { position:fixed; bottom:32px; left:50%; transform:translateX(-50%); background:var(--ink); color:white; padding:12px 28px; border-radius:var(--radius-pill); font-size:14px; font-weight:800; font-family:'Nunito',sans-serif; box-shadow:0 12px 40px rgba(0,0,0,0.2); z-index:9999; animation:toastPop 0.3s cubic-bezier(0.34,1.56,0.64,1); white-space:nowrap; }
  @keyframes toastPop { from{opacity:0;transform:translateX(-50%) scale(0.85) translateY(12px);}to{opacity:1;transform:translateX(-50%) scale(1) translateY(0);} }
  .otp-overlay { position:fixed; inset:0; background:rgba(240,249,255,0.85); backdrop-filter:blur(12px); display:flex; align-items:center; justify-content:center; z-index:2000; }
  .otp-box { background:white; border-radius:var(--radius-xl); padding:48px 40px; max-width:420px; width:90%; text-align:center; border:3px solid var(--sky); box-shadow:0 24px 64px rgba(110,198,245,0.3); animation:cardIn 0.4s cubic-bezier(0.34,1.56,0.64,1); }
  .otp-emoji { font-size:56px; margin-bottom:12px; animation:bounce 1s infinite; display:block; }
  @keyframes bounce { 0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);} }
  .otp-box h2 { font-family:'Fredoka One',cursive; font-size:28px; color:var(--ink); margin-bottom:8px; }
  .otp-box p  { font-size:14px; color:var(--ink-soft); margin-bottom:28px; font-weight:600; }
  .otp-input { width:100%; padding:16px; font-size:32px; text-align:center; letter-spacing:0.5em; border:3px solid var(--sky); border-radius:var(--radius-lg); font-family:'Fredoka One',cursive; color:var(--ink); background:#f0f9ff; outline:none; margin-bottom:20px; transition:border-color 0.2s,box-shadow 0.2s; }
  .otp-input:focus { border-color:var(--sky-dark); box-shadow:0 0 0 4px rgba(110,198,245,0.25); }
  .btn-otp-confirm { width:100%; background:linear-gradient(135deg,var(--sky-dark),var(--mint-dark)); color:white; border:none; padding:14px; border-radius:var(--radius-pill); font-size:17px; font-weight:900; font-family:'Nunito',sans-serif; cursor:pointer; box-shadow:0 6px 20px rgba(110,198,245,0.4); margin-bottom:14px; transition:transform 0.15s; }
  .btn-otp-confirm:hover { transform:scale(1.02); }
  .btn-resend { background:none; border:none; color:var(--ink-soft); font-size:13px; font-weight:700; font-family:'Nunito',sans-serif; cursor:pointer; }
  .btn-resend:disabled { color:var(--ink-light); cursor:default; }
  .skeleton-card { height:180px; border-radius:var(--radius-xl); background:linear-gradient(90deg,#dbeafe 0%,#e0f2fe 50%,#dbeafe 100%); background-size:200% 100%; animation:shimmer 1.5s infinite; margin-bottom:20px; }
  @keyframes shimmer { 0%{background-position:200% 0;}100%{background-position:-200% 0;} }
`

export default function Profile() {
  const [user, setUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [gender, setGender] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<{ msg: string } | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp] = useState("")
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState("")
  const [resendLoading, setResendLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [stats, setStats] = useState<Stats>({ total_questions: 0, total_attempts: 0, total_users: 0 })
  const [accuracyData, setAccuracyData] = useState<AccuracyData>({ correct: 0, total: 0, accuracy: 0 })
  const [upcoming, setUpcoming] = useState<UpcomingSession[]>([])
  const [now, setNow] = useState(new Date())
  const [avatarEmoji] = useState(() => EMOJIS[Math.floor(Math.random() * EMOJIS.length)])

  const getToken = () => {
    const cookie = document.cookie.split(";").find((r) => r.trim().startsWith("session_token="))
    if (!cookie) return undefined
    return cookie.split("=").slice(1).join("=").trim()
  }

  const showToast = (msg: string) => { setToast({ msg }); setTimeout(() => setToast(null), 3000) }
  const startTimer = () => {
    setResendTimer(60)
    const interval = setInterval(() => {
      setResendTimer((prev) => { if (prev <= 1) { clearInterval(interval); return 0 } return prev - 1 })
    }, 1000)
  }

  useEffect(() => {
    const fetchUser = async () => {
      const token = getToken(); if (!token) return
      const res = await fetch(`${API}/api/user`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      const u = data.data
      setUser(u || null)
      if (u) { setName(u.name); setEmail(u.email); setGender(u.gender || "") }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(clock)
  }, [])

  useEffect(() => {
    const fetchAll = async () => {
      const token = getToken()
      const headers = { Authorization: `Bearer ${token}` }
      try { const r = await fetch(`${API}/api/stats`, { headers }); const d = await r.json(); if (d.success) setStats(d.data) } catch (e) { console.error(e) }
      try { const r = await fetch(`${API}/api/accuracy`, { headers }); const d = await r.json(); if (d.success) setAccuracyData(d.data) } catch (e) { console.error(e) }
      try { const r = await fetch(`${API}/api/quiz/upcomingQuizzes`, { headers }); const d = await r.json(); if (d.data) setUpcoming(d.data.slice(0, 3)) } catch (e) { console.error(e) }
    }
    fetchAll()
  }, [])

  const handleProfilePic = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const token = getToken(); if (!token) return
    setUploading(true)
    const formData = new FormData(); formData.append("profile_picture", file)
    const res = await fetch(`${API}/api/updateProfilePic`, { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: formData })
    const data = await res.json()
    if (data.success) { setUser((prev) => prev ? { ...prev, profile_url: data.profile_url } : prev); showToast("🎉 Photo updated!") }
    else showToast("😢 Photo update failed")
    setUploading(false)
  }

  const handleSave = async () => {
    const token = getToken(); if (!token) return
    if (newPassword && currentPassword === newPassword) { setPasswordError("New password must be different!"); return }
    if (newPassword && newPassword !== confirmPassword) { setPasswordError("Passwords don't match!"); return }
    if (newPassword && newPassword.length < 6) { setPasswordError("Min 6 characters needed!"); return }
    if (newPassword && !currentPassword) { setPasswordError("Enter your current password first!"); return }
    setPasswordError(null); setSaving(true)
    const res = await fetch(`${API}/api/update`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, gender, currentPassword: currentPassword || undefined, password: newPassword || undefined, profile_url: user?.profile_url }),
    })
    const data = await res.json()
    if (data.success) {
      setUser(data.data.user); setIsEditing(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
      showToast("🎊 Profile updated!")
    } else if (data.emailVerificationRequired) {
      setUser((prev) => prev ? { ...prev, email: data.email, verification_code: "pending" } : prev)
      setEmail(data.email); setIsEditing(false); setCurrentPassword(""); setNewPassword("")
      showToast("📧 Check your new email!")
    } else {
      setPasswordError(data.message === "Incorrect current password" ? "Wrong current password!" : null)
      if (data.message !== "Incorrect current password") showToast(data.message || "Update failed")
    }
    setSaving(false)
  }

  const handleCancel = () => {
    if (user) { setName(user.name); setEmail(user.email); setGender(user.gender || "") }
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setPasswordError(null); setIsEditing(false)
  }

  const handleSendCode = async () => {
    if (!user) return; setResendLoading(true)
    const res = await fetch(`${API}/api/resendCode`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: user.email }) })
    const data = await res.json()
    if (data.success) { setShowOtp(true); startTimer() }
    setResendLoading(false)
  }

  const handleVerifyOtp = async () => {
    if (!otp || !user) return; setOtpLoading(true)
    const res = await fetch(`${API}/api/verify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ verification_code: otp, email: user.email }) })
    const data = await res.json()
    if (data.success) { setUser((prev) => prev ? { ...prev, verification_code: null } : prev); setShowOtp(false); setOtp(""); showToast("✅ Email verified!") }
    else setOtpError(data.message || "Invalid code!")
    setOtpLoading(false)
  }

  const handleLogout = () => {
    document.cookie = "session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    window.location.href = "/login"
  }

  return (
    <div className="page">
      <style>{css}</style>

      <div className="bg-blobs">
        <div className="blob blob-1" /><div className="blob blob-2" />
        <div className="blob blob-3" /><div className="blob blob-4" />
        <div className="blob blob-5" />
      </div>

      <div className="rainbow-bar" />

      <nav className="topnav">
        <div className="logo">Profile</div>
        <div className="nav-badge">🎮 Play Now!</div>
      </nav>

      {toast && <div className="toast">{toast.msg}</div>}

      <div className="main">
        {!user ? (
          <>
            <div className="skeleton-card" />
            <div className="skeleton-card" style={{ height: "140px", opacity: 0.7 }} />
            <div className="skeleton-card" style={{ height: "200px", opacity: 0.5 }} />
          </>
        ) : (
          <>
            {/* ── Hero ── */}
            <div className="hero-card full-card">
              <div className="hero-inner">
                <div className="avatar-wrap">
                  <div className="avatar-circle">
                    {user.profile_url
                      ? <img src={user.profile_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span className="avatar-initials-big">{getInitials(user.name)}</span>}
                  </div>
                  <div className="avatar-emoji">{avatarEmoji}</div>
                </div>
                <div className="hero-info">
                  <div className="hero-name">Hey, {user.name.split(" ")[0]}! 👋</div>
                  <div className="hero-email">{user.email}</div>
                  <div className="hero-actions">
                    <label className="btn-upload-fun">
                      {uploading ? "⏳ Uploading…" : "Update picture"}
                      <input type="file" hidden onChange={handleProfilePic} />
                    </label>
                    {!isEditing
                      ? <button className="btn-primary" onClick={() => setIsEditing(true)}>✏️ Edit Profile</button>
                      : <button className="btn-ghost" onClick={handleCancel}> Discard</button>}
                    
                  </div>
                </div>
              </div>
            </div>

            {/* ── My Info — FULL WIDTH with 3-column field grid ── */}
            <div className="fun-card full-card">
              <div className="card-top lilac" />
              <div className="card-pad">
                <div className="section-title">🙋 My Info</div>
                <div className="info-card-inner">
                  {/* Name */}
                  <div className="field">
                    <span className="field-lbl">Display Name</span>
                    {isEditing
                      ? <input className="fun-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your cool name" />
                      : <div className="field-val">{user.name}</div>}
                  </div>
                  {/* Email */}
                  <div className="field">
                    <span className="field-lbl">Email</span>
                    {isEditing
                      ? <input className="fun-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
                      : <div className="field-val normal-case">{user.email}</div>}
                    {user.verification_code && !showOtp && (
                      <button className="verify-btn" onClick={handleSendCode}>
                        {resendLoading ? "Sending…" : "📬 Verify email →"}
                      </button>
                    )}
                  </div>
                  {/* Gender */}
                  <div className="field">
                    <span className="field-lbl">Gender</span>
                    {isEditing ? (
                      <select className="fun-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                        <option value="">Pick one…</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    ) : <div className="field-val">{user.gender || "Not set"}</div>}
                  </div>
                </div>
              </div>
            </div>

             {/* ── Security (edit only) ── */}
            {isEditing && (
              <div className="fun-card full-card">
                <div className="card-top mint" />
                <div className="card-pad">
                  <div className="section-title">🔐 Change Password</div>
                  <div style={{ marginBottom: "18px" }}>
                    <span className="field-lbl">Current Password</span>
                    <input type="password" className={`fun-input${passwordError ? " err" : ""}`} placeholder="Current password" value={currentPassword} onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError(null) }} />
                  </div>
                  <div>
                    <div className="pw-grid">
                      <div>
                        <span className="field-lbl">New Password</span>
                        <input type="password" className="fun-input" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                      </div>
                      <div>
                        <span className="field-lbl">Confirm</span>
                        <input type="password" className="fun-input" placeholder="Repeat it!" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                      </div>
                    </div>
                    {passwordError && <div className="err-msg">⚠️ {passwordError}</div>}
                  </div>
                 
                </div>
              </div>
            )}
{isEditing && (
  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
    <button className="btn-save" onClick={handleSave} disabled={saving}>
      {saving ? "⏳ Saving…" : "🚀 Save Changes!"}
    </button>
  </div>
)}
            {/* ── Stats + Accuracy + Upcoming — 3 columns ── */}
            <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>

              {/* Stats */}
              <div className="fun-card">
                <div className="card-top sky" />
                <div className="card-pad">
                  <div className="section-title">🏆 My Stats</div>
                  <div className="stat-row">
                    <div className="stat-bubble blue">
                      <div className="stat-icon blue">❓</div>
                      <div>
                        <div className="stat-num">{stats.total_questions.toLocaleString()}</div>
                        <div className="stat-lbl">Questions</div>
                      </div>
                    </div>
                    <div className="stat-bubble green">
                      <div className="stat-icon green">⚡</div>
                      <div>
                        <div className="stat-num">{stats.total_attempts.toLocaleString()}</div>
                        <div className="stat-lbl">Attempts</div>
                      </div>
                    </div>
                  
                  </div>
                </div>
              </div>

              {/* Accuracy */}
              <div className="fun-card">
                <div className="card-top peach" />
                <div className="card-pad">
                  <div className="section-title">🎯 Accuracy</div>
                  <AccuracyDonut accuracy={accuracyData.accuracy} correct={accuracyData.correct} total={accuracyData.total} />
                </div>
              </div>

              {/* Upcoming */}
              <div className="fun-card">
                <div className="card-top coral" />
                <div className="card-pad">
                  <div className="section-title">📅 Coming Up!</div>
                  {upcoming.length > 0 ? upcoming.map((s) => (
                    <div className="session-pill" key={s.id}>
                      <div>
                        <div className="session-name">{s.topic_name}</div>
                        <div className="session-sub">{s.subject_name} · {s.registered_count} joined</div>
                      </div>
                    </div>
                  )) : <div className="no-sessions">😴 No sessions yet!<br />Check back soon!</div>}
                </div>
              </div>
            </div>

           

           
          </>
        )}
      </div>

      {/* OTP Modal */}
      {showOtp && user && (
        <div className="otp-overlay">
          <div className="otp-box">
            <span className="otp-emoji">📬</span>
            <h2>Check Your Email!</h2>
            <p>We sent a secret code to<br /><strong>{user.email}</strong></p>
            <input className="otp-input" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="· · · · · ·" maxLength={6} />
            {otpError && <div className="err-msg" style={{ marginBottom: "12px" }}>⚠️ {otpError}</div>}
            <button className="btn-otp-confirm" onClick={handleVerifyOtp}>
              {otpLoading ? "⏳ Checking…" : "✅ Confirm Code!"}
            </button>
            <button className="btn-resend" onClick={handleSendCode} disabled={resendTimer > 0}>
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}