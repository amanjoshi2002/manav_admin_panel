import { useCallback } from 'react';
import type { ProductFormData } from './types';

export function useProductFormHandlers(
  formData: ProductFormData,
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>,
  setColorImageFiles: React.Dispatch<React.SetStateAction<File[][]>>,
  colorImageFiles: File[][],
  setImageFiles: React.Dispatch<React.SetStateAction<File[]>>,
  setError: (msg: string) => void,
  setLoading: (b: boolean) => void,
  router: any,
  productId: string | undefined,
  isEditing: boolean,
  setSuccessMessage: (msg: string) => void,
  fileInputRef: React.RefObject<HTMLInputElement | null>,
  colorRefs: React.MutableRefObject<Array<HTMLDivElement | null>>
) {
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, [setFormData]);

  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  }, [setFormData]);

  const handleNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const num = value === "" ? 0 : parseFloat(value);
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: num
        }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: num }));
    }
  }, [setFormData]);

  const handleSizesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sizesArray = e.target.value.split(',').map(size => size.trim()).filter(size => size !== '');
    setFormData(prev => {
      let newSizeBasedPricing = [...prev.sizeBasedPricing];
      if (prev.pricingMode === 'size-based') {
        newSizeBasedPricing = sizesArray.map(size => {
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
        sizes: sizesArray,
        sizeBasedPricing: newSizeBasedPricing
      };
    });
  }, [setFormData]);

  const handleColorChange = useCallback((index: number, field: string, value: string) => {
    const updatedColors = [...formData.colors];
    updatedColors[index] = {
      ...updatedColors[index],
      [field]: value
    };
    setFormData({ ...formData, colors: updatedColors });
  }, [formData, setFormData]);

  const addColor = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, { name: "", images: [] }]
    }));
    setColorImageFiles(prev => [...prev, []]);
    setTimeout(() => {
      const idx = formData.colors.length;
      if (colorRefs.current[idx]) {
        colorRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  }, [formData.colors.length, setFormData, setColorImageFiles, colorRefs]);

  const removeColor = useCallback((index: number) => {
    const updatedColors = [...formData.colors];
    updatedColors.splice(index, 1);
    setFormData({
      ...formData,
      colors: updatedColors.length ? updatedColors : [{ name: "", images: [] }]
    });
    const updatedColorFiles = [...colorImageFiles];
    updatedColorFiles.splice(index, 1);
    setColorImageFiles(updatedColorFiles);
  }, [formData, setFormData, colorImageFiles, setColorImageFiles]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newImages = [...formData.images];
    newImages[index] = e.target.value;
    setFormData({
      ...formData,
      images: newImages
    });
  }, [formData, setFormData]);

  const addImageField = useCallback(() => {
    setFormData({
      ...formData,
      images: [...formData.images, ""]
    });
  }, [formData, setFormData]);

  const removeImageField = useCallback((index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({
      ...formData,
      images: newImages
    });
  }, [formData, setFormData]);

  const handleColorImageUrlChange = useCallback((colorIndex: number, imageIndex: number, value: string) => {
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
  }, [formData, setFormData]);

  const addColorImageField = useCallback((colorIndex: number) => {
    const updatedColors = [...formData.colors];
    updatedColors[colorIndex] = {
      ...updatedColors[colorIndex],
      images: [...updatedColors[colorIndex].images, ""]
    };
    setFormData({
      ...formData,
      colors: updatedColors
    });
  }, [formData, setFormData]);

  const removeColorImageField = useCallback((colorIndex: number, imageIndex: number) => {
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
  }, [formData, setFormData]);

  const handleImageFilesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...filesArr]);
    }
  }, [setImageFiles]);

  const removeImage = useCallback((index: number, isFile: boolean) => {
    if (isFile) {
      setImageFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setFormData({
        ...formData,
        images: formData.images.filter((_, i) => i !== index)
      });
    }
  }, [formData, setFormData, setImageFiles]);

  const handleColorImageFilesChange = useCallback((colorIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setColorImageFiles(prev => {
        const updated = [...prev];
        updated[colorIdx] = (prev[colorIdx] || []).concat(filesArr);
        return updated;
      });
    }
  }, [setColorImageFiles]);

  const removeColorImageFile = useCallback((colorIdx: number, fileIdx: number) => {
    setColorImageFiles(prev => {
      const updated = [...prev];
      updated[colorIdx] = updated[colorIdx].filter((_, i) => i !== fileIdx);
      return updated;
    });
  }, [setColorImageFiles]);

  const removeColorImageUrl = useCallback((colorIndex: number, imageIndex: number) => {
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
  }, [formData, setFormData]);

  const handleMainResellerPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [setFormData]);

  return {
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
    handleMainResellerPriceChange,
    // ...other handlers
  };
}
