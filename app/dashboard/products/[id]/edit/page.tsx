"use client";

import { useParams } from "next/navigation";
import ProductForm from "../../components/ProductForm";

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Product</h1>
      <ProductForm productId={productId} isEditing={true} />
    </div>
  );
}