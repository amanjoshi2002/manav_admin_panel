"use client";

import { useState, useEffect } from "react";
import { authenticatedRequest } from "@/config/api";
import Image from "next/image";

// Define CATEGORIES constant (can be moved to a shared file later)
const CATEGORIES = {
  APPARELS: 'apparels',
  TROPHIES: 'trophies',
  CORPORATE_GIFTS: 'corporate_gifts',
  PERSONALISED_GIFTS: 'personalised_gifts'
};

// Define interfaces (can be moved to a shared file later)
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
  // attributes: Attribute[]; // Assuming attributes might not be needed for product selection dropdown
  isActive: boolean;
}

interface SubCategory {
  _id: string;
  name: string;
  category: string; // This links to the main category like 'apparels'
  description?: string;
  image?: string;
  // commonAttributes: Attribute[]; // Assuming not needed for product selection dropdown
  subCategories: SubSubCategory[]; // These are the sub-subcategories
  isActive: boolean;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  categoryId: string;
  subCategoryId: string;
  subSubCategoryId?: string;
  pricing: {
    mrp: number;
    regular: number;
    reseller: number;
    special: number;
  };
  stock: number;
  dynamicFields: Record<string, any>;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // State for categories
  const [allSubcategories, setAllSubcategories] = useState<SubCategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<SubCategory[]>([]);
  const [filteredSubSubcategories, setFilteredSubSubcategories] = useState<SubSubCategory[]>([]);
  
  // New product form state
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    categoryId: '',
    subCategoryId: '',
    subSubCategoryId: '',
    pricing: {
      mrp: 0,
      regular: 0,
      reseller: 0,
      special: 0
    },
    stock: 0,
    dynamicFields: {},
    images: [],
    isActive: true
  });

  // Fetch products with pagination
  const fetchProducts = async (page = 1) => {
    setLoading(true);
    setError(""); // Clear previous errors before a new fetch
    try {
      const response = await authenticatedRequest<{ 
        success: boolean; 
        data: Product[];
        pagination: { 
          total: number;
          limit: number;
          page: number;
          pages: number;
        }
    
      }>(`/products?page=${page}&limit=${limit}`);
      
      // Ensure response.data is an array before setting products
      setProducts(Array.isArray(response.data) ? response.data : []);
      // Safely access pagination properties using optional chaining
      setTotalPages(response.pagination?.pages || 1);
      setCurrentPage(response.pagination?.page || 1);
    } catch (err: any) {
      setError(err.message || "Failed to fetch products");
      setProducts([]); // Set products to an empty array on error to prevent .length errors
    } finally {
      setLoading(false);
    }
  };

  // Add this function to fetch subcategories
  const fetchSubcategories = async () => {
    try {
      const response = await authenticatedRequest<{ success: boolean; data: SubCategory[] }>("/subcategories");
      setAllSubcategories(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch subcategories");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSubcategories(); // Add this line
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setNewProduct(prev => ({ ...prev, [name]: value }));

    if (name === 'categoryId') {
      const selectedCategoryValue = value;
      const subcats = allSubcategories.filter(sc => sc.category === selectedCategoryValue);
      setFilteredSubcategories(subcats);
      setFilteredSubSubcategories([]); // Reset sub-subcategories
      setNewProduct(prev => ({
        ...prev,
        categoryId: selectedCategoryValue,
        subCategoryId: '', // Reset subcategory ID
        subSubCategoryId: '' // Reset sub-subcategory ID
      }));
    } else if (name === 'subCategoryId') {
      const selectedSubCategoryId = value;
      const selectedSubcategory = filteredSubcategories.find(sc => sc._id === selectedSubCategoryId);
      setFilteredSubSubcategories(selectedSubcategory ? selectedSubcategory.subCategories : []);
      setNewProduct(prev => ({
        ...prev,
        subCategoryId: selectedSubCategoryId,
        subSubCategoryId: '' // Reset sub-subcategory ID
      }));
    } else if (name.startsWith('pricing.')) {
      const pricingField = name.split('.')[1];
      setNewProduct({
        ...newProduct,
        pricing: {
          // Make sure pricing object exists with default values
          mrp: newProduct.pricing?.mrp || 0,
          regular: newProduct.pricing?.regular || 0,
          reseller: newProduct.pricing?.reseller || 0,
          special: newProduct.pricing?.special || 0,
          // Then override the specific field being changed
          [pricingField]: parseFloat(value) || 0
        }
      });
    } else if (name === 'stock') {
      setNewProduct({
        ...newProduct,
        [name]: parseInt(value) || 0
      });
    } else {
      setNewProduct({
        ...newProduct,
        [name]: value
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (formMode === 'create') {
        await authenticatedRequest("/products", {
          method: "POST",
          body: JSON.stringify(newProduct),
        });
        setSuccessMessage("Product created successfully");
      } else {
        await authenticatedRequest(`/products/${selectedProduct?._id}`, {
          method: "PUT",
          body: JSON.stringify(newProduct),
        });
        setSuccessMessage("Product updated successfully");
      }
      
      // Reset form and refresh data
      setShowForm(false);
      setNewProduct({
        name: '',
        description: '',
        categoryId: '',
        subCategoryId: '',
        subSubCategoryId: '',
        pricing: {
          mrp: 0,
          regular: 0,
          reseller: 0,
          special: 0
        },
        stock: 0,
        dynamicFields: {},
        images: [],
        isActive: true
      });
      fetchProducts(currentPage);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save product");
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await authenticatedRequest(`/products/${productId}`, {
        method: "DELETE",
      });
      
      setSuccessMessage("Product deleted successfully");
      fetchProducts(currentPage);
      
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to delete product");
    }
  };

  // Handle product activation/deactivation
  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    try {
      await authenticatedRequest(`/products/${productId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      
      setSuccessMessage(`Product ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchProducts(currentPage);
      
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update product status");
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchProducts(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <div className="space-x-2">
          <button 
            onClick={() => fetchProducts(currentPage)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
          <button 
            onClick={() => {
              setFormMode('create');
              setShowForm(true);
              setSelectedProduct(null);
              setNewProduct({
                name: '',
                description: '',
                categoryId: '',
                subCategoryId: '',
                subSubCategoryId: '',
                pricing: {
                  mrp: 0,
                  regular: 0,
                  reseller: 0,
                  special: 0
                },
                stock: 0,
                dynamicFields: {},
                images: [],
                isActive: true
              });
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add New Product
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

      {/* Product Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">
            {formMode === 'create' ? 'Create New Product' : 'Edit Product'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={newProduct.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={newProduct.description}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category ID *
                </label>
                <select
                  name="categoryId"
                  value={newProduct.categoryId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                >
                  <option value="">Select a category</option>
                  <option value="apparels">Apparels</option>
                  <option value="trophies">Trophies</option>
                  <option value="corporate_gifts">Corporate Gifts</option>
                  <option value="personalised_gifts">Personalised Gifts</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subcategory ID *
                </label>
                <input
                  type="text"
                  name="subCategoryId"
                  value={newProduct.subCategoryId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sub-subcategory ID
                </label>
                <input
                  type="text"
                  name="subSubCategoryId"
                  value={newProduct.subSubCategoryId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stock *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={newProduct.stock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                />
              </div>
            </div>
            
            <div className="border p-4 rounded-md border-gray-300 dark:border-gray-600">
              <h3 className="text-md font-medium mb-3">Pricing Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    MRP *
                  </label>
                  <input
                    type="number"
                    name="pricing.mrp"
                    value={newProduct.pricing?.mrp}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Regular Price *
                  </label>
                  <input
                    type="number"
                    name="pricing.regular"
                    value={newProduct.pricing?.regular}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reseller Price *
                  </label>
                  <input
                    type="number"
                    name="pricing.reseller"
                    value={newProduct.pricing?.reseller}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Special Price *
                  </label>
                  <input
                    type="number"
                    name="pricing.special"
                    value={newProduct.pricing?.special}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                  />
                </div>
              </div>
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
                {formMode === 'create' ? 'Create Product' : 'Update Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      {loading ? (
        <div className="text-center py-4">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          No products found. Create your first one!
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {products && products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {product.categoryId} / {product.subCategoryId} {product.subSubCategoryId && `/ ${product.subSubCategoryId}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      ₹{product.pricing.regular.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${product.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setFormMode('edit');
                          setShowForm(true);
                          setSelectedProduct(product);
                          setNewProduct({
                            ...product,
                            pricing: {
                              mrp: product.pricing.mrp,
                              regular: product.pricing.regular,
                              reseller: product.pricing.reseller,
                              special: product.pricing.special
                            }
                          });
                        }}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(product._id, product.isActive)}
                        className={`${
                          product.isActive 
                            ? 'text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300' 
                            : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                        } mr-4`}
                      >
                        {product.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Page numbers */}
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === i + 1
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
