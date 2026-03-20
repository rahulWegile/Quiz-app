import { redirect } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL

export default function Page() {

  async function forgetPass(formData: FormData) {
    "use server";

    const email = formData.get("email") as string;

    if (!email) redirect("/Auth/Invalid-User");

    const res = await fetch(`${API}/api/forgot-pass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      redirect("/Auth/Invalid-User");
    }

    const userName = data.data.name;
    redirect(`/Auth/reset-pass?email=${email}&name=${encodeURIComponent(userName)}`);
  }

  return (
    <div style={{
       maxWidth: "400px",
        margin: "80px auto",
        backgroundColor: "#f5f5f5",
        padding: "20px",
        borderRadius: "8px"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "420px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        padding: "40px"
      }}>

       

        <h3 style={{ textAlign: "center", marginBottom: "8px", color: "#111827", fontSize: "22px", fontWeight: 700 }}>
          Forgot Password?
        </h3>
        <p style={{ textAlign: "center", color: "#6b7280", fontSize: "14px", marginBottom: "28px" }}>
          Enter your email 
        </p>

        <form action={forgetPass}>
          <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500, color: "#374151" }}>
            Email Address
          </label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            style={{
              width: "100%",
              padding: "10px 14px",
              marginBottom: "20px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#111827",
              outline: "none",
              boxSizing: "border-box"
            }}
          />

          <button
            type="submit"
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              width: "100%",
              padding: "11px",
              border: "none",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Send Reset Code
          </button>
        </form>

        <a 
          href="/Auth/signIn"
          style={{
            display: "block",
            textAlign: "center",
            marginTop: "20px",
            color: "#2563eb",
            fontSize: "14px",
            textDecoration: "none"
          }}
        >
          ← Back to Login
        </a>
      </div>
    </div>
  );
}