"use client";
import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL

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

  const getToken = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("session_token="))
      ?.split("=")[1];
  };

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
  // data.data is a single object, wrap it in array
  const arr = data.data ? (Array.isArray(data.data) ? data.data : [data.data]) : [];
  setTopics(arr);
  setSelectedTopic("");
};
  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!selectedSubject) return;
    fetchTopics(selectedSubject);
  }, [selectedSubject]);

  const handleAddSubject = async () => {
    if (!newSubject.trim()) return;
    const token = getToken();
    const res = await fetch(`${API}/api/insertSubject`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
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
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: newTopic, subject_id: selectedSubject }),
  });
  const data = await res.json();
  if (data.data) {
    setNewTopic("");
    setSelectedTopic(data.data.topic_id);
    await fetchTopics(selectedSubject);
  }
};

  const injectTopicId = (questions: Record<string, string>[]) => {
    return questions.map((q) => ({ ...q, topic_id: selectedTopic }));
  };

  const uploadQuestions = async (questions: Record<string, string>[]) => {
    const token = getToken();
    const withTopic = injectTopicId(questions);
    const res = await fetch(`${API}/api/insertQuestions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ questions: withTopic }),
    });
    return await res.json();
  };

  const handleJSONUpload = async () => {
    setError("");
    setResult(null);
    if (!selectedTopic) {
      setError("Please select a subject and topic first");
      return;
    }
    setLoading(true);
    try {
      const parsed = JSON.parse(jsonText);
      const questions = Array.isArray(parsed) ? parsed : parsed.questions;
      if (!questions || !Array.isArray(questions)) {
        setError("JSON must be an array of questions");
        return;
      }
      const data = await uploadQuestions(questions);
      setResult(data);
    } catch (err) {
      console.log("error:", err);
      setError("Upload failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = async () => {
    setError("");
    setResult(null);
    if (!selectedTopic) {
      setError("Please select a subject and topic first");
      return;
    }
    if (!file) {
      setError("Please select a CSV file");
      return;
    }
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
console.log("headers:", headers);
console.log("questions:", questions);
      const data = await uploadQuestions(questions);
      setResult(data);
    } catch (err) {
      console.log("error:", err);
      setError("Upload failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">


       <div className="mb-8 flex flex-col items-center text-center">
  <a href="/Admin" className="text-3xl font-bold text-gray-800">
    Admin Dashboard
  </a>

  
</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Bulk Upload Questions</h1>

      {/* Subject Section */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Subject</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Select Subject */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Select Existing Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-black"
            >
              <option value="">Select a subject</option>
              {subjects.map((s) => (
                <option key={s.subject_id} value={s.subject_id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Add New Subject */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Add New Subject</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Subject name"
                className="flex-1 border border-gray-300 rounded-lg p-2 text-black"
              />
              <button
                onClick={handleAddSubject}
                disabled={!newSubject.trim()}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Topic Section */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Topic</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Select Topic */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Select Existing Topic</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={!selectedSubject}
              className="w-full border border-gray-300 rounded-lg p-2 text-black disabled:bg-gray-100"
            >
              <option value="">Select a topic</option>
              {topics.map((t) => (
                <option key={t.topic_id} value={t.topic_id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Add New Topic */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Add New Topic</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Topic name"
                disabled={!selectedSubject}
                className="flex-1 border border-gray-300 rounded-lg p-2 text-black disabled:bg-gray-100"
              />
              <button
                onClick={handleAddTopic}
                disabled={!newTopic.trim() || !selectedSubject}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg"
              >
                Add
              </button>
            </div>
          </div>
        </div>
        {/* {selectedTopic && (
          <p className="text-xs text-green-600 mt-3">
            ✅ topic_id will be auto-injected into all uploaded questions
          </p>
        )} */}
      </div>

      {/* JSON Upload */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Paste JSON</h2>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 text-sm font-mono h-48 resize-none text-black"
          placeholder='[{"question_text": "...", "option_a": "...", "option_b": "...", "option_c": "...", "option_d": "...", "correct_answer": "...", "difficulty": "easy"}]'
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
        />
        <button
          onClick={handleJSONUpload}
          disabled={loading || !jsonText || !selectedTopic}
          className="mt-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold px-6 py-2 rounded-lg transition"
        >
          {loading ? "Uploading..." : "Upload JSON"}
        </button>
      </div>

      {/* CSV Upload */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Upload CSV File</h2>
        <p className="text-sm text-gray-500 mb-3">
          CSV headers: question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty
        </p>
      <label style={{cursor:"pointer", display:"inline-block", backgroundColor:"#3b82f6", color:"white", fontSize:"14px", fontWeight:"600", padding:"8px 16px", borderRadius:"8px", marginBottom:"12px", marginRight:"5px"}}>
  {file ? file.name : "Choose File"}
  <input
    type="file"
    accept=".csv"
    onChange={(e) => setFile(e.target.files?.[0] || null)}
    style={{display:"none"}}
  />
</label>
        <button
          onClick={handleCSVUpload}
          disabled={loading || !file || !selectedTopic}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold px-6 py-2 rounded-lg transition"
        >
          {loading ? "Uploading..." : "Upload CSV"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-4">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 font-semibold">Upload Complete</p>
          <p className="text-sm text-green-600 mt-1">
            Inserted: {result.data?.length || 0}
          </p>
        </div>
      )}
    </div>
  );
}