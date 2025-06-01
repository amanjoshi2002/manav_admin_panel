"use client";

import { useState, useEffect } from "react";
import { authenticatedRequest } from "@/config/api";

interface Attribute {
  _id?: string;
  name: string;
  type: 'brand' | 'material' | 'size' | 'color' | 'style' | 'other';
  image?: string;
  description?: string;
  isActive: boolean;
}

interface SubSubCategory {
  _id?: string;
  name: string;
  description?: string;
  image?: string;
  attributes: Attribute[];
  isActive: boolean;
}

interface SubCategory {
  _id: string;
  name: string;
  category: string;
  description?: string;
  image?: string;
  commonAttributes: Attribute[];
  subCategories: SubSubCategory[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  image?: string;
}

export default function SubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubCategory | null>(null);
  
  // Sub-subcategory form states
  const [showSubSubForm, setShowSubSubForm] = useState(false);
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState<SubSubCategory | null>(null);
  const [parentSubcategoryId, setParentSubcategoryId] = useState<string>("");
  const [newSubSubcategory, setNewSubSubcategory] = useState<SubSubCategory>({
    name: '',
    description: '',
    image: '',
    attributes: [],
    isActive: true
  });
  
  // New subcategory form state
  const [newSubcategory, setNewSubcategory] = useState<Partial<SubCategory>>({
    name: '',
    category: '',
    description: '',
    image: '',
    commonAttributes: [],
    subCategories: [],
    isActive: true
  });

  // Category states
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Add to state for file handling
  const [subcategoryImage, setSubcategoryImage] = useState<File | null>(null);
  const [subSubcategoryImage, setSubSubcategoryImage] = useState<File | null>(null);

  // Fetch all subcategories
  const fetchSubcategories = async () => {
    setLoading(true);
    try {
      const response = await authenticatedRequest<{ success: boolean; data: SubCategory[] }>("/subcategories");
      setSubcategories(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch subcategories");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const data = await authenticatedRequest<Category[]>("/categories");
      setCategories(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchSubcategories();
    fetchCategories();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewSubcategory({
      ...newSubcategory,
      [name]: value
    });
  };

  // Handle sub-subcategory form input changes
  const handleSubSubInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewSubSubcategory({
      ...newSubSubcategory,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", newSubcategory.name || "");
      formData.append("category", newSubcategory.category || "");
      formData.append("description", newSubcategory.description || "");
      formData.append("isActive", String(newSubcategory.isActive));
      if (subcategoryImage) formData.append("image", subcategoryImage);

      const endpoint = formMode === "create"
        ? "/subcategories"
        : `/subcategories/${selectedSubcategory?._id}`;
      const method = formMode === "create" ? "POST" : "PUT";

      await authenticatedRequest(endpoint, {
        method,
        body: formData,
        // Don't set Content-Type, browser will set it for FormData
      });

      setSuccessMessage(formMode === "create"
        ? "Subcategory created successfully"
        : "Subcategory updated successfully"
      );
      setShowForm(false);
      setNewSubcategory({
        name: '',
        category: '',
        description: '',
        image: '',
        commonAttributes: [],
        subCategories: [],
        isActive: true
      });
      setSubcategoryImage(null);
      fetchSubcategories();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save subcategory");
    }
  };

  // Handle sub-subcategory form submission
  const handleSubSubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", newSubSubcategory.name || "");
      formData.append("description", newSubSubcategory.description || "");
      formData.append("isActive", String(newSubSubcategory.isActive));
      if (subSubcategoryImage) formData.append("image", subSubcategoryImage);

      let endpoint = "";
      let method = "";
      if (!selectedSubSubcategory?._id) {
        endpoint = `/subcategories/${parentSubcategoryId}/sub`;
        method = "POST";
      } else {
        endpoint = `/subcategories/${parentSubcategoryId}/sub/${selectedSubSubcategory._id}`;
        method = "PUT";
      }

      await authenticatedRequest(endpoint, {
        method,
        body: formData,
      });

      setSuccessMessage(!selectedSubSubcategory?._id
        ? "Sub-subcategory added successfully"
        : "Sub-subcategory updated successfully"
      );
      setShowSubSubForm(false);
      setSelectedSubSubcategory(null);
      setParentSubcategoryId("");
      setNewSubSubcategory({
        name: '',
        description: '',
        image: '',
        attributes: [],
        isActive: true
      });
      setSubSubcategoryImage(null);
      fetchSubcategories();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save sub-subcategory");
    }
  };

  // Handle adding a sub-subcategory
  const handleAddSubSubcategory = (subcategoryId: string) => {
    setParentSubcategoryId(subcategoryId);
    setSelectedSubSubcategory(null);
    setNewSubSubcategory({
      name: '',
      description: '',
      image: '',
      attributes: [],
      isActive: true
    });
    setShowSubSubForm(true);
  };

  // Handle editing a sub-subcategory
  const handleEditSubSubcategory = (subcategoryId: string, subSubcategory: SubSubCategory) => {
    setParentSubcategoryId(subcategoryId);
    setSelectedSubSubcategory(subSubcategory);
    setNewSubSubcategory({
      ...subSubcategory
    });
    setShowSubSubForm(true);
  };

  // Handle deleting a sub-subcategory
  const handleDeleteSubSubcategory = async (subcategoryId: string, subSubcategoryId: string) => {
    if (!window.confirm("Are you sure you want to delete this sub-subcategory?")) {
      return;
    }

    try {
      await authenticatedRequest(`/subcategories/${subcategoryId}/sub/${subSubcategoryId}`, {
        method: "DELETE",
      });
      
      setSuccessMessage("Sub-subcategory deleted successfully");
      fetchSubcategories();
      
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to delete sub-subcategory");
    }
  };

  // Add this handler for deleting a subcategory
  const handleDeleteSubcategory = async (subcategoryId: string) => {
    if (!window.confirm("Are you sure you want to delete this subcategory?")) {
      return;
    }
    try {
      await authenticatedRequest(`/subcategories/${subcategoryId}`, {
        method: "DELETE",
      });
      setSuccessMessage("Subcategory deleted successfully");
      fetchSubcategories();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to delete subcategory");
    }
  };

  // Filter subcategories by selected category
  const filteredSubcategories = selectedCategory
    ? subcategories.filter((sc) => sc.category === selectedCategory)
    : subcategories;

  return (
    <div className="space-y-6">
      {/* Category filter bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className={`px-3 py-1 rounded ${selectedCategory === "" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
          onClick={() => setSelectedCategory("")}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            className={`px-3 py-1 rounded ${selectedCategory === cat._id ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
            onClick={() => setSelectedCategory(cat._id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Subcategory Management</h1>
        <div className="space-x-2">
          <button 
            onClick={fetchSubcategories}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
          <button 
            onClick={() => {
              setFormMode('create');
              setShowForm(true);
              setSelectedSubcategory(null);
              setNewSubcategory({
                name: '',
                category: '',
                description: '',
                image: '',
                commonAttributes: [],
                subCategories: [],
                isActive: true
              });
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add New Subcategory
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
          <button 
            className="absolute top-0 right-0 px-4 py-3" 
            onClick={() => setError("")}
          >
            &times;
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {successMessage}
          <button 
            className="absolute top-0 right-0 px-4 py-3" 
            onClick={() => setSuccessMessage("")}
          >
            &times;
          </button>
        </div>
      )}

      {/* Subcategory Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">
            {formMode === 'create' ? 'Create New Subcategory' : 'Edit Subcategory'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={newSubcategory.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={newSubcategory.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={newSubcategory.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setSubcategoryImage(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Active
              </label>
              <input
                type="checkbox"
                name="isActive"
                checked={!!newSubcategory.isActive}
                onChange={e =>
                  setNewSubcategory({
                    ...newSubcategory,
                    isActive: e.target.checked,
                  })
                }
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {newSubcategory.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {formMode === 'create' ? 'Create Subcategory' : 'Update Subcategory'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sub-subcategory Form Modal */}
      {showSubSubForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {selectedSubSubcategory?._id ? 'Edit Sub-subcategory' : 'Add Sub-subcategory'}
            </h2>
            
            <form onSubmit={handleSubSubSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={newSubSubcategory.name}
                  onChange={handleSubSubInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={newSubSubcategory.description}
                  onChange={handleSubSubInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setSubSubcategoryImage(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Active
                </label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={!!newSubSubcategory.isActive}
                  onChange={e =>
                    setNewSubSubcategory({
                      ...newSubSubcategory,
                      isActive: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {newSubSubcategory.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSubSubForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {selectedSubSubcategory?._id ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategories List */}
      {loading ? (
        <div className="text-center py-4">Loading subcategories...</div>
      ) : filteredSubcategories.length === 0 ? (
        <div className="text-center py-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          No subcategories found. Create your first one!
        </div>
      ) : (
        <div className="space-y-6">
          {filteredSubcategories.map((subcategory) => (
            <div key={subcategory._id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold">{subcategory.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Category: <span className="font-medium">{subcategory.category}</span>
                    </p>
                    {subcategory.description && (
                      <p className="mt-2 text-gray-600 dark:text-gray-300">{subcategory.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setFormMode('edit');
                        setShowForm(true);
                        setSelectedSubcategory(subcategory);
                        setNewSubcategory({
                          ...subcategory,
                        });
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSubcategory(subcategory._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Sub-subcategories */}
              <div className="p-6">
                <h4 className="text-md font-bold mb-4">Sub-subcategories</h4>
                
                {subcategory.subCategories.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No sub-subcategories found.</p>
                ) : (
                  <div className="space-y-4">
                    {subcategory.subCategories.map((subSubcategory) => (
                      <div key={subSubcategory._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{subSubcategory.name}</h5>
                            {subSubcategory.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{subSubcategory.description}</p>
                            )}
                            {subSubcategory.image && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Image: {subSubcategory.image.substring(0, 30)}...
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditSubSubcategory(subcategory._id, subSubcategory)}
                              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSubSubcategory(subcategory._id, subSubcategory._id!)}
                              className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add new sub-subcategory button */}
                <button
                  onClick={() => handleAddSubSubcategory(subcategory._id)}
                  className="mt-4 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  Add Sub-subcategory
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}