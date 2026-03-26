"use client"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

const API = process.env.NEXT_PUBLIC_API_URL

export default function ResetPassword() {
    const searchParams = useSearchParams()
    const email = searchParams.get("email") || ""
    const router = useRouter()

    const [code, setCode] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [resendLoading, setResendLoading] = useState(false)
    const [resendSuccess, setResendSuccess] = useState(false)
    const [resendTimer, setResendTimer] = useState(0)

    const startTimer = () => {
        setResendTimer(60)
        const interval = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) { clearInterval(interval); return 0 }
                return prev - 1
            })
        }, 1000)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        try {
            const res = await fetch(`${API}/api/reset-pass`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, newPassword })
            })
            const data = await res.json()
            if (!data.success) {
                setError(data.message || "Invalid OTP")
                setLoading(false)
                return
            }
            router.push("/Auth/password-reset-succesfull")
        } catch {
            setError("Something went wrong")
            setLoading(false)
        }
    }

    const handleResend = async () => {
        setResendLoading(true)
        setResendSuccess(false)
        try {
            const res = await fetch(`${API}/api/resendCode`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            })
            const data = await res.json()
            if (data.success) {
                setResendSuccess(true)
                startTimer()
            }
        } catch {
            console.error("Resend failed")
        }
        setResendLoading(false)
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&family=Fraunces:wght@700;800&display=swap');

                body {
                    margin: 0;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    background: #faf8ff;
                }

                .root {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }

                /* background */
                .blob {
                    position: fixed;
                    border-radius: 50%;
                    filter: blur(80px);
                    z-index: 0;
                }
                .b1 { width: 450px; height: 450px; background: rgba(124,58,237,0.1); top: -100px; right: -80px; }
                .b2 { width: 350px; height: 350px; background: rgba(236,72,153,0.08); bottom: 0; left: -100px; }

                .card {
                    position: relative;
                    z-index: 1;
                    width: 420px;
                    background: white;
                    border-radius: 24px;
                    padding: 36px;
                    box-shadow: 0 12px 40px rgba(0,0,0,0.08);
                }

                .eyebrow {
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    color: #7c3aed;
                    margin-bottom: 10px;
                }

                .title {
                    font-family: 'Fraunces', serif;
                    font-size: 30px;
                    font-weight: 800;
                    color: #1a1033;
                    margin-bottom: 8px;
                }

                .sub {
                    font-size: 14px;
                    color: #6b7280;
                    margin-bottom: 24px;
                }

                .label {
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #6b7280;
                    margin-bottom: 8px;
                    display: block;
                }

                .input {
                    width: 100%;
                    padding: 14px 16px;
                    border-radius: 14px;
                    border: 1.5px solid rgba(0,0,0,0.08);
                    background: #faf8ff;
                    font-size: 15px;
                    outline: none;
                    margin-bottom: 18px;
                    transition: 0.2s;
                }

                .input:focus {
                    border-color: #7c3aed;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
                }

                .otp {
                    text-align: center;
                    font-family: 'Fraunces', serif;
                    font-size: 28px;
                    letter-spacing: 0.3em;
                }

                .btn {
                    width: 100%;
                    padding: 14px;
                    border: none;
                    border-radius: 16px;
                    background: linear-gradient(135deg, #7c3aed, #8b5cf6);
                    color: white;
                    font-weight: 700;
                    font-size: 15px;
                    cursor: pointer;
                    box-shadow: 0 10px 30px rgba(124,58,237,0.25);
                    transition: 0.2s;
                }

                .btn:hover {
                    transform: translateY(-2px);
                }

                .btn:disabled {
                    background: #d1d5db;
                    cursor: not-allowed;
                    box-shadow: none;
                }

                .err {
                    background: #fff5f5;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                    padding: 10px;
                    border-radius: 10px;
                    font-size: 13px;
                    margin-bottom: 12px;
                    text-align: center;
                }

                .ok {
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    color: #16a34a;
                    padding: 10px;
                    border-radius: 10px;
                    font-size: 13px;
                    margin-bottom: 12px;
                    text-align: center;
                }

                .resend {
                    text-align: center;
                    margin-top: 16px;
                }

                .link {
                    background: none;
                    border: none;
                    font-size: 13px;
                    color: #7c3aed;
                    cursor: pointer;
                    font-weight: 600;
                }

                .link:disabled {
                    color: #aaa;
                    cursor: default;
                }

            `}</style>

            <div className="blob b1" />
            <div className="blob b2" />

            <div className="root">
                <div className="card">
                    <div className="eyebrow">Reset</div>

                    <h1 className="title">Reset Password</h1>

                    <p className="sub">
                        Code sent to <strong>{email}</strong>
                    </p>

                    {error && <div className="err">⚠ {error}</div>}
                    {resendSuccess && <div className="ok">✓ Code resent successfully</div>}

                    <form onSubmit={handleSubmit}>
                        <label className="label">Verification Code</label>
                        <input
                            value={code}
                            onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="000000"
                            maxLength={6}
                            required
                            className="input otp"
                        />

                        <label className="label">New Password</label>
                        <input
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            type="password"
                            placeholder="Enter new password"
                            required
                            minLength={6}
                            className="input"
                        />

                        <button type="submit" disabled={loading} className="btn">
                            {loading ? "Resetting..." : "⚡ Reset Password"}
                        </button>
                    </form>

                    <div className="resend">
                        <button
                            onClick={handleResend}
                            disabled={resendLoading || resendTimer > 0}
                            className="link"
                        >
                            {resendTimer > 0
                                ? `Resend in ${resendTimer}s`
                                : resendLoading
                                ? "Sending..."
                                : "Resend code"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}