"use client";
import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Question {
  question_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  status: string;
  difficulty: string;
  rejection_reason: string | null;
}

const DIFF_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  easy:   { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  medium: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  hard:   { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
};

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  approved: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  pending:  { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  rejected: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
};

const FIELDS = ["question_text", "option_a", "option_b", "option_c", "option_d", "correct_answer"] as const;

export default function AdminAllQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState<Question | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const getToken = () =>
    document.cookie.split("; ").find((r) => r.startsWith("session_token="))?.split("=")[1];

  const fetchQuestions = async () => {
    const token = getToken();
    const res = await fetch(`${API}/api/allquestion`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setQuestions(data.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchQuestions(); }, []);

  const handleDelete = async (id: string) => {
    setActionLoading(true);
    const token = getToken();
    await fetch(`${API}/api/deleteQuestions/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setDeleteId(null);
    await fetchQuestions();
    setActionLoading(false);
  };

  const handleUpdate = async () => {
    if (!editModal) return;
    setActionLoading(true);
    const token = getToken();
    await fetch(`${API}/api/updateQuestion/${editModal.question_id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(editModal),
    });
    setEditModal(null);
    await fetchQuestions();
    setActionLoading(false);
  };

  const handleApprove = async (id: string) => {
    const token = getToken();
    await fetch(`${API}/api/updateApprove/${id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    await fetchQuestions();
  };

  if (loading)
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", background: "#eef2ff" }}>
        <div className="aq-spinner" />
      </div>
    );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,700&display=swap');
        .aq{font-family:'Outfit',sans-serif;background:#eef2ff;min-height:100vh;color:#1e1b4b;}
        .aq *{box-sizing:border-box;margin:0;padding:0;}

        .aq-header{background:linear-gradient(160deg,#e0e7ff 0%,#f5f3ff 100%);padding:40px 60px 36px;border-bottom:1px solid #c7d2fe;position:relative;overflow:hidden;}
        .aq-header::before{content:'';position:absolute;inset:0;background-image:radial-gradient(circle,rgba(99,102,241,0.06) 1.5px,transparent 1.5px);background-size:24px 24px;pointer-events:none;}
        .aq-header-inner{max-width:960px;margin:0 auto;position:relative;z-index:1;}
        .aq-tag{display:inline-flex;align-items:center;gap:7px;background:#fff;border:1.5px solid #c7d2fe;color:#6366f1;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:5px 12px;border-radius:100px;margin-bottom:14px;box-shadow:0 2px 8px rgba(99,102,241,.1);}
        .aq-tag-dot{width:6px;height:6px;background:#6366f1;border-radius:50%;animation:aqp 2s infinite;}
        @keyframes aqp{0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.4);}50%{box-shadow:0 0 0 5px rgba(99,102,241,0);}}
        .aq-title{font-family:'Fraunces',serif;font-size:clamp(24px,3.5vw,38px);font-weight:900;color:#1e1b4b;letter-spacing:-.02em;}
        .aq-title em{font-style:italic;background:linear-gradient(135deg,#6366f1,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .aq-nav{font-family:'Fraunces',serif;font-size:13px;font-weight:700;color:#6366f1;text-decoration:none;margin-top:10px;display:inline-block;opacity:.7;transition:opacity .15s;}
        .aq-nav:hover{opacity:1;}

        .aq-body{max-width:960px;margin:0 auto;padding:36px 60px 80px;}
        .aq-count{font-size:13px;color:#9ca3af;font-weight:500;margin-bottom:20px;}

        /* QUESTION CARD */
        .aq-card{background:#fff;border:1.5px solid #e0e7ff;border-radius:18px;padding:18px 22px;margin-bottom:14px;display:flex;align-items:flex-start;gap:14px;box-shadow:0 2px 10px rgba(99,102,241,.05);transition:box-shadow .15s;}
        .aq-card:hover{box-shadow:0 4px 18px rgba(99,102,241,.1);}
        .aq-card-body{flex:1;min-width:0;}
        .aq-card-q{font-size:14px;font-weight:600;color:#1e1b4b;line-height:1.5;}
        .aq-card-meta{display:flex;align-items:center;gap:8px;margin-top:8px;flex-wrap:wrap;}
        .aq-chip{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:3px 10px;border-radius:100px;border:1.5px solid;}
        .aq-rejection{font-size:12px;color:#dc2626;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:6px 10px;margin-top:8px;}
        .aq-card-actions{display:flex;gap:8px;flex-shrink:0;align-items:center;flex-wrap:wrap;justify-content:flex-end;}

        .aq-btn-sm{font-family:'Outfit',sans-serif;font-size:11px;font-weight:700;border-radius:8px;padding:6px 13px;cursor:pointer;transition:opacity .15s,transform .12s;border:1.5px solid;}
        .aq-btn-sm:hover{opacity:.85;transform:translateY(-1px);}
        .aq-btn-approve{background:#f0fdf4;color:#16a34a;border-color:#bbf7d0;}
        .aq-btn-edit{background:#eef2ff;color:#6366f1;border-color:#c7d2fe;}
        .aq-btn-delete{background:#fef2f2;color:#dc2626;border-color:#fecaca;}

        /* EMPTY */
        .aq-empty{text-align:center;padding:56px;background:#fff;border-radius:20px;border:1.5px solid #e0e7ff;}

        /* MODAL */
        .aq-overlay{position:fixed;inset:0;background:rgba(30,27,75,.45);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:50;padding:20px;}
        .aq-modal{background:#fff;border-radius:22px;padding:32px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 60px rgba(99,102,241,.2);border:1.5px solid #e0e7ff;}
        .aq-modal-sm{max-width:400px;}
        .aq-modal-title{font-family:'Fraunces',serif;font-size:22px;font-weight:900;color:#1e1b4b;margin-bottom:20px;}
        .aq-modal-sub{font-size:14px;color:#6b7280;margin-bottom:24px;line-height:1.6;}
        .aq-field{margin-bottom:16px;}
        .aq-label{display:block;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9ca3af;margin-bottom:6px;}
        .aq-input{width:100%;font-family:'Outfit',sans-serif;font-size:14px;font-weight:500;color:#1e1b4b;background:#fafbff;border:1.5px solid #e0e7ff;border-radius:10px;padding:10px 14px;outline:none;transition:border-color .18s,box-shadow .18s;}
        .aq-input:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.1);}
        .aq-select{width:100%;font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;color:#1e1b4b;background:#fafbff;border:1.5px solid #e0e7ff;border-radius:10px;padding:10px 14px;outline:none;cursor:pointer;transition:border-color .18s;}
        .aq-select:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.1);}
        .aq-modal-footer{display:flex;gap:10px;justify-content:flex-end;margin-top:20px;}
        .aq-btn-ghost{font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;color:#6b7280;background:#f9fafb;border:1.5px solid #e5e7eb;border-radius:10px;padding:9px 18px;cursor:pointer;transition:background .15s;}
        .aq-btn-ghost:hover{background:#f3f4f6;}
        .aq-btn-primary{font-family:'Outfit',sans-serif;font-size:13px;font-weight:700;color:#fff;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;border-radius:10px;padding:9px 22px;cursor:pointer;box-shadow:0 3px 10px rgba(99,102,241,.25);transition:opacity .18s,transform .15s;}
        .aq-btn-primary:hover:not(:disabled){opacity:.88;transform:translateY(-1px);}
        .aq-btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none;}
        .aq-btn-danger{font-family:'Outfit',sans-serif;font-size:13px;font-weight:700;color:#fff;background:linear-gradient(135deg,#f43f5e,#ef4444);border:none;border-radius:10px;padding:9px 22px;cursor:pointer;box-shadow:0 3px 10px rgba(239,68,68,.2);transition:opacity .18s,transform .15s;}
        .aq-btn-danger:hover:not(:disabled){opacity:.88;transform:translateY(-1px);}
        .aq-btn-danger:disabled{opacity:.5;cursor:not-allowed;transform:none;}

        .aq-spinner{width:36px;height:36px;border:3px solid #e0e7ff;border-top-color:#6366f1;border-radius:50%;animation:aqs .8s linear infinite;}
        @keyframes aqs{to{transform:rotate(360deg);}}
        @media(max-width:700px){.aq-header,.aq-body{padding:24px 20px;}.aq-card-actions{flex-direction:column;gap:4px;}}
      `}</style>

      <div className="aq">
        <div className="aq-header">
          <div className="aq-header-inner">
            <div className="aq-tag"><span className="aq-tag-dot" />Question Bank</div>
            <h1 className="aq-title">All <em>Questions</em></h1>
            <a href="/Admin" className="aq-nav">← Admin Dashboard</a>
          </div>
        </div>

        <div className="aq-body">
          <p className="aq-count">{questions.length} questions total</p>

          {questions.length === 0 ? (
            <div className="aq-empty">
              <div style={{ fontSize: 48, marginBottom: 14 }}>📭</div>
              <p style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 900, color: "#1e1b4b" }}>No questions yet</p>
            </div>
          ) : (
            questions.map((q) => {
              const diff = DIFF_STYLE[q.difficulty] || DIFF_STYLE.easy;
              const stat = STATUS_STYLE[q.status] || STATUS_STYLE.pending;
              return (
                <div key={q.question_id} className="aq-card">
                  <div className="aq-card-body">
                    <p className="aq-card-q">{q.question_text}</p>
                    <div className="aq-card-meta">
                      <span className="aq-chip" style={{ background: diff.bg, color: diff.color, borderColor: diff.border }}>{q.difficulty}</span>
                      <span className="aq-chip" style={{ background: stat.bg, color: stat.color, borderColor: stat.border }}>{q.status}</span>
                    </div>
                    {q.rejection_reason && (
                      <div className="aq-rejection">⚠️ {q.rejection_reason}</div>
                    )}
                  </div>
                  <div className="aq-card-actions">
                    {q.status === "rejected" && (
                      <button className="aq-btn-sm aq-btn-approve" onClick={() => handleApprove(q.question_id)}>✓ Approve</button>
                    )}
                    <button className="aq-btn-sm aq-btn-edit" onClick={() => setEditModal(q)}>✎ Edit</button>
                    <button className="aq-btn-sm aq-btn-delete" onClick={() => setDeleteId(q.question_id)}>✕ Delete</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editModal && (
        <div className="aq-overlay">
          <div className="aq-modal">
            <div className="aq-modal-title">Edit Question</div>
            {FIELDS.map((field) => (
              <div key={field} className="aq-field">
                <label className="aq-label">{field.replace(/_/g, " ")}</label>
                <input className="aq-input" type="text"
                  value={editModal[field] || ""}
                  onChange={(e) => setEditModal({ ...editModal, [field]: e.target.value })}
                />
              </div>
            ))}
            <div className="aq-field">
              <label className="aq-label">Difficulty</label>
              <select className="aq-select" value={editModal.difficulty}
                onChange={(e) => setEditModal({ ...editModal, difficulty: e.target.value })}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="aq-modal-footer">
              <button className="aq-btn-ghost" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="aq-btn-primary" onClick={handleUpdate} disabled={actionLoading}>
                {actionLoading ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="aq-overlay">
          <div className="aq-modal aq-modal-sm">
            <div className="aq-modal-title">Delete Question?</div>
            <p className="aq-modal-sub">This action is permanent and cannot be undone.</p>
            <div className="aq-modal-footer">
              <button className="aq-btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="aq-btn-danger" onClick={() => handleDelete(deleteId)} disabled={actionLoading}>
                {actionLoading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}