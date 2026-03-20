"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const API = process.env.NEXT_PUBLIC_API_URL

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [authorized, setAuthorized] = useState(false)

    useEffect(() => {
        const checkAuth = async () => {
            const token = document.cookie
                .split(";")
                .find((row) => row.trim().startsWith("session_token="))
                ?.split("=")[1]

            if (!token) {
                router.replace("/Auth/signIn")
                return
            }

            try {
                const res = await fetch(`${API}/api/user`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const data = await res.json()

                if (!data.success || (data.data.role !== "admin" && data.data.role !== "superAdmin")) {
                    router.replace("/")  // ✅ not admin — redirect to home
                    return
                }

                setAuthorized(true)
            } catch (err) {
                router.replace("/Auth/signIn")
            }
        }

        checkAuth()
    }, [])

    if (!authorized) return null  // ✅ render nothing until verified

    return <>{children}</>
}