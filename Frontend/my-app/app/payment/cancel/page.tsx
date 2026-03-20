"use client"
import { useRouter } from "next/navigation"

export default function PaymentCancel() {
    const router = useRouter()
    return (
        <div style={{ maxWidth: 400, margin: "100px auto", textAlign: "center" }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Payment Cancelled</h1>
            <p style={{ color: "#888", marginBottom: 32 }}>You cancelled the payment.</p>
            <button
                onClick={() => router.push("/quiz")}
                style={{
                    padding: "14px 32px", background: "#2563eb",
                    color: "white", border: "none", borderRadius: 8,
                    fontSize: 16, fontWeight: 600, cursor: "pointer"
                }}
            >
                Back to Quizzes
            </button>
        </div>
    )
}