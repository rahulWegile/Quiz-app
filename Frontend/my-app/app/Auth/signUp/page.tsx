"use client";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;
import { useRouter } from "next/navigation";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const res = await fetch(`${API}/api/signUp`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const data = await res.json();
    console.log("signup response:", data);

    if (!data.success) {
      setError(data.message || "Signup failed");
      setLoading(false);
      return;
    }

    const token = data.data.accesToken;
    document.cookie = `session_token=${token}; max-age=${60 * 60 * 24}; path=/; samesite=strict`;
    window.location.href = "/";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const steps = [
    { icon: "🎯", label: "Pick topics you love" },
    { icon: "⚔️", label: "Battle in real-time" },
    { icon: "🏆", label: "Climb the ranks" },
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

        .signup-root {
          min-height: 100vh;
          display: flex;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          background: var(--bg);
          color: var(--text);
          position: relative;
          overflow: hidden;
        }

        /* background blobs */
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

        /* steps */
        .steps-list { display: flex; flex-direction: column; gap: 0; }
        .step-row {
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
        }
        .step-row:not(:last-child)::after {
          content: '';
          position: absolute;
          left: 21px;
          top: 44px;
          width: 2px;
          height: 28px;
          background: linear-gradient(to bottom, rgba(124,58,237,0.25), transparent);
        }
        .step-ico-wrap {
          width: 44px; height: 44px;
          border-radius: 14px;
          background: var(--surface);
          border: 1.5px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
          box-shadow: var(--shadow-sm);
        }
        .step-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          padding: 14px 0;
        }

        /* stat row */
        .stat-row {
          display: flex;
          gap: 24px;
          margin-top: 40px;
          padding-top: 32px;
          border-top: 1px solid var(--border);
        }
        .stat-item {}
        .stat-num {
          font-family: 'Fraunces', serif;
          font-size: 26px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.03em;
          line-height: 1;
          margin-bottom: 4px;
        }
        .stat-label { font-size: 12px; color: var(--text-muted); font-weight: 500; }

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
          min-width: 440px;
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 52px;
          background: var(--surface);
          box-shadow: -4px 0 40px rgba(0,0,0,0.04);
          overflow-y: auto;
        }

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
          margin-bottom: 32px;
          line-height: 1.55;
        }
        .form-sub a { color: var(--purple); font-weight: 700; text-decoration: none; }
        .form-sub a:hover { text-decoration: underline; }

        /* Fields */
        .field { margin-bottom: 18px; }
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

        /* avatar upload */
        .avatar-upload {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 18px;
        }
        .avatar-preview {
          width: 64px; height: 64px;
          border-radius: 50%;
          background: var(--purple-light);
          border: 2px dashed rgba(124,58,237,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 26px;
          flex-shrink: 0;
          overflow: hidden;
          transition: border-color 0.18s;
          cursor: pointer;
        }
        .avatar-preview:hover { border-color: var(--purple); }
        .avatar-preview img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-text {}
        .avatar-label {
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 3px;
        }
        .avatar-hint { font-size: 12px; color: var(--text-muted); }
        .file-input-hidden {
          display: none;
        }
        .avatar-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: var(--purple);
          background: var(--purple-light);
          border: none;
          border-radius: 8px;
          padding: 6px 12px;
          cursor: pointer;
          margin-top: 6px;
          transition: background 0.15s;
        }
        .avatar-btn:hover { background: #ddd6fe; }

        /* Error */
        .merr {
          display: flex; align-items: center; gap: 8px;
          background: #fff5f5; border: 1.5px solid #fecaca;
          border-radius: 12px; padding: 11px 14px;
          color: #dc2626; font-size: 13px; font-weight: 600;
          margin-bottom: 18px;
        }

        /* CTA */
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
          margin-top: 4px;
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
        }
        .btn-primary:disabled::after { display: none; }

        /* terms */
        .terms-note {
          font-size: 11.5px;
          color: var(--text-muted);
          text-align: center;
          margin-top: 14px;
          line-height: 1.6;
        }
        .terms-note a { color: var(--purple); text-decoration: none; font-weight: 600; }
        .terms-note a:hover { text-decoration: underline; }

        .signin-row {
          text-align: center;
          margin-top: 20px;
          font-size: 13px;
          color: var(--text-muted);
        }
        .signin-row a {
          color: var(--purple);
          font-weight: 700;
          text-decoration: none;
          margin-left: 4px;
        }
        .signin-row a:hover { text-decoration: underline; }

        /* Responsive */
        @media (max-width: 960px) {
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
        .fu:nth-child(8) { animation-delay: 0.54s; }
      `}</style>

      {/* background */}
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />
      <div className="bg-blob blob-3" />
      <div className="dot-grid" />

      <div className="signup-root">
        {/* ══ LEFT ══ */}
        <div className="left">
          <div className="brand" onClick={() => router.push("/")}>
            <div className="brand-icon">⚡</div>
            <span className="brand-name">BrainBolt</span>
          </div>

          <div className="left-mid">
            <div className="left-badge">
              <span className="badge-dot" />
              Free forever · No credit card
            </div>

            <h1 className="left-headline">
              Your Brain<br />
              <span className="gradient-text">Deserves</span><br />
              A Worthy Stage.
            </h1>

            <p className="left-sub">
              Join thousands of curious minds competing daily.
              Create your free account in under a minute.
            </p>

            <div className="steps-list">
              {[
                { icon: "✍️", label: "Create your free account" },
                { icon: "🎯", label: "Pick topics you love" },
                { icon: "⚔️", label: "Battle in real-time" },
                { icon: "🏆", label: "Climb the global leaderboard" },
              ].map((s) => (
                <div className="step-row" key={s.label}>
                  <div className="step-ico-wrap">{s.icon}</div>
                  <div className="step-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="stat-row">
              {[
                { num: "50K+", label: "Active players" },
                { num: "500+", label: "Quiz topics" },
                { num: "#1", label: "Quiz platform" },
              ].map((s) => (
                <div className="stat-item" key={s.label}>
                  <div className="stat-num">{s.num}</div>
                  <div className="stat-label">{s.label}</div>
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
          <div className="form-eyebrow fu">
            <span className="eyebrow-bar" /> New account
          </div>
          <h1 className="form-title fu">Join BrainBolt<br />for free</h1>
          <p className="form-sub fu">
            Already have an account?{" "}
            <a href="/Auth/signIn">Sign in here</a>
          </p>

          <form onSubmit={handleSubmit}>
            {/* Avatar upload */}
            <div className="avatar-upload fu">
              <label htmlFor="profile_picture_input" className="avatar-preview">
                {preview
                  ? <img src={preview} alt="Preview" />
                  : "🧑"}
              </label>
              <div className="avatar-text">
                <div className="avatar-label">Profile Photo</div>
                <div className="avatar-hint">Optional · JPG, PNG up to 5 MB</div>
                <label htmlFor="profile_picture_input" className="avatar-btn">
                  📷 Choose photo
                </label>
              </div>
              <input
                id="profile_picture_input"
                type="file"
                name="profile_picture"
                accept="image/*"
                className="file-input-hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="field fu">
              <label className="flabel">Username</label>
              <input
                name="name"
                placeholder="Pick a cool name"
                required
                className="finput"
              />
            </div>

            <div className="field fu">
              <label className="flabel">Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
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

            {error && (
              <div className="merr fu"><span>⚠</span>{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary fu">
              {loading ? "Creating account…" : "⚡ Create My Account"}
            </button>

            <p className="terms-note fu">
              By signing up you agree to our{" "}
              <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>.
            </p>
          </form>

          <div className="signin-row fu">
            Already a member?
            <a href="/Auth/signIn">Sign in →</a>
          </div>
        </div>
      </div>
    </>
  );
}