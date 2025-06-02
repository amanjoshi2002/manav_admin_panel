"use client";

import { useState, useEffect, useRef } from "react";
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
  gst: number;
  pricing?: {
    mrp: number;
    customer: number;
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
  subCategoryId: string;
  subSubCategoryId?: string;
  description: string;
  gst: number;
  pricing: {
    mrp: number;
    customer: number;
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
  colorImageFiles?: File[][]; // Array of arrays, each for a color
}

export default function ProductForm({ productId, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [subSubCategories, setSubSubCategories] = useState<SubSubCategory[]>([]);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    subCategoryId: "",
    description: "",
    gst: 0,
    pricing: {
      mrp: 0,
      customer: 0,
      reseller: 0,
      special: 0
    },
    stock: 0,
    isActive: true,
    sizes: [],
    colors: [{ name: "", images: [] }],
    images: []
  });

  // Add state for image files
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [colorImageFiles, setColorImageFiles] = useState<File[][]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch subcategories
  useEffect(() => {
    const fetchSubCategories = async () => {
      setLoading(true);
      try {
        const response = await authenticatedRequest<{ success: boolean; data: SubCategory[] }>(
          `/subcategories`
        );
        setSubCategories(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch subcategories");
        setSubCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategories();
  }, []);

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
          subCategoryId: typeof product.subCategoryId === 'object' && product.subCategoryId !== null 
            ? product.subCategoryId._id 
            : product.subCategoryId as string,
          subSubCategoryId: product.subSubCategoryId,
          description: product.description || "",
          gst: product.gst || 0,
          pricing: {
            mrp: product.pricing?.mrp || 0,
            customer: product.pricing?.customer || 0,
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

  // Update handleNumberChange to default to 0 if empty
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const num = value === "" ? 0 : parseFloat(value);

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...(formData[parent as keyof ProductFormData] as object),
          [child]: num
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: num
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
    setColorImageFiles([...colorImageFiles, []]);
  };

  // Remove color
  const removeColor = (index: number) => {
    const updatedColors = [...formData.colors];
    updatedColors.splice(index, 1);
    setFormData({
      ...formData,
      colors: updatedColors.length ? updatedColors : [{ name: "", images: [] }]
    });
    const updatedColorFiles = [...colorImageFiles];
    updatedColorFiles.splice(index, 1);
    setColorImageFiles(updatedColorFiles);
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

  // Handle image file selection
  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  // Remove a selected image file
  const removeImageFile = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle color image file selection
  const handleColorImageFilesChange = (colorIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setColorImageFiles(prev => {
        const updated = [...prev];
        updated[colorIdx] = filesArr;
        return updated;
      });
    }
  };

  // Remove a selected color image file
  const removeColorImageFile = (colorIdx: number, fileIdx: number) => {
    setColorImageFiles(prev => {
      const updated = [...prev];
      updated[colorIdx] = updated[colorIdx].filter((_, i) => i !== fileIdx);
      return updated;
    });
  };

  // Add validation before submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate pricing fields
    const { mrp, customer, reseller, special } = formData.pricing;
    if (
      isNaN(mrp) || mrp <= 0 ||
      isNaN(customer) || customer <= 0 ||
      isNaN(reseller) || reseller <= 0 ||
      isNaN(special) || special <= 0 ||
      isNaN(formData.gst) || formData.gst < 0
    ) {
      setError("All pricing fields are required and must be greater than 0.");
      setLoading(false);
      return;
    }

    try {
      // Remove empty images from URLs
      const cleanedFormData = {
        ...formData,
        images: formData.images.filter(img => img.trim() !== ""),
        colors: formData.colors.filter(color => color.name.trim() !== "")
      };

      const formPayload = new FormData();
      formPayload.append("name", cleanedFormData.name);
      formPayload.append("subCategoryId", cleanedFormData.subCategoryId);
      if (cleanedFormData.subSubCategoryId)
        formPayload.append("subSubCategoryId", cleanedFormData.subSubCategoryId);
      formPayload.append("description", cleanedFormData.description);
      formPayload.append("gst", String(cleanedFormData.gst));

      // FIX: Always stringify objects/arrays
      formPayload.append("pricing", JSON.stringify(cleanedFormData.pricing));
      formPayload.append("stock", String(cleanedFormData.stock));
      formPayload.append("isActive", String(cleanedFormData.isActive));
      formPayload.append("sizes", JSON.stringify(cleanedFormData.sizes));
      // Remove color images (urls) from color objects, backend will set them
      const colorsWithoutImages = cleanedFormData.colors.map((c) => ({ ...c, images: [] }));
      formPayload.append("colors", JSON.stringify(colorsWithoutImages));
      formPayload.append("dynamicFields", JSON.stringify(cleanedFormData.dynamicFields || {}));

      // Main product images
      imageFiles.forEach((file) => {
        formPayload.append("images", file);
      });
      // Color images: send as colorImages-0, colorImages-1, etc.
      colorImageFiles.forEach((files, colorIdx) => {
        files.forEach((file) => {
          formPayload.append(`colorImages-${colorIdx}`, file);
        });
      });

      let endpoint = "/products";
      let method = "POST";
      if (isEditing && productId) {
        endpoint = `/products/${productId}`;
        method = "PUT";
      }

      await authenticatedRequest(endpoint, {
        method,
        body: formPayload,
      });

      setSuccessMessage(isEditing ? "Product updated successfully" : "Product created successfully");
      setTimeout(() => {
        if (isEditing && productId) {
          router.push(`/dashboard/products/${productId}`);
        } else {
          router.push(`/dashboard/products`);
        }
      }, 1500);
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
              GST (%)
            </label>
            <input
              type="number"
              name="gst"
              value={formData.gst}
              onChange={handleNumberChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
            />
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
            {subCategories.length === 0 && (
              <p className="mt-1 text-sm text-yellow-600">
                No subcategories found. Please create one first.
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
                customer Price *
              </label>
              <input
                type="number"
                name="pricing.customer"
                value={formData.pricing.customer}
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
                        Color Images (Upload)
                      </label>
                      <label
                        htmlFor={`color-images-${index}`}
                        className="inline-block px-3 py-1 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 text-xs"
                      >
                        {colorImageFiles[index] && colorImageFiles[index].length > 0
                          ? "Change Images"
                          : "Choose Images"}
                      </label>
                      <input
                        id={`color-images-${index}`}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={e => handleColorImageFilesChange(index, e)}
                        className="hidden"
                      />
                    </div>

                    {/* Preview selected color images */}
                    {colorImageFiles[index] && colorImageFiles[index].length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {colorImageFiles[index].map((file, fileIdx) => (
                          <div key={fileIdx} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Color ${index + 1} Preview ${fileIdx + 1}`}
                              className="h-12 w-12 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removeColorImageFile(index, fileIdx)}
                              className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-1 py-0.5 text-xs"
                              title="Remove"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Show current images if editing and no new images selected */}
                    {(!colorImageFiles[index] || colorImageFiles[index].length === 0) &&
                      color.images &&
                      color.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {color.images.map((img, imgIdx) => (
                            <img
                              key={imgIdx}
                              src={img}
                              alt={`Color ${index + 1} Image ${imgIdx + 1}`}
                              className="h-12 w-12 object-cover rounded"
                            />
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
          <h2 className="text-xl font-semibold">Images</h2>
          <label
            htmlFor="product-images"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700"
          >
            {imageFiles.length > 0 ? "Change Images" : "Choose Images"}
          </label>
          <input
            id="product-images"
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            onChange={handleImageFilesChange}
            className="hidden"
          />
          {/* Preview selected images */}
          {imageFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {imageFiles.map((file, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${idx + 1}`}
                    className="h-16 w-16 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImageFile(idx)}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-1 py-0.5 text-xs"
                    title="Remove"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* Show current images if editing and no new images selected */}
          {imageFiles.length === 0 && formData.images && formData.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Product ${idx + 1}`}
                  className="h-16 w-16 object-cover rounded"
                />
              ))}
            </div>
          )}
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