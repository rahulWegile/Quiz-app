"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"

const API = process.env.NEXT_PUBLIC_API_URL

function PaymentContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const sessionId = searchParams.get("session_id")
    const mode = searchParams.get("mode")
    const [loading, setLoading] = useState(false)

    const getToken = () =>
        document.cookie
            .split(";")
            .find((row) => row.trim().startsWith("session_token="))
            ?.split("=")[1]

    const handlePay = async () => {
        if (!sessionId) return
        setLoading(true)
        try {
            const token = getToken()
            const res = await fetch(`${API}/api/payment`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ session_id: sessionId, mode: mode || "" })
            })
            const data = await res.json()
            if (data.success) {
                window.location.href = data.url
            } else {
                setLoading(false)
            }
        } catch {
            setLoading(false)
        }
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900&display=swap');
                .pay-page { font-family:'Outfit',sans-serif; min-height:100vh; background:#eef2ff; display:flex; align-items:center; justify-content:center; padding:24px; }
                .pay-page * { box-sizing:border-box; margin:0; padding:0; }

                .pay-card { background:#fff; border-radius:24px; border:1.5px solid #e0e7ff; box-shadow:0 4px 24px rgba(99,102,241,0.1); max-width:420px; width:100%; overflow:hidden; }
                .pay-stripe { height:4px; background:linear-gradient(90deg,#6366f1,#a78bfa,#ec4899); }
                .pay-body { padding:40px 36px 32px; text-align:center; }

                .pay-logo { font-size:22px; font-weight:900; color:#1e1b4b; margin-bottom:24px; letter-spacing:-0.3px; }
                .pay-logo span { color:#6366f1; }

                .pay-icon { width:60px; height:60px; background:#eef2ff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:26px; margin:0 auto 20px; }

                .pay-title { font-family:'Fraunces',serif; font-size:22px; font-weight:900; color:#1e1b4b; margin-bottom:6px; }
                .pay-sub { font-size:13px; color:#9ca3af; margin-bottom:28px; line-height:1.5; }

                .pay-amount-box { background:#f5f3ff; border:1.5px solid #e0e7ff; border-radius:16px; padding:20px 24px; margin-bottom:28px; }
                .pay-amount-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:#9ca3af; margin-bottom:8px; }
                .pay-amount { font-family:'Fraunces',serif; font-size:48px; font-weight:900; color:#6366f1; line-height:1; }
                .pay-amount-sub { font-size:12px; color:#9ca3af; margin-top:6px; }

                .pay-btn { width:100%; padding:15px; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; border:none; border-radius:100px; font-family:'Outfit',sans-serif; font-size:15px; font-weight:700; cursor:pointer; transition:all .18s; box-shadow:0 4px 16px rgba(99,102,241,.35); margin-bottom:12px; }
                .pay-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 24px rgba(99,102,241,.45); }
                .pay-btn:disabled { opacity:.7; cursor:not-allowed; }

                .pay-cancel { background:none; border:none; color:#9ca3af; font-size:13px; font-family:'Outfit',sans-serif; cursor:pointer; transition:color .15s; }
                .pay-cancel:hover { color:#6366f1; }

                .pay-secure { font-size:11px; color:#d1d5db; margin-top:20px; }
            `}</style>

            <div className="pay-page">
                <div className="pay-card">
                    <div className="pay-stripe" />
                    <div className="pay-body">
                        <div className="pay-logo">Brain<span>Bolt</span> ⚡</div>

                        <div className="pay-icon">💳</div>

                        <div className="pay-title">Quiz Access</div>
                        <p className="pay-sub">One-time payment to{" "}
                            {mode === "register" ? "register for this quiz session" : "attempt this quiz session"}
                        </p>

                        <div className="pay-amount-box">
                            <div className="pay-amount-label">Amount due</div>
                            <div className="pay-amount">₹99</div>
                            <div className="pay-amount-sub">one-time · per session</div>
                        </div>

                        <button className="pay-btn" onClick={handlePay} disabled={loading}>
                            {loading ? "Redirecting…" : mode === "register" ? "Pay ₹99 & Register →" : "Pay ₹99 & Start Quiz →"}
                        </button>

                        <button className="pay-cancel" onClick={() => router.push("/quiz")}>
                            Cancel — Back to Quizzes
                        </button>

                        <p className="pay-secure">🔒 Secured by Stripe. We never store your card details.</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default function Payment() {
    return (
        <Suspense fallback={
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#eef2ff" }}>
                <div style={{ width: 36, height: 36, border: "3px solid #e0e7ff", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
            </div>
        }>
            <PaymentContent />
        </Suspense>
    )
}