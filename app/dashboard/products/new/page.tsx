"use client";

import ProductForm from "../components/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create New Product</h1>
      <ProductForm />
    </div>
  );
}