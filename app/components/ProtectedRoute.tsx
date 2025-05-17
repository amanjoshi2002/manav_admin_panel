"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getCurrentUser } from "@/config/api";

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  adminOnly = true 
}: ProtectedRouteProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const checkAuth = () => {
      if (!isAuthenticated()) {
        setAuthorized(false);
        router.push('/');
        return;
      }

      // If adminOnly is true, check if user is admin
      if (adminOnly) {
        const user = getCurrentUser();
        if (!user || user.role !== 'admin') {
          setAuthorized(false);
          router.push('/');
          return;
        }
      }

      setAuthorized(true);
    };

    checkAuth();
    setLoading(false);
  }, [router, adminOnly]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Verifying authentication...</p>
      </div>
    );
  }

  return authorized ? <>{children}</> : null;
}