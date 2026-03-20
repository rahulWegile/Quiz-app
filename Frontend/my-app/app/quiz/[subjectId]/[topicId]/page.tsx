"use client"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"  

const API = process.env.NEXT_PUBLIC_API_URL

interface UpcomingSession {
    id: string
    topic_id: string
    scheduled_at: string
    status: string
}

export default function TopicsPage() {
    const { topicId } = useParams()
    const router = useRouter()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [activeSession, setActiveSession] = useState<UpcomingSession | null>(null)  
    const [isRegistered, setIsRegistered] = useState(false)  
    const [registering, setRegistering] = useState(false)  

    const getToken = () => {
        return document.cookie
            .split(";")
            .find((row) => row.trim().startsWith("session_token="))
            ?.split("=")[1]
    }

    
    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch(`${API}/api/quiz/upcomingQuizzes`)
                const data = await res.json()
                const sessions: UpcomingSession[] = data.data || []

              
                const match = sessions.find((s) => s.topic_id === topicId)
                if (match) setActiveSession(match)
            } catch (err) {
                console.error("Failed to check session")
            }
        }
        checkSession()
    }, [topicId])

    const handleStartQuiz = async () => {
        setLoading(true)
        try {
            const token = getToken()
            const res = await fetch(`${API}/api/quiz/start`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ topic_id: topicId })
            })
            const data = await res.json()
            if (!data.success) {
                setError(data.message || "Failed to start quiz")
                setLoading(false)
                return
            }
            router.push(`/quiz/play/${data.data.id}`)
        } catch (err) {
            setError("Something went wrong")
            setLoading(false)
        }
    }

    const handleRegister = async () => {
        if (!activeSession) return
        setRegistering(true)
        try {
            const token = getToken()
            const res = await fetch(`${API}/api/quiz/register`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ session_id: activeSession.id })
            })
            const data = await res.json()
            if (data.success) setIsRegistered(true)
        } catch (err) {
            console.error("Registration failed")
        }
        setRegistering(false)
    }

    if (error) return <p>{error}</p>

    return (
        <div style={{ marginTop: "100px", marginBottom: "350px" }}>
            <div style={{ display: "flex", justifyContent: "center", fontSize: "25px" }}>
                Instructions
            </div>

            <div style={{
                border: "2px solid black",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                maxWidth: "400px",
                margin: "20px auto",
                padding: "20px",
                borderRadius: "8px"
            }}>
                <h1>Ready to Start?</h1>
                <p>10 Questions</p>
                <p>10 Minutes</p>
                <p>Once started you cannot go back</p>
            </div>

            {activeSession?.status === "active" ? (
                <button
                    onClick={() => router.push(`/quiz/play/${activeSession.id}`)}
                    style={{
                        display: "block", margin: "10px auto",
                        backgroundColor: "#16a34a", padding: "8px 16px",
                        borderRadius: "5px", color: "white",
                        border: "none", cursor: "pointer"
                    }}
                >
                    Join Quiz 🚀
                </button>
            ) : activeSession?.status === "upcoming" ? (
                isRegistered ? (
                    <div style={{ textAlign: "center", color: "#16a34a", fontWeight: 600 }}>
                        ✓ Registered — starts at {new Date(activeSession.scheduled_at).toLocaleString("en-IN", {
                            timeZone: "Asia/Kolkata",
                            timeStyle: "short",
                            dateStyle: "medium"
                        })}
                    </div>
                ) : (
                    <button
                        onClick={handleRegister}
                        disabled={registering}
                        style={{
                            display: "block", margin: "10px auto",
                            backgroundColor: "#2563eb", padding: "8px 16px",
                            borderRadius: "5px", color: "white",
                            border: "none", cursor: registering ? "not-allowed" : "pointer"
                        }}
                    >
                        {registering ? "Registering..." : "Register for Quiz"}
                    </button>
                )
            ) : (
                // ✅ no session — instant quiz
                <button
                    style={{
                        display: "block", margin: "10px auto",
                        backgroundColor: "blue", padding: "8px 16px",
                        borderRadius: "5px", color: "white",
                        border: "none", cursor: "pointer"
                    }}
                    onClick={handleStartQuiz}
                    disabled={loading}
                >
                    {loading ? "Starting..." : "Start Quiz"}
                </button>
            )}
        </div>
    )
}