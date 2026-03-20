"use client"
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const getToken = (): string | undefined => {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split(";")
    .find((row) => row.trim().startsWith("session_token="))
    ?.split("=")[1];
};

interface UpcomingSession {
  id: string;
  topic_name: string;
  subject_name: string;
  scheduled_at: string;
  status: string;
  registered_count: number;
}

const API = process.env.NEXT_PUBLIC_API_URL;

export default function HomeLanding() {
  const router = useRouter();
  const [upcoming, setUpcoming] = useState<UpcomingSession[]>([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchUpcoming = async () => {
      if (!API) return;
      try {
        const token = getToken();
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API}/api/quiz/upcomingQuizzes`, { headers, signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        if (data.data) setUpcoming(data.data.slice(0, 3));
      } catch (e) {
        if ((e as Error).name !== "AbortError") console.error(e);
      }
    };
    fetchUpcoming();
    return () => controller.abort();
  }, []);

  const getTimeUntil = useCallback((scheduledAt: string) => {
    const diff = new Date(scheduledAt).getTime() - now.getTime();
    if (diff <= 0) return "Starting soon";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }, [now]);

  const features = [
    { icon: "🎯", title: "Instant Quiz", desc: "Pick a topic, get 10 questions, test yourself instantly.", cta: "Start now", href: "/quiz" },
    { icon: "⚔️", title: "Live Battles", desc: "Compete in real-time scheduled quizzes against other players.", cta: "View schedule", href: "/quiz" },
    { icon: "🏆", title: "Leaderboard", desc: "Climb the ranks. Top scores sorted by accuracy and speed.", cta: "See rankings", href: "/leaderBoard" },
    { icon: "📈", title: "Track Progress", desc: "Review attempts and identify where you can improve.", cta: "My profile", href: "/profile" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,700;1,9..144,900&display=swap');

        :root {
          --bg: #f0f4ff;
          --surface: #ffffff;
          --border: rgba(0,0,0,0.07);
          --text: #0d0d0d;
          --muted: #888;
          --accent1: #6c63ff;
          --accent2: #ff6584;
          --accent3: #43c6ac;
          --accent4: #f7971e;
          --radius: 20px;
        }

        .hl * { box-sizing: border-box; margin: 0; padding: 0; }

        .hl {
          font-family: 'Outfit', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ── HERO ── */
        .hl-hero {
          position: relative;
          min-height: 92vh;
          display: flex;
          align-items: center;
          padding: 80px 60px;
          overflow: hidden;
        }

        .hl-hero-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 70% 40%, rgba(108,99,255,0.13) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 20% 80%, rgba(67,198,172,0.1) 0%, transparent 50%),
            radial-gradient(ellipse 40% 30% at 90% 10%, rgba(255,101,132,0.08) 0%, transparent 50%);
          pointer-events: none;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.5;
          animation: drift 8s ease-in-out infinite alternate;
        }
        .blob-1 { width: 400px; height: 400px; background: rgba(108,99,255,0.15); top: -80px; right: 5%; animation-delay: 0s; }
        .blob-2 { width: 300px; height: 300px; background: rgba(67,198,172,0.12); bottom: 10%; left: 5%; animation-delay: 2s; }
        .blob-3 { width: 200px; height: 200px; background: rgba(255,101,132,0.1); top: 30%; right: 30%; animation-delay: 4s; }

        @keyframes drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(20px, -20px) scale(1.05); }
        }

        .hl-hero::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
        }

        .hl-hero-inner {
          position: relative;
          z-index: 2;
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .hl-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(108,99,255,0.1);
          border: 1px solid rgba(108,99,255,0.25);
          color: var(--accent1);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 100px;
          margin-bottom: 24px;
          opacity: 0;
          transform: translateY(10px);
          animation: fadeUp 0.5s ease forwards;
          animation-delay: 0.1s;
        }

        .pulse-dot {
          width: 7px; height: 7px;
          background: var(--accent1);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(108,99,255,0.4); }
          50% { box-shadow: 0 0 0 5px rgba(108,99,255,0); }
        }

        .hl-h1 {
          font-family: 'Fraunces', serif;
          font-size: clamp(42px, 5vw, 68px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: var(--text);
          margin-bottom: 20px;
          opacity: 0;
          transform: translateY(20px);
          animation: fadeUp 0.6s ease forwards;
          animation-delay: 0.2s;
        }

        .hl-h1 .grad {
          background: linear-gradient(135deg, #6c63ff 0%, #ff6584 50%, #43c6ac 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hl-sub {
          font-size: 16px;
          color: var(--muted);
          line-height: 1.7;
          font-weight: 400;
          max-width: 440px;
          margin-bottom: 36px;
          opacity: 0;
          transform: translateY(20px);
          animation: fadeUp 0.6s ease forwards;
          animation-delay: 0.35s;
        }

        .hl-btns {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          opacity: 0;
          transform: translateY(20px);
          animation: fadeUp 0.6s ease forwards;
          animation-delay: 0.5s;
        }

        .btn-play {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #6c63ff, #8b5cf6);
          color: #fff;
          font-family: 'Fraunces', serif;
          font-size: 14px;
          font-weight: 700;
          padding: 14px 28px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 8px 24px rgba(108,99,255,0.35);
          letter-spacing: 0.01em;
        }
        .btn-play:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px rgba(108,99,255,0.45);
        }

        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--surface);
          color: var(--text);
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 500;
          padding: 14px 24px;
          border-radius: 14px;
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .btn-ghost:hover {
          border-color: #ccc;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
        }

        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }

        .hl-hero-right {
          display: flex;
          flex-direction: column;
          gap: 12px;
          opacity: 0;
          animation: fadeUp 0.7s ease forwards;
          animation-delay: 0.4s;
        }

        .hero-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          transition: all 0.2s;
          cursor: pointer;
        }
        .hero-card:hover {
          transform: translateX(6px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.1);
          border-color: rgba(108,99,255,0.3);
        }

        .hero-card-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }
        .hci-1 { background: rgba(108,99,255,0.1); }
        .hci-2 { background: rgba(255,101,132,0.1); }
        .hci-3 { background: rgba(247,151,30,0.1); }

        .hero-card-text { flex: 1; }
        .hero-card-title {
          font-family: 'Fraunces', serif;
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 2px;
        }
        .hero-card-desc { font-size: 12px; color: var(--muted); line-height: 1.4; }
        .hero-card-arrow { font-size: 16px; color: #ccc; transition: all 0.2s; }
        .hero-card:hover .hero-card-arrow { color: var(--accent1); transform: translateX(3px); }

        /* ── MARQUEE ── */
        .hl-marquee {
          overflow: hidden;
          padding: 32px 0px;
          background: var(--text);
        }
        .marquee-track {
          display: flex;
          animation: marquee 20s linear infinite;
          white-space: nowrap;
        }
        .marquee-item {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 0 32px;
          font-family: 'Fraunces', serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
        }
        .marquee-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--accent1); flex-shrink: 0; }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* ── HOW IT WORKS ── */
        .hl-section {
          max-width: 1100px;
          margin: 0 auto;
          padding: 80px 60px;
          
        }

        .hl-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--accent1);
          margin-bottom: 10px;
        }

        .hl-section-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(28px, 3vw, 40px);
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.02em;
          margin-bottom: 48px;
          line-height: 1.1;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .feat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 32px;
          cursor: pointer;
          transition: all 0.25s;
          position: relative;
          overflow: hidden;
        }

        .feat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          border-radius: var(--radius) var(--radius) 0 0;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .fc-1::before { background: linear-gradient(90deg, #6c63ff, #8b5cf6); }
        .fc-2::before { background: linear-gradient(90deg, #ff6584, #f7971e); }
        .fc-3::before { background: linear-gradient(90deg, #f7971e, #43c6ac); }
        .fc-4::before { background: linear-gradient(90deg, #43c6ac, #6c63ff); }

        .feat-card:hover { transform: translateY(-4px); box-shadow: 0 20px 48px rgba(0,0,0,0.1); }
        .feat-card:hover::before { opacity: 1; }

        .feat-num {
          font-family: 'Fraunces', serif;
          font-size: 48px;
          font-weight: 800;
          color: rgba(0,0,0,0.04);
          position: absolute;
          top: 16px; right: 20px;
          line-height: 1;
        }

        .feat-icon { font-size: 30px; margin-bottom: 16px; }

        .feat-title {
          font-family: 'Fraunces', serif;
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 8px;
        }

        .feat-desc { font-size: 13px; color: var(--muted); line-height: 1.6; margin-bottom: 20px; }

        .feat-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: var(--accent1);
          transition: gap 0.2s;
        }
        .feat-card:hover .feat-cta { gap: 10px; }

        /* ── UPCOMING ── */
        .hl-upcoming-bg {
          background: var(--text);
          padding: 80px 0;
        }

        .up-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 60px;
        }

        .up-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 10px;
        }

        .up-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(28px, 3vw, 40px);
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
          margin-bottom: 40px;
        }

        .up-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .up-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 18px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .up-card:hover {
          background: rgba(255,255,255,0.09);
          transform: translateY(-3px);
          border-color: rgba(108,99,255,0.4);
        }

        .up-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 100px;
          margin-bottom: 14px;
        }
        .b-live { background: rgba(67,198,172,0.15); color: #43c6ac; border: 1px solid rgba(67,198,172,0.3); }
        .b-up   { background: rgba(247,151,30,0.15); color: #f7971e; border: 1px solid rgba(247,151,30,0.3); }

        .up-topic {
          font-family: 'Fraunces', serif;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 4px;
        }
        .up-subj { font-size: 11px; color: rgba(255,255,255,0.35); margin-bottom: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; }
        .up-time { font-size: 13px; color: #a5b4fc; font-weight: 600; font-variant-numeric: tabular-nums; }
        .up-reg  { font-size: 12px; color: rgba(255,255,255,0.25); margin-top: 6px; }

        /* ── CTA ── */
        .hl-cta {
          position: relative;
          padding: 100px 60px;
          text-align: center;
          overflow: hidden;
          background: linear-gradient(135deg, #f0f4ff 0%, #fdf2ff 50%, #f0fff4 100%);
        }

        .hl-cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(108,99,255,0.06) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
        }

        .cta-inner { position: relative; z-index: 1; }

        .cta-emoji {
          font-size: 48px;
          margin-bottom: 20px;
          display: block;
          animation: bounce 2s ease-in-out infinite;
        }
        @keyframes bounce {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .cta-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(30px, 4vw, 52px);
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.02em;
          margin-bottom: 14px;
        }

        .cta-sub {
          font-size: 16px;
          color: var(--muted);
          margin-bottom: 36px;
          font-weight: 400;
        }

        .cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

        @media (max-width: 860px) {
          .hl-hero { padding: 60px 24px; min-height: auto; }
          .hl-hero-inner { grid-template-columns: 1fr; gap: 40px; }
          .hl-hero-right { display: none; }
          .hl-section, .up-inner { padding: 60px 24px; }
          .features-grid, .up-grid { grid-template-columns: 1fr; }
          .hl-cta { padding: 60px 24px; }
        }
      `}</style>

      <div className="hl">

           {/* MARQUEE */}
        <div className="hl-marquee">
          <div className="marquee-track">
            {Array(2).fill(null).map((_, i) =>
              ["Science", "Mathematics", "History", "Geography", "Technology", "Sports", "Literature", "AI", "Entertainment", "Culture"].map((t, j) => (
                <span key={`${i}-${j}`} className="marquee-item">
                  <span className="marquee-dot" />
                  {t}
                </span>
              ))
            )}
          </div>
        </div>

        {/* HERO */}
        <section className="hl-hero">
          <div className="hl-hero-bg" />
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />

          <div className="hl-hero-inner">
            <div>
              <div className="hl-tag">
                <span className="pulse-dot" />
                Live quizzes · Real competition
              </div>

              <h1 className="hl-h1">
                Prove You&apos;re<br />
                <span className="grad">The Smartest</span><br />
                in the Room.
              </h1>

              <p className="hl-sub">
                Jump into live quiz battles, challenge yourself across dozens of topics,
                and climb the global leaderboard. Your brain deserves a workout.
              </p>

              <div className="hl-btns">
                <button className="btn-play" onClick={() => router.push("/quiz")}>
                  ⚡ Play Now
                </button>
                <button className="btn-ghost" onClick={() => router.push("/leaderBoard")}>
                  🏆 Leaderboard
                </button>
              </div>
            </div>

            <div className="hl-hero-right">
              {[
                { icon: "🎯", color: "hci-1", title: "10 Questions", desc: "Fast-paced, no filler. Pure knowledge testing.", href: "/quiz" },
                { icon: "⚔️", color: "hci-2", title: "Live Battles", desc: "Same questions, same time — may the best mind win.", href: "/quiz" },
                { icon: "🏅", color: "hci-3", title: "Earn Your Rank", desc: "Accuracy + speed = your spot on the leaderboard.", href: "/leaderBoard" },
              ].map((c, i) => (
                <div key={i} className="hero-card" onClick={() => router.push(c.href)}>
                  <div className={`hero-card-icon ${c.color}`}>{c.icon}</div>
                  <div className="hero-card-text">
                    <div className="hero-card-title">{c.title}</div>
                    <div className="hero-card-desc">{c.desc}</div>
                  </div>
                  <div className="hero-card-arrow">→</div>
                </div>
              ))}
            </div>
          </div>
        </section>

     

        {/* HOW IT WORKS */}
        <section className="hl-section">
          <div className="hl-eyebrow">How it works</div>
          <div className="hl-section-title">Four ways to<br />get smarter.</div>

          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className={`feat-card fc-${i + 1}`} onClick={() => router.push(f.href)}>
                <div className="feat-num">0{i + 1}</div>
                <div className="feat-icon">{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <div className="feat-desc">{f.desc}</div>
                <div className="feat-cta">{f.cta} →</div>
              </div>
            ))}
          </div>
        </section>

        {/* UPCOMING */}
        {upcoming.length > 0 && (
          <div className="hl-upcoming-bg">
            <div className="up-inner">
              <div className="up-eyebrow">Live & Scheduled</div>
              <div className="up-title">Upcoming Battles</div>
              <div className="up-grid">
                {upcoming.map((s) => (
                  <div key={s.id} className="up-card" onClick={() => router.push("/quiz")}>
                    <div className={`up-badge ${s.status === "active" ? "b-live" : "b-up"}`}>
                      {s.status === "active" ? "🟢 Live Now" : "⏰ Upcoming"}
                    </div>
                    <div className="up-topic">{s.topic_name}</div>
                    <div className="up-subj">{s.subject_name}</div>
                    {s.status === "upcoming" && (
                      <div className="up-time">⏳ {getTimeUntil(s.scheduled_at)}</div>
                    )}
                    <div className="up-reg">{s.registered_count} registered</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <section className="hl-cta">
          <div className="cta-inner">
            <span className="cta-emoji">🧠</span>
            <h2 className="cta-title">Ready to challenge<br />your limits?</h2>
            <p className="cta-sub">Join thousands competing every day. Your next win is one click away.</p>
            <div className="cta-btns">
              <button className="btn-play" onClick={() => router.push("/quiz")}>
                ⚡ Start Playing
              </button>
              <button className="btn-ghost" onClick={() => router.push("/profile")}>
                👤 View Profile
              </button>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}