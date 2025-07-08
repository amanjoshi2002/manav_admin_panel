// Types for ProductForm and related entities

export interface SubCategory {
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

export interface SubSubCategory {
  _id?: string;
  name: string;
  description?: string;
  image?: string;
  attributes: any[];
  isActive: boolean;
}

export interface Product {
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
    reseller1?: number;
    reseller2?: number;
    reseller3?: number;
    reseller4?: number;
    reseller5?: number;
    reseller6?: number;
  };
  description?: string;
  colors?: Array<{
    name: string;
    images: string[];
  }>;
  sizes?: string[];
  dynamicFields?: Record<string, any>;
  images?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sizeBasedPricing?: Array<{
    size: string;
    pricing: {
      mrp: number;
      customer: number;
      reseller: number;
      reseller1: number;
      reseller2: number;
      reseller3: number;
      reseller4: number;
      reseller5: number;
      reseller6: number;
      special: number;
    };
  }>;
}

export interface ProductFormProps {
  productId?: string;
  isEditing?: boolean;
}

export interface ProductFormData {
  name: string;
  subCategoryId: string;
  subSubCategoryId?: string;
  description: string;
  gst: number;
  pricing: {
    mrp: number;
    customer: number;
    reseller: number;
    reseller1: number;
    reseller2: number;
    reseller3: number;
    reseller4: number;
    reseller5: number;
    reseller6: number;
    special: number;
  };
  isActive: boolean;
  isAvailable: boolean;
  sizes: string[];
  colors: Array<{
    name: string;
    images: string[];
  }>;
  images: string[];
  dynamicFields?: Record<string, any>;
  colorImageFiles?: File[][];
  showForCustomer: boolean;
  showForReseller: boolean;
  showForReseller1: boolean;
  showForReseller2: boolean;
  showForReseller3: boolean;
  showForReseller4: boolean;
  showForReseller5: boolean;
  showForReseller6: boolean;
  showForSpecial: boolean;
  useIndividualResellerPricing: boolean;
  pricingMode: 'common' | 'size-based';
  sizeBasedPricing: Array<{
    size: string;
    pricing: {
      mrp: number;
      customer: number;
      reseller: number;
      reseller1: number;
      reseller2: number;
      reseller3: number;
      reseller4: number;
      reseller5: number;
      reseller6: number;
      special: number;
    };
  }>;
}

export interface ImagesSectionProps {
  formData: ProductFormData;
  imageFiles: File[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleImageFilesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number, isFile: boolean) => void;
}
