"use client";
import { useState, useEffect } from "react";


const API = process.env.NEXT_PUBLIC_API_URL
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
  const [rejectModal, setRejectModal] = useState<{id: string | null, bulk: boolean}>({id: null, bulk: false});
  const [rejectReason, setRejectReason] = useState("");

  const getToken = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("session_token="))
      ?.split("=")[1];
  };

  const fetchQuestions = async () => {
    const token = getToken();
    const res = await fetch("http://localhost:4000/api/questionStatusPending", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setQuestions(data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchQuestions();
  }, []);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selected.length === questions.length) {
      setSelected([]);
    } else {
      setSelected(questions.map((q) => q.question_id));
    }
  };

  const approveOne = async (id: string) => {
    const token = getToken();
    await fetch(`http://localhost:4000/api/updateApprove/${id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchQuestions();
  };

  const approveSelected = async () => {
    setActionLoading(true);
    const token = getToken();
    await Promise.all(
      selected.map((id) =>
        fetch(`http://localhost:4000/api/updateApprove/${id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );
    setSelected([]);
    await fetchQuestions();
    setActionLoading(false);
  };

  const rejectOne = (id: string) => {
    setRejectModal({ id, bulk: false });
  };

  const rejectSelected = () => {
    setRejectModal({ id: null, bulk: true });
  };

  const confirmReject = async () => {
    setActionLoading(true);
    const token = getToken();
    if (rejectModal.bulk) {
      await Promise.all(
        selected.map((id) =>
          fetch(`${API}/api/updateReject/${id}`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ rejection_reason: rejectReason || "Rejected by admin" }),
          })
        )
      );
      setSelected([]);
    } else {
      await fetch(`http://localhost:4000/api/updateReject/${rejectModal.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rejection_reason: rejectReason || "Rejected by admin" }),
      });
    }
    setRejectModal({ id: null, bulk: false });
    setRejectReason("");
    await fetchQuestions();
    setActionLoading(false);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">

 <div className="mb-8 flex flex-col items-center text-center">
  <a href="/Admin" className="text-3xl font-bold text-gray-800">
    Admin Dashboard
  </a>

  
</div>
 

      <h1 className="text-2xl font-bold mb-4">Pending Questions</h1>

      {/* Top Action Bar */}
      <div className="flex items-center gap-3 mb-6 bg-white shadow rounded-lg p-4">
        <input
          type="checkbox"
          checked={selected.length === questions.length && questions.length > 0}
          onChange={selectAll}
          className="w-4 h-4 cursor-pointer"
        />
        <span className="text-sm text-gray-600">
          {selected.length > 0 ? `${selected.length} selected` : "Select all"}
        </span>
        <button
          onClick={approveSelected}
          disabled={actionLoading || selected.length === 0}
          className="ml-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-sm font-semibold px-4 py-2 rounded-lg"
        >
          {actionLoading ? "Processing..." : `Approve ${selected.length > 0 ? `(${selected.length})` : ""}`}
        </button>
        <button
          onClick={rejectSelected}
          disabled={actionLoading || selected.length === 0}
          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white text-sm font-semibold px-4 py-2 rounded-lg"
        >
          {actionLoading ? "Processing..." : `Reject ${selected.length > 0 ? `(${selected.length})` : ""}`}
        </button>
        <span className="ml-auto text-sm text-gray-500">
          Total: {questions.length} questions
        </span>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <p className="text-gray-500">No pending questions</p>
      ) : (
        questions.map((q) => (
          <div
            key={q.question_id}
            className={`bg-white shadow rounded-lg p-4 mb-4 flex items-start gap-4 border-2 transition ${
              selected.includes(q.question_id) ? "border-blue-400" : "border-transparent"
            }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(q.question_id)}
              onChange={() => toggleSelect(q.question_id)}
              className="mt-1 w-4 h-4 cursor-pointer"
            />
            <div className="flex-1">
              <p className="font-semibold">{q.question_text}</p>
              <p className="text-sm text-gray-500 mt-1">
                Difficulty: {q.difficulty} | Status: {q.status}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => approveOne(q.question_id)}
                className="bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-lg"
              >
                Approve
              </button>
              <button
                onClick={() => rejectOne(q.question_id)}
                className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-lg"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
      

      {/* Reject Reason Modal */}
      {(rejectModal.id !== null || rejectModal.bulk) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Rejection Reason</h2>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection (optional)"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm h-28 resize-none text-black mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setRejectModal({ id: null, bulk: false }); setRejectReason(""); }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={actionLoading}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white text-sm font-semibold px-4 py-2 rounded-lg"
              >
                {actionLoading ? "Rejecting..." : "Confirm Reject"}
              </button>
              

              
            </div>
          </div>
          
        </div>
        
      )}
    </div>
  );
}