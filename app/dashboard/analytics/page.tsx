"use client";

import { useState, useEffect } from "react";
import { authenticatedRequest } from "@/config/api";

interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface SubCategory {
  _id: string;
  name: string;
  category: string;
  subCategories: SubSubCategory[];
  isActive: boolean;
}

interface SubSubCategory {
  _id: string;
  name: string;
  isActive: boolean;
}

interface Product {
  _id: string;
  name: string;
  categoryId: string;
  subCategoryId: string;
  subSubCategoryId?: string;
  category?: any;
  subCategory?: any;
  subSubCategory?: any;
  isActive: boolean;
  stock: number;
}

interface TreeNode {
  id: string;
  name: string;
  type: 'category' | 'subcategory' | 'subsubcategory' | 'product';
  children?: TreeNode[];
  count?: number;
  isActive: boolean;
}

export default function AnalyticsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [treeData, setTreeData] = useState<TreeNode[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      console.log("Fetching analytics data...");
      
      // Try different endpoints with better error handling
      const [categoriesRes, subCategoriesRes, productsRes] = await Promise.all([
        authenticatedRequest<any>("/categories")
          .then(res => {
            console.log("Categories API response:", res);
            if (res?.data) return { data: res.data };
            if (Array.isArray(res)) return { data: res };
            if (res?.success && res?.categories) return { data: res.categories };
            return { data: [] };
          })
          .catch(e => {
            console.error("Categories fetch error:", e);
            return { data: [] };
          }),
        
        authenticatedRequest<{ success: boolean; data: SubCategory[] }>("/subcategories")
          .then(res => {
            console.log("SubCategories API response:", res);
            return res;
          })
          .catch(e => {
            console.error("SubCategories fetch error:", e);
            return { data: [] };
          }),
        
        // Try the regular products endpoint first, then fallback
        authenticatedRequest<any>("/products")
          .then(res => {
            console.log("Products API response from /products:", res);
            if (res?.data) return res.data;
            if (Array.isArray(res)) return res;
            return [];
          })
          .catch(e => {
            console.error("Products fetch error from /products, trying analytics endpoint:", e);
            return authenticatedRequest<any>("/products/all/analytics")
              .then(res => {
                console.log("Products API response from /products/all/analytics:", res);
                if (res?.data) return res.data;
                if (Array.isArray(res)) return res;
                return [];
              })
              .catch(err => {
                console.error("Products analytics fetch error:", err);
                return [];
              });
          })
      ]);

      console.log("Raw fetched data:", {
        categoriesRes,
        subCategoriesRes,
        productsRes
      });

      const cats = categoriesRes?.data || [];
      const subCats = subCategoriesRes?.data || [];
      const prods = Array.isArray(productsRes) ? productsRes : [];

      console.log("Processed data:", {
        categories: cats.length,
        subCategories: subCats.length,
        products: prods.length
      });

      // Log sample data for debugging
      if (cats.length > 0) console.log("Sample category:", cats[0]);
      if (subCats.length > 0) console.log("Sample subcategory:", subCats[0]);
      if (prods.length > 0) console.log("Sample product:", prods[0]);

      setCategories(cats);
      setSubCategories(subCats);
      setProducts(prods);
      
      // Build tree structure
      buildTreeStructure(cats, subCats, prods);
    } catch (err: any) {
      console.error("Analytics fetch error:", err);
      setError(`Failed to fetch data: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const buildTreeStructure = (cats: Category[], subCats: SubCategory[], prods: Product[]) => {
    console.log("Building tree structure with:", {
      categories: cats.length,
      subCategories: subCats.length,
      products: prods.length
    });

    // If no categories, try to create them from subcategories
    if (cats.length === 0 && subCats.length > 0) {
      console.log("No categories found, trying to extract from subcategories...");
      
      // Get unique category IDs from subcategories
      const uniqueCategoryIds = [...new Set(subCats.map(sc => sc.category).filter(Boolean))];
      console.log("Found category IDs in subcategories:", uniqueCategoryIds);
      
      // Create placeholder categories
      const placeholderCategories = uniqueCategoryIds.map(categoryId => ({
        _id: categoryId as string,
        name: `Category ${categoryId}`,
        isActive: true
      }));
      
      console.log("Created placeholder categories:", placeholderCategories);
      
      // Use placeholder categories
      buildTreeWithCategories(placeholderCategories, subCats, prods);
      return;
    }

    buildTreeWithCategories(cats, subCats, prods);
  };

  const buildTreeWithCategories = (cats: any[], subCats: SubCategory[], prods: Product[]) => {
    const tree: TreeNode[] = cats.map(category => {
      console.log(`Processing category: ${category.name} (${category._id})`);
      
      // Find subcategories for this category - try multiple field names
      const categorySubCats = subCats.filter(sc => {
        const matches = sc.category === category._id || 
                       (sc as any).categoryId === category._id ||
                       sc.category === category.name ||
                       (sc as any).category?._id === category._id;
        if (matches) {
          console.log(`SubCategory ${sc.name} matches category ${category.name}`);
        }
        return matches;
      });
      
      console.log(`Found ${categorySubCats.length} subcategories for category ${category.name}`);
      
      const children = categorySubCats.map(subCat => {
        const subSubCats = subCat.subCategories || [];
        console.log(`SubCategory ${subCat.name} has ${subSubCats.length} sub-subcategories`);
        
        const subSubChildren = subSubCats.map(subSubCat => {
          const subSubProducts = prods.filter(p => {
            // Handle populated objects and string IDs for category matching
            const categoryMatch = p.categoryId === category._id || 
                                 p.category?._id === category._id ||
                                 p.category === category._id ||
                                 (typeof p.category === 'string' && p.category === category._id);
            
            // Handle populated subCategoryId objects
            const subCategoryMatch = p.subCategoryId === subCat._id ||
                                   (typeof p.subCategoryId === 'object' && p.subCategoryId !== null && '_id' in p.subCategoryId && (p.subCategoryId as { _id: string })._id === subCat._id) ||
                                   p.subCategory?._id === subCat._id ||
                                   p.subCategory === subCat._id ||
                                   (typeof p.subCategory === 'string' && p.subCategory === subCat._id);
            
            // Handle populated subSubCategoryId
            const subSubCategoryMatch = p.subSubCategoryId === subSubCat._id ||
                                       (typeof p.subSubCategoryId === 'object' && (p.subSubCategoryId as { _id: string })._id === subSubCat._id) ||
                                       p.subSubCategory?._id === subSubCat._id ||
                                       p.subSubCategory === subSubCat._id ||
                                       (typeof p.subSubCategory === 'string' && p.subSubCategory === subSubCat._id);
            
            const matches = categoryMatch && subCategoryMatch && subSubCategoryMatch;
            if (matches) {
              console.log(`Product ${p.name} matches category ${category.name} -> ${subCat.name} -> ${subSubCat.name}`);
            }
            return matches;
          });
          
          const productChildren = subSubProducts.map(product => ({
            id: product._id,
            name: product.name,
            type: 'product' as const,
            isActive: product.isActive,
            count: product.stock
          }));

          return {
            id: subSubCat._id || `subsub-${Math.random()}`,
            name: subSubCat.name,
            type: 'subsubcategory' as const,
            children: productChildren,
            count: productChildren.length,
            isActive: subSubCat.isActive
          };
        });

        // Get products directly under subcategory (without sub-subcategory)
        const directProducts = prods.filter(p => {
          const categoryMatch = p.categoryId === category._id || 
                               p.category?._id === category._id ||
                               p.category === category._id ||
                               (typeof p.category === 'string' && p.category === category._id);
          
          // Handle populated subCategoryId objects
          const subCategoryMatch = p.subCategoryId === subCat._id ||
                                 (typeof p.subCategoryId === 'object' && p.subCategoryId !== null && (p.subCategoryId as { _id: string })._id === subCat._id) ||
                                 p.subCategory?._id === subCat._id ||
                                 p.subCategory === subCat._id ||
                                 (typeof p.subCategory === 'string' && p.subCategory === subCat._id);
          
          // Check if product has no sub-subcategory or it's empty/null
          const noSubSubCategory = !p.subSubCategoryId || 
                                  p.subSubCategoryId === "" ||
                                  p.subSubCategoryId === null ||
                                  p.subSubCategoryId === undefined;
          
          const matches = categoryMatch && subCategoryMatch && noSubSubCategory;
          if (matches) {
            console.log(`Direct product ${p.name} matches category ${category.name} -> ${subCat.name}`);
          }
          return matches;
        });

        const directProductNodes = directProducts.map(product => ({
          id: product._id,
          name: product.name,
          type: 'product' as const,
          isActive: product.isActive,
          count: product.stock
        }));

        const allChildren = [...subSubChildren, ...directProductNodes];
        const totalProducts = subSubChildren.reduce((sum, ssc) => sum + (ssc.children?.length || 0), 0) + directProducts.length;

        console.log(`SubCategory ${subCat.name} has ${totalProducts} total products (${directProducts.length} direct + ${subSubChildren.reduce((sum, ssc) => sum + (ssc.children?.length || 0), 0)} in sub-subcategories)`);

        return {
          id: subCat._id,
          name: subCat.name,
          type: 'subcategory' as const,
          children: allChildren,
          count: totalProducts,
          isActive: subCat.isActive
        };
      });

      // Get all products for this category with flexible field matching
      const categoryProducts = prods.filter(p => {
        const matches = p.categoryId === category._id || 
                       p.category?._id === category._id ||
                       p.category === category._id ||
                       (typeof p.category === 'string' && p.category === category._id);
        if (matches) {
          console.log(`Product ${p.name} belongs to category ${category.name}`);
          console.log('Product details:', {
            categoryId: p.categoryId,
            subCategoryId: typeof p.subCategoryId === 'object' && p.subCategoryId !== null && '_id' in p.subCategoryId
              ? (p.subCategoryId as { _id: string })._id
              : p.subCategoryId,
            subCategoryName: typeof p.subCategoryId === 'object' && p.subCategoryId !== null && 'name' in p.subCategoryId
              ? (p.subCategoryId as { name: string }).name
              : 'N/A',
            subSubCategoryId: p.subSubCategoryId,
            category: p.category,
            subCategory: p.subCategory,
            subSubCategory: p.subSubCategory
          });
        }
        return matches;
      });
      console.log(`Category ${category.name} has ${categoryProducts.length} total products`);

      return {
        id: category._id,
        name: category.name,
        type: 'category' as const,
        children,
        count: categoryProducts.length,
        isActive: category.isActive
      };
    });

    console.log("Built tree structure:", tree);
    setTreeData(tree);
  };

  const getStats = () => {
    const safeCategories = categories || [];
    const safeSubCategories = subCategories || [];
    const safeProducts = products || [];

    const activeCategories = safeCategories.filter(c => c.isActive).length;
    const activeSubCategories = safeSubCategories.filter(sc => sc.isActive).length;
    const activeProducts = safeProducts.filter(p => p.isActive).length;
    const totalStock = safeProducts.reduce((sum, p) => sum + (p.stock || 0), 0);

    return {
      totalCategories: safeCategories.length,
      activeCategories,
      totalSubCategories: safeSubCategories.length,
      activeSubCategories,
      totalProducts: safeProducts.length,
      activeProducts,
      totalStock,
      outOfStock: safeProducts.filter(p => (p.stock || 0) === 0).length
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
        <button 
          onClick={fetchAllData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Product Hierarchy Analytics</h1>
        <button 
          onClick={fetchAllData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Data
        </button>
      </div>

      {/* Debug Info */}
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <h3 className="font-semibold text-yellow-800">Debug Info:</h3>
        <p className="text-sm text-yellow-700">
          Categories: {categories.length} | SubCategories: {subCategories.length} | Products: {products.length} | Tree Nodes: {treeData.length}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Categories",
            value: stats.totalCategories,
            active: stats.activeCategories,
            color: "bg-blue-500",
            icon: "📁"
          },
          {
            title: "Sub Categories",
            value: stats.totalSubCategories,
            active: stats.activeSubCategories,
            color: "bg-green-500",
            icon: "📂"
          },
          {
            title: "Products",
            value: stats.totalProducts,
            active: stats.activeProducts,
            color: "bg-purple-500",
            icon: "📦"
          },
          {
            title: "Total Stock",
            value: stats.totalStock,
            active: stats.totalStock - stats.outOfStock,
            color: "bg-orange-500",
            icon: "📊"
          }
        ].map((card, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-sm text-green-600">
                  {card.active} active
                </p>
              </div>
              <div className={`p-3 rounded-full ${card.color} text-white text-2xl`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Category Distribution</h2>
        
        <div className="space-y-4">
          {(categories || []).map((category, index) => {
            const categorySubCats = (subCategories || []).filter(sc => sc.category === category._id);
            const categoryProducts = (products || []).filter(p => p.categoryId === category._id);
            const activeProducts = categoryProducts.filter(p => p.isActive);
            const totalStock = categoryProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
            const maxProducts = Math.max(...(categories || []).map(c => 
              (products || []).filter(p => p.categoryId === c._id).length
            ), 1);

            return (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{category.name}</h3>
                  <div className="flex space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{categorySubCats.length} subcategories</span>
                    <span>{categoryProducts.length} products</span>
                    <span>{totalStock} total stock</span>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(categoryProducts.length / maxProducts) * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{activeProducts.length} active products</span>
                  <span>{categoryProducts.length - activeProducts.length} inactive</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tree Structure */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Product Hierarchy Tree</h2>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
          <div className="flex items-center space-x-2">
            <span>🏢</span>
            <span className="text-sm">Category</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>📂</span>
            <span className="text-sm">Sub Category</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>📄</span>
            <span className="text-sm">Sub-Sub Category</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>📦</span>
            <span className="text-sm">Product</span>
          </div>
        </div>

        {/* Tree */}
        <div className="max-h-[600px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          {treeData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hierarchy data available</p>
              {categories.length === 0 && <p className="text-sm">No categories found</p>}
              {categories.length > 0 && subCategories.length === 0 && <p className="text-sm">No subcategories found</p>}
              {categories.length > 0 && subCategories.length > 0 && products.length === 0 && <p className="text-sm">No products found</p>}
            </div>
          ) : (
            <TreeView nodes={treeData} />
          )}
        </div>
      </div>
    </div>
  );
}

// Tree View Component
function TreeView({ nodes }: { nodes: TreeNode[] }) {
  return (
    <div className="space-y-2">
      {nodes.map((node) => (
        <TreeNodeComponent key={node.id} node={node} level={0} />
      ))}
    </div>
  );
}

function TreeNodeComponent({ node, level }: { node: TreeNode; level: number }) {
  const [isExpanded, setIsExpanded] = useState(level < 2);

  const getNodeStyles = () => {
    const baseStyles = "p-3 rounded-lg border-l-4 mb-2";
    const activeStyles = node.isActive ? "opacity-100" : "opacity-60";
    
    switch (node.type) {
      case 'category':
        return `${baseStyles} ${activeStyles} bg-blue-50 dark:bg-blue-900/20 border-blue-500`;
      case 'subcategory':
        return `${baseStyles} ${activeStyles} bg-green-50 dark:bg-green-900/20 border-green-500`;
      case 'subsubcategory':
        return `${baseStyles} ${activeStyles} bg-purple-50 dark:bg-purple-900/20 border-purple-500`;
      case 'product':
        return `${baseStyles} ${activeStyles} bg-orange-50 dark:bg-orange-900/20 border-orange-500`;
      default:
        return `${baseStyles} ${activeStyles} bg-gray-50 dark:bg-gray-900/20 border-gray-500`;
    }
  };

  const getIcon = () => {
    switch (node.type) {
      case 'category': return '🏢';
      case 'subcategory': return '📂';
      case 'subsubcategory': return '📄';
      case 'product': return '📦';
      default: return '📝';
    }
  };

  const hasChildren = node.children && node.children.length > 0;

  return (
    <div style={{ marginLeft: `${level * 20}px` }}>
      <div className={getNodeStyles()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {hasChildren && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            <span className="text-lg">{getIcon()}</span>
            <span className="font-medium">{node.name}</span>
            {!node.isActive && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                Inactive
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {node.type === 'product' && node.count !== undefined && (
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Stock: {node.count}
              </span>
            )}
            {node.count !== undefined && node.type !== 'product' && (
              <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                {node.count} items
              </span>
            )}
          </div>
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="ml-4">
          {node.children!.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
