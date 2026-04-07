// app/admin/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Question {
  question_id: string;
  status: string;
  difficulty: string;
  topic_id: string;
}

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    redirect("/Auth/signIn?error=login_required");
  }

  const res = await fetch(`${API}/api/allquestion`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    console.log("API error:", res.status, res.statusText);
    return <div>Failed to load stats</div>;
  }

  const data = await res.json();
  const questions: Question[] = data.data || [];

  const stats = {
    pending: questions.filter((q) => q.status === "pending").length,
    approved: questions.filter((q) => q.status === "approved").length,
    rejected: questions.filter((q) => q.status === "rejected").length,
    total: questions.length,
  };

  const navLinks = [
    { href: "/Admin/pending", label: "Review Pending", emoji: "🔍", color: "from-orange-400 to-amber-300", border: "border-orange-300" },
    { href: "/Admin/questions", label: "All Questions", emoji: "📋", color: "from-blue-400 to-cyan-300", border: "border-blue-300" },
    { href: "/Admin/subjects", label: "Manage Subjects", emoji: "📚", color: "from-purple-400 to-pink-300", border: "border-purple-300" },
    { href: "/Admin/upload", label: "Uploads", emoji: "⬆️", color: "from-green-400 to-teal-300", border: "border-green-300" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Nunito', sans-serif;
          background: #f0f4ff;
          min-height: 100vh;
        }

        .page {
          min-height: 100vh;
          background: #eef2ff;
          padding: 2rem;
        }

        /* Rainbow top bar */
        .rainbow-bar {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 5px;
          background: linear-gradient(90deg, #f87171, #fb923c, #facc15, #4ade80, #60a5fa, #a78bfa, #f472b6);
          z-index: 100;
        }

        /* Header */
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          padding-top: 0.5rem;
        }

        .logo-area {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          width: 48px; height: 48px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem;
          box-shadow: 0 4px 12px rgba(99,102,241,0.35);
        }

        .logo-text {
          font-family: 'Fredoka One', sans-serif;
          font-size: 1.6rem;
          background: linear-gradient(135deg, #6366f1, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .play-btn {
          background: linear-gradient(135deg, #f97316, #ef4444);
          color: white;
          font-family: 'Nunito', sans-serif;
          font-weight: 800;
          font-size: 0.9rem;
          border: none;
          border-radius: 999px;
          padding: 0.6rem 1.4rem;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(249,115,22,0.4);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .play-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(249,115,22,0.5);
        }

        /* Welcome Card */
        .welcome-card {
          background: white;
          border-radius: 20px;
          padding: 1.75rem 2rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          border: 2px solid transparent;
          background-clip: padding-box;
          position: relative;
          box-shadow: 0 2px 16px rgba(99,102,241,0.08);
          overflow: hidden;
        }

        .welcome-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          padding: 2px;
          background: linear-gradient(135deg, #6366f1, #ec4899, #f97316);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .admin-avatar {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 2rem;
          flex-shrink: 0;
          box-shadow: 0 4px 16px rgba(99,102,241,0.3);
          border: 3px solid white;
          outline: 3px solid #6366f1;
        }

        .welcome-text h1 {
          font-family: 'Fredoka One', sans-serif;
          font-size: 1.8rem;
          color: #1e1b4b;
        }

        .welcome-text p {
          color: #6b7280;
          font-size: 0.9rem;
          font-weight: 600;
          margin-top: 0.15rem;
        }

        .admin-badge {
          margin-left: auto;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          font-weight: 800;
          font-size: 0.8rem;
          padding: 0.4rem 1rem;
          border-radius: 999px;
          letter-spacing: 0.05em;
        }

        /* Stats row */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .stat-card {
          background: white;
          border-radius: 18px;
          padding: 1.5rem 1.25rem;
          text-align: center;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          position: relative;
          overflow: hidden;
          transition: transform 0.2s;
        }
        .stat-card:hover { transform: translateY(-3px); }

        .stat-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          border-radius: 18px 18px 0 0;
        }

        .stat-card.total::after  { background: linear-gradient(90deg, #6366f1, #8b5cf6); }
        .stat-card.pending::after { background: linear-gradient(90deg, #f97316, #facc15); }
        .stat-card.approved::after { background: linear-gradient(90deg, #22c55e, #4ade80); }
        .stat-card.rejected::after { background: linear-gradient(90deg, #ef4444, #f87171); }

        .stat-icon {
          width: 48px; height: 48px;
          border-radius: 14px;
          margin: 0 auto 0.75rem;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem;
        }

        .stat-card.total .stat-icon   { background: #ede9fe; }
        .stat-card.pending .stat-icon  { background: #fff7ed; }
        .stat-card.approved .stat-icon { background: #f0fdf4; }
        .stat-card.rejected .stat-icon { background: #fef2f2; }

        .stat-number {
          font-family: 'Fredoka One', sans-serif;
          font-size: 2.4rem;
          line-height: 1;
          margin-bottom: 0.25rem;
        }

        .stat-card.total .stat-number   { color: #6366f1; }
        .stat-card.pending .stat-number  { color: #f97316; }
        .stat-card.approved .stat-number { color: #22c55e; }
        .stat-card.rejected .stat-number { color: #ef4444; }

        .stat-label {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #9ca3af;
        }

        /* Bottom two columns */
        .bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 640px) {
          .bottom-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
          .admin-badge { display: none; }
        }

        /* Quick Actions */
        .section-card {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }

        .section-title {
          font-family: 'Fredoka One', sans-serif;
          font-size: 1.15rem;
          color: #1e1b4b;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 0.875rem 1rem;
          border-radius: 14px;
          text-decoration: none;
          margin-bottom: 0.65rem;
          font-weight: 700;
          font-size: 0.95rem;
          color: #1e1b4b;
          border: 2px solid transparent;
          transition: transform 0.15s, box-shadow 0.15s;
          background: #f8f9ff;
        }
        .action-btn:last-child { margin-bottom: 0; }
        .action-btn:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }

        .action-btn-icon {
          width: 40px; height: 40px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .action-btn.orange { border-color: #fed7aa; }
        .action-btn.orange .action-btn-icon { background: linear-gradient(135deg, #f97316, #facc15); }
        .action-btn.blue   { border-color: #bfdbfe; }
        .action-btn.blue   .action-btn-icon { background: linear-gradient(135deg, #3b82f6, #06b6d4); }
        .action-btn.purple { border-color: #e9d5ff; }
        .action-btn.purple .action-btn-icon { background: linear-gradient(135deg, #8b5cf6, #ec4899); }
        .action-btn.green  { border-color: #bbf7d0; }
        .action-btn.green  .action-btn-icon { background: linear-gradient(135deg, #22c55e, #10b981); }

        /* Activity panel */
        .activity-bar {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          height: 8px;
          border-radius: 999px;
          overflow: hidden;
        }

        .activity-segment {
          border-radius: 999px;
        }

        .activity-legend {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .legend-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .legend-dot-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #4b5563;
        }

        .legend-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
        }

        .legend-count {
          font-family: 'Fredoka One', sans-serif;
          font-size: 1rem;
        }
      `}</style>

      <div className="rainbow-bar" />

      <div className="page" style={{ paddingTop: "2.5rem" }}>
        {/* Header */}
        <div className="header">
          <div className="logo-area">
           
          </div>
          <a href="/Admin/schedule-quiz" className="play-btn">Schedule-Quiz</a>
        </div>

        {/* Welcome Card */}
        <div className="welcome-card">
          <div className="admin-avatar">🛡️</div>
          <div className="welcome-text">
            
            <p>Manage questions, subjects, and more</p>
          </div>
        
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">📊</div>
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Questions</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-icon">🔍</div>
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending Review</div>
          </div>
          <div className="stat-card approved">
            <div className="stat-icon">✅</div>
            <div className="stat-number">{stats.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card rejected">
            <div className="stat-icon">❌</div>
            <div className="stat-number">{stats.rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>

        {/* Bottom */}
        <div className="bottom-grid">
          {/* Quick Actions */}
          <div className="section-card">
            <div className="section-title">⚡ Quick Actions</div>
            <a href="/Admin/pending" className="action-btn orange">
              <div className="action-btn-icon">🔍</div>
              Review Pending
            </a>
            <a href="/Admin/questions" className="action-btn blue">
              <div className="action-btn-icon">📋</div>
              All Questions
            </a>
            <a href="/Admin/subjects" className="action-btn purple">
              <div className="action-btn-icon">📚</div>
              Manage Subjects
            </a>
            <a href="/Admin/upload" className="action-btn green">
              <div className="action-btn-icon">⬆️</div>
              Uploads
            </a>
          </div>

          {/* Overview */}
          <div className="section-card">
            <div className="section-title">📊 Overview</div>

            {/* Proportional bar */}
            <div className="activity-bar">
              {stats.total > 0 && (
                <>
                  <div
                    className="activity-segment"
                    style={{
                      width: `${(stats.approved / stats.total) * 100}%`,
                      background: "linear-gradient(90deg, #22c55e, #4ade80)",
                    }}
                  />
                  <div
                    className="activity-segment"
                    style={{
                      width: `${(stats.pending / stats.total) * 100}%`,
                      background: "linear-gradient(90deg, #f97316, #facc15)",
                    }}
                  />
                  <div
                    className="activity-segment"
                    style={{
                      width: `${(stats.rejected / stats.total) * 100}%`,
                      background: "linear-gradient(90deg, #ef4444, #f87171)",
                    }}
                  />
                </>
              )}
            </div>

            <div className="activity-legend">
              <div className="legend-row">
                <div className="legend-dot-label">
                  <div className="legend-dot" style={{ background: "#22c55e" }} />
                  Approved
                </div>
                <span className="legend-count" style={{ color: "#22c55e" }}>
                  {stats.approved}
                </span>
              </div>
              <div className="legend-row">
                <div className="legend-dot-label">
                  <div className="legend-dot" style={{ background: "#f97316" }} />
                  Pending
                </div>
                <span className="legend-count" style={{ color: "#f97316" }}>
                  {stats.pending}
                </span>
              </div>
              <div className="legend-row">
                <div className="legend-dot-label">
                  <div className="legend-dot" style={{ background: "#ef4444" }} />
                  Rejected
                </div>
                <span className="legend-count" style={{ color: "#ef4444" }}>
                  {stats.rejected}
                </span>
              </div>
              <div className="legend-row" style={{ borderTop: "1px solid #f3f4f6", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
                <div className="legend-dot-label">
                  <div className="legend-dot" style={{ background: "#6366f1" }} />
                  Total
                </div>
                <span className="legend-count" style={{ color: "#6366f1" }}>
                  {stats.total}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}