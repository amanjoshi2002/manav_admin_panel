"use client";

import { useEffect, useState } from "react";
import { authenticatedRequest } from "@/config/api";

interface Policy {
  _id: string;
  title: string;
  content: string;
}

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Policy | null>(null);
  const [form, setForm] = useState({ title: "", content: "" });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const data = await authenticatedRequest<any>("/policies");
      let arr: Policy[] = [];
      if (Array.isArray(data)) arr = data;
      else if (Array.isArray(data?.policies)) arr = data.policies;
      else if (Array.isArray(data?.data)) arr = data.data;
      setPolicies(arr);
    } catch (e: any) {
      setError(e.message || "Failed to fetch policies");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (policy: Policy) => {
    setEditing(policy);
    setForm({ title: policy.title, content: policy.content });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this policy?")) return;
    try {
      await authenticatedRequest(`/policies/${id}`, { method: "DELETE" });
      setPolicies(prev => prev.filter(p => p._id !== id));
    } catch (e: any) {
      alert(e.message || "Delete failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await authenticatedRequest<Policy>(
          `/policies/${editing._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          }
        );
        // Always re-fetch after edit
        await fetchPolicies();
        setEditing(null);
      } else {
        await authenticatedRequest<Policy>(
          "/policies",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          }
        );
        // Always re-fetch after add
        await fetchPolicies();
      }
      setForm({ title: "", content: "" });
    } catch (e: any) {
      alert(e.message || "Save failed");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">Policy Management</h2>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <input
          className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          placeholder="Title"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          required
        />
        <textarea
          className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          placeholder="Content"
          value={form.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          required
        />
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {editing ? "Update Policy" : "Add Policy"}
          </button>
          {editing && (
            <button
              type="button"
              className="bg-gray-400 text-white px-4 py-2 rounded"
              onClick={() => {
                setEditing(null);
                setForm({ title: "", content: "" });
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="text-center text-gray-600 dark:text-gray-300">Loading policies...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="space-y-4">
          {policies.map(policy => (
            <div
              key={policy._id}
              className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg shadow flex justify-between items-start border border-gray-200 dark:border-gray-700"
            >
              <div>
                <div className="font-bold text-gray-900 dark:text-gray-100">{policy.title}</div>
                <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{policy.content}</div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <button
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                  onClick={() => handleEdit(policy)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 dark:text-red-400 hover:underline"
                  onClick={() => handleDelete(policy._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}