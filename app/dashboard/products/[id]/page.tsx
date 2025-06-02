"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { authenticatedRequest } from "@/config/api";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  categoryId: string;
  subCategoryId: {
    _id: string;
    name: string;
  };
  subSubCategoryId: string;
  pricing: {
    mrp: number;
    customer: number;
    reseller: number;
    special: number;
  };
  description?: string;
  colors: Array<{
    name: string;
    images: string[];
  }>;
  sizes: string[];
  dynamicFields?: Record<string, any>;
  images: string[];
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await authenticatedRequest<Product>(`/products/${productId}`);
        setProduct(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  if (loading) {
    return <div className="text-center py-8">Loading product details...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
        <button 
          className="absolute top-0 right-0 px-4 py-3" 
          onClick={() => router.push("/dashboard/products")}
        >
          &times;
        </button>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-8">Product not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <div className="space-x-2">
          <Link
            href="/dashboard/products"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Back to Products
          </Link>
          <Link
            href={`/dashboard/products/${product._id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit Product
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {/* Product Images */}
          <div className="md:col-span-1">
            {product.images && product.images.length > 0 ? (
              <div className="space-y-4">
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-auto object-cover rounded-lg"
                />
                
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.slice(1).map((image, index) => (
                      <img 
                        key={index}
                        src={image} 
                        alt={`${product.name} - ${index + 2}`} 
                        className="w-full h-16 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400">No images available</span>
              </div>
            )}
          </div>
          
          {/* Product Details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Product Information</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Stock</p>
                  <p className="font-medium">{product.stock}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <p className={`font-medium ${product.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Pricing</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">MRP</p>
                  <p className="font-medium">
                    {product.pricing &&
                    !isNaN(Number(product.pricing.mrp)) &&
                    product.pricing.mrp !== null &&
                    product.pricing.mrp !== undefined
                      ? formatPrice(Number(product.pricing.mrp))
                      : "N/A"}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">customer Price</p>
                  <p className="font-medium">
                    {product.pricing &&
                    !isNaN(Number(product.pricing.customer)) &&
                    product.pricing.customer !== null &&
                    product.pricing.customer !== undefined
                      ? formatPrice(Number(product.pricing.customer))
                      : "N/A"}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Reseller Price</p>
                  <p className="font-medium">
                    {product.pricing &&
                    !isNaN(Number(product.pricing.reseller)) &&
                    product.pricing.reseller !== null &&
                    product.pricing.reseller !== undefined
                      ? formatPrice(Number(product.pricing.reseller))
                      : "N/A"}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Special Price</p>
                  <p className="font-medium">
                    {product.pricing &&
                    !isNaN(Number(product.pricing.special)) &&
                    product.pricing.special !== null &&
                    product.pricing.special !== undefined
                      ? formatPrice(Number(product.pricing.special))
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
            
            {product.description && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <p className="text-gray-700 dark:text-gray-300">{product.description}</p>
              </div>
            )}
            
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Available Sizes</h2>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {product.colors && product.colors.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Available Colors</h2>
                <div className="flex flex-wrap gap-4">
                  {product.colors.map((color, index) => (
                    <div key={index} className="text-center">
                      <div 
                        className="w-8 h-8 rounded-full mx-auto mb-1"
                        style={{ backgroundColor: color.name }}
                      ></div>
                      <span className="text-xs">{color.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {product.dynamicFields && Object.keys(product.dynamicFields).length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(product.dynamicFields).map(([key, value], index) => (
                    <div key={index}>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{key}</p>
                      <p className="font-medium">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Timestamps</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Created At</p>
                  <p className="font-medium">{new Date(product.createdAt).toLocaleString()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                  <p className="font-medium">{new Date(product.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}