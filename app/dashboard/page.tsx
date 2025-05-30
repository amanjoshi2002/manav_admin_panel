"use client";

import { useState, useEffect } from "react";
import { getCurrentUser } from "@/config/api";
import Link from "next/link";

interface User {
  email: string;
  name?: string;
  role: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getCurrentUser() as User);
  }, []);

  if (!user) {
    return <div>Loading user information...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Welcome, {user.name || user.email}</h2>
        <p className="text-gray-600 dark:text-gray-300">
          You are logged in as an <span className="font-semibold">{user.role}</span> user.
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Admin Dashboard</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          This is your admin control panel. From here you can manage users and system settings.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <Link href="/dashboard/users" className="block">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors">
              <h4 className="font-bold">User Management</h4>
              <p className="text-sm mt-2">Manage user accounts, roles and permissions</p>
            </div>
          </Link>
          
          <Link href="/dashboard/subcategories" className="block">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-800/30 transition-colors">
              <h4 className="font-bold">Subcategory Management</h4>
              <p className="text-sm mt-2">Manage subcategories and their attributes</p>
            </div>
          </Link>
          
          <Link href="/dashboard/products" className="block">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-100 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-800/30 transition-colors">
              <h4 className="font-bold">Product Management</h4>
              <p className="text-sm mt-2">Manage products, pricing, and inventory</p>
            </div>
          </Link>

          {/* PDF Management Section */}
          <Link href="/dashboard/pdfs" className="block">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-800/30 transition-colors">
              <h4 className="font-bold">PDF Management</h4>
              <p className="text-sm mt-2">Add, update, and delete PDFs</p>
            </div>
          </Link>

          {/* Video Management Section */}
          <Link href="/dashboard/videos" className="block">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-800/30 transition-colors">
              <h4 className="font-bold">Video Management</h4>
              <p className="text-sm mt-2">Add, update, and delete videos</p>
            </div>
          </Link>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
            <h4 className="font-bold">System Settings</h4>
            <p className="text-sm mt-2">Configure system settings and preferences</p>
          </div>
        </div>
      </div>
    </div>
  );
}