import React from 'react';
import { ProductFormData } from './types';

interface VisibilitySectionProps {
  formData: ProductFormData;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const VisibilitySection: React.FC<VisibilitySectionProps> = ({
  formData,
  handleCheckboxChange,
}) => {
  const visibilityOptions = [
    { key: 'showForCustomer', label: 'Show for Customer' },
    { key: 'showForReseller', label: 'Show for Reseller' },
    { key: 'showForReseller1', label: 'Show for Reseller1' },
    { key: 'showForReseller2', label: 'Show for Reseller2' },
    { key: 'showForReseller3', label: 'Show for Reseller3' },
    { key: 'showForReseller4', label: 'Show for Reseller4' },
    { key: 'showForReseller5', label: 'Show for Reseller5' },
    { key: 'showForReseller6', label: 'Show for Reseller6' },
    { key: 'showForSpecial', label: 'Show for Special' },
  ];
  return (
    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold">Visibility</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {visibilityOptions.map(({ key, label }) => (
          <label key={key} className="flex items-center space-x-2">
            <input
              type="checkbox"
              name={key}
              checked={(formData as any)[key]}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default VisibilitySection;
