import React, { useState } from 'react';
import { ProductFormData } from './types';

interface VariantsSectionProps {
  formData: ProductFormData;
  handleSizesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  addColor: () => void;
  removeColor: (index: number) => void;
  handleColorChange: (index: number, field: string, value: string) => void;
  colorRefs: React.MutableRefObject<Array<HTMLDivElement | null>>;
  addColorImageField: (colorIndex: number) => void;
  removeColorImageField: (colorIndex: number, imageIndex: number) => void;
  handleColorImageUrlChange: (colorIndex: number, imageIndex: number, value: string) => void;
  handleColorImageFilesChange: (colorIdx: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  removeColorImageFile: (colorIdx: number, fileIdx: number) => void;
}

const VariantsSection: React.FC<VariantsSectionProps> = ({
  formData,
  handleSizesChange,
  addColor,
  removeColor,
  handleColorChange,
  colorRefs,
  addColorImageField,
  removeColorImageField,
  handleColorImageUrlChange,
  handleColorImageFilesChange,
  removeColorImageFile,
}) => {
  // Local state for sizes input
  const [sizesInput, setSizesInput] = useState(formData.sizes.join(', '));

  // Update local state as user types
  const handleSizesInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSizesInput(e.target.value);
  };

  // On blur, update formData.sizes via handler
  const handleSizesInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Create a synthetic event to pass to the original handler
    const syntheticEvent = {
      ...e,
      target: { ...e.target, value: sizesInput }
    } as React.ChangeEvent<HTMLInputElement>;
    handleSizesChange(syntheticEvent);
  };

  // If formData.sizes changes externally, update local state
  React.useEffect(() => {
    setSizesInput(formData.sizes.join(', '));
  }, [formData.sizes]);

  return (
    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold">Variants</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Sizes (comma separated)
        </label>
        <input
          type="text"
          value={sizesInput}
          onChange={handleSizesInputChange}
          onBlur={handleSizesInputBlur}
          placeholder="S, M, L, XL"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
        />
        {formData.pricingMode === 'size-based' && (
          <p className="mt-1 text-xs text-blue-600">
            Size-based pricing will be automatically created for each size you add
          </p>
        )}
      </div>
      <div className="space-y-4">
        {/* Add Color button at the top */}
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
        {/* Color fields */}
        {formData.colors.map((color, colorIdx) => (
          <div
            key={colorIdx}
            ref={el => { colorRefs.current[colorIdx] = el; }}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex justify-between items-start mb-4">
              <input
                type="text"
                value={color.name}
                onChange={e => handleColorChange(colorIdx, 'name', e.target.value)}
                placeholder="Color name"
                className="w-1/2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
              />
              <button
                type="button"
                onClick={() => removeColor(colorIdx)}
                className="ml-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
              >
                Remove
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Images
                </label>
                {/* File upload for color images only */}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => handleColorImageFilesChange(colorIdx, e)}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 mt-2"
                />
                {/* Display uploaded files as thumbnails */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {Array.isArray(formData.colorImageFiles?.[colorIdx]) && formData.colorImageFiles[colorIdx].length > 0 &&
                    formData.colorImageFiles[colorIdx].map((file, fileIdx) => (
                      <div key={fileIdx} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Color ${colorIdx + 1} File ${fileIdx + 1}`}
                          className="h-14 w-14 object-cover rounded border border-gray-300 dark:border-gray-600 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeColorImageFile(colorIdx, fileIdx)}
                          className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-1 py-0.5 text-xs opacity-80 group-hover:opacity-100"
                          title="Remove"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        ))}
        {/* Add Color button at the bottom */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={addColor}
            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
          >
            Add Color
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariantsSection;
