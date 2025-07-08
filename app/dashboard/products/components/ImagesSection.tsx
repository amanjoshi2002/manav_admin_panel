import React from 'react';
import { ProductFormData, ImagesSectionProps } from './types';

const ImagesSection: React.FC<ImagesSectionProps> = ({
  formData,
  imageFiles,
  fileInputRef,
  handleImageFilesChange,
  removeImage,
}) => (
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
    {/* Always show both existing and new images */}
    <div className="flex flex-wrap gap-2 mt-2">
      {/* Existing images from URLs */}
      {formData.images && formData.images.map((img, idx) => (
        <div key={"existing-" + idx} className="relative">
          <img
            src={img}
            alt={`Product ${idx + 1}`}
            className="h-16 w-16 object-cover rounded"
          />
          <button
            type="button"
            onClick={() => removeImage(idx, false)}
            className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-1 py-0.5 text-xs"
            title="Remove"
          >
            &times;
          </button>
        </div>
      ))}
      {/* New images from file uploads */}
      {imageFiles.map((file, idx) => (
        <div key={"file-" + idx} className="relative">
          <img
            src={URL.createObjectURL(file)}
            alt={`Preview ${idx + 1}`}
            className="h-16 w-16 object-cover rounded"
          />
          <button
            type="button"
            onClick={() => removeImage(idx, true)}
            className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-1 py-0.5 text-xs"
            title="Remove"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  </div>
);

export default ImagesSection;
