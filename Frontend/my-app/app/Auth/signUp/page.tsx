"use client";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL
import { useRouter } from "next/navigation";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

const res = await fetch(`${API}/api/signUp`, {
  method: "POST",
  body: formData,
  credentials: "include"
});

   const data = await res.json();
console.log("signup response:", data);

if (!data.success) {
  setError(data.message || "Signup failed");
  setLoading(false);
  return;
}

// IMPORTANT: token path is inside data.data
const token = data.data.accesToken;

document.cookie = `session_token=${token}; max-age=${60 * 60 * 24}; path=/; samesite=strict`;

console.log("cookie after signup:", document.cookie);

window.location.href = "/";
  };

  return (
    <div style={{ maxWidth: "400px", margin: "80px auto", backgroundColor: "#f5f5f5", padding: "20px", borderRadius: "8px" }}>
      <form onSubmit={handleSubmit} style={{ backgroundColor: "white", padding: "20px", border: "1px solid #ddd", borderRadius: "6px" }}>
        <h3 style={{ textAlign: "center", marginBottom: "20px", color: "black" }}>
          Create Your Account
        </h3>

        <label>Username</label>
        <input name="name" placeholder="Name" required
          style={{ width: "100%", padding: "10px", marginBottom: "12px", border: "1px solid #ccc", borderRadius: "4px", color: "black" }}
        />

        <label>Email Address</label>
        <input name="email" type="email" placeholder="Email" required
          style={{ width: "100%", padding: "10px", marginBottom: "16px", border: "1px solid #ccc", borderRadius: "4px", color: "black" }}
        />

        <label>Password</label>
        <input name="password" type="password" placeholder="Password" required minLength={3}
          style={{ width: "100%", padding: "10px", marginBottom: "16px", border: "1px solid #ccc", borderRadius: "4px", color: "black" }}
        />

        <div style={{ marginBottom: "16px" }}>
          <label>Upload Photo</label>
          <input type="file" name="profile_picture"
            style={{ display: "block", padding: "6px", border: "1px solid #ccc", borderRadius: "4px", backgroundColor: "#fff", color: "black", width: "100%" }}
          />
        </div>

        {error && (
          <p style={{ color: "#c0392b", fontSize: "14px", marginBottom: "8px" }}>{error}</p>
        )}

        <button type="submit" disabled={loading}
          style={{ backgroundColor: loading ? "#93c5fd" : "#2563eb", color: "white", width: "100%", padding: "10px", border: "none", borderRadius: "4px", cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Creating account..." : "Signup"}
        </button>

        <a href="/Auth/signIn" style={{ display: "block", textAlign: "right", marginBottom: "16px", color: "#2563eb", fontSize: "18px", textDecoration: "none", marginRight: "5px", marginTop: "15px" }}> 
          SignIn
        </a>
      </form>
    </div>
  );
}