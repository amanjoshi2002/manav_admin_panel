"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Analytics', href: '/dashboard/analytics', icon: '📊' },
    { name: 'Categories', href: '/dashboard/categories', icon: '📁' },
    { name: 'Sub Categories', href: '/dashboard/subcategories', icon: '📂' },
    { name: 'Products', href: '/dashboard/products', icon: '📦' },
    { name: 'Users', href: '/dashboard/users', icon: '👥' },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 dark:bg-gray-900">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white dark:bg-gray-800 shadow-md md:min-h-screen">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
          </div>
          
          <nav className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href} 
                    className={`flex items-center p-2 rounded-lg ${
                      isActive(item.href)
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
            <div className="md:hidden">
              {/* Mobile menu button - could be expanded with functionality */}
              <button className="text-gray-500 hover:text-gray-600 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <div className="ml-auto">
              <button 
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  window.location.href = "/";
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}