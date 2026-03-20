import Link from "next/link";

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
          border: "3px solid #ef4444",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "18px"
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>

        <h2 style={{ color: "#111827", fontSize: "24px", fontWeight: 700, marginBottom: "10px" }}>
          Invalid Otp
        </h2>
        <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>
         Please Enter a Valid otp
        </p>


        <Link
          href="/forget-pass"
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
          Retry
        </Link>

        
      </div>
    </div>
  );
}