import React from 'react';
import type { ProductFormData, SubCategory, SubSubCategory } from './types';

interface BasicInfoSectionProps {
  formData: ProductFormData;
  subCategories: SubCategory[];
  subSubCategories: SubSubCategory[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  subCategories,
  subSubCategories,
  handleInputChange,
}) => (
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
        onChange={handleInputChange}
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
);

export default BasicInfoSection;
