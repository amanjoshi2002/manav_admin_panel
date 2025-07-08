import React from 'react';
import { ProductFormData } from './types';

interface PricingSectionProps {
  formData: ProductFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleResellerPricingToggle: (useIndividual: boolean) => void;
  handleMainResellerPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePricingModeChange: (mode: 'common' | 'size-based') => void;
  handleSizeBasedPricingChange: (sizeIndex: number, field: string, value: number) => void;
  handleSizeBasedResellerPriceChange: (sizeIndex: number, value: number) => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({
  formData,
  handleInputChange,
  handleNumberChange,
  handleResellerPricingToggle,
  handleMainResellerPriceChange,
  handlePricingModeChange,
  handleSizeBasedPricingChange,
  handleSizeBasedResellerPriceChange,
}) => (
  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
    <h2 className="text-xl font-semibold">Pricing</h2>
    {/* Pricing Mode Selection */}
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Pricing Mode
      </label>
      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="pricingMode"
            checked={formData.pricingMode === 'common'}
            onChange={() => handlePricingModeChange('common')}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Common pricing for all sizes
          </span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="pricingMode"
            checked={formData.pricingMode === 'size-based'}
            onChange={() => handlePricingModeChange('size-based')}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Dynamic pricing based on sizes
          </span>
        </label>
      </div>
      {formData.pricingMode === 'size-based' && formData.sizes.length === 0 && (
        <p className="mt-2 text-xs text-yellow-600">
          Please add sizes first to enable size-based pricing
        </p>
      )}
    </div>
    {/* Reseller Pricing Mode Toggle - always visible */}
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Reseller Pricing Mode
      </label>
      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="resellerPricingMode"
            checked={!formData.useIndividualResellerPricing}
            onChange={() => handleResellerPricingToggle(false)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Same price for all resellers (Reseller1-6 will use main Reseller price)
          </span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="resellerPricingMode"
            checked={formData.useIndividualResellerPricing}
            onChange={() => handleResellerPricingToggle(true)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Individual prices for each reseller type
          </span>
        </label>
      </div>
    </div>
    {/* Common Pricing Section */}
    {formData.pricingMode === 'common' && (
      <>
        {/* Common Pricing Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              MRP *
            </label>
            <input
              type="number"
              name="pricing.mrp"
              value={formData.pricing.mrp}
              onChange={handleNumberChange}
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Customer Price *
            </label>
            <input
              type="number"
              name="pricing.customer"
              value={formData.pricing.customer}
              onChange={handleNumberChange}
              min="0"
              required
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
              value={formData.pricing.reseller}
              onChange={handleMainResellerPriceChange}
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
            />
          </div>
          {formData.useIndividualResellerPricing && [1,2,3,4,5,6].map((num) => (
            <div key={num}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reseller{num} Price *
              </label>
              <input
                type="number"
                name={`pricing.reseller${num}`}
                value={(formData.pricing as any)[`reseller${num}`]}
                onChange={handleNumberChange}
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Special Price *
            </label>
            <input
              type="number"
              name="pricing.special"
              value={formData.pricing.special}
              onChange={handleNumberChange}
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
            />
          </div>
        </div>
      </>
    )}
    {/* Size-Based Pricing Section */}
    {formData.pricingMode === 'size-based' && formData.sizes.length > 0 && (
      <div className="space-y-4">
        {formData.sizeBasedPricing.map((sizePrice, index) => (
          <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="font-semibold mb-2">Size: {sizePrice.size}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  MRP *
                </label>
                <input
                  type="number"
                  value={sizePrice.pricing.mrp}
                  onChange={e => handleSizeBasedPricingChange(index, 'pricing.mrp', parseFloat(e.target.value))}
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Customer Price *
                </label>
                <input
                  type="number"
                  value={sizePrice.pricing.customer}
                  onChange={e => handleSizeBasedPricingChange(index, 'pricing.customer', parseFloat(e.target.value))}
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reseller Price *
                </label>
                <input
                  type="number"
                  value={sizePrice.pricing.reseller}
                  onChange={e => handleSizeBasedResellerPriceChange(index, parseFloat(e.target.value))}
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                />
              </div>
              {formData.useIndividualResellerPricing && [1,2,3,4,5,6].map((num) => (
                <div key={num}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reseller{num} Price *
                  </label>
                  <input
                    type="number"
                    value={(sizePrice.pricing as any)[`reseller${num}`]}
                    onChange={e => handleSizeBasedPricingChange(index, `pricing.reseller${num}`, parseFloat(e.target.value))}
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Special Price *
                </label>
                <input
                  type="number"
                  value={sizePrice.pricing.special}
                  onChange={e => handleSizeBasedPricingChange(index, 'pricing.special', parseFloat(e.target.value))}
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default PricingSection;
