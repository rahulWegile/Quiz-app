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
  const { executeRecaptcha } = useGoogleReCaptcha();

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

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  setError("");
  setUnverifiedEmail("");
  setLoading(true);

  const formData = new FormData(e.currentTarget);
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  setSavedPassword(password);

  try {
    let token = "";

    // ✅ Safely get recaptcha token
    if (executeRecaptcha) {
      try {
        token = await executeRecaptcha("login");
      } catch (err) {
        console.log("Recaptcha failed:", err);
      }
    }

    // ❗ fallback if token missing (prevents blocking in dev)
    if (!token) {
      console.log("No recaptcha token, continuing (dev fallback)");
    }

    const res = await fetch(`${API}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        token, // ✅ always send (even empty)
      }),
    });

    const data = await res.json();

    if (!data.success) {
      if (data.message === "Please verify your email first") {
        setUnverifiedEmail(email);
        setShowOtp(true);

        await fetch(`${API}/api/resendCode`, {
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

  } catch (err) {
    console.error(err);
    setError("Something went wrong");
    setLoading(false);
  }
};

  const handleResend = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    const res = await fetch(`${API}/api/resendCode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: unverifiedEmail }),
    });
    const data = await res.json();
    if (data.success) { setResendSuccess(true); startTimer(); }
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

  const features = [
    { icon: "🎯", title: "Instant Quizzes", desc: "500+ topics across science, math, history & more.", color: "#7c3aed" },
    { icon: "⚔️", title: "Live Battles", desc: "Compete in real-time against players worldwide.", color: "#ec4899" },
    { icon: "🏆", title: "Leaderboards", desc: "Climb the ranks. Top scores by accuracy & speed.", color: "#f59e0b" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:opsz,wght@9..144,400;9..144,700;9..144,800;9..144,900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #faf8ff;
          --bg-warm: #fdf4ff;
          --surface: #ffffff;
          --border: rgba(0,0,0,0.06);
          --border-accent: rgba(124,58,237,0.15);
          --text: #1a1033;
          --text-secondary: #6b7280;
          --text-muted: #9ca3af;
          --purple: #7c3aed;
          --purple-light: #ede9fe;
          --pink: #ec4899;
          --amber: #f59e0b;
          --radius: 20px;
          --radius-lg: 28px;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.04);
          --shadow-md: 0 4px 20px rgba(0,0,0,0.06);
          --shadow-lg: 0 12px 40px rgba(0,0,0,0.08);
          --shadow-glow: 0 8px 32px rgba(124,58,237,0.20);
        }

        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          background: var(--bg);
          color: var(--text);
          position: relative;
          overflow: hidden;
        }

        /* ── background blobs (same as home) ── */
        .bg-blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }
        .blob-1 { width: 500px; height: 500px; background: rgba(124,58,237,0.08); top: -100px; right: -80px; }
        .blob-2 { width: 400px; height: 400px; background: rgba(236,72,153,0.06); bottom: 10%; left: -120px; }
        .blob-3 { width: 300px; height: 300px; background: rgba(59,130,246,0.05); top: 40%; right: 5%; }

        /* dot grid (same as home) */
        .dot-grid {
          position: fixed;
          inset: 0;
          background-image: radial-gradient(circle, rgba(124,58,237,0.06) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
          z-index: 0;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 0%, transparent 100%);
        }

        /* ── LEFT PANEL ── */
        .left {
          flex: 1;
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 56px 56px;
          overflow: hidden;
        }

        /* brand */
        .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
        .brand-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #000000, #000000);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          box-shadow: var(--shadow-glow);
        }
        .brand-name {
          font-family: 'Fraunces', serif;
          font-size: 20px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.03em;
        }

        /* hero text */
        .left-mid {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 0;
        }

        .left-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--purple-light);
          border: 1px solid rgba(124,58,237,0.2);
          color: var(--purple);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 7px 16px;
          border-radius: 100px;
          margin-bottom: 24px;
          width: fit-content;
        }
        .badge-dot {
          width: 7px; height: 7px;
          background: var(--purple);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.3); }
          50% { box-shadow: 0 0 0 6px rgba(124,58,237,0); }
        }

        .left-headline {
          font-family: 'Fraunces', serif;
          font-size: clamp(36px, 4vw, 56px);
          font-weight: 800;
          line-height: 1.06;
          letter-spacing: -0.03em;
          color: var(--text);
          margin-bottom: 18px;
        }
        .gradient-text {
          background: linear-gradient(135deg, #7c3aed 0%, #ec4899 45%, #3b82f6 75%, #10b981 100%);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradFlow 6s ease-in-out infinite;
        }
        @keyframes gradFlow {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .left-sub {
          font-size: 16px;
          color: var(--text-secondary);
          line-height: 1.75;
          max-width: 400px;
          margin-bottom: 44px;
          font-weight: 400;
        }

        /* feature bullets */
        .feat-list { display: flex; flex-direction: column; gap: 16px; }
        .feat-row {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 18px 20px;
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow-sm);
        }
        .feat-ico {
          width: 44px; height: 44px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }
        .feat-body {}
        .feat-title {
          font-family: 'Fraunces', serif;
          font-size: 15px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 2px;
        }
        .feat-desc { font-size: 13px; color: var(--text-muted); line-height: 1.5; }

        /* footer */
        .left-foot {
          font-size: 12px;
          color: var(--text-muted);
          display: flex;
          gap: 20px;
        }
        .left-foot a { color: var(--text-muted); text-decoration: none; }
        .left-foot a:hover { color: var(--purple); }

        /* ── DIVIDER ── */
        .v-divider {
          width: 1px;
          background: var(--border);
          position: relative;
          z-index: 1;
          flex-shrink: 0;
        }

        /* ── RIGHT FORM PANEL ── */
        .right {
          width: 700px;
          min-width: 420px;
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 56px 52px;
          background: var(--surface);
          box-shadow: -4px 0 40px rgba(0,0,0,0.04);
        }

        /* top purple accent (matches home hero badge) */
        .right::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #7c3aed, #ec4899, #3b82f6);
          border-radius: 0 0 4px 4px;
        }

        .form-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--purple);
          margin-bottom: 10px;
        }
        .eyebrow-bar {
          width: 24px; height: 3px;
          background: linear-gradient(90deg, var(--purple), var(--pink));
          border-radius: 10px;
        }

        .form-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(26px, 2.8vw, 34px);
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin-bottom: 8px;
        }
        .form-sub {
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 36px;
          line-height: 1.55;
        }
        .form-sub a { color: var(--purple); font-weight: 700; text-decoration: none; }
        .form-sub a:hover { text-decoration: underline; }

        /* Fields */
        .field { margin-bottom: 20px; }
        .flabel {
          display: block;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        .finput {
          width: 100%;
          padding: 13px 16px;
          background: var(--bg);
          border: 1.5px solid rgba(0,0,0,0.08);
          border-radius: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          color: var(--text);
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
        }
        .finput::placeholder { color: var(--text-muted); }
        .finput:focus {
          border-color: var(--purple);
          background: var(--surface);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
        }

        /* Messages */
        .merr {
          display: flex; align-items: center; gap: 8px;
          background: #fff5f5; border: 1.5px solid #fecaca;
          border-radius: 12px; padding: 11px 14px;
          color: #dc2626; font-size: 13px; font-weight: 600;
          margin-bottom: 18px;
        }
        .mok {
          display: flex; align-items: center; gap: 8px;
          background: #f0fdf4; border: 1.5px solid #bbf7d0;
          border-radius: 12px; padding: 11px 14px;
          color: #16a34a; font-size: 13px; font-weight: 600;
          margin-bottom: 18px;
        }

        /* CTA — matches home .btn-primary exactly */
        .btn-primary {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: linear-gradient(135deg, #7c3aed, #8b5cf6);
          color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          font-weight: 700;
          padding: 15px 32px;
          border-radius: 16px;
          border: none;
          cursor: pointer;
          box-shadow: var(--shadow-glow);
          position: relative;
          overflow: hidden;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .btn-primary::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 200%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          animation: shimmer 3s infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(50%); }
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(124,58,237,0.3);
        }
        .btn-primary:active:not(:disabled) { transform: translateY(0); }
        .btn-primary:disabled {
          background: #d1d5db;
          box-shadow: none;
          cursor: not-allowed;
          animation: none;
        }
        .btn-primary:disabled::after { display: none; }

        /* Footer links */
        .frow {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 18px;
        }
        .lnk {
          font-size: 13px; font-weight: 600;
          background: none; border: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 0; cursor: pointer;
          text-decoration: none;
          transition: color 0.15s;
        }
        .lnk.purple { color: var(--purple); }
        .lnk.purple:hover { color: #6d28d9; }
        .lnk.muted { color: var(--text-muted); }
        .lnk.muted:hover { color: var(--text); }

        /* OTP */
        .otp-box {
          background: var(--bg);
          border: 1.5px solid rgba(0,0,0,0.08);
          border-radius: 14px;
          padding: 14px 16px;
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 22px;
        }
        .otp-box strong { color: var(--text); font-weight: 700; }

        .otp-digits {
          width: 100%; padding: 16px; text-align: center;
          font-family: 'Fraunces', serif;
          font-size: 30px; letter-spacing: 0.3em;
          background: var(--bg); border: 1.5px solid rgba(0,0,0,0.08);
          border-radius: 14px; color: var(--text);
          outline: none; margin-bottom: 22px;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .otp-digits::placeholder { color: #d1d5db; }
        .otp-digits:focus {
          border-color: var(--purple);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
        }

        /* Responsive */
        @media (max-width: 900px) {
          .left { display: none; }
          .v-divider { display: none; }
          .right { width: 100%; min-width: unset; padding: 40px 28px; }
        }

        /* Entrance animation */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fu { opacity: 0; animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) forwards; }
        .fu:nth-child(1) { animation-delay: 0.05s; }
        .fu:nth-child(2) { animation-delay: 0.12s; }
        .fu:nth-child(3) { animation-delay: 0.19s; }
        .fu:nth-child(4) { animation-delay: 0.26s; }
        .fu:nth-child(5) { animation-delay: 0.33s; }
        .fu:nth-child(6) { animation-delay: 0.40s; }
        .fu:nth-child(7) { animation-delay: 0.47s; }
      `}</style>

      {/* background */}
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />
      <div className="bg-blob blob-3" />
      <div className="dot-grid" />

      <div className="login-root">
        {/* ══ LEFT ══ */}
        <div className="left">
          <div className="brand" onClick={() => router.push("/")}>
            <div className="brand-icon">⚡</div>
            <span className="brand-name">BrainBolt</span>
          </div>

          <div className="left-mid">
            <div className="left-badge">
              <span className="badge-dot" />
              Live quizzes · Real competition
            </div>

            <h1 className="left-headline">
              Prove You&apos;re<br />
              <span className="gradient-text">The Smartest</span><br />
              in the Room.
            </h1>

            <p className="left-sub">
              Jump into live quiz battles, challenge yourself across dozens of topics,
              and climb the global leaderboard.
            </p>

            <div className="feat-list">
              {features.map((f) => (
                <div className="feat-row" key={f.title}>
                  <div className="feat-ico" style={{ background: `${f.color}15` }}>{f.icon}</div>
                  <div className="feat-body">
                    <div className="feat-title">{f.title}</div>
                    <div className="feat-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="left-foot">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Support</a>
          </div>
        </div>

        <div className="v-divider" />

        {/* ══ RIGHT ══ */}
        <div className="right">
          {!showOtp ? (
            <>
              <div className="form-eyebrow fu">
                <span className="eyebrow-bar" /> Welcome back
              </div>
              <h1 className="form-title fu">Sign in to<br />your account</h1>
              <p className="form-sub fu">
                No account yet?{" "}
                <a href="/Auth/signUp">Create one free</a>
              </p>

              <form onSubmit={handleSubmit}>
                <div className="field fu">
                  <label className="flabel">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    minLength={3}
                    className="finput"
                  />
                </div>

                <div className="field fu">
                  <label className="flabel">Password</label>
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={3}
                    className="finput"
                  />
                </div>

                {error && <div className="merr fu"><span>⚠</span>{error}</div>}

                <button type="submit" disabled={loading} className="btn-primary fu">
                  {loading ? "Signing in…" : "⚡ Sign In"}
                </button>

                <div className="frow fu">
                  <a href="/Auth/forget-pass" className="lnk purple">Forgot password?</a>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="form-eyebrow fu">
                <span className="eyebrow-bar" /> Verification
              </div>
              <h1 className="form-title fu">Check your<br />inbox 📬</h1>

              <div className="otp-box fu">
                Code sent to <strong>{unverifiedEmail}</strong>. Check your inbox and spam folder.
              </div>

              <div className="fu">
                <label className="flabel">Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="otp-digits"
                />
              </div>

              {otpError && <div className="merr fu"><span>⚠</span>{otpError}</div>}
              {resendSuccess && <div className="mok fu"><span>✓</span>New code sent!</div>}

              <button
                onClick={handleVerifyOtp}
                disabled={otpLoading || otp.length < 4}
                className="btn-primary fu"
              >
                {otpLoading ? "Verifying…" : "⚡ Verify & Sign In"}
              </button>

              <div className="frow fu">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading || resendTimer > 0}
                  className="lnk purple"
                  style={{ opacity: resendTimer > 0 ? 0.45 : 1, cursor: resendTimer > 0 ? "default" : "pointer" }}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : resendLoading ? "Sending…" : "Resend code"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowOtp(false); setOtp(""); setOtpError(""); setError(""); }}
                  className="lnk muted"
                >
                  ← Back to login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}