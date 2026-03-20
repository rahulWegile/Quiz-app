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
        <div style={{ maxWidth: "400px", margin: "80px auto", padding: "20px" }}>
            <div style={{
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                padding: "40px"
            }}>
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                    <h3 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>Enter OTP</h3>
                    <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "8px" }}>
                        Code sent to: <strong>{email}</strong>
                    </p>
                </div>

                {error && (
                    <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "12px", textAlign: "center" }}>
                        {error}
                    </p>
                )}

                {resendSuccess && (
                    <p style={{ color: "#16a34a", fontSize: "13px", marginBottom: "12px", textAlign: "center" }}>
                        Code resent successfully!
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <label style={{ fontSize: "14px", fontWeight: 600 }}>OTP Code</label>
                    <input
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        type="text"
                        placeholder="Enter 6-digit code"
                        required
                        maxLength={6}
                        style={{
                            width: "100%", padding: "10px 14px", marginBottom: "16px",
                            border: "1px solid #d1d5db", borderRadius: "8px",
                            fontSize: "14px", boxSizing: "border-box"
                        }}
                    />

                    <label style={{ fontSize: "14px", fontWeight: 600 }}>New Password</label>
                    <input
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        type="password"
                        placeholder="Enter new password"
                        required
                        minLength={6}
                        style={{
                            width: "100%", padding: "10px 14px", marginBottom: "24px",
                            border: "1px solid #d1d5db", borderRadius: "8px",
                            fontSize: "14px", boxSizing: "border-box"
                        }}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            backgroundColor: loading ? "#999" : "#2563eb",
                            color: "white", width: "100%", padding: "11px",
                            border: "none", borderRadius: "8px",
                            fontSize: "15px", fontWeight: 600,
                            cursor: loading ? "not-allowed" : "pointer"
                        }}
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>

                <div style={{ textAlign: "center", marginTop: "16px" }}>
                    <button
                        onClick={handleResend}
                        disabled={resendLoading || resendTimer > 0}
                        style={{
                            background: "none", border: "none",
                            color: resendTimer > 0 ? "#aaa" : "#2563eb",
                            fontSize: "13px",
                            cursor: resendTimer > 0 ? "default" : "pointer",
                            padding: 0
                        }}
                    >
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : resendLoading ? "Sending..." : "Resend code"}
                    </button>
                </div>
            </div>
        </div>
    )
}