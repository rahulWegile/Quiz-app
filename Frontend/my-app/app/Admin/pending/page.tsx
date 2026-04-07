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
}

export default function AdminQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState<{ id: string | null; bulk: boolean }>({ id: null, bulk: false });
  const [rejectReason, setRejectReason] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getToken = () =>
    document.cookie.split("; ").find((row) => row.startsWith("session_token="))?.split("=")[1];

  const fetchQuestions = async () => {
    const token = getToken();
    const res = await fetch(`${API}/api/questionStatusPending`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setQuestions(data.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchQuestions(); }, []);

  const toggleSelect = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const selectAll = () =>
    setSelected(selected.length === questions.length ? [] : questions.map((q) => q.question_id));

  const approveOne = async (id: string) => {
    const token = getToken();
    await fetch(`${API}/api/updateApprove/${id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    await fetchQuestions();
  };

  const approveSelected = async () => {
    setActionLoading(true);
    const token = getToken();
    await Promise.all(selected.map((id) =>
      fetch(`${API}/api/updateApprove/${id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } })
    ));
    setSelected([]);
    await fetchQuestions();
    setActionLoading(false);
  };

  const confirmReject = async () => {
    setActionLoading(true);
    const token = getToken();
    if (rejectModal.bulk) {
      await Promise.all(selected.map((id) =>
        fetch(`${API}/api/updateReject/${id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ rejection_reason: rejectReason || "Rejected by admin" }),
        })
      ));
      setSelected([]);
    } else {
      await fetch(`${API}/api/updateReject/${rejectModal.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ rejection_reason: rejectReason || "Rejected by admin" }),
      });
    }
    setRejectModal({ id: null, bulk: false });
    setRejectReason("");
    await fetchQuestions();
    setActionLoading(false);
  };

  const difficultyStyle = (d: string) => {
    if (d === "easy") return { background: "#f0fdf4", color: "#14b8a6", borderColor: "#99f6e4" };
    if (d === "medium") return { background: "#fffbeb", color: "#f59e0b", borderColor: "#fde68a" };
    if (d === "hard") return { background: "#fdf2f8", color: "#ec4899", borderColor: "#fbcfe8" };
    return { background: "#eef2ff", color: "#6366f1", borderColor: "#c7d2fe" };
  };

  const optionKeys = ["option_a", "option_b", "option_c", "option_d"] as const;
  const optionLabels = ["A", "B", "C", "D"];

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
        .aq { font-family: 'Outfit', sans-serif; background: #eef2ff; min-height: 100vh; color: #1e1b4b; }
        .aq * { box-sizing: border-box; margin: 0; padding: 0; }

        /* HEADER */
        .aq-header { background: linear-gradient(160deg, #e0e7ff 0%, #f5f3ff 100%); padding: 48px 60px 40px; border-bottom: 1px solid #c7d2fe; position: relative; overflow: hidden; }
        .aq-header::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(circle, rgba(99,102,241,0.06) 1.5px, transparent 1.5px); background-size: 24px 24px; pointer-events: none; }
        .aq-header-inner { max-width: 960px; margin: 0 auto; position: relative; z-index: 1; }
        .aq-tag { display: inline-flex; align-items: center; gap: 7px; background: #fff; border: 1.5px solid #c7d2fe; color: #6366f1; font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; padding: 5px 12px; border-radius: 100px; margin-bottom: 14px; box-shadow: 0 2px 8px rgba(99,102,241,.1); }
        .aq-tag-dot { width: 6px; height: 6px; background: #6366f1; border-radius: 50%; animation: aqp 2s infinite; }
        @keyframes aqp { 0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,.4); } 50% { box-shadow: 0 0 0 5px rgba(99,102,241,0); } }
        .aq-title { font-family: 'Fraunces', serif; font-size: clamp(28px, 4vw, 44px); font-weight: 900; color: #1e1b4b; letter-spacing: -.02em; line-height: 1.05; }
        .aq-title em { font-style: italic; background: linear-gradient(135deg, #6366f1, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .aq-sub { font-size: 14px; color: #6b7280; margin-top: 6px; }

        /* BODY */
        .aq-body { max-width: 960px; margin: 0 auto; padding: 40px 60px 80px; }

        /* ACTION BAR */
        .aq-bar { display: flex; align-items: center; gap: 12px; background: #fff; border: 1.5px solid #e0e7ff; border-radius: 16px; padding: 14px 20px; margin-bottom: 24px; box-shadow: 0 2px 12px rgba(99,102,241,.06); flex-wrap: wrap; }
        .aq-bar-check { width: 16px; height: 16px; cursor: pointer; accent-color: #6366f1; }
        .aq-bar-label { font-size: 13px; color: #6b7280; font-weight: 500; }
        .aq-btn { font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 700; padding: 8px 16px; border-radius: 10px; border: none; cursor: pointer; transition: all .15s; }
        .aq-btn-approve { background: #6366f1; color: #fff; }
        .aq-btn-approve:hover { background: #4f46e5; }
        .aq-btn-reject { background: #fff; color: #ec4899; border: 1.5px solid #fbcfe8; }
        .aq-btn-reject:hover { background: #fdf2f8; }
        .aq-btn:disabled { background: #f3f4f6; color: #9ca3af; border-color: transparent; cursor: not-allowed; }
        .aq-bar-count { margin-left: auto; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #9ca3af; }

        /* QUESTION CARD */
        .aq-card { background: #fff; border: 1.5px solid #e0e7ff; border-radius: 20px; margin-bottom: 12px; overflow: hidden; transition: box-shadow .2s; box-shadow: 0 2px 8px rgba(99,102,241,.05); }
        .aq-card:hover { box-shadow: 0 8px 24px rgba(99,102,241,.10); }
        .aq-card.selected { border-color: #a5b4fc; background: #fafbff; }
        .aq-card-row { display: flex; align-items: flex-start; gap: 14px; padding: 18px 20px; }
        .aq-card-check { margin-top: 3px; width: 16px; height: 16px; cursor: pointer; accent-color: #6366f1; flex-shrink: 0; }
        .aq-card-body { flex: 1; min-width: 0; }
        .aq-card-text { font-size: 15px; font-weight: 600; color: #1e1b4b; line-height: 1.5; }
        .aq-card-meta { display: flex; align-items: center; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
        .aq-diff-chip { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 100px; border: 1px solid; }
        .aq-status { font-size: 11px; color: #9ca3af; font-weight: 500; }
        .aq-card-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
        .aq-btn-review { font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 8px; background: #eef2ff; color: #6366f1; border: 1.5px solid #c7d2fe; cursor: pointer; transition: all .15s; }
        .aq-btn-review:hover { background: #e0e7ff; }
        .aq-btn-sm-approve { font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 8px; background: #6366f1; color: #fff; border: none; cursor: pointer; transition: background .15s; }
        .aq-btn-sm-approve:hover { background: #4f46e5; }
        .aq-btn-sm-reject { font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 8px; background: #fff; color: #ec4899; border: 1.5px solid #fbcfe8; cursor: pointer; transition: all .15s; }
        .aq-btn-sm-reject:hover { background: #fdf2f8; }

        /* REVIEW PANEL */
        .aq-review { border-top: 1px solid #f3f4f6; padding: 20px 20px 20px 50px; background: #fafbff; }
        .aq-review-label { font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #9ca3af; margin-bottom: 12px; }
        .aq-options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .aq-option { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 12px; border: 1.5px solid #e0e7ff; font-size: 13px; font-weight: 500; color: #374151; background: #fff; transition: all .15s; }
        .aq-option.correct { background: #f0fdf4; border-color: #6ee7b7; color: #065f46; font-weight: 700; }
        .aq-option-badge { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; font-family: 'Fraunces', serif; flex-shrink: 0; background: #f3f4f6; color: #6b7280; }
        .aq-option.correct .aq-option-badge { background: #10b981; color: #fff; }
        .aq-option-correct-tag { margin-left: auto; font-size: 11px; font-weight: 700; color: #10b981; }

        /* EMPTY */
        .aq-empty { text-align: center; padding: 56px; background: #fff; border-radius: 20px; border: 1.5px solid #e0e7ff; }
        .aq-empty-icon { font-size: 48px; margin-bottom: 14px; }
        .aq-empty-title { font-family: 'Fraunces', serif; font-size: 22px; font-weight: 900; color: #1e1b4b; margin-bottom: 8px; }
        .aq-empty-sub { font-size: 14px; color: #9ca3af; }

        /* MODAL */
        .aq-modal-overlay { position: fixed; inset: 0; background: rgba(30,27,75,.45); display: flex; align-items: center; justify-content: center; z-index: 50; }
        .aq-modal { background: #fff; border-radius: 20px; padding: 28px; width: 100%; max-width: 440px; box-shadow: 0 20px 60px rgba(99,102,241,.18); }
        .aq-modal-title { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 900; color: #1e1b4b; margin-bottom: 16px; }
        .aq-modal-textarea { width: 100%; border: 1.5px solid #e0e7ff; border-radius: 12px; padding: 12px; font-family: 'Outfit', sans-serif; font-size: 14px; height: 110px; resize: none; color: #1e1b4b; outline: none; transition: border-color .15s; }
        .aq-modal-textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.10); }
        .aq-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 16px; }
        .aq-btn-cancel { font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600; padding: 9px 18px; border-radius: 10px; background: #fff; border: 1.5px solid #e0e7ff; color: #6b7280; cursor: pointer; }
        .aq-btn-cancel:hover { background: #f9fafb; }
        .aq-btn-confirm-reject { font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 700; padding: 9px 18px; border-radius: 10px; background: #ec4899; color: #fff; border: none; cursor: pointer; transition: background .15s; }
        .aq-btn-confirm-reject:hover { background: #db2777; }
        .aq-btn-confirm-reject:disabled { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; }

        .aq-spinner { width: 36px; height: 36px; border: 3px solid #e0e7ff; border-top-color: #6366f1; border-radius: 50%; animation: aqs .8s linear infinite; }
        @keyframes aqs { to { transform: rotate(360deg); } }

        @media (max-width: 700px) {
          .aq-header, .aq-body { padding: 28px 20px; }
          .aq-options { grid-template-columns: 1fr; }
          .aq-card-actions { flex-wrap: wrap; }
          .aq-review { padding-left: 20px; }
        }
          
      `}</style>

      <div className="aq">
        {/* HEADER */}
        <div className="aq-header">
          <div className="aq-header-inner">
            <div className="aq-tag">
              <span className="aq-tag-dot" />
              Super Admin
            </div>
            <h1 className="aq-title">Pending <em>Questions</em></h1>
            <p className="aq-sub">Review, approve or reject submitted questions</p>
          </div>
        </div>

        <div className="aq-body">
          {/* ACTION BAR */}
          <div className="aq-bar">
            <input type="checkbox" className="aq-bar-check"
              checked={selected.length === questions.length && questions.length > 0}
              onChange={selectAll}
            />
            <span className="aq-bar-label">
              {selected.length > 0 ? `${selected.length} selected` : "Select all"}
            </span>
            <button className="aq-btn aq-btn-approve"
              disabled={actionLoading || selected.length === 0}
              onClick={approveSelected}
            >
              {actionLoading ? "Processing..." : `Approve${selected.length > 0 ? ` (${selected.length})` : ""}`}
            </button>
            <button className="aq-btn aq-btn-reject"
              disabled={actionLoading || selected.length === 0}
              onClick={() => setRejectModal({ id: null, bulk: true })}
            >
              {actionLoading ? "Processing..." : `Reject${selected.length > 0 ? ` (${selected.length})` : ""}`}
            </button>
            <span className="aq-bar-count">Total: {questions.length}</span>
          </div>

          {/* QUESTIONS */}
          {questions.length === 0 ? (
            <div className="aq-empty">
              <div className="aq-empty-icon">✅</div>
              <div className="aq-empty-title">All caught up!</div>
              <p className="aq-empty-sub">No pending questions to review.</p>
            </div>
          ) : (
            questions.map((q) => {
              const isExpanded = expandedId === q.question_id;
              const ds = difficultyStyle(q.difficulty);
              return (
                <div key={q.question_id} className={`aq-card${selected.includes(q.question_id) ? " selected" : ""}`}>
                  <div className="aq-card-row">
                    <input type="checkbox" className="aq-card-check"
                      checked={selected.includes(q.question_id)}
                      onChange={() => toggleSelect(q.question_id)}
                    />
                    <div className="aq-card-body">
                      <p className="aq-card-text">{q.question_text}</p>
                      <div className="aq-card-meta">
                        <span className="aq-diff-chip" style={ds}>{q.difficulty}</span>
                        <span className="aq-status">Status: {q.status}</span>
                      </div>
                    </div>
                    <div className="aq-card-actions">
                      <button className="aq-btn-review"
                        onClick={() => setExpandedId(isExpanded ? null : q.question_id)}
                      >
                        {isExpanded ? "Hide" : "Review"}
                      </button>
                      <button className="aq-btn-sm-approve" onClick={() => approveOne(q.question_id)}>Approve</button>
                      <button className="aq-btn-sm-reject" onClick={() => setRejectModal({ id: q.question_id, bulk: false })}>Reject</button>
                    </div>
                  </div>

                  {/* REVIEW PANEL */}
                  {isExpanded && (
                    <div className="aq-review">
                      <p className="aq-review-label">Answer Options</p>
                      <div className="aq-options">
                        {optionKeys.map((key, i) => {
                          const isCorrect = q[key] === q.correct_answer;
                          return (
                            <div key={key} className={`aq-option${isCorrect ? " correct" : ""}`}>
                              <span className="aq-option-badge">{optionLabels[i]}</span>
                              <span>{q[key]}</span>
                              {isCorrect && <span className="aq-option-correct-tag">✓ Correct</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* REJECT MODAL */}
      {(rejectModal.id !== null || rejectModal.bulk) && (
        <div className="aq-modal-overlay">
          <div className="aq-modal">
            <h2 className="aq-modal-title">Rejection Reason</h2>
            <textarea className="aq-modal-textarea"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection (optional)"
            />
            <div className="aq-modal-actions">
              <button className="aq-btn-cancel"
                onClick={() => { setRejectModal({ id: null, bulk: false }); setRejectReason(""); }}
              >
                Cancel
              </button>
              <button className="aq-btn-confirm-reject" disabled={actionLoading} onClick={confirmReject}>
                {actionLoading ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}