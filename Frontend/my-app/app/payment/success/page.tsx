"use client"
import { useEffect, Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

const API = process.env.NEXT_PUBLIC_API_URL

function SuccessContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const sessionId = searchParams.get("session_id")
    const stripeSessionId = searchParams.get("stripe_session_id")
    const mode = searchParams.get("mode")
    const [countdown, setCountdown] = useState(3)
    const [done, setDone] = useState(false)

    useEffect(() => {
        const confirm = async () => {
            const token = document.cookie
                .split(";")
                .find(r => r.trim().startsWith("session_token="))
                ?.split("=")[1]

            if (mode === "register") {
                await fetch(`${API}/api/payment/confirm`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ session_id: sessionId, stripe_session_id: stripeSessionId })
                })
                await fetch(`${API}/api/quiz/register`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ session_id: sessionId })
                })
                setDone(true)
                let c = 3
                const iv = setInterval(() => {
                    c--
                    setCountdown(c)
                    if (c <= 0) { clearInterval(iv); router.push(`/quiz`) }
                }, 1000)
            } else {
                await fetch(`${API}/api/payment/confirm`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ session_id: sessionId, stripe_session_id: stripeSessionId })
                })
                setDone(true)
                let c = 3
                const iv = setInterval(() => {
                    c--
                    setCountdown(c)
                    if (c <= 0) { clearInterval(iv); router.push(`/quiz/play/${sessionId}`) }
                }, 1000)
            }
        }

        if (sessionId && stripeSessionId) confirm()
    }, [sessionId, stripeSessionId, mode, router])

    const destination = mode === "register" ? "quizzes" : "quiz"

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                body {
                    font-family: 'Nunito', sans-serif;
                    background: #eef2ff;
                    min-height: 100vh;
                }

                .rainbow-bar {
                    position: fixed;
                    top: 0; left: 0; right: 0;
                    height: 5px;
                    background: linear-gradient(90deg, #f87171, #fb923c, #facc15, #4ade80, #60a5fa, #a78bfa, #f472b6);
                    z-index: 100;
                }

                .page {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    padding-top: 5px;
                }

                /* Logo at top */
                .logo-area {
                    position: fixed;
                    top: 20px; left: 2rem;
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                }

                .logo-icon {
                    width: 40px; height: 40px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.25rem;
                    box-shadow: 0 4px 12px rgba(99,102,241,0.35);
                }

                .logo-text {
                    font-family: 'Fredoka One', sans-serif;
                    font-size: 1.4rem;
                    background: linear-gradient(135deg, #6366f1, #ec4899);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                /* Main card */
                .card {
                    background: white;
                    border-radius: 24px;
                    padding: 3rem 2.5rem;
                    max-width: 420px;
                    width: 100%;
                    text-align: center;
                    position: relative;
                    box-shadow: 0 8px 40px rgba(99,102,241,0.12);
                    overflow: hidden;
                    animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                }

                @keyframes popIn {
                    from { opacity: 0; transform: scale(0.85) translateY(20px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }

                /* Gradient border */
                .card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 24px;
                    padding: 2px;
                    background: linear-gradient(135deg, #22c55e, #4ade80, #6366f1);
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    pointer-events: none;
                }

                /* Confetti-style decorative blobs */
                .blob {
                    position: absolute;
                    border-radius: 50%;
                    opacity: 0.12;
                    pointer-events: none;
                }
                .blob-1 { width: 120px; height: 120px; background: #22c55e; top: -40px; right: -30px; }
                .blob-2 { width: 80px; height: 80px; background: #6366f1; bottom: -20px; left: -20px; }
                .blob-3 { width: 50px; height: 50px; background: #f97316; top: 50%; left: -15px; }

                /* Check circle */
                .check-circle {
                    width: 96px; height: 96px;
                    background: linear-gradient(135deg, #22c55e, #4ade80);
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 2.75rem;
                    margin: 0 auto 1.75rem;
                    box-shadow: 0 8px 24px rgba(34,197,94,0.35);
                    animation: bounceIn 0.6s 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                }

                @keyframes bounceIn {
                    from { opacity: 0; transform: scale(0); }
                    to   { opacity: 1; transform: scale(1); }
                }

                .title {
                    font-family: 'Fredoka One', sans-serif;
                    font-size: 2rem;
                    color: #1e1b4b;
                    margin-bottom: 0.5rem;
                    animation: fadeUp 0.5s 0.5s both;
                }

                .subtitle {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #9ca3af;
                    margin-bottom: 2rem;
                    animation: fadeUp 0.5s 0.6s both;
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* Redirect pill */
                .redirect-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.6rem;
                    background: #f0fdf4;
                    border: 2px solid #bbf7d0;
                    border-radius: 999px;
                    padding: 0.6rem 1.25rem;
                    font-weight: 700;
                    font-size: 0.9rem;
                    color: #16a34a;
                    animation: fadeUp 0.5s 0.7s both;
                    margin-bottom: 1.5rem;
                }

                .redirect-pill .dot {
                    width: 8px; height: 8px;
                    border-radius: 50%;
                    background: #22c55e;
                    animation: pulse 1s infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50%       { opacity: 0.5; transform: scale(0.7); }
                }

                /* Countdown ring */
                .countdown-wrap {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    animation: fadeUp 0.5s 0.8s both;
                }

                .countdown-badge {
                    width: 44px; height: 44px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white;
                    font-family: 'Fredoka One', sans-serif;
                    font-size: 1.3rem;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 4px 12px rgba(99,102,241,0.35);
                    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
                }

                .countdown-label {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #6b7280;
                }

                /* Loading state */
                .loading-dots {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    margin: 1.5rem 0;
                }

                .loading-dots span {
                    width: 10px; height: 10px;
                    border-radius: 50%;
                    background: #d1d5db;
                    animation: dotBounce 1.2s infinite ease-in-out;
                }
                .loading-dots span:nth-child(2) { animation-delay: 0.2s; background: #a78bfa; }
                .loading-dots span:nth-child(3) { animation-delay: 0.4s; background: #6366f1; }

                @keyframes dotBounce {
                    0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
                    40%           { transform: scale(1); opacity: 1; }
                }

                /* Info chips */
                .info-chips {
                    display: flex;
                    gap: 0.5rem;
                    justify-content: center;
                    flex-wrap: wrap;
                    margin-top: 1.5rem;
                    animation: fadeUp 0.5s 0.9s both;
                }

                .chip {
                    background: #f5f3ff;
                    border: 1.5px solid #ede9fe;
                    border-radius: 999px;
                    padding: 0.3rem 0.85rem;
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #7c3aed;
                }
            `}</style>

            <div className="rainbow-bar" />

            <div className="logo-area">
                <div className="logo-icon">⚡</div>
                <span className="logo-text">BrainBolt</span>
            </div>

            <div className="page">
                <div className="card">
                    {/* Decorative blobs */}
                    <div className="blob blob-1" />
                    <div className="blob blob-2" />
                    <div className="blob blob-3" />

                    {/* Check */}
                    <div className="check-circle">✓</div>

                    <h1 className="title">Payment Successful!</h1>
                    <p className="subtitle">
                        {mode === "register"
                            ? "You're registered! Get ready to play 🎮"
                            : "You're in! Your quiz is loading 🧠"}
                    </p>

                    {!done ? (
                        <>
                            <div className="redirect-pill">
                                <span className="dot" />
                                Confirming your payment…
                            </div>
                            <div className="loading-dots">
                                <span />
                                <span />
                                <span />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="redirect-pill">
                                <span className="dot" />
                                Heading to {destination}…
                            </div>
                            <div className="countdown-wrap">
                                <div className="countdown-badge">{countdown}</div>
                                <span className="countdown-label">seconds</span>
                            </div>
                        </>
                    )}

                    <div className="info-chips">
                        <span className="chip">🔒 Secure</span>
                        <span className="chip">⚡ Powered by Stripe</span>
                        <span className="chip">🎯 BrainBolt</span>
                    </div>
                </div>
            </div>
        </>
    )
}

export default function Success() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Nunito, sans-serif", color: "#9ca3af", fontSize: "1rem", fontWeight: 700 }}>
                Loading…
            </div>
        }>
            <SuccessContent />
        </Suspense>
    )
}