"use client";
import { useState, useEffect, useRef } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Subject {
  subject_id: string;
  name: string;
}

interface Topic {
  topic_id: string;
  name: string;
}

interface UploadResult {
  success: boolean;
  message: string;
  data: unknown[];
}

const SUBJECT_ICONS: Record<string, string> = {
  science: "⚗️",
  mathematics: "📐",
  history: "🏛️",
  geography: "🌍",
  technology: "💻",
  sports: "⚽",
  entertainment: "🎬",
  literature: "📚",
  maths: "📐",
  ai: "🤖",
  default: "🧠",
};
const getIcon = (name: string) =>
  SUBJECT_ICONS[name.toLowerCase()] || SUBJECT_ICONS.default;

/* ─── Custom Dropdown ─────────────────────────────────────── */
interface DropdownOption { id: string; name: string; }
interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
  disabled?: boolean;
  showIcons?: boolean;
}

function CustomDropdown({ options, value, onChange, placeholder, disabled, showIcons }: CustomDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o) => o.id === value);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        className={`bu-select-btn${open ? " open" : ""}${disabled ? " disabled" : ""}`}
        onClick={() => !disabled && setOpen((o) => !o)}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen((o) => !o); }
          if (e.key === "Escape") setOpen(false);
        }}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {showIcons && (
          <span className="bu-select-icon">
            {selected ? getIcon(selected.name) : "📁"}
          </span>
        )}
        <span className="bu-select-text">
          {selected ? selected.name : placeholder}
        </span>
        <svg
          className="bu-chevron-icon"
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {open && (
        <div className="bu-dropdown-menu" role="listbox">
          <div
            className={`bu-option${!value ? " selected" : ""}`}
            role="option"
            onClick={() => { onChange(""); setOpen(false); }}
          >
            {showIcons && <span className="bu-option-icon">📁</span>}
            <span className="bu-option-label">{placeholder}</span>
          </div>
          {options.length > 0 && <div className="bu-divider" />}
          {options.map((opt) => (
            <div
              key={opt.id}
              className={`bu-option${value === opt.id ? " selected" : ""}`}
              role="option"
              aria-selected={value === opt.id}
              onClick={() => { onChange(opt.id); setOpen(false); }}
            >
              {showIcons && <span className="bu-option-icon">{getIcon(opt.name)}</span>}
              <span className="bu-option-label">{opt.name}</span>
              {value === opt.id && <span className="bu-option-check">✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
/* ──────────────────────────────────────────────────────────── */

export default function BulkUpload() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  const [newSubject, setNewSubject] = useState("");
  const [newTopic, setNewTopic] = useState("");

  const [jsonText, setJsonText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");

  const getToken = () =>
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("session_token="))
      ?.split("=")[1];

  const fetchSubjects = async () => {
    const token = getToken();
    const res = await fetch(`${API}/api/getSubjects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setSubjects(data.data || []);
  };

  const fetchTopics = async (subject_id: string) => {
    const token = getToken();
    const res = await fetch(`${API}/api/topicBySUb/${subject_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const arr = data.data
      ? Array.isArray(data.data) ? data.data : [data.data]
      : [];
    setTopics(arr);
    setSelectedTopic("");
  };

  useEffect(() => { fetchSubjects(); }, []);
  useEffect(() => {
    if (!selectedSubject) { setTopics([]); setSelectedTopic(""); return; }
    fetchTopics(selectedSubject);
  }, [selectedSubject]);

  const handleAddSubject = async () => {
    if (!newSubject.trim()) return;
    const token = getToken();
    const res = await fetch(`${API}/api/insertSubject`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: newSubject }),
    });
    const data = await res.json();
    if (data.data) {
      setNewSubject("");
      await fetchSubjects();
      setSelectedSubject(data.data.subject_id);
    }
  };

  const handleAddTopic = async () => {
    if (!newTopic.trim() || !selectedSubject) return;
    const token = getToken();
    const res = await fetch(`${API}/api/insertTopic`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTopic, subject_id: selectedSubject }),
    });
    const data = await res.json();
    if (data.data) {
      setNewTopic("");
      setSelectedTopic(data.data.topic_id);
      await fetchTopics(selectedSubject);
    }
  };

  const injectTopicId = (questions: Record<string, string>[]) =>
    questions.map((q) => ({ ...q, topic_id: selectedTopic }));

  const uploadQuestions = async (questions: Record<string, string>[]) => {
    const token = getToken();
    const withTopic = injectTopicId(questions);
    const res = await fetch(`${API}/api/insertQuestions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ questions: withTopic }),
    });
    return await res.json();
  };

  const handleJSONUpload = async () => {
    setError(""); setResult(null);
    if (!selectedTopic) { setError("Please select a subject and topic first"); return; }
    setLoading(true);
    try {
      const parsed = JSON.parse(jsonText);
      const questions = Array.isArray(parsed) ? parsed : parsed.questions;
      if (!questions || !Array.isArray(questions)) { setError("JSON must be an array of questions"); return; }
      const data = await uploadQuestions(questions);
      setResult(data);
    } catch (err) {
      console.log("error:", err);
      setError("Upload failed. Check your connection.");
    } finally { setLoading(false); }
  };

  const handleCSVUpload = async () => {
    setError(""); setResult(null);
    if (!selectedTopic) { setError("Please select a subject and topic first"); return; }
    if (!file) { setError("Please select a CSV file"); return; }
    setLoading(true);
    try {
      const text = await file.text();
      const lines = text.trim().split("\n");
      const delimiter = lines[0].includes("\t") ? "\t" : ",";
      const headers = lines[0].split(delimiter).map((h) => h.trim());
      const questions = lines.slice(1).map((line) => {
        const values = line.split(delimiter).map((v) => v.trim());
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => { obj[h] = values[i]; });
        return obj;
      });
      const data = await uploadQuestions(questions);
      setResult(data);
    } catch (err) {
      console.log("error:", err);
      setError("Upload failed. Check your connection.");
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,700&display=swap');

        .bu-page { font-family: 'Outfit', sans-serif; background: #eef2ff; min-height: 100vh; color: #1e1b4b; }
        .bu-page * { box-sizing: border-box; margin: 0; padding: 0; }

        /* HEADER */
        .bu-header { background: linear-gradient(160deg, #e0e7ff 0%, #f5f3ff 100%); padding: 40px 60px 36px; border-bottom: 1px solid #c7d2fe; position: relative; overflow: hidden; }
        .bu-header::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(circle, rgba(99,102,241,0.06) 1.5px, transparent 1.5px); background-size: 24px 24px; pointer-events: none; }
        .bu-header-inner { max-width: 960px; margin: 0 auto; position: relative; z-index: 1; }
        .bu-tag { display: inline-flex; align-items: center; gap: 7px; background: #fff; border: 1.5px solid #c7d2fe; color: #6366f1; font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; padding: 5px 12px; border-radius: 100px; margin-bottom: 14px; box-shadow: 0 2px 8px rgba(99,102,241,.1); }
        .bu-tag-dot { width: 6px; height: 6px; background: #6366f1; border-radius: 50%; animation: bup 2s infinite; }
        @keyframes bup { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.4);}50%{box-shadow:0 0 0 5px rgba(99,102,241,0);} }
        .bu-title { font-family: 'Fraunces', serif; font-size: clamp(24px, 3.5vw, 38px); font-weight: 900; color: #1e1b4b; letter-spacing: -.02em; line-height: 1.05; }
        .bu-title em { font-style: italic; background: linear-gradient(135deg, #6366f1, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .bu-nav-link { font-family: 'Fraunces', serif; font-size: 13px; font-weight: 700; color: #6366f1; text-decoration: none; letter-spacing: .04em; margin-top: 10px; display: inline-block; opacity: .7; transition: opacity .15s; }
        .bu-nav-link:hover { opacity: 1; }

        /* BODY */
        .bu-body { max-width: 960px; margin: 0 auto; padding: 36px 60px 80px; }

        /* CARDS */
        .bu-card { background: #fff; border-radius: 20px; border: 1.5px solid #e0e7ff; box-shadow: 0 2px 12px rgba(99,102,241,.06); padding: 28px 32px; margin-bottom: 20px; }
        .bu-card-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #6366f1; margin-bottom: 4px; }
        .bu-card-title { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 900; color: #1e1b4b; margin-bottom: 20px; }

        .bu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 700px) { .bu-grid { grid-template-columns: 1fr; } .bu-header, .bu-body { padding: 24px 20px; } }

        .bu-field-label { font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #9ca3af; margin-bottom: 8px; display: block; }

        /* CUSTOM DROPDOWN — matches leaderboard style */
        .bu-select-btn {
          display: flex; align-items: center; gap: 8px;
          font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 600; color: #1e1b4b;
          background: #fff; border: 1.5px solid #e0e7ff; border-radius: 12px;
          padding: 10px 14px; cursor: pointer; transition: border-color .18s, box-shadow .18s;
          width: 100%; user-select: none; outline: none;
        }
        .bu-select-btn:hover:not(.disabled) { border-color: #a5b4fc; }
        .bu-select-btn.open { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.12); }
        .bu-select-btn.disabled { background: #f9fafb; color: #9ca3af; cursor: not-allowed; opacity: .7; }
        .bu-select-icon { font-size: 15px; line-height: 1; flex-shrink: 0; }
        .bu-select-text { flex: 1; text-align: left; }
        .bu-chevron-icon { margin-left: auto; color: #9ca3af; transition: transform .2s; flex-shrink: 0; }
        .bu-select-btn.open .bu-chevron-icon { transform: rotate(180deg); }

        .bu-dropdown-menu {
          position: absolute; top: calc(100% + 6px); left: 0; right: 0;
          background: #fff; border: 1.5px solid #e0e7ff; border-radius: 14px;
          box-shadow: 0 8px 28px rgba(99,102,241,.14); z-index: 200;
          max-height: 220px; overflow-y: auto; overflow-x: hidden;
          animation: budd .15s ease;
        }
        @keyframes budd { from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:translateY(0);} }
        .bu-option { display: flex; align-items: center; gap: 10px; padding: 10px 14px; cursor: pointer; transition: background .13s; font-size: 14px; font-weight: 500; color: #1e1b4b; }
        .bu-option:hover { background: #f5f3ff; }
        .bu-option.selected { background: #eef2ff; font-weight: 700; }
        .bu-option-icon { font-size: 14px; line-height: 1; flex-shrink: 0; }
        .bu-option-label { flex: 1; }
        .bu-option-check { font-size: 12px; color: #6366f1; font-weight: 800; }
        .bu-divider { height: 1px; background: #f3f4f6; margin: 4px 0; }

        /* ADD ROW */
        .bu-add-row { display: flex; gap: 8px; }
        .bu-input {
          flex: 1; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 500;
          color: #1e1b4b; background: #fff; border: 1.5px solid #e0e7ff;
          border-radius: 12px; padding: 10px 14px; outline: none;
          transition: border-color .18s, box-shadow .18s;
        }
        .bu-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.12); }
        .bu-input:disabled { background: #f9fafb; color: #9ca3af; cursor: not-allowed; }
        .bu-input::placeholder { color: #c4b5fd; }

        .bu-btn-add {
          font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 700;
          color: #fff; background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none; border-radius: 12px; padding: 10px 18px;
          cursor: pointer; transition: opacity .18s, transform .15s; white-space: nowrap;
        }
        .bu-btn-add:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
        .bu-btn-add:disabled { background: #e0e7ff; color: #a5b4fc; cursor: not-allowed; transform: none; }

        /* TEXTAREA */
        .bu-textarea {
          width: 100%; font-family: 'Outfit', monospace; font-size: 13px; color: #1e1b4b;
          background: #fafbff; border: 1.5px solid #e0e7ff; border-radius: 14px;
          padding: 16px; height: 180px; resize: none; outline: none;
          transition: border-color .18s, box-shadow .18s;
        }
        .bu-textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
        .bu-textarea::placeholder { color: #c4b5fd; }

        /* BUTTONS */
        .bu-btn-upload {
          margin-top: 14px; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700;
          color: #fff; background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none; border-radius: 12px; padding: 11px 28px;
          cursor: pointer; transition: opacity .18s, transform .15s; box-shadow: 0 4px 14px rgba(99,102,241,.25);
        }
        .bu-btn-upload:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
        .bu-btn-upload:disabled { background: #e0e7ff; color: #a5b4fc; cursor: not-allowed; box-shadow: none; transform: none; }
        .bu-btn-upload.green { background: linear-gradient(135deg, #14b8a6, #10b981); box-shadow: 0 4px 14px rgba(20,184,166,.25); }

        /* FILE PICK */
        .bu-file-label {
          display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
          font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 700;
          color: #6366f1; background: #eef2ff; border: 1.5px solid #c7d2fe;
          border-radius: 10px; padding: 8px 16px; transition: background .15s;
        }
        .bu-file-label:hover { background: #e0e7ff; }
        .bu-file-hint { font-size: 12px; color: #9ca3af; margin-bottom: 14px; }

        /* ALERT */
        .bu-alert-err { background: #fef2f2; border: 1.5px solid #fecaca; color: #dc2626; border-radius: 14px; padding: 14px 18px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
        .bu-alert-ok { background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 14px; padding: 14px 18px; }
        .bu-alert-ok-title { font-family: 'Fraunces', serif; font-size: 16px; font-weight: 900; color: #15803d; }
        .bu-alert-ok-sub { font-size: 13px; color: #16a34a; margin-top: 4px; }
      `}</style>

      <div className="bu-page">
        {/* HEADER */}
        <div className="bu-header">
          <div className="bu-header-inner">
            <div className="bu-tag">
              <span className="bu-tag-dot" />
              Admin Panel
            </div>
            <h1 className="bu-title">
              Bulk <em>Upload</em> Questions
            </h1>
            <a href="/Admin" className="bu-nav-link">← Admin Dashboard</a>
          </div>
        </div>

        <div className="bu-body">

          {/* SUBJECT CARD */}
          <div className="bu-card">
            <div className="bu-card-eyebrow">Step 1</div>
            <div className="bu-card-title">Choose a Subject</div>
            <div className="bu-grid">
              <div>
                <span className="bu-field-label">Select Existing Subject</span>
                <CustomDropdown
                  options={subjects.map((s) => ({ id: s.subject_id, name: s.name }))}
                  value={selectedSubject}
                  onChange={setSelectedSubject}
                  placeholder="Pick a subject…"
                  showIcons
                />
              </div>
              <div>
                <span className="bu-field-label">Add New Subject</span>
                <div className="bu-add-row">
                  <input
                    className="bu-input"
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Subject name"
                    onKeyDown={(e) => e.key === "Enter" && handleAddSubject()}
                  />
                  <button className="bu-btn-add" onClick={handleAddSubject} disabled={!newSubject.trim()}>
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* TOPIC CARD */}
          <div className="bu-card">
            <div className="bu-card-eyebrow">Step 2</div>
            <div className="bu-card-title">Choose a Topic</div>
            <div className="bu-grid">
              <div>
                <span className="bu-field-label">Select Existing Topic</span>
                <CustomDropdown
                  options={topics.map((t) => ({ id: t.topic_id, name: t.name }))}
                  value={selectedTopic}
                  onChange={setSelectedTopic}
                  placeholder={selectedSubject ? "Pick a topic…" : "Select subject first"}
                  disabled={!selectedSubject}
                />
              </div>
              <div>
                <span className="bu-field-label">Add New Topic</span>
                <div className="bu-add-row">
                  <input
                    className="bu-input"
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="Topic name"
                    disabled={!selectedSubject}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTopic()}
                  />
                  <button className="bu-btn-add" onClick={handleAddTopic} disabled={!newTopic.trim() || !selectedSubject}>
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* JSON CARD */}
          <div className="bu-card">
            <div className="bu-card-eyebrow">Option A</div>
            <div className="bu-card-title">Paste JSON</div>
            <textarea
              className="bu-textarea"
              placeholder='[{"question_text": "...", "option_a": "...", "option_b": "...", "option_c": "...", "option_d": "...", "correct_answer": "...", "difficulty": "easy"}]'
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
            />
            <button
              className="bu-btn-upload"
              onClick={handleJSONUpload}
              disabled={loading || !jsonText || !selectedTopic}
            >
              {loading ? "Uploading…" : "Upload JSON"}
            </button>
          </div>

          {/* CSV CARD */}
          <div className="bu-card">
            <div className="bu-card-eyebrow">Option B</div>
            <div className="bu-card-title">Upload CSV File</div>
            <p className="bu-file-hint">
              Headers: question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty
            </p>
            <label className="bu-file-label">
              📂 {file ? file.name : "Choose CSV File"}
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                style={{ display: "none" }}
              />
            </label>
            <br />
            <button
              className="bu-btn-upload green"
              onClick={handleCSVUpload}
              disabled={loading || !file || !selectedTopic}
            >
              {loading ? "Uploading…" : "Upload CSV"}
            </button>
          </div>

          {error && <div className="bu-alert-err">{error}</div>}

          {result && (
            <div className="bu-alert-ok">
              <div className="bu-alert-ok-title">✅ Upload Complete</div>
              <p className="bu-alert-ok-sub">Inserted: {(result.data as unknown[])?.length || 0} question(s)</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}