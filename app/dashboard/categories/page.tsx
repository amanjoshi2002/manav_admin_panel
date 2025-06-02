"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL, getAuthToken, authenticatedRequest } from "@/config/api";

interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  image?: string;
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    isActive: true,
    image: undefined as File | undefined,
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await authenticatedRequest<Category[]>("/categories");
      setCategories(res);
    } catch (e: any) {
      setError(e.message || "Failed to fetch categories");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm((prev) => ({
        ...prev,
        image: e.target.files![0],
      }));
    }
  };

  // Handle create/update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("isActive", String(form.isActive));
    if (form.image) formData.append("image", form.image);

    try {
      const token = getAuthToken();
      const endpoint = editCategory
        ? `/categories/${editCategory._id}`
        : "/categories";
      const method = editCategory ? "PUT" : "POST";

      const res = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
          method,
          headers:
            {
              Authorization: token ? `Bearer ${token}` : "",
            },
          body: formData,
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save category");
      }

      setShowForm(false);
      setEditCategory(null);
      setForm({ name: "", description: "", isActive: true, image: undefined });
      fetchCategories();
    } catch (e: any) {
      setError(e.message || "Failed to save category");
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await authenticatedRequest(`/categories/${id}`, { method: "DELETE" });
      fetchCategories();
    } catch (e: any) {
      setError(e.message || "Failed to delete category");
    }
  };

  // Handle edit
  const handleEdit = (cat: Category) => {
    setEditCategory(cat);
    setForm({
      name: cat.name,
      description: cat.description || "",
      isActive: cat.isActive,
      image: undefined,
    });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Category Management</h2>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => {
            setShowForm(true);
            setEditCategory(null);
            setForm({ name: "", description: "", isActive: true, image: undefined });
          }}
        >
          + Add Category
        </button>
      </div>

      {error && (
        <div className="mb-4 text-red-600 bg-red-100 p-2 rounded">{error}</div>
      )}

      {/* Category Form */}
      {showForm && (
        <form
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6"
          onSubmit={handleSubmit}
        >
          <div className="mb-4">
            <label className="block font-semibold mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700"
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700"
            />
          </div>
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="mr-2"
            />
            <label className="font-semibold">Active</label>
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Image</label>
            <label
              htmlFor="category-image"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700"
            >
              {form.image ? "Change Image" : "Choose Image"}
            </label>
            <input
              id="category-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {/* Preview selected image */}
            {form.image && (
              <img
                src={URL.createObjectURL(form.image)}
                alt="Preview"
                className="mt-2 h-16 rounded"
              />
            )}
            {/* Show current image if editing and no new image selected */}
            {!form.image && editCategory?.image && (
              <img
                src={editCategory.image}
                alt="Category"
                className="mt-2 h-16 rounded"
              />
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {editCategory ? "Update" : "Create"}
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={() => {
                setShowForm(false);
                setEditCategory(null);
                setForm({ name: "", description: "", isActive: true, image: undefined });
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Category List */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        {loading ? (
          <div>Loading categories...</div>
        ) : categories.length === 0 ? (
          <div>No categories found.</div>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-left">Active</th>
                <th className="p-2 text-left">Image</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id} className="border-b dark:border-gray-700">
                  <td className="p-2">{cat.name}</td>
                  <td className="p-2">{cat.description}</td>
                  <td className="p-2">
                    {cat.isActive ? (
                      <span className="text-green-600 font-bold">Yes</span>
                    ) : (
                      <span className="text-red-600 font-bold">No</span>
                    )}
                  </td>
                  <td className="p-2">
                    {cat.image && (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="h-10 w-10 object-cover rounded"
                      />
                    )}
                  </td>
                  <td className="p-2 flex gap-2">
                    <button
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      onClick={() => handleEdit(cat)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      onClick={() => handleDelete(cat._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}