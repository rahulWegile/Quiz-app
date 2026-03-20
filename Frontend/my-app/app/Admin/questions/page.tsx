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
  rejection_reason: string | null;
}

export default function AdminDashboard() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState<Question | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const getToken = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("session_token="))
      ?.split("=")[1];
  };

  const fetchQuestions = async () => {
    const token = getToken();
    const res = await fetch(`${API}/api/allquestion`, {
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

  const handleDelete = async (id: string) => {
    setActionLoading(true);
    const token = getToken();
    await fetch(`${API}/api/deleteQuestions/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeleteId(null);
    await fetchQuestions();
    setActionLoading(false);
  };

  const handleUpdate = async () => {
  if (!editModal) return;
  setActionLoading(true);
  const token = getToken();
  console.log("updating:", editModal.question_id);
  const res = await fetch(`${API}/api/updateQuestion/${editModal.question_id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(editModal),
  });
  console.log("update status:", res.status);
  const data = await res.json();
  console.log("update response:", data);
  setEditModal(null);
  await fetchQuestions();
  setActionLoading(false);
};

  const handleApprove = async (id: string) => {
    const token = getToken();
    await fetch(`${API}/api/updateApprove/${id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchQuestions();
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">

       <div className="mb-8 flex flex-col items-center text-center">
  <a href="/Admin" className="text-3xl font-bold text-gray-800">
    Admin Dashboard
  </a>

  
</div>
      <h1 className="text-2xl font-bold mb-6">All Questions</h1>
      <p className="text-sm text-gray-500 mb-6">Total: {questions.length} questions</p>

      {questions.length === 0 ? (
        <p>No questions found</p>
      ) : (
        questions.map((q) => (
          <div key={q.question_id} className="bg-white shadow rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold">{q.question_text}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Difficulty: {q.difficulty} | Status: {q.status}
                </p>
                {q.rejection_reason && (
                  <p className="text-sm text-red-500 mt-1">
                    Rejection reason: {q.rejection_reason}
                  </p>
                )}
              </div>
              <div className="flex gap-2 items-center">
                {q.status === "rejected" && (
                  <button
                    onClick={() => handleApprove(q.question_id)}
                    className="bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-lg"
                  >
                    Approve
                  </button>
                )}
                <button
                  onClick={() => setEditModal(q)}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-lg"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteId(q.question_id)}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Edit Question</h2>
            {["question_text", "option_a", "option_b", "option_c", "option_d", "correct_answer"].map((field) => (
              <div key={field} className="mb-3">
                <label className="block text-sm text-gray-600 mb-1 capitalize">{field.replace("_", " ")}</label>
                <input
                  type="text"
                  value={editModal[field as keyof Question] as string || ""}
                  onChange={(e) => setEditModal({ ...editModal, [field]: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm text-black"
                />
              </div>
            ))}
            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-1">Difficulty</label>
              <select
                value={editModal.difficulty}
                onChange={(e) => setEditModal({ ...editModal, difficulty: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm text-black"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => setEditModal(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={actionLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-sm font-semibold px-4 py-2 rounded-lg"
              >
                {actionLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-2">Delete Question?</h2>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={actionLoading}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white text-sm font-semibold px-4 py-2 rounded-lg"
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}