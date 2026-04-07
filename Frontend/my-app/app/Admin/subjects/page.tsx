"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Subject {
  subject_id: string;
  name: string;
}

const SUBJECT_ICONS: Record<string, string> = {
  science: "⚗️", mathematics: "📐", history: "🏛️", geography: "🌍",
  technology: "💻", sports: "⚽", entertainment: "🎬", literature: "📚",
  maths: "📐", ai: "🤖", default: "🧠",
};
const getIcon = (name: string) => SUBJECT_ICONS[name.toLowerCase()] || SUBJECT_ICONS.default;

const AVATAR_COLORS = [
  { bg: "#eef2ff", color: "#6366f1", border: "#c7d2fe" },
  { bg: "#fdf2f8", color: "#ec4899", border: "#fbcfe8" },
  { bg: "#f0fdf4", color: "#14b8a6", border: "#99f6e4" },
  { bg: "#fff7ed", color: "#f97316", border: "#fed7aa" },
  { bg: "#fffbeb", color: "#f59e0b", border: "#fde68a" },
  { bg: "#f5f3ff", color: "#8b5cf6", border: "#ddd6fe" },
];

export default function AdminSubjects() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);
  const [deleting, setDeleting] = useState(false);

  const getToken = () =>
    document.cookie.split("; ").find((r) => r.startsWith("session_token="))?.split("=")[1];

  useEffect(() => {
    const fetchSubjects = async () => {
      const token = getToken();
      if (!token) { router.push("/signIn"); return; }
      const res = await fetch(`${API}/api/getSubjects`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (!res.ok) { setError("Failed to load subjects"); setLoading(false); return; }
      const data = await res.json();
      setSubjects(data.data || []);
      setLoading(false);
    };
    fetchSubjects();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const token = getToken();
    const res = await fetch(`${API}/api/delSubject/${deleteTarget.subject_id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    if (res.ok) {
      setSubjects((prev) => prev.filter((s) => s.subject_id !== deleteTarget.subject_id));
    } else {
      alert("Failed to delete subject.");
    }
    setDeleting(false);
    setDeleteTarget(null);
  };

  if (loading)
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", background: "#eef2ff" }}>
        <div className="as-spinner" />
      </div>
    );

  if (error)
    return (
      <div style={{ textAlign: "center", padding: 60, background: "#eef2ff", minHeight: "60vh" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <p style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 800, color: "#1e1b4b" }}>{error}</p>
      </div>
    );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,700&display=swap');
        .as{font-family:'Outfit',sans-serif;background:#eef2ff;min-height:100vh;color:#1e1b4b;}
        .as *{box-sizing:border-box;margin:0;padding:0;}

        .as-header{background:linear-gradient(160deg,#e0e7ff 0%,#f5f3ff 100%);padding:40px 60px 36px;border-bottom:1px solid #c7d2fe;position:relative;overflow:hidden;}
        .as-header::before{content:'';position:absolute;inset:0;background-image:radial-gradient(circle,rgba(99,102,241,0.06) 1.5px,transparent 1.5px);background-size:24px 24px;pointer-events:none;}
        .as-header-inner{max-width:960px;margin:0 auto;position:relative;z-index:1;}
        .as-tag{display:inline-flex;align-items:center;gap:7px;background:#fff;border:1.5px solid #c7d2fe;color:#6366f1;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:5px 12px;border-radius:100px;margin-bottom:14px;box-shadow:0 2px 8px rgba(99,102,241,.1);}
        .as-tag-dot{width:6px;height:6px;background:#6366f1;border-radius:50%;animation:asp 2s infinite;}
        @keyframes asp{0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.4);}50%{box-shadow:0 0 0 5px rgba(99,102,241,0);}}
        .as-title{font-family:'Fraunces',serif;font-size:clamp(24px,3.5vw,38px);font-weight:900;color:#1e1b4b;letter-spacing:-.02em;}
        .as-title em{font-style:italic;background:linear-gradient(135deg,#6366f1,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .as-nav{font-family:'Fraunces',serif;font-size:13px;font-weight:700;color:#6366f1;text-decoration:none;margin-top:10px;display:inline-block;opacity:.7;transition:opacity .15s;}
        .as-nav:hover{opacity:1;}

        .as-body{max-width:960px;margin:0 auto;padding:36px 60px 80px;}
        .as-count{font-size:13px;color:#9ca3af;font-weight:500;margin-bottom:20px;}

        /* SUBJECT CARD — matches leaderboard row style */
        .as-card{background:#fff;border:1.5px solid #e0e7ff;border-radius:18px;padding:16px 22px;margin-bottom:12px;display:flex;align-items:center;gap:14px;box-shadow:0 2px 10px rgba(99,102,241,.05);transition:box-shadow .15s,border-color .15s;}
        .as-card:hover{box-shadow:0 4px 18px rgba(99,102,241,.1);border-color:#c7d2fe;}
        .as-av{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;border:2px solid;}
        .as-name{flex:1;font-size:15px;font-weight:700;color:#1e1b4b;}
        .as-icon-chip{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;padding:4px 12px;border-radius:100px;border:1.5px solid;margin-right:8px;}
        .as-btn-delete{font-family:'Outfit',sans-serif;font-size:12px;font-weight:700;color:#dc2626;background:#fef2f2;border:1.5px solid #fecaca;border-radius:8px;padding:7px 14px;cursor:pointer;transition:background .15s,transform .12s;}
        .as-btn-delete:hover{background:#fee2e2;transform:translateY(-1px);}

        /* EMPTY */
        .as-empty{text-align:center;padding:56px;background:#fff;border-radius:20px;border:1.5px solid #e0e7ff;}

        /* MODAL */
        .as-overlay{position:fixed;inset:0;background:rgba(30,27,75,.45);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:50;padding:20px;}
        .as-modal{background:#fff;border-radius:22px;padding:32px;width:100%;max-width:400px;box-shadow:0 24px 60px rgba(99,102,241,.2);border:1.5px solid #e0e7ff;}
        .as-modal-title{font-family:'Fraunces',serif;font-size:22px;font-weight:900;color:#1e1b4b;margin-bottom:10px;}
        .as-modal-sub{font-size:14px;color:#6b7280;line-height:1.6;margin-bottom:24px;}
        .as-modal-sub strong{color:#1e1b4b;}
        .as-modal-footer{display:flex;gap:10px;justify-content:flex-end;}
        .as-btn-ghost{font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;color:#6b7280;background:#f9fafb;border:1.5px solid #e5e7eb;border-radius:10px;padding:9px 18px;cursor:pointer;transition:background .15s;}
        .as-btn-ghost:hover:not(:disabled){background:#f3f4f6;}
        .as-btn-ghost:disabled{opacity:.5;cursor:not-allowed;}
        .as-btn-danger{font-family:'Outfit',sans-serif;font-size:13px;font-weight:700;color:#fff;background:linear-gradient(135deg,#f43f5e,#ef4444);border:none;border-radius:10px;padding:9px 22px;cursor:pointer;box-shadow:0 3px 10px rgba(239,68,68,.2);transition:opacity .18s,transform .15s;}
        .as-btn-danger:hover:not(:disabled){opacity:.88;transform:translateY(-1px);}
        .as-btn-danger:disabled{opacity:.5;cursor:not-allowed;transform:none;}

        .as-spinner{width:36px;height:36px;border:3px solid #e0e7ff;border-top-color:#6366f1;border-radius:50%;animation:ass .8s linear infinite;}
        @keyframes ass{to{transform:rotate(360deg);}}
        @media(max-width:700px){.as-header,.as-body{padding:24px 20px;}}
      `}</style>

      <div className="as">
        <div className="as-header">
          <div className="as-header-inner">
            <div className="as-tag"><span className="as-tag-dot" />Subjects</div>
            <h1 className="as-title">All <em>Subjects</em></h1>
            <a href="/Admin" className="as-nav">← Admin Dashboard</a>
          </div>
        </div>

        <div className="as-body">
          <p className="as-count">{subjects.length} subjects</p>

          {subjects.length === 0 ? (
            <div className="as-empty">
              <div style={{ fontSize: 48, marginBottom: 14 }}>📚</div>
              <p style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 900, color: "#1e1b4b" }}>No subjects yet</p>
            </div>
          ) : (
            subjects.map((s, i) => {
              const ac = AVATAR_COLORS[i % AVATAR_COLORS.length];
              return (
                <div key={s.subject_id} className="as-card">
                  <div className="as-av" style={{ background: ac.bg, borderColor: ac.border }}>
                    {getIcon(s.name)}
                  </div>
                  <span className="as-name">{s.name}</span>
                  <span className="as-icon-chip" style={{ background: ac.bg, color: ac.color, borderColor: ac.border }}>
                    {getIcon(s.name)} {s.name}
                  </span>
                  <button className="as-btn-delete" onClick={() => setDeleteTarget(s)}>✕ Delete</button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="as-overlay">
          <div className="as-modal">
            <div className="as-modal-title">Delete Subject?</div>
            <p className="as-modal-sub">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
              This action cannot be undone and may affect related topics and questions.
            </p>
            <div className="as-modal-footer">
              <button className="as-btn-ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
              <button className="as-btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}