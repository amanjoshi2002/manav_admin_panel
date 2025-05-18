"use client";

import { useState, useEffect } from "react";
import { authenticatedRequest } from "@/config/api";
import { useRouter } from "next/navigation";

interface SubCategory {
  _id: string;
  name: string;
  category: string;
  description?: string;
  image?: string;
  commonAttributes: any[];
  subCategories: SubSubCategory[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SubSubCategory {
  _id?: string;
  name: string;
  description?: string;
  image?: string;
  attributes: any[];
  isActive: boolean;
}

interface Product {
  _id: string;
  name: string;
  categoryId: string;
  subCategoryId: {
    _id: string;
    name: string;
  } | string;
  subSubCategoryId?: string;
  pricing?: {
    mrp: number;
    regular: number;
    reseller: number;
    special: number;
  };
  description?: string;
  colors?: Array<{
    name: string;
    images: string[];
  }>;
  sizes?: string[];
  dynamicFields?: Record<string, any>;
  images?: string[];
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductFormProps {
  productId?: string;
  isEditing?: boolean;
}

interface ProductFormData {
  name: string;
  categoryId: string;
  subCategoryId: string;
  subSubCategoryId?: string;
  description: string;
  pricing: {
    mrp: number;
    regular: number;
    reseller: number;
    special: number;
  };
  stock: number;
  isActive: boolean;
  sizes: string[];
  colors: Array<{
    name: string;
    images: string[];
  }>;
  images: string[];
  dynamicFields?: Record<string, any>;
}

const CATEGORIES = {
  APPARELS: 'apparels',
  TROPHIES: 'trophies',
  CORPORATE_GIFTS: 'corporate_gifts',
  PERSONALISED_GIFTS: 'personalised_gifts'
};

export default function ProductForm({ productId, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [subSubCategories, setSubSubCategories] = useState<SubSubCategory[]>([]);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    categoryId: Object.values(CATEGORIES)[0],
    subCategoryId: "",
    description: "",
    pricing: {
      mrp: 0,
      regular: 0,
      reseller: 0,
      special: 0
    },
    stock: 0,
    isActive: true,
    sizes: [],
    colors: [{ name: "", images: [] }],
    images: []
  });

  // Fetch subcategories based on selected category
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!formData.categoryId) return;
      
      setLoading(true);
      try {
        // Using the same pattern as in subcategories page
        const response = await authenticatedRequest<{ success: boolean; data: SubCategory[] }>(
          `/subcategories`
        );
        
        // Filter subcategories by category
        const filteredSubcategories = response.data.filter(
          subcat => subcat.category === formData.categoryId
        );
        
        setSubCategories(filteredSubcategories);
      } catch (err: any) {
        console.error("Failed to fetch subcategories:", err);
        setError(err.message || "Failed to fetch subcategories");
        setSubCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategories();
  }, [formData.categoryId]);

  // Fetch sub-subcategories based on selected subcategory
  useEffect(() => {
    const fetchSubSubCategories = async () => {
      if (!formData.subCategoryId) {
        setSubSubCategories([]);
        return;
      }
      
      try {
        // Find the selected subcategory in our already loaded subcategories
        const selectedSubcategory = subCategories.find(
          subcat => subcat._id === formData.subCategoryId
        );
        
        // If we found it, use its subCategories directly instead of making another API call
        if (selectedSubcategory) {
          setSubSubCategories(selectedSubcategory.subCategories);
        } else {
          setSubSubCategories([]);
        }
      } catch (err: any) {
        console.error("Failed to process sub-subcategories:", err);
        setSubSubCategories([]);
      }
    };

    fetchSubSubCategories();
  }, [formData.subCategoryId, subCategories]);

  // Fetch product data if editing
  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId || !isEditing) return;
      
      setLoading(true);
      try {
        const product = await authenticatedRequest<Product>(`/products/${productId}`);
        
        // Transform product data to match form structure
        setFormData({
          name: product.name,
          categoryId: product.categoryId,
          subCategoryId: typeof product.subCategoryId === 'object' && product.subCategoryId !== null 
            ? product.subCategoryId._id 
            : product.subCategoryId as string,
          subSubCategoryId: product.subSubCategoryId,
          description: product.description || "",
          pricing: {
            mrp: product.pricing?.mrp || 0,
            regular: product.pricing?.regular || 0,
            reseller: product.pricing?.reseller || 0,
            special: product.pricing?.special || 0
          },
          stock: product.stock || 0,
          isActive: product.isActive,
          sizes: product.sizes || [],
          colors: product.colors || [{ name: "", images: [] }],
          images: product.images || []
        });
      } catch (err: any) {
        setError(err.message || "Failed to fetch product data");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId, isEditing]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...(formData[parent as keyof ProductFormData] as object),
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...(formData[parent as keyof ProductFormData] as object),
          [child]: parseFloat(value) || 0
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    }
  };

  // Handle sizes array
  const handleSizesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sizesArray = e.target.value.split(',').map(size => size.trim());
    setFormData({
      ...formData,
      sizes: sizesArray
    });
  };

  // Handle color changes
  const handleColorChange = (index: number, field: string, value: string) => {
    const updatedColors = [...formData.colors];
    updatedColors[index] = {
      ...updatedColors[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      colors: updatedColors
    });
  };

  // Add new color
  const addColor = () => {
    setFormData({
      ...formData,
      colors: [...formData.colors, { name: "", images: [] }]
    });
  };

  // Remove color
  const removeColor = (index: number) => {
    const updatedColors = [...formData.colors];
    updatedColors.splice(index, 1);
    
    setFormData({
      ...formData,
      colors: updatedColors.length ? updatedColors : [{ name: "", images: [] }]
    });
  };

  // Handle image URL changes
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newImages = [...formData.images];
    newImages[index] = e.target.value;
    
    setFormData({
      ...formData,
      images: newImages
    });
  };

  // Add new image field
  const addImageField = () => {
    setFormData({
      ...formData,
      images: [...formData.images, ""]
    });
  };

  // Remove image field
  const removeImageField = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    
    setFormData({
      ...formData,
      images: newImages
    });
  };

  // Handle color image URL changes
  const handleColorImageUrlChange = (colorIndex: number, imageIndex: number, value: string) => {
    const updatedColors = [...formData.colors];
    const updatedImages = [...updatedColors[colorIndex].images];
    updatedImages[imageIndex] = value;
    
    updatedColors[colorIndex] = {
      ...updatedColors[colorIndex],
      images: updatedImages
    };
    
    setFormData({
      ...formData,
      colors: updatedColors
    });
  };
  
  // Add new color image field
  const addColorImageField = (colorIndex: number) => {
    const updatedColors = [...formData.colors];
    updatedColors[colorIndex] = {
      ...updatedColors[colorIndex],
      images: [...updatedColors[colorIndex].images, ""]
    };
    
    setFormData({
      ...formData,
      colors: updatedColors
    });
  };
  
  // Remove color image field
  const removeColorImageField = (colorIndex: number, imageIndex: number) => {
    const updatedColors = [...formData.colors];
    const updatedImages = [...updatedColors[colorIndex].images];
    updatedImages.splice(imageIndex, 1);
    
    updatedColors[colorIndex] = {
      ...updatedColors[colorIndex],
      images: updatedImages
    };
    
    setFormData({
      ...formData,
      colors: updatedColors
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Remove empty images
      const cleanedFormData = {
        ...formData,
        images: formData.images.filter(img => img.trim() !== ""),
        colors: formData.colors.filter(color => color.name.trim() !== "")
      };
      
      if (isEditing && productId) {
        // Update existing product
        await authenticatedRequest(`/products/${productId}`, {
          method: "PUT",
          body: JSON.stringify(cleanedFormData),
        });
        setSuccessMessage("Product updated successfully");
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push(`/dashboard/products/${productId}`);
        }, 1500);
      } else {
        // Create new product
        const response = await authenticatedRequest<{ _id: string }>("/products", {
          method: "POST",
          body: JSON.stringify(cleanedFormData),
        });
        
        setSuccessMessage("Product created successfully");
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push(`/dashboard/products/${response._id}`);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
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
        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {successMessage}
          <button 
            className="absolute top-0 right-0 px-4 py-3" 
            onClick={() => setSuccessMessage("")}
          >
            &times;
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
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
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
            >
              <option value="">Select a category</option>
              {Object.entries(CATEGORIES).map(([label, value]) => (
                <option key={value} value={value}>
                  {label.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subcategory *
            </label>
            <select
              name="subCategoryId"
              value={formData.subCategoryId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
            >
              <option value="">Select a subcategory</option>
              {subCategories.map((subcat) => (
                <option key={subcat._id} value={subcat._id}>
                  {subcat.name}
                </option>
              ))}
            </select>
            {subCategories.length === 0 && formData.categoryId && (
              <p className="mt-1 text-sm text-yellow-600">
                No subcategories found for this category. Please create one first.
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sub-subcategory
            </label>
            <select
              name="subSubCategoryId"
              value={formData.subSubCategoryId || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
            >
              <option value="">Select a sub-subcategory (optional)</option>
              {subSubCategories.map((subsubcat) => (
                <option key={subsubcat._id} value={subsubcat._id}>
                  {subsubcat.name}
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
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
            />
          </div>
        </div>
        
        {/* Pricing */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                MRP *
              </label>
              <input
                type="number"
                name="pricing.mrp"
                value={formData.pricing.mrp}
                onChange={handleNumberChange}
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
                value={formData.pricing.regular}
                onChange={handleNumberChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reseller Price
              </label>
              <input
                type="number"
                name="pricing.reseller"
                value={formData.pricing.reseller}
                onChange={handleNumberChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Special Price
              </label>
              <input
                type="number"
                name="pricing.special"
                value={formData.pricing.special}
                onChange={handleNumberChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
              />
            </div>
          </div>
        </div>
        
        {/* Inventory */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">Inventory</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stock *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleNumberChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Active (available for purchase)
              </label>
            </div>
          </div>
        </div>
        
        {/* Variants */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">Variants</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sizes (comma separated)
            </label>
            <input
              type="text"
              value={formData.sizes.join(', ')}
              onChange={handleSizesChange}
              placeholder="S, M, L, XL"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Colors
              </label>
              <button
                type="button"
                onClick={addColor}
                className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
              >
                Add Color
              </button>
            </div>
            
            {formData.colors.map((color, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-sm font-medium">Color #{index + 1}</h4>
                  {formData.colors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeColor(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Color Name/Code
                    </label>
                    <input
                      type="text"
                      value={color.name}
                      onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                      placeholder="Red or #FF0000"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                    />
                  </div>
                  
                  {/* Color Images Section */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs text-gray-500 dark:text-gray-400">
                        Color Images (URLs)
                      </label>
                      <button
                        type="button"
                        onClick={() => addColorImageField(index)}
                        className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        Add Image
                      </button>
                    </div>
                    
                    {color.images.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">No images added for this color</p>
                    ) : (
                      <div className="space-y-2">
                        {color.images.map((imageUrl, imageIndex) => (
                          <div key={imageIndex} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={imageUrl}
                              onChange={(e) => handleColorImageUrlChange(index, imageIndex, e.target.value)}
                              placeholder="https://example.com/image.jpg"
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => removeColorImageField(index, imageIndex)}
                              className="px-2 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Images */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Images</h2>
            <button
              type="button"
              onClick={addImageField}
              className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
            >
              Add Image
            </button>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please provide URLs for your product images. The first image will be used as the main product image.
          </p>
          
          {formData.images.length === 0 && (
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-center text-gray-500 dark:text-gray-400">
                No images added yet. Click "Add Image" to add your first image.
              </p>
            </div>
          )}
          
          {formData.images.map((image, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={image}
                onChange={(e) => handleImageChange(e, index)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
              />
              <button
                type="button"
                onClick={() => removeImageField(index)}
                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        
        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}