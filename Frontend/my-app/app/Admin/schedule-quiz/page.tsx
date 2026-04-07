"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

interface Subject {
  subject_id: string;
  name: string;
}
interface Topic {
  topic_id: string;
  name: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function ScheduleQuiz() {
  const now = new Date();

  const getNowIST = () => {
    const ist = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    );
    ist.setMinutes(ist.getMinutes() + 2);
    let h24 = ist.getHours();
    let min = ist.getMinutes();
    min = Math.ceil(min / 5) * 5;
    if (min === 60) { min = 0; h24 += 1; }
    if (h24 === 24) h24 = 0;
    const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 || 12;
    return { h12, min, period, y: ist.getFullYear(), m: ist.getMonth(), d: ist.getDate() };
  };

  const initTime = getNowIST();

  // ── all useState calls below, now that initTime is defined ──
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(null);

  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState("");
  const subjectRef = useRef<HTMLDivElement>(null);

  const [isTopicOpen, setIsTopicOpen] = useState(false);
  const [topicSearch, setTopicSearch] = useState("");
  const topicRef = useRef<HTMLDivElement>(null);

  const [hourDraft, setHourDraft] = useState<string>(String(initTime.h12));
  const [minDraft, setMinDraft] = useState<string>(String(initTime.min).padStart(2, "0"));

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerView, setPickerView] = useState({ year: initTime.y, month: initTime.m });
  const [selDate, setSelDate] = useState<{ y: number; m: number; d: number } | null>(
    { y: initTime.y, m: initTime.m, d: initTime.d }
  );
  const [selHour, setSelHour] = useState(initTime.h12);
  const [selMin, setSelMin] = useState(initTime.min);
  const [selPeriod, setSelPeriod] = useState<"AM" | "PM">(initTime.period);

  const router = useRouter();

  const getToken = () =>
    document.cookie
      .split(";")
      .find((r) => r.trim().startsWith("session_token="))
      ?.split("=")[1];

  const showToast = (msg: string, error = false) => {
    setToast({ msg, error });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (subjectRef.current && !subjectRef.current.contains(e.target as Node)) {
        setIsSubjectOpen(false);
      }
      if (topicRef.current && !topicRef.current.contains(e.target as Node)) {
        setIsTopicOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = getToken();
        if (!token) { router.push("/Auth/signIn"); return; }
        const res = await fetch(`${API}/api/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setSubjects(data.data);
      } catch {
        setError("Failed to fetch subjects");
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!selectedSubject) return;
    const fetchTopics = async () => {
      try {
        const token = getToken();
        const res = await fetch(`${API}/api/subjects/${selectedSubject}/topics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTopics(data.data);
        setSelectedTopic("");
      } catch {
        setError("Failed to fetch topics");
      }
    };
    fetchTopics();
  }, [selectedSubject]);

  const handleSubmit = async () => {
    if (!selectedTopic || !scheduledAt) {
      showToast("Please select a topic and time", true);
      return;
    }
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API}/api/quiz/schedule`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic_id: selectedTopic, scheduled_at: scheduledAt }),
      });
      const data = await res.json();
      if (!data.success) {
        showToast(data.message || "Failed to schedule", true);
        setLoading(false);
        return;
      }
      showToast("Quiz scheduled successfully! 🎉");
      const t = getNowIST();
      setSelectedSubject("");
      setSelectedTopic("");
      setScheduledAt("");
      setTopics([]);
      setSelDate({ y: t.y, m: t.m, d: t.d });
      setSelHour(t.h12);
      setSelMin(t.min);
      setSelPeriod(t.period);
      setHourDraft(String(t.h12));
      setMinDraft(String(t.min).padStart(2, "0"));
      setSubjectSearch("");
      setTopicSearch("");
    } catch {
      showToast("Something went wrong", true);
    }
    setLoading(false);
  };

  const getDateTimeDisplay = () => {
    if (!selDate) return null;
    const d = new Date(selDate.y, selDate.m, selDate.d);
    const dateStr = d.toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
    return `${dateStr}, ${String(selHour).padStart(2, "0")}:${String(selMin).padStart(2, "0")} ${selPeriod} IST`;
  };

  const changeMonth = (dir: number) => {
    setPickerView((v) => {
      let m = v.month + dir, y = v.year;
      if (m > 11) { m = 0; y++; }
      if (m < 0) { m = 11; y--; }
      return { year: y, month: m };
    });
  };

  const changeHour = (dir: number) => {
    setSelHour((h) => {
      let n = h + dir;
      if (n > 12) n = 1;
      if (n < 1) n = 12;
      setHourDraft(String(n));
      return n;
    });
  };

  const changeMin = (dir: number) => {
    setSelMin((m) => {
      let n = m + dir * 5;
      if (n >= 60) n = 0;
      if (n < 0) n = 55;
      setMinDraft(String(n).padStart(2, "0"));
      return n;
    });
  };

  const confirmPicker = () => {
    if (!selDate) { showToast("Please select a date", true); return; }
    let h = selHour;
    if (selPeriod === "AM" && h === 12) h = 0;
    if (selPeriod === "PM" && h !== 12) h += 12;
    const pad = (n: number) => String(n).padStart(2, "0");
    setScheduledAt(
      `${selDate.y}-${pad(selDate.m + 1)}-${pad(selDate.d)}T${pad(h)}:${pad(selMin)}:00+05:30`,
    );
    setIsPickerOpen(false);
  };

  const clearDatePicker = () => {
    const t = getNowIST();
    setSelDate({ y: t.y, m: t.m, d: t.d });
    setScheduledAt("");
    setSelHour(t.h12);
    setSelMin(t.min);
    setSelPeriod(t.period);
    setHourDraft(String(t.h12));
    setMinDraft(String(t.min).padStart(2, "0"));
    setIsPickerOpen(false);
  };

  const selectedSubjectName = subjects.find((s) => s.subject_id === selectedSubject)?.name;
  const selectedTopicName = topics.find((t) => t.topic_id === selectedTopic)?.name;
  const filteredSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(subjectSearch.toLowerCase())
  );
  const filteredTopics = topics.filter((t) =>
    t.name.toLowerCase().includes(topicSearch.toLowerCase())
  );

  if (error)
    return (
      <div style={{ textAlign: "center", padding: 60, background: "#eef2ff", minHeight: "60vh" }}>
        <p style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 800, color: "#1e1b4b" }}>
          {error}
        </p>
      </div>
    );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,700&display=swap');
        .sq{font-family:'Outfit',sans-serif;background:#eef2ff;min-height:100vh;color:#1e1b4b;}
        .sq *{box-sizing:border-box;margin:0;padding:0;}

        .sq-header{background:linear-gradient(160deg,#e0e7ff 0%,#f5f3ff 100%);padding:48px 60px 40px;border-bottom:1px solid #c7d2fe;position:relative;overflow:hidden;}
        .sq-header::before{content:'';position:absolute;inset:0;background-image:radial-gradient(circle,rgba(99,102,241,0.06) 1.5px,transparent 1.5px);background-size:24px 24px;pointer-events:none;}
        .sq-header-inner{max-width:640px;margin:0 auto;position:relative;z-index:1;}
        .sq-tag{display:inline-flex;align-items:center;gap:7px;background:#fff;border:1.5px solid #c7d2fe;color:#6366f1;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:5px 12px;border-radius:100px;margin-bottom:14px;box-shadow:0 2px 8px rgba(99,102,241,.1);}
        .sq-title{font-family:'Fraunces',serif;font-size:clamp(28px,4vw,42px);font-weight:900;color:#1e1b4b;letter-spacing:-.02em;line-height:1.05;}
        .sq-title em{font-style:italic;background:linear-gradient(135deg,#6366f1,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .sq-sub{font-size:14px;color:#6b7280;margin-top:6px;}

        .sq-body{max-width:640px;margin:0 auto;padding:40px 60px 340px;}

        .sq-card{background:#fff;border-radius:24px;border:1.5px solid #e0e7ff;box-shadow:0 4px 20px rgba(99,102,241,.08);overflow:visible;}
        .sq-card-top{height:4px;background:linear-gradient(90deg,#6366f1,#ec4899,#14b8a6);}
        .sq-card-body{padding:32px;}

        .sq-field{margin-bottom:22px;position:relative;}
        .sq-label{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;margin-bottom:8px;}
        .sq-label-icon{font-size:14px;}

        .sq-picker-trigger{width:100%;padding:13px 16px;border:1.5px solid #e0e7ff;border-radius:12px;font-family:'Outfit',sans-serif;font-size:15px;font-weight:500;background:#fafbff;cursor:pointer;text-align:left;display:flex;align-items:center;justify-content:space-between;transition:all .18s;outline:none;color:#1e1b4b;}
        .sq-picker-trigger:hover,.sq-picker-trigger.open{border-color:#a5b4fc;background:#fff;box-shadow:0 0 0 3px rgba(99,102,241,.1);}
        .sq-picker-trigger.disabled{opacity:.5;cursor:not-allowed;pointer-events:none;}
        .sq-picker-trigger .placeholder{color:#9ca3af;}
        .sq-picker-trigger .value-set{color:#1e1b4b;}
        .sq-picker-trigger .chevron{font-size:13px;color:#9ca3af;transition:transform .2s;flex-shrink:0;}
        .sq-picker-trigger.open .chevron{transform:rotate(180deg);}

        .sq-picker-panel{background:#fff;border:1.5px solid #e0e7ff;border-radius:16px;box-shadow:0 8px 32px rgba(99,102,241,.13);margin-top:6px;overflow:visible;position:absolute;width:100%;z-index:50;}

        .sq-search{padding:12px 14px 8px;}
        .sq-search input{width:100%;padding:9px 12px;border:1.5px solid #e0e7ff;border-radius:10px;font-family:'Outfit',sans-serif;font-size:14px;background:#fafbff;color:#1e1b4b;outline:none;transition:all .15s;}
        .sq-search input:focus{border-color:#a5b4fc;background:#fff;box-shadow:0 0 0 3px rgba(99,102,241,.08);}
        .sq-search input::placeholder{color:#9ca3af;}

        .sq-options{max-height:220px;overflow-y:auto;padding:6px 8px 10px;}
        .sq-options::-webkit-scrollbar{width:4px;}
        .sq-options::-webkit-scrollbar-track{background:transparent;}
        .sq-options::-webkit-scrollbar-thumb{background:#e0e7ff;border-radius:4px;}

        .sq-option{display:flex;align-items:center;gap:10px;padding:10px;border-radius:10px;cursor:pointer;transition:all .12s;font-size:14px;font-weight:500;color:#374151;}
        .sq-option:hover{background:#eef2ff;color:#6366f1;}
        .sq-option.selected{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;}
        .sq-option .opt-name{flex:1;}
        .sq-option .opt-check{font-size:13px;opacity:0;flex-shrink:0;}
        .sq-option.selected .opt-check{opacity:1;}
        .sq-empty{padding:16px;text-align:center;font-size:13px;color:#9ca3af;}

        .sq-picker-footer{padding:10px 14px;border-top:1px solid #f0f0ff;display:flex;justify-content:space-between;align-items:center;}
        .sq-footer-hint{font-size:11px;color:#9ca3af;font-weight:600;letter-spacing:.04em;text-transform:uppercase;}
        .sq-picker-clear{padding:7px 14px;border:1.5px solid #e0e7ff;border-radius:9px;background:#fafbff;font-family:'Outfit',sans-serif;font-size:12px;font-weight:600;color:#6b7280;cursor:pointer;transition:all .15s;}
        .sq-picker-clear:hover{border-color:#c7d2fe;color:#6366f1;}

        .sq-cal-header{display:flex;align-items:center;justify-content:space-between;padding:16px 18px 12px;border-bottom:1px solid #f0f0ff;}
        .sq-month-label{font-family:'Fraunces',serif;font-size:15px;font-weight:900;color:#1e1b4b;letter-spacing:-.01em;}
        .sq-nav-btn{width:30px;height:30px;border:1.5px solid #e0e7ff;border-radius:8px;background:#fafbff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:15px;color:#6b7280;transition:all .15s;font-family:'Outfit',sans-serif;}
        .sq-nav-btn:hover{border-color:#a5b4fc;background:#eef2ff;color:#6366f1;}

        .sq-cal-grid{padding:12px 14px 8px;}
        .sq-day-names{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:6px;}
        .sq-day-name{text-align:center;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af;padding:4px 0;}
        .sq-cal-days{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;}
        .sq-cal-day{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:500;border-radius:8px;border:1.5px solid transparent;transition:all .12s;cursor:pointer;color:#374151;}
        .sq-cal-day:hover{background:#eef2ff;color:#6366f1;border-color:#c7d2fe;}
        .sq-cal-day.empty{cursor:default;pointer-events:none;}
        .sq-cal-day.past{color:#d1d5db;cursor:not-allowed;pointer-events:none;}
        .sq-cal-day.today{color:#6366f1;font-weight:700;border-color:#c7d2fe;}
        .sq-cal-day.selected{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-color:transparent;font-weight:700;box-shadow:0 3px 10px rgba(99,102,241,.35);}
        .sq-cal-day.selected:hover{background:linear-gradient(135deg,#6366f1,#8b5cf6);}

        .sq-time-section{border-top:1px solid #f0f0ff;padding:14px 18px;}
        .sq-time-label{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9ca3af;margin-bottom:10px;}
        .sq-time-row{display:flex;align-items:center;justify-content:center;gap:8px;}
        .sq-time-col{flex:unset;}
        .sq-time-col-label{font-size:11px;font-weight:600;color:#9ca3af;text-align:center;margin-bottom:4px;}
        .sq-time-scroller{display:flex;align-items:center;gap:6px;}
        .sq-time-scroll-btn{width:28px;height:28px;border:1.5px solid #e0e7ff;border-radius:7px;background:#fafbff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;color:#6b7280;transition:all .12s;font-family:'Outfit',sans-serif;flex-shrink:0;line-height:1;}
        .sq-time-scroll-btn:hover{border-color:#a5b4fc;background:#eef2ff;color:#6366f1;}
        .sq-time-sep{font-size:20px;font-weight:700;color:#c7d2fe;padding:0 2px;padding-bottom:2px;}
        .sq-period-wrap{display:flex;flex-direction:column;gap:4px;}
        .sq-period-btns{display:flex;gap:5px;}
        .sq-period-btn{padding:6px 10px;border:1.5px solid #e0e7ff;border-radius:8px;background:#fafbff;font-family:'Outfit',sans-serif;font-size:12px;font-weight:700;color:#6b7280;cursor:pointer;transition:all .15s;}
        .sq-period-btn.active{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-color:transparent;box-shadow:0 2px 8px rgba(99,102,241,.3);}

        .sq-picker-confirm{flex:2;padding:10px;border:none;border-radius:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);font-family:'Fraunces',serif;font-size:14px;font-weight:900;color:#fff;cursor:pointer;box-shadow:0 4px 12px rgba(99,102,241,.3);transition:all .15s;}
        .sq-picker-confirm:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(99,102,241,.4);}

        .sq-preview{background:#fafbff;border:1.5px solid #e0e7ff;border-radius:14px;padding:16px 18px;margin-bottom:22px;}
        .sq-preview-label{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9ca3af;margin-bottom:10px;}
        .sq-preview-row{display:flex;align-items:center;gap:10px;margin-bottom:6px;}
        .sq-preview-row:last-child{margin-bottom:0;}
        .sq-preview-chip{font-size:12px;font-weight:700;padding:3px 10px;border-radius:100px;border:1px solid;}
        .sq-preview-val{font-size:13px;color:#6b7280;}

        .sq-submit{width:100%;padding:15px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:14px;font-family:'Fraunces',serif;font-size:17px;font-weight:900;cursor:pointer;transition:all .2s;box-shadow:0 6px 18px rgba(99,102,241,.3);letter-spacing:-.01em;}
        .sq-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 26px rgba(99,102,241,.4);}
        .sq-submit:disabled{opacity:.6;cursor:not-allowed;}

        .sq-toast{position:fixed;top:24px;right:24px;padding:12px 20px;border-radius:12px;font-size:13px;font-weight:600;z-index:100;animation:sqtin .3s ease;border:1.5px solid;}
        @keyframes sqtin{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);}}
        .sq-toast.ok{background:#f0fdf4;color:#0d9488;border-color:#99f6e4;}
        .sq-toast.err{background:#fdf2f8;color:#ec4899;border-color:#fbcfe8;}

        .sq-info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;}
        .sq-info-card{background:#fff;border-radius:16px;padding:18px;border:1.5px solid #e0e7ff;box-shadow:0 2px 8px rgba(99,102,241,.05);}
        .sq-info-icon{font-size:22px;margin-bottom:8px;}
        .sq-info-title{font-family:'Fraunces',serif;font-size:14px;font-weight:800;color:#1e1b4b;margin-bottom:3px;}
        .sq-info-desc{font-size:12px;color:#9ca3af;line-height:1.4;}

        .sq-time-input{width:44px;height:36px;text-align:center;font-size:16px;font-weight:700;border:1.5px solid #e0e7ff;border-radius:8px;background:#fafbff;outline:none;padding:0;flex-shrink:0;font-family:'Outfit',sans-serif;color:#1e1b4b;}
        .sq-time-input:focus{border-color:#6366f1;background:#fff;}

        @media(max-width:680px){
          .sq-body{padding:32px 24px 240px;}
          .sq-header{padding:36px 24px 30px;}
          .sq-info-grid{grid-template-columns:1fr;}
        }
        @media(max-width:480px){
          .sq-time-row{flex-direction:column;align-items:center;gap:10px;}
          .sq-time-sep{display:none;}
          .sq-time-col{width:100%;display:flex;flex-direction:column;align-items:center;}
          .sq-time-scroller{justify-content:center;}
          .sq-period-wrap{flex-direction:row;justify-content:center;}
        }
      `}</style>

      <div className="sq">
        {toast && (
          <div className={`sq-toast ${toast.error ? "err" : "ok"}`}>
            {toast.error ? "⚠️ " : "✅ "}{toast.msg}
          </div>
        )}

        <div className="sq-header">
          <div className="sq-header-inner">
            <div className="sq-tag">⚙️ Admin Panel</div>
            <h1 className="sq-title">Schedule a <em>Quiz</em></h1>
            <p className="sq-sub">Pick a topic and set a time — players will be notified</p>
          </div>
        </div>

        <div className="sq-body">
          <div className="sq-info-grid">
            {[
              { icon: "📅", title: "Live Sessions", desc: "Scheduled quizzes go live automatically at the set time" },
              { icon: "🔒", title: "Registration Closes", desc: "Players can't join 2 minutes before the session starts" },
              { icon: "⏱️", title: "20s Per Question", desc: "Each player gets 20 seconds to answer each question" },
              { icon: "🏆", title: "Auto Leaderboard", desc: "Results appear 2 minutes after the session ends" },
            ].map((c, i) => (
              <div key={i} className="sq-info-card">
                <div className="sq-info-icon">{c.icon}</div>
                <div className="sq-info-title">{c.title}</div>
                <div className="sq-info-desc">{c.desc}</div>
              </div>
            ))}
          </div>

          <div className="sq-card">
            <div className="sq-card-top" />
            <div className="sq-card-body">

              {/* ── Subject Picker ── */}
              <div className="sq-field" ref={subjectRef}>
                <div className="sq-label">
                  <span className="sq-label-icon">📚</span>Subject
                </div>
                <button
                  className={`sq-picker-trigger${isSubjectOpen ? " open" : ""}`}
                  onClick={() => { setIsSubjectOpen((o) => !o); setIsTopicOpen(false); setIsPickerOpen(false); }}
                >
                  <span className={selectedSubjectName ? "value-set" : "placeholder"}>
                    {selectedSubjectName ?? "Choose a subject…"}
                  </span>
                  <span className="chevron">▾</span>
                </button>

                {isSubjectOpen && (
                  <div className="sq-picker-panel">
                    <div className="sq-search">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Search subjects…"
                        value={subjectSearch}
                        onChange={(e) => setSubjectSearch(e.target.value)}
                      />
                    </div>
                    <div className="sq-options">
                      {filteredSubjects.length === 0 ? (
                        <div className="sq-empty">No subjects found</div>
                      ) : (
                        filteredSubjects.map((s) => (
                          <div
                            key={s.subject_id}
                            className={`sq-option${selectedSubject === s.subject_id ? " selected" : ""}`}
                            onClick={() => { setSelectedSubject(s.subject_id); setIsSubjectOpen(false); setSubjectSearch(""); }}
                          >
                            <span className="opt-name">{s.name}</span>
                            <span className="opt-check">✓</span>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="sq-picker-footer">
                      <span className="sq-footer-hint">Select one</span>
                      <button
                        className="sq-picker-clear"
                        onClick={() => { setSelectedSubject(""); setSelectedTopic(""); setTopics([]); setSubjectSearch(""); setIsSubjectOpen(false); }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Topic Picker ── */}
              <div className="sq-field" ref={topicRef}>
                <div className="sq-label">
                  <span className="sq-label-icon">🎯</span>Topic
                </div>
                <button
                  className={`sq-picker-trigger${isTopicOpen ? " open" : ""}${!selectedSubject ? " disabled" : ""}`}
                  onClick={() => { if (!selectedSubject) return; setIsTopicOpen((o) => !o); setIsSubjectOpen(false); setIsPickerOpen(false); }}
                >
                  <span className={selectedTopicName ? "value-set" : "placeholder"}>
                    {selectedTopicName ?? (selectedSubject ? "Choose a topic…" : "Select a subject first")}
                  </span>
                  <span className="chevron">▾</span>
                </button>

                {isTopicOpen && (
                  <div className="sq-picker-panel">
                    <div className="sq-search">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Search topics…"
                        value={topicSearch}
                        onChange={(e) => setTopicSearch(e.target.value)}
                      />
                    </div>
                    <div className="sq-options">
                      {filteredTopics.length === 0 ? (
                        <div className="sq-empty">No topics found</div>
                      ) : (
                        filteredTopics.map((t) => (
                          <div
                            key={t.topic_id}
                            className={`sq-option${selectedTopic === t.topic_id ? " selected" : ""}`}
                            onClick={() => { setSelectedTopic(t.topic_id); setIsTopicOpen(false); setTopicSearch(""); }}
                          >
                            <span className="opt-name">{t.name}</span>
                            <span className="opt-check">✓</span>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="sq-picker-footer">
                      <span className="sq-footer-hint">Select one</span>
                      <button
                        className="sq-picker-clear"
                        onClick={() => { setSelectedTopic(""); setTopicSearch(""); setIsTopicOpen(false); }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── DateTime Picker ── */}
              <div className="sq-field">
                <div className="sq-label">
                  <span className="sq-label-icon">⏰</span>Date &amp; Time (IST)
                </div>

                <button
                  className={`sq-picker-trigger${isPickerOpen ? " open" : ""}`}
                  onClick={() => { setIsPickerOpen((o) => !o); setIsSubjectOpen(false); setIsTopicOpen(false); }}
                >
                  <span className={getDateTimeDisplay() ? "value-set" : "placeholder"}>
                    {getDateTimeDisplay() ?? "Pick a date and time…"}
                  </span>
                  <span className="chevron">▾</span>
                </button>

                {isPickerOpen && (
                  <div className="sq-picker-panel">
                    {/* Calendar */}
                    <div className="sq-cal-header">
                      <button className="sq-nav-btn" onClick={() => changeMonth(-1)}>‹</button>
                      <span className="sq-month-label">{MONTHS[pickerView.month]} {pickerView.year}</span>
                      <button className="sq-nav-btn" onClick={() => changeMonth(1)}>›</button>
                    </div>

                    <div className="sq-cal-grid">
                      <div className="sq-day-names">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                          <div key={d} className="sq-day-name">{d}</div>
                        ))}
                      </div>
                      <div className="sq-cal-days">
                        {(() => {
                          const { year, month } = pickerView;
                          const firstDay = new Date(year, month, 1).getDay();
                          const total = new Date(year, month + 1, 0).getDate();
                          const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                          const cells = [];
                          for (let i = 0; i < firstDay; i++) {
                            cells.push(<div key={`e${i}`} className="sq-cal-day empty" />);
                          }
                          for (let d = 1; d <= total; d++) {
                            const cellDate = new Date(year, month, d);
                            const isPast = cellDate < todayMidnight;
                            const isToday = year === now.getFullYear() && month === now.getMonth() && d === now.getDate();
                            const isSel = selDate?.y === year && selDate?.m === month && selDate?.d === d;
                            let cls = "sq-cal-day";
                            if (isPast) cls += " past";
                            if (isToday) cls += " today";
                            if (isSel) cls += " selected";
                            cells.push(
                              <div key={d} className={cls} onClick={() => !isPast && setSelDate({ y: year, m: month, d })}>
                                {d}
                              </div>
                            );
                          }
                          return cells;
                        })()}
                      </div>
                    </div>

                    {/* Time */}
                    <div className="sq-time-section">
                      <div className="sq-time-label">Select time</div>
                      <div className="sq-time-row">

                        {/* Hour */}
                        <div className="sq-time-col">
                          <div className="sq-time-col-label">Hour</div>
                          <div className="sq-time-scroller">
                            <button className="sq-time-scroll-btn" onClick={() => changeHour(-1)}>−</button>
                            <input
                              type="tel"
                              inputMode="numeric"
                              value={hourDraft}
                              className="sq-time-input"
                              onChange={(e) => setHourDraft(e.target.value)}
                              onBlur={() => {
                                let v = parseInt(hourDraft);
                                if (isNaN(v) || v < 1) v = 1;
                                if (v > 12) v = 12;
                                setSelHour(v);
                                setHourDraft(String(v));
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "ArrowUp") { e.preventDefault(); changeHour(1); }
                                if (e.key === "ArrowDown") { e.preventDefault(); changeHour(-1); }
                              }}
                            />
                            <button className="sq-time-scroll-btn" onClick={() => changeHour(1)}>+</button>
                          </div>
                        </div>

                        <span className="sq-time-sep">:</span>

                        {/* Minute */}
                        <div className="sq-time-col">
                          <div className="sq-time-col-label">Minute</div>
                          <div className="sq-time-scroller">
                            <button className="sq-time-scroll-btn" onClick={() => changeMin(-1)}>−</button>
                            <input
                              type="tel"
                              inputMode="numeric"
                              value={minDraft}
                              className="sq-time-input"
                              onChange={(e) => setMinDraft(e.target.value)}
                              onBlur={() => {
                                let v = parseInt(minDraft);
                                if (isNaN(v) || v < 0) v = 0;
                                if (v > 59) v = 59;
                                v = Math.round(v / 5) * 5;
                                if (v === 60) v = 55;
                                setSelMin(v);
                                setMinDraft(String(v).padStart(2, "0"));
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "ArrowUp") { e.preventDefault(); changeMin(1); }
                                if (e.key === "ArrowDown") { e.preventDefault(); changeMin(-1); }
                              }}
                            />
                            <button className="sq-time-scroll-btn" onClick={() => changeMin(1)}>+</button>
                          </div>
                        </div>

                        {/* AM/PM */}
                        <div className="sq-period-wrap">
                          <div className="sq-time-col-label" style={{ visibility: "hidden" }}>x</div>
                          <div className="sq-period-btns">
                            <button
                              className={`sq-period-btn${selPeriod === "AM" ? " active" : ""}`}
                              onClick={() => setSelPeriod("AM")}
                            >AM</button>
                            <button
                              className={`sq-period-btn${selPeriod === "PM" ? " active" : ""}`}
                              onClick={() => setSelPeriod("PM")}
                            >PM</button>
                          </div>
                        </div>

                      </div>
                    </div>

                    <div className="sq-picker-footer">
                      <button className="sq-picker-clear" onClick={clearDatePicker}>Clear</button>
                      <button className="sq-picker-confirm" onClick={confirmPicker}>
                        Confirm date &amp; time
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview */}
              {(selectedSubjectName || selectedTopicName || scheduledAt) && (
                <div className="sq-preview">
                  <div className="sq-preview-label">Quiz Preview</div>
                  {selectedSubjectName && (
                    <div className="sq-preview-row">
                      <span className="sq-preview-chip" style={{ background: "#eef2ff", color: "#6366f1", borderColor: "#c7d2fe" }}>Subject</span>
                      <span className="sq-preview-val">{selectedSubjectName}</span>
                    </div>
                  )}
                  {selectedTopicName && (
                    <div className="sq-preview-row">
                      <span className="sq-preview-chip" style={{ background: "#fdf2f8", color: "#ec4899", borderColor: "#fbcfe8" }}>Topic</span>
                      <span className="sq-preview-val">{selectedTopicName}</span>
                    </div>
                  )}
                  {scheduledAt && (
                    <div className="sq-preview-row">
                      <span className="sq-preview-chip" style={{ background: "#f0fdf4", color: "#14b8a6", borderColor: "#99f6e4" }}>Time</span>
                      <span className="sq-preview-val">
                        {new Date(scheduledAt).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}{" "}IST
                      </span>
                    </div>
                  )}
                </div>
              )}

              <button className="sq-submit" onClick={handleSubmit} disabled={loading}>
                {loading ? "Scheduling…" : "🗓️ Schedule Quiz"}
              </button>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}