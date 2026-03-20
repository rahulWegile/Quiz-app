"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"

const API = process.env.NEXT_PUBLIC_API_URL

function PaymentContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const sessionId = searchParams.get("session_id")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const getToken = () => {
        return document.cookie
            .split(";")
            .find((row) => row.trim().startsWith("session_token="))
            ?.split("=")[1]
    }

            const mode= searchParams.get('mode')
        
    const handlePay = async () => {

        if (!sessionId) { setError("Session not found"); return }
        setLoading(true)
        setError(null)
        try {
            const token = getToken()
            const res = await fetch(`${API}/api/payment`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
              body: JSON.stringify({ session_id: sessionId, mode: mode || '' })  // ✅ add mode
            })
            const data = await res.json()
            if (data.success) {
                window.location.href = data.url
            } else {
                setError(data.message || "Payment failed")
                setLoading(false)
                console.error("api error");
                
            }
        } catch {
            setError("Something went wrong")
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: "100vh", background: "#f9f9f9", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: "white", borderRadius: 12, padding: "48px 40px", maxWidth: 420, width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", textAlign: "center" }}>

                

                <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>BrainBolt Quiz Access</h1>
                <p style={{ color: "#888", fontSize: 14, marginBottom: 32 }}>
                    One-time payment to attempt this quiz session
                </p>

                <div style={{ background: "#f9fafb", borderRadius: 10, padding: "24px", marginBottom: 32 }}>
                    <p style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>Amount</p>
                    <p style={{ fontSize: 48, fontWeight: 700, color: "#111", margin: 0 }}>₹99</p>
                    <p style={{ fontSize: 13, color: "#888", marginTop: 8 }}>one-time per quiz session</p>
                </div>

                

                {error && (
                    <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 16 }}>{error}</p>
                )}

                <button
                    onClick={handlePay}
                    disabled={loading}
                    style={{
                        width: "100%", padding: "16px",
                        background: loading ? "#999" : "#2563eb",
                        color: "white", border: "none",
                        borderRadius: 8, fontSize: 16,
                        fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                        marginBottom: 12
                    }}
                >
                   {loading ? "Redirecting..." : mode === "register" ? "Pay ₹99 & Register" : "Pay ₹99 & Start Quiz"}
                </button>

                <button
                    onClick={() => router.push("/quiz")}
                    style={{ background: "none", border: "none", color: "#888", fontSize: 13, cursor: "pointer" }}
                >
                    Cancel — Back to Quizzes
                </button>

                <p style={{ fontSize: 11, color: "#ccc", marginTop: 24 }}>
                    Secured by Stripe. We never store your card details.
                </p>
            </div>
        </div>
    )
}

// ✅ wrap in Suspense — required for useSearchParams in Next.js
export default function Payment() {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <PaymentContent />
        </Suspense>
    )
}