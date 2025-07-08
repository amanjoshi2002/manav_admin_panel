import React from 'react';
import { ProductFormData } from './types';

interface InventorySectionProps {
  formData: ProductFormData;
  handleNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InventorySection: React.FC<InventorySectionProps> = ({
  formData,
  handleNumberChange,
  handleCheckboxChange,
}) => (
  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
    <h2 className="text-xl font-semibold">Inventory</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
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
            Active (visible to users)
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="isAvailable"
            name="isAvailable"
            type="checkbox"
            checked={formData.isAvailable}
            onChange={handleCheckboxChange}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Available
          </label>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p> If unchecked, product is hidden from users but visible to admin</p>
          <p> If unchecked, product is shown but marked as unavailable</p>
        </div>
      </div>
    </div>
  </div>
);

export default InventorySection;
