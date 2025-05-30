"use client";

import { useEffect, useState } from "react";
import { authenticatedRequest } from "@/config/api";

interface Pdf {
  _id: string;
  name: string;
  pdfLink: string;
  image?: string;
  description?: string;
}

export default function PdfsPage() {
  const [pdfs, setPdfs] = useState<Pdf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Partial<Pdf>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchPdfs = async () => {
    setLoading(true);
    try {
      const data = await authenticatedRequest<Pdf[]>("/pdfs");
      setPdfs(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch PDFs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPdfs();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await authenticatedRequest(`/pdfs/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(form),
          headers: { "Content-Type": "application/json" },
        });
      } else {
        await authenticatedRequest("/pdfs", {
          method: "POST",
          body: JSON.stringify(form),
          headers: { "Content-Type": "application/json" },
        });
      }
      setForm({});
      setEditingId(null);
      fetchPdfs();
    } catch (err: any) {
      setError(err.message || "Failed to save PDF");
    }
  };

  const handleEdit = (pdf: Pdf) => {
    setForm(pdf);
    setEditingId(pdf._id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this PDF?")) return;
    try {
      await authenticatedRequest(`/pdfs/${id}`, { method: "DELETE" });
      fetchPdfs();
    } catch (err: any) {
      setError(err.message || "Failed to delete PDF");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-4">PDF Management</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-2xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            placeholder="PDF Name"
            value={form.name || ""}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
          />
          <input
            name="pdfLink"
            placeholder="PDF Link"
            value={form.pdfLink || ""}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
          />
          <input
            name="image"
            placeholder="Image URL"
            value={form.image || ""}
            onChange={handleChange}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description || ""}
            onChange={handleChange}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400 md:col-span-2"
          />
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition"
          >
            {editingId ? "Update PDF" : "Add PDF"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setForm({});
                setEditingId(null);
              }}
              className="px-6 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      {error && <div className="text-red-600 text-center">{error}</div>}
      {loading ? (
        <div className="text-center text-lg">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <thead>
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">PDF Link</th>
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pdfs.map((pdf) => (
                <tr
                  key={pdf._id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <td className="p-3 font-medium">{pdf.name}</td>
                  <td className="p-3">
                    <a
                      href={pdf.pdfLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      View
                    </a>
                  </td>
                  <td className="p-3">
                    {pdf.image && (
                      <img
                        src={pdf.image}
                        alt={pdf.name}
                        className="h-12 w-12 object-cover rounded shadow"
                      />
                    )}
                  </td>
                  <td className="p-3">{pdf.description}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(pdf)}
                      className="px-3 py-1 rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(pdf._id)}
                      className="px-3 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {pdfs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center p-4 text-gray-500">
                    No PDFs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}