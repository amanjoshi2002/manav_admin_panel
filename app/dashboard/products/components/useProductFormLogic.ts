import { useState, useEffect, useRef } from 'react';
import { authenticatedRequest } from '@/config/api';
import type { ProductFormData, SubCategory, SubSubCategory, Product, ProductFormProps } from './types';

export function useProductFormLogic(productId?: string, isEditing: boolean = false) {
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
      mrp: 0, customer: 0, reseller: 0, reseller1: 0, reseller2: 0, reseller3: 0, reseller4: 0, reseller5: 0, reseller6: 0, special: 0
    },
    isActive: true,
    isAvailable: true,
    sizes: [],
    colors: [{ name: "", images: [] }],
    images: [],
    showForCustomer: true,
    showForReseller: true,
    showForReseller1: true,
    showForReseller2: true,
    showForReseller3: true,
    showForReseller4: true,
    showForReseller5: true,
    showForReseller6: true,
    showForSpecial: true,
    useIndividualResellerPricing: false,
    pricingMode: 'common',
    sizeBasedPricing: []
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [colorImageFiles, setColorImageFiles] = useState<File[][]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const fetchSubCategories = async () => {
      setLoading(true);
      try {
        const response = await authenticatedRequest<{ success: boolean; data: SubCategory[] }>(`/subcategories`);
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

  useEffect(() => {
    const fetchSubSubCategories = async () => {
      if (!formData.subCategoryId) {
        setSubSubCategories([]);
        return;
      }
      try {
        const selectedSubcategory = subCategories.find(subcat => subcat._id === formData.subCategoryId);
        if (selectedSubcategory) {
          setSubSubCategories(selectedSubcategory.subCategories);
        } else {
          setSubSubCategories([]);
        }
      } catch (err: any) {
        setSubSubCategories([]);
      }
    };
    fetchSubSubCategories();
  }, [formData.subCategoryId, subCategories]);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId || !isEditing) return;
      setLoading(true);
      try {
        const product = await authenticatedRequest<Product>(`/products/${productId}`);
        const hasSizeBasedPricing = product.sizeBasedPricing && product.sizeBasedPricing.length > 0;
        setFormData({
          name: product.name,
          subCategoryId: typeof product.subCategoryId === 'object' && product.subCategoryId !== null ? product.subCategoryId._id : product.subCategoryId as string,
          subSubCategoryId: product.subSubCategoryId,
          description: product.description || "",
          gst: product.gst || 0,
          pricing: {
            mrp: product.pricing?.mrp || 0,
            customer: product.pricing?.customer || 0,
            reseller: product.pricing?.reseller || 0,
            reseller1: (product.pricing as any)?.reseller1 || 0,
            reseller2: (product.pricing as any)?.reseller2 || 0,
            reseller3: (product.pricing as any)?.reseller3 || 0,
            reseller4: (product.pricing as any)?.reseller4 || 0,
            reseller5: (product.pricing as any)?.reseller5 || 0,
            reseller6: (product.pricing as any)?.reseller6 || 0,
            special: product.pricing?.special || 0
          },
          isActive: product.isActive,
          isAvailable: (product as any).isAvailable ?? true,
          sizes: product.sizes || [],
          colors: product.colors || [{ name: "", images: [] }],
          images: product.images || [],
          showForCustomer: (product as any).showForCustomer ?? true,
          showForReseller: (product as any).showForReseller ?? true,
          showForReseller1: (product as any).showForReseller1 ?? true,
          showForReseller2: (product as any).showForReseller2 ?? true,
          showForReseller3: (product as any).showForReseller3 ?? true,
          showForReseller4: (product as any).showForReseller4 ?? true,
          showForReseller5: (product as any).showForReseller5 ?? true,
          showForReseller6: (product as any).showForReseller6 ?? true,
          showForSpecial: (product as any).showForSpecial ?? true,
          useIndividualResellerPricing: (product.pricing as any)?.reseller1 !== (product.pricing as any)?.reseller ||
            (product.pricing as any)?.reseller2 !== (product.pricing as any)?.reseller ||
            (product.pricing as any)?.reseller3 !== (product.pricing as any)?.reseller ||
            (product.pricing as any)?.reseller4 !== (product.pricing as any)?.reseller ||
            (product.pricing as any)?.reseller5 !== (product.pricing as any)?.reseller ||
            (product.pricing as any)?.reseller6 !== (product.pricing as any)?.reseller,
          pricingMode: hasSizeBasedPricing ? 'size-based' : 'common',
          sizeBasedPricing: (product as any).sizeBasedPricing || []
        });
        setColorImageFiles(Array((product.colors && product.colors.length) || 1).fill(null).map(() => []));
      } catch (err: any) {
        setError(err.message || "Failed to fetch product data");
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [productId, isEditing]);

  return {
    loading, setLoading, error, setError, successMessage, setSuccessMessage,
    subCategories, setSubCategories, subSubCategories, setSubSubCategories,
    formData, setFormData, imageFiles, setImageFiles, colorImageFiles, setColorImageFiles,
    fileInputRef, colorRefs
  };
}
