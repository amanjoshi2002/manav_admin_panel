"use client";

import ProtectedRoute from "../components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <header className="bg-foreground text-background p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
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
        <main className="flex-grow container mx-auto p-4">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}