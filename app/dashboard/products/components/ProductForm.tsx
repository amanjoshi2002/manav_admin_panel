"use client";

import { authenticatedRequest } from "@/config/api";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect, MutableRefObject } from "react";
import PricingSection from './PricingSection';
import InventorySection from './InventorySection';
import VariantsSection from './VariantsSection';
import ImagesSection from './ImagesSection';
import VisibilitySection from './VisibilitySection';
import BasicInfoSection from './BasicInfoSection';
import type { ProductFormData, ProductFormProps, SubCategory, SubSubCategory } from './types';
import type { Product } from './types';
import { useProductFormLogic } from './useProductFormLogic';
import { useProductFormHandlers } from './useProductFormHandlers';

export default function ProductForm({ productId, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const {
    loading, setLoading, error, setError, successMessage, setSuccessMessage,
    subCategories, setSubCategories, subSubCategories, setSubSubCategories,
    formData, setFormData, imageFiles, setImageFiles, colorImageFiles, setColorImageFiles,
    fileInputRef, colorRefs
  } = useProductFormLogic(productId, isEditing);

  const {
    handleInputChange,
    handleCheckboxChange,
    handleNumberChange,
    handleSizesChange,
    handleColorChange,
    addColor,
    removeColor,
    handleImageChange,
    addImageField,
    removeImageField,
    handleColorImageUrlChange,
    addColorImageField,
    removeColorImageField,
    handleImageFilesChange,
    removeImage,
    handleColorImageFilesChange,
    removeColorImageFile,
    removeColorImageUrl,
  } = useProductFormHandlers(
    formData,
    setFormData,
    setColorImageFiles,
    colorImageFiles,
    setImageFiles,
    setError,
    setLoading,
    router,
    productId,
    isEditing,
    setSuccessMessage,
    fileInputRef,
    colorRefs
  );

  // Add validation before submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate pricing fields
    const { mrp, customer, reseller, reseller1, reseller2, reseller3, reseller4, reseller5, reseller6, special } = formData.pricing;
    if (
      isNaN(mrp) || mrp < 0 ||
      isNaN(customer) || customer < 0 ||
      isNaN(reseller) || reseller < 0 ||
      isNaN(reseller1) || reseller1 < 0 ||
      isNaN(reseller2) || reseller2 < 0 ||
      isNaN(reseller3) || reseller3 < 0 ||
      isNaN(reseller4) || reseller4 < 0 ||
      isNaN(reseller5) || reseller5 < 0 ||
      isNaN(reseller6) || reseller6 < 0 ||
      isNaN(special) || special < 0 ||
      isNaN(formData.gst) || formData.gst < 0
    ) {
      setError("All pricing fields are required and must be zero or greater.");
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
      formPayload.append("isAvailable", String(cleanedFormData.isAvailable)); // Add this
      formPayload.append("sizes", JSON.stringify(cleanedFormData.sizes));
      // DO NOT clear color images (urls) from color objects
      formPayload.append("colors", JSON.stringify(cleanedFormData.colors));
      formPayload.append("dynamicFields", JSON.stringify(cleanedFormData.dynamicFields || {}));
      formPayload.append("showForCustomer", String(cleanedFormData.showForCustomer));
      formPayload.append("showForReseller", String(cleanedFormData.showForReseller));
      formPayload.append("showForReseller1", String(cleanedFormData.showForReseller1));
      formPayload.append("showForReseller2", String(cleanedFormData.showForReseller2));
      formPayload.append("showForReseller3", String(cleanedFormData.showForReseller3));
      formPayload.append("showForReseller4", String(cleanedFormData.showForReseller4));
      formPayload.append("showForReseller5", String(cleanedFormData.showForReseller5));
      formPayload.append("showForReseller6", String(cleanedFormData.showForReseller6));
      formPayload.append("showForSpecial", String(cleanedFormData.showForSpecial));
      formPayload.append("pricingMode", cleanedFormData.pricingMode); // Add this
      formPayload.append("sizeBasedPricing", JSON.stringify(cleanedFormData.sizeBasedPricing)); // Add this

      // Main product images
      // Always send both existing URLs and new files
      cleanedFormData.images.forEach((img) => {
        formPayload.append("images", img);
      });
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

  // Handle reseller pricing toggle
  const handleResellerPricingToggle = (useIndividual: boolean) => {
    setFormData(prev => {
      const updatedPricing = { ...prev.pricing };
      
      if (!useIndividual) {
        // If switching to unified pricing, set all reseller prices to main reseller price
        updatedPricing.reseller1 = prev.pricing.reseller;
        updatedPricing.reseller2 = prev.pricing.reseller;
        updatedPricing.reseller3 = prev.pricing.reseller;
        updatedPricing.reseller4 = prev.pricing.reseller;
        updatedPricing.reseller5 = prev.pricing.reseller;
        updatedPricing.reseller6 = prev.pricing.reseller;
      }
      
      return {
        ...prev,
        useIndividualResellerPricing: useIndividual,
        pricing: updatedPricing
      };
    });
  };

  // Handle main reseller price change (update all if unified pricing)
  const handleMainResellerPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const num = value === "" ? 0 : parseFloat(value);
    
    setFormData(prev => {
      const updatedPricing = { ...prev.pricing, reseller: num };
      
      // If using unified pricing, update all reseller prices
      if (!prev.useIndividualResellerPricing) {
        updatedPricing.reseller1 = num;
        updatedPricing.reseller2 = num;
        updatedPricing.reseller3 = num;
        updatedPricing.reseller4 = num;
        updatedPricing.reseller5 = num;
        updatedPricing.reseller6 = num;
      }
      
      return { ...prev, pricing: updatedPricing };
    });
  };

  // Handle pricing mode change
  const handlePricingModeChange = (mode: 'common' | 'size-based') => {
    setFormData(prev => {
      let newSizeBasedPricing = [...prev.sizeBasedPricing];
      
      if (mode === 'size-based' && prev.sizes.length > 0) {
        // Create size-based pricing entries for each size if switching to size-based
        newSizeBasedPricing = prev.sizes.map(size => {
          const existing = prev.sizeBasedPricing.find(sbp => sbp.size === size);
          return existing || {
            size,
            pricing: {
              mrp: prev.pricing.mrp,
              customer: prev.pricing.customer,
              reseller: prev.pricing.reseller,
              reseller1: prev.useIndividualResellerPricing ? prev.pricing.reseller1 : prev.pricing.reseller,
              reseller2: prev.useIndividualResellerPricing ? prev.pricing.reseller2 : prev.pricing.reseller,
              reseller3: prev.useIndividualResellerPricing ? prev.pricing.reseller3 : prev.pricing.reseller,
              reseller4: prev.useIndividualResellerPricing ? prev.pricing.reseller4 : prev.pricing.reseller,
              reseller5: prev.useIndividualResellerPricing ? prev.pricing.reseller5 : prev.pricing.reseller,
              reseller6: prev.useIndividualResellerPricing ? prev.pricing.reseller6 : prev.pricing.reseller,
              special: prev.pricing.special
            }
          };
        });
      }
      
      return {
        ...prev,
        pricingMode: mode,
        sizeBasedPricing: newSizeBasedPricing
      };
    });
  };

  // Handle size-based pricing changes
  const handleSizeBasedPricingChange = (sizeIndex: number, field: string, value: number) => {
    setFormData(prev => {
      const updatedSizeBasedPricing = [...prev.sizeBasedPricing];
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        updatedSizeBasedPricing[sizeIndex] = {
          ...updatedSizeBasedPricing[sizeIndex],
          [parent]: {
            ...((updatedSizeBasedPricing[sizeIndex] as any)[parent] || {}),
            [child]: value
          }
        };
      } else {
        updatedSizeBasedPricing[sizeIndex] = {
          ...updatedSizeBasedPricing[sizeIndex],
          [field]: value
        };
      }
      return {
        ...prev,
        sizeBasedPricing: updatedSizeBasedPricing
      };
    });
  };

  // Handle size-based reseller price change (update all reseller types if unified pricing)
  const handleSizeBasedResellerPriceChange = (sizeIndex: number, value: number) => {
    setFormData(prev => {
      const updatedSizeBasedPricing = [...prev.sizeBasedPricing];
      const updatedPricing = { ...updatedSizeBasedPricing[sizeIndex].pricing, reseller: value };
      
      // If using unified pricing, update all reseller prices for this size
      if (!prev.useIndividualResellerPricing) {
        updatedPricing.reseller1 = value;
        updatedPricing.reseller2 = value;
        updatedPricing.reseller3 = value;
        updatedPricing.reseller4 = value;
        updatedPricing.reseller5 = value;
        updatedPricing.reseller6 = value;
      }
      
      updatedSizeBasedPricing[sizeIndex] = {
        ...updatedSizeBasedPricing[sizeIndex],
        pricing: updatedPricing
      };
      
      return { ...prev, sizeBasedPricing: updatedSizeBasedPricing };
    });
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
        {/* Basic Information Section */}
        <BasicInfoSection
          formData={formData}
          subCategories={subCategories}
          subSubCategories={subSubCategories}
          handleInputChange={handleInputChange}
        />
        {/* Pricing Section */}
        <PricingSection
          formData={formData}
          handleInputChange={handleInputChange}
          handleNumberChange={handleNumberChange}
          handleResellerPricingToggle={handleResellerPricingToggle}
          handleMainResellerPriceChange={handleMainResellerPriceChange}
          handlePricingModeChange={handlePricingModeChange}
          handleSizeBasedPricingChange={handleSizeBasedPricingChange}
          handleSizeBasedResellerPriceChange={handleSizeBasedResellerPriceChange}
        />
        {/* Inventory Section */}
        <InventorySection
          formData={formData}
          handleNumberChange={handleNumberChange}
          handleCheckboxChange={handleCheckboxChange}
        />
        {/* Variants Section */}
        <VariantsSection
          formData={formData}
          handleSizesChange={handleSizesChange}
          addColor={addColor}
          removeColor={removeColor}
          handleColorChange={handleColorChange}
          colorRefs={colorRefs}
          addColorImageField={addColorImageField}
          removeColorImageField={removeColorImageField}
          handleColorImageUrlChange={handleColorImageUrlChange}
          handleColorImageFilesChange={handleColorImageFilesChange}
          removeColorImageFile={removeColorImageFile}
        />
        {/* Images Section */}
        <ImagesSection
          formData={formData}
          imageFiles={imageFiles}
          fileInputRef={fileInputRef}
          handleImageFilesChange={handleImageFilesChange}
          removeImage={removeImage}
        />
        {/* Visibility Section */}
        <VisibilitySection
          formData={formData}
          handleCheckboxChange={handleCheckboxChange}
        />
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