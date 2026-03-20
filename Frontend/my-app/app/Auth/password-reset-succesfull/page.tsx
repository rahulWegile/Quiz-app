import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL

export default function Page() {
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
        padding: "48px 40px",
        textAlign: "center"
      }}>

        {/* Green checkmark circle */}
        <div style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          border: "3px solid #22c55e",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px"
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h2 style={{ color: "#111827", fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>
          Password Changed!
        </h2>
        <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "32px" }}>
          Your password has been changed successfully.
        </p>

        <Link
          href="/Auth/signIn"
          style={{
            display: "block",
            backgroundColor: "#2563eb",
            color: "white",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: 600,
            textDecoration: "none"
          }}
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}