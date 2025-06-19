"use client";

import { useEffect, useState, useRef } from "react";
import { authenticatedRequest } from "@/config/api";
import Image from "next/image";

interface Notification {
  _id: string;
  title: string;
  message: string;
  image?: string;
  startDate: string;
  endDate: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Notification | null>(null);
  const [form, setForm] = useState({
    title: "",
    message: "",
    startDate: "",
    endDate: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await authenticatedRequest<any>("/notifications");
      let arr: Notification[] = [];
      if (Array.isArray(data)) arr = data;
      else if (Array.isArray(data?.notifications)) arr = data.notifications;
      else if (Array.isArray(data?.data)) arr = data.data;
      setNotifications(arr);
    } catch (e: any) {
      setError(e.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (notification: Notification) => {
    setEditing(notification);
    setForm({
      title: notification.title,
      message: notification.message,
      startDate: notification.startDate?.slice(0, 16) || "",
      endDate: notification.endDate?.slice(0, 16) || "",
    });
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this notification?")) return;
    try {
      await authenticatedRequest(`/notifications/${id}`, { method: "DELETE" });
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (e: any) {
      alert(e.message || "Delete failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let url = "/notifications";
      let method = "POST";
      if (editing) {
        url = `/notifications/${editing._id}`;
        method = "PUT";
      }

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("message", form.message);
      formData.append("startDate", form.startDate);
      formData.append("endDate", form.endDate);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await authenticatedRequest(url, {
        method,
        body: formData,
        // Don't set Content-Type header; browser will set it for FormData
      });

      await fetchNotifications();
      setEditing(null);
      setForm({ title: "", message: "", startDate: "", endDate: "" });
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e: any) {
      alert(e.message || "Save failed");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">Notification Management</h2>

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
          placeholder="Message"
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          required
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          onChange={e => setImageFile(e.target.files?.[0] || null)}
        />
        <div className="flex gap-2">
          <input
            type="datetime-local"
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            value={form.startDate}
            onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
            required
          />
          <input
            type="datetime-local"
            className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            value={form.endDate}
            onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
            required
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {editing ? "Update Notification" : "Add Notification"}
          </button>
          {editing && (
            <button
              type="button"
              className="bg-gray-400 text-white px-4 py-2 rounded"
              onClick={() => {
                setEditing(null);
                setForm({ title: "", message: "", startDate: "", endDate: "" });
                setImageFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="text-center text-gray-600 dark:text-gray-300">Loading notifications...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => (
            <div
              key={notification._id}
              className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg shadow flex justify-between items-start border border-gray-200 dark:border-gray-700"
            >
              <div>
                <div className="font-bold text-gray-900 dark:text-gray-100">{notification.title}</div>
                <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{notification.message}</div>
                {notification.image && (
                  <div className="mt-2 max-h-32 rounded relative w-full" style={{ maxWidth: 200, height: 128 }}>
                    <Image
                      src={notification.image}
                      alt="Notification"
                      fill
                      style={{ objectFit: "contain" }}
                      className="rounded"
                      sizes="200px"
                      priority={false}
                    />
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  {notification.startDate && (
                    <span>Start: {new Date(notification.startDate).toLocaleString()}</span>
                  )}
                  {notification.endDate && (
                    <span className="ml-2">End: {new Date(notification.endDate).toLocaleString()}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <button
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                  onClick={() => handleEdit(notification)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 dark:text-red-400 hover:underline"
                  onClick={() => handleDelete(notification._id)}
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
