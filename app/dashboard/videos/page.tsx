"use client";

import { useEffect, useState } from "react";
import { authenticatedRequest } from "@/config/api";

interface Video {
  _id: string;
  name: string;
  videoLink: string;
  image?: string;
  description?: string;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Partial<Video>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const data = await authenticatedRequest<Video[]>("/videos");
      setVideos(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoFile(e.target.files?.[0] || null);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", form.name || "");
      formData.append("description", form.description || "");
      if (videoFile) formData.append("video", videoFile);
      if (imageFile) formData.append("image", imageFile);

      let endpoint = "/videos";
      let method = "POST";
      if (editingId) {
        endpoint = `/videos/${editingId}`;
        method = "PUT";
      }

      await authenticatedRequest(endpoint, {
        method,
        body: formData,
      });

      setForm({});
      setEditingId(null);
      setVideoFile(null);
      setImageFile(null);
      fetchVideos();
    } catch (err: any) {
      setError(err.message || "Failed to save video");
    }
  };

  const handleEdit = (video: Video) => {
    setForm(video);
    setEditingId(video._id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this video?")) return;
    try {
      await authenticatedRequest(`/videos/${id}`, { method: "DELETE" });
      fetchVideos();
    } catch (err: any) {
      setError(err.message || "Failed to delete video");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-4">Video Management</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-2xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            placeholder="Video Name"
            value={form.name || ""}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
          />
          {/* Video file upload */}
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoFileChange}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
          />
          {/* Image file upload */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageFileChange}
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
            {editingId ? "Update Video" : "Add Video"}
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
                <th className="p-3 text-left">Video Link</th>
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr
                  key={video._id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <td className="p-3 font-medium">{video.name}</td>
                  <td className="p-3">
                    <a
                      href={video.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      View
                    </a>
                  </td>
                  <td className="p-3">
                    {video.image && (
                      <img
                        src={video.image}
                        alt={video.name}
                        className="h-12 w-12 object-cover rounded shadow"
                      />
                    )}
                  </td>
                  <td className="p-3">{video.description}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(video)}
                      className="px-3 py-1 rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(video._id)}
                      className="px-3 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {videos.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center p-4 text-gray-500">
                    No videos found.
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