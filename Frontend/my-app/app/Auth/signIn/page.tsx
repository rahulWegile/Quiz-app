"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function Page() {
  const [error, setError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [savedPassword, setSavedPassword] = useState("");
  const router = useRouter();

 

  useEffect(() => {
    const token = document.cookie
      .split(";")
      .find((row) => row.trim().startsWith("session_token="))
      ?.split("=")[1];
    if (token) router.push("/Auth/already-signed-in");
  }, [router]);

  const startTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

   const  {executeRecaptcha}  = useGoogleReCaptcha()
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setUnverifiedEmail("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    setSavedPassword(password);
if (!executeRecaptcha) {
    setError("Captcha not ready, please wait")
    setLoading(false)
    return
}
const token = await executeRecaptcha("login")
    const res = await fetch(`${API}/api/login`, {  // ✅ fixed
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password,captchaToken:token }),
    });

    const data = await res.json();
    console.log("captchaToken received:", token)

    if (!data.success) {
      if (data.message === "Please verify your email first") {
        setUnverifiedEmail(email);
        setShowOtp(true);
        await fetch(`${API}/api/resendCode`, {  // ✅ fixed
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        startTimer();
      }
      setError(data.message || "Login failed");
      setLoading(false);
      return;
    }

    document.cookie = `session_token=${data.accesToken}; max-age=${60 * 60 * 24}; path=/; samesite=lax`;
    window.location.href = "/";
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    const res = await fetch(`${API}/api/resendCode`, {  // ✅ fixed
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: unverifiedEmail }),
    });
    const data = await res.json();
    if (data.success) {
      setResendSuccess(true);
      startTimer();
    }
    setResendLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    setOtpLoading(true);
    setOtpError("");
    const res = await fetch(`${API}/api/verify`, {  
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verification_code: otp, email: unverifiedEmail }),
    });
    const data = await res.json();
    if (data.success) {
      const loginRes = await fetch(`${API}/api/login`, {  
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unverifiedEmail, password: savedPassword }),
      });
      const loginData = await loginRes.json();
      if (loginData.success) {
        document.cookie = `session_token=${loginData.accesToken}; max-age=${60 * 60 * 24}; path=/; samesite=lax`;
        window.location.href = "/";
      } else {
        setOtpError("Verified! Please log in again.");
        setShowOtp(false);
      }
    } else {
      setOtpError(data.message || "Invalid code");
    }
    setOtpLoading(false);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "80px auto", backgroundColor: "#f5f5f5", padding: "20px", borderRadius: "8px" }}>
      <div style={{ backgroundColor: "white", padding: "20px", border: "1px solid #ddd", borderRadius: "6px" }}>
        <h3 style={{ textAlign: "center", marginBottom: "20px", color: "black" }}>
          {showOtp ? "Verify Your Email" : "User Login "}
        </h3>

        {!showOtp ? (
          <form onSubmit={handleSubmit}>
            <label>Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              minLength={3}
              style={{ width: "100%", padding: "10px", marginBottom: "16px", border: "1px solid #ccc", borderRadius: "4px", color: "black" }}
            />

            <label>Password</label>
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              minLength={3}
              style={{ width: "100%", padding: "10px", marginBottom: "16px", border: "1px solid #ccc", borderRadius: "4px", color: "black" }}
            />

            {error && (
              <p style={{ color: "#c0392b", fontSize: "14px", marginBottom: "8px" }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: loading ? "#93c5fd" : "#2563eb", color: "white", width: "100%", padding: "10px", border: "none", borderRadius: "4px", cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <a href="/Auth/forget-pass" style={{ display: "block", textAlign: "left", marginTop: "16px", marginBottom: "2px", color: "#2563eb", fontSize: "14px", textDecoration: "none" }}>
              Forgot Password?
            </a>
            <p style={{display: "block", textAlign: "right", marginBottom: "5px",}}>No account-  
            <a href="/Auth/signUp" style={{  color: "#0011ff", fontSize: "16px", textDecoration: "none", marginRight: "12px",textDecorationLine:"underline" }}>
              create here
            </a></p>
          </form>
        ) : (
          <div>
            <p style={{ fontSize: "14px", color: "#555", marginBottom: "4px" }}>
              A verification code was sent to <strong>{unverifiedEmail}</strong>
            </p>
            <p style={{ fontSize: "12px", color: "#aaa", marginBottom: "16px" }}>
              Check your inbox and enter the code below.
            </p>

            <label>Verification Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter code"
              maxLength={6}
              style={{ width: "100%", padding: "10px", marginBottom: "16px", border: "1px solid #ccc", borderRadius: "4px", color: "black", letterSpacing: "0.2em", fontSize: "18px", textAlign: "center" }}
            />

            {otpError && (
              <p style={{ color: "#c0392b", fontSize: "13px", marginBottom: "8px" }}>{otpError}</p>
            )}

            {resendSuccess && (
              <p style={{ color: "#16a34a", fontSize: "13px", marginBottom: "8px" }}>✓ New code sent to your email</p>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={otpLoading || otp.length < 4}
              style={{ backgroundColor: otpLoading ? "#93c5fd" : "#2563eb", color: "white", width: "100%", padding: "10px", border: "none", borderRadius: "4px", cursor: "pointer", marginBottom: "12px" }}
            >
              {otpLoading ? "Verifying..." : "Verify & Login"}
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading || resendTimer > 0}
                style={{ background: "none", border: "none", color: resendTimer > 0 ? "#aaa" : "#2563eb", fontSize: "13px", cursor: resendTimer > 0 ? "default" : "pointer", padding: 0 }}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : resendLoading ? "Sending..." : "Resend code"}
              </button>

              <button
                type="button"
                onClick={() => { setShowOtp(false); setOtp(""); setOtpError(""); setError(""); }}
                style={{ background: "none", border: "none", color: "#888", fontSize: "13px", cursor: "pointer", padding: 0 }}
              >
                ← Back to login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}