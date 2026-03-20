// ============================================================
// FOOTER  →  app/components/footer.tsx
// ============================================================
import Link from "next/link"

export default function Footer() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,700&display=swap');

        .ft { font-family: 'Outfit', sans-serif; background: #fff; color: #6b7280; position: relative; overflow: hidden; border-top: 1.5px solid #e0e7ff; }
        .ft * { box-sizing: border-box; margin: 0; padding: 0; }

        .ft::before {
          content: ''; position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(99,102,241,0.05) 1.5px, transparent 1.5px);
          background-size: 28px 28px; pointer-events: none;
        }
        .ft::after {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, #6366f1, #ec4899, #14b8a6, #f97316, #6366f1);
          background-size: 200% 100%; animation: ftshift 4s linear infinite;
        }
        @keyframes ftshift { to { background-position: 200% 0; } }

        .ft-inner { max-width: 1100px; margin: 0 auto; padding: 60px 60px 0; position: relative; z-index: 1; }

        .ft-grid {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px; margin-bottom: 48px;
        }

        .ft-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; margin-bottom: 16px; }
        .ft-logo-badge {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(99,102,241,0.4);
        }
        .ft-logo-name { font-family: 'Fraunces', serif; font-size: 18px; font-weight: 900; color: #1e1b4b; letter-spacing: -0.02em; }

        .ft-brand-desc { font-size: 13px; color: #9ca3af; line-height: 1.7; max-width: 220px; margin-bottom: 20px; }

        .ft-social { display: flex; gap: 10px; }
        .ft-social-btn {
          width: 36px; height: 36px; border-radius: 10px;
          background: #f5f3ff; border: 1.5px solid #e0e7ff;
          display: flex; align-items: center; justify-content: center;
          color: #6366f1; text-decoration: none; font-size: 14px; font-weight: 700;
          transition: all 0.18s;
        }
        .ft-social-btn:hover { background: #eef2ff; border-color: #a5b4fc; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(99,102,241,0.15); }

        .ft-col-title { font-family: 'Fraunces', serif; font-size: 14px; font-weight: 800; color: #1e1b4b; margin-bottom: 16px; letter-spacing: -0.01em; }
        .ft-links { display: flex; flex-direction: column; gap: 10px; }
        .ft-link {
          color: #9ca3af; text-decoration: none; font-size: 13px; font-weight: 500;
          transition: all 0.15s; display: inline-flex; align-items: center; gap: 5px;
        }
        .ft-link:hover { color: #6366f1; transform: translateX(3px); }

        .ft-bottom {
          border-top: 1px solid #e0e7ff;
          padding: 20px 0;
          display: flex; align-items: center; justify-content: space-between;
          font-size: 12px; color: #9ca3af;
          position: relative; z-index: 1;
          max-width: 1100px; margin: 0 auto;
          padding-left: 60px; padding-right: 60px;
        }
        .ft-bottom-pills { display: flex; gap: 8px; }
        .ft-bottom-pill {
          padding: 3px 10px; border-radius: 100px;
          background: #eef2ff; border: 1.5px solid #e0e7ff;
          font-size: 11px; font-weight: 700; color: #6366f1;
        }

        @media (max-width: 768px) {
          .ft-inner { padding: 48px 24px 0; }
          .ft-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .ft-bottom { padding: 20px 24px; flex-direction: column; gap: 12px; text-align: center; }
        }
        @media (max-width: 480px) { .ft-grid { grid-template-columns: 1fr; } }
      `}</style>

      <footer className="ft">
        <div className="ft-inner">
          <div className="ft-grid">
            {/* Brand */}
            <div>
              <div className="ft-logo">
                <div className="ft-logo-badge">⚡</div>
                <span className="ft-logo-name">BrainBolt</span>
              </div>
              <p className="ft-brand-desc">Challenge your mind, test your skills, and climb the leaderboard against players worldwide.</p>
              <div className="ft-social">
                {[{ label: "Twitter", icon: "𝕏" }, { label: "Facebook", icon: "f" }, { label: "Instagram", icon: "📷" }].map(({ label, icon }) => (
                  <Link key={label} href="/" title={label} className="ft-social-btn">{icon}</Link>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <div className="ft-col-title">Navigate</div>
              <div className="ft-links">
                {[["Home", "/"], ["Quizzes", "/quiz"], ["Leaderboard", "/leaderBoard"], ["Profile", "/profile"]].map(([label, href]) => (
                  <Link key={label} href={href} className="ft-link">→ {label}</Link>
                ))}
              </div>
            </div>

            {/* Support */}
            <div>
              <div className="ft-col-title">Support</div>
              <div className="ft-links">
                {["Help Center", "Contact Us", "Privacy Policy", "Terms of Service"].map(item => (
                  <Link key={item} href="/" className="ft-link">→ {item}</Link>
                ))}
              </div>
            </div>

            {/* Play */}
            <div>
              <div className="ft-col-title">Play</div>
              <div className="ft-links">
                {["Instant Quiz", "Live Battles", "Rankings", "Track Progress"].map(item => (
                  <Link key={item} href="/quiz" className="ft-link">→ {item}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="ft-bottom">
          <span>© {new Date().getFullYear()} BrainBolt. All rights reserved.</span>
          <div className="ft-bottom-pills">
            <span className="ft-bottom-pill">⚡ Live Quizzes</span>
            <span className="ft-bottom-pill">🏆 Leaderboard</span>
            <span className="ft-bottom-pill">🧠 BrainBolt</span>
          </div>
        </div>
      </footer>
    </>
  )
}