"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL

interface Subject {
  subject_id: string;
  name: string;
}

export default function AdminQuestions() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);
  const [deleting, setDeleting] = useState(false);

  const getToken = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("session_token="))
      ?.split("=")[1];
  };
 useEffect(() => {
  const fetchSubjects = async () => {
    const token = getToken();
    if (!token) {
      router.push("/signIn");
      return;
    }

    const res = await fetch(`${API}/api/getSubjects`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      setError("Failed to load subjects");
      setLoading(false);
      return;
    }

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
    const res = await fetch(
      `${API}/api/delSubject/${deleteTarget.subject_id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (res.ok) {
      setSubjects((prev) =>
        prev.filter((s) => s.subject_id !== deleteTarget.subject_id)
      );
    } else {
      alert("Failed to delete subject.");
    }

    setDeleting(false);
    setDeleteTarget(null);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8">{error}</div>;

  return (
    <div className="p-8">

       <div className="mb-8 flex flex-col items-center text-center">
  <a href="/Admin" className="text-3xl font-bold text-gray-800">
    Admin Dashboard
  </a>

  
</div>
      <h1 className="text-2xl font-bold mb-6">All Subjects</h1>

      {subjects.length === 0 ? (
        <p>No subjects found</p>
      ) : (
        subjects.map((s) => (
          <div
            key={s.subject_id}
            className="bg-white shadow rounded-lg p-4 mb-4 flex items-center justify-between"
          >
            <p className="font-semibold">{s.name}</p>
            <button
              onClick={() => setDeleteTarget(s)}
              className="text-sm text-red-500 hover:text-red-700 border border-red-300 hover:border-red-500 px-3 py-1 rounded transition"
            >
              Delete
            </button>
          </div>
        ))
      )}

      {/* Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-2">Delete Subject</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                {deleteTarget.name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}