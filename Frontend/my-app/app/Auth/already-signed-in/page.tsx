"use client"
import { useRouter } from "next/navigation"

const API = process.env.NEXT_PUBLIC_API_URL

export default function AlreadySignedIn() {
    const router = useRouter()

    const handleSignOut = () => {
        document.cookie = "session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        
        router.push("/Auth/signIn")
    }

    return (
        <div style={{ maxWidth: "400px", margin: "80px auto", textAlign: "center", padding: "40px", border: "1px solid #e5e5e5", borderRadius: "12px" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: "12px" }}>Already Signed In</h2>
            <p style={{ color: "#666", marginBottom: "24px" }}>
                You are currently signed in. Sign out to continue with a different account.
            </p>
            <button
                onClick={handleSignOut}
                
                style={{
                    width: "100%",
                    padding: "12px",
                    background: "#b91c1c",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    marginBottom: "12px"
                }}
            >
                Sign Out
            </button>
            <button
                onClick={() => router.push("/quiz")}
                style={{
                    width: "100%",
                    padding: "12px",
                    background: "#f0f0f0",
                    color: "#111",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer"
                }}
            >
                Continue as Current User
            </button>
        </div>
    )
}