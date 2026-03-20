"use client"
import { useEffect, useState } from "react"

const API = process.env.NEXT_PUBLIC_API_URL

interface Session {
    id: string
    topic_name: string
    subject_name: string
    scheduled_at: string
    status: string
    registered_count: number
}

export default function ManageSessions() {
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [opening, setOpening] = useState<string | null>(null)

    const getToken = () => {
        return document.cookie
            .split(";")
            .find((row) => row.trim().startsWith("session_token="))
            ?.split("=")[1]
    }

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await fetch(`${API}/api/quiz/upcomingQuizzes`) // ✅ added /api
                const data = await res.json()
                if (!data.success) {
                    setError(data.message || "Failed to load sessions")
                    setLoading(false)
                    return
                }
                setSessions(data.data)
                setLoading(false)
            } catch (err) {
                setError("Something went wrong")
                setLoading(false)
            }
        }
        fetchSessions()
    }, [])

    const handleOpen = async (session_id: string) => {
        setOpening(session_id)
        try {
            const token = getToken()
            const res = await fetch(`${API}/api/quiz/open`, { // ✅ added /api
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ session_id })
            })
            const data = await res.json()
            if (data.success) {
                setSessions((prev) =>
                    prev.map((s) =>
                        s.id === session_id ? { ...s, status: "active" } : s
                    )
                )
            } else {
                setError(data.message || "Failed to open session")
            }
        } catch (err) {
            setError("Something went wrong")
        }
        setOpening(null)
    }

    if (loading) return <p>Loading...</p>
    if (error) return <p style={{ color: "#c0392b" }}>{error}</p>

    return (
        <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "24px" }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: "24px" }}>
                Manage Sessions
            </h1>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ background: "#f9f9f9", borderBottom: "2px solid #e5e5e5" }}>
                        <th style={{ padding: "14px", textAlign: "left" }}>Subject</th>
                        <th style={{ padding: "14px", textAlign: "left" }}>Topic</th>
                        <th style={{ padding: "14px", textAlign: "left" }}>Scheduled At</th>
                        <th style={{ padding: "14px", textAlign: "left" }}>Registered</th>
                        <th style={{ padding: "14px", textAlign: "left" }}>Status</th>
                        <th style={{ padding: "14px", textAlign: "left" }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {sessions.map((session) => (
                        <tr key={session.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                            <td style={{ padding: "14px" }}>{session.subject_name}</td>
                            <td style={{ padding: "14px" }}>{session.topic_name}</td>
                            <td style={{ padding: "14px" }}>
                                {new Date(session.scheduled_at).toLocaleString("en-IN", {
                                    timeZone: "Asia/Kolkata",
                                    dateStyle: "medium",
                                    timeStyle: "short"
                                })}
                            </td>
                            <td style={{ padding: "14px" }}>
                                {session.registered_count} users
                            </td>
                            <td style={{ padding: "14px" }}>
                                <span style={{
                                    padding: "4px 10px",
                                    borderRadius: "20px",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    background: session.status === "active" ? "#dcfce7" : "#fef9c3",
                                    color: session.status === "active" ? "#16a34a" : "#854d0e"
                                }}>
                                    {session.status}
                                </span>
                            </td>
                            <td style={{ padding: "14px" }}>
                                {session.status === "upcoming" ? (
                                    <button
                                        onClick={() => handleOpen(session.id)}
                                        disabled={opening === session.id}
                                        style={{
                                            padding: "8px 16px",
                                            background: "#1a1a1a",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            fontSize: 13,
                                            fontWeight: 600,
                                            cursor: opening === session.id ? "not-allowed" : "pointer"
                                        }}
                                    >
                                        {opening === session.id ? "Opening..." : "Open Now"}
                                    </button>
                                ) : (
                                    <span style={{ color: "#16a34a", fontWeight: 600 }}>
                                        Opened ✓
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {sessions.length === 0 && (
                <p style={{ textAlign: "center", color: "#888", marginTop: "40px" }}>
                    No upcoming sessions found
                </p>
            )}
        </div>
    )
}