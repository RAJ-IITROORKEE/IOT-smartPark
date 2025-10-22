"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const adminToken = localStorage.getItem("admin_token");
      const tokenExpiry = localStorage.getItem("admin_token_expiry");
      
      if (adminToken && tokenExpiry) {
        const now = new Date().getTime();
        const expiry = parseInt(tokenExpiry);
        
        if (now < expiry) {
          setIsAuthenticated(true);
          return;
        }
      }
      
      // Clear invalid tokens
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_token_expiry");
      setIsAuthenticated(false);
      
      // Redirect to login if not on login page
      if (pathname !== "/admin") {
        router.push("/admin");
      }
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_token_expiry");
    setIsAuthenticated(false);
    router.push("/admin");
  };

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 text-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  // Show login page if not authenticated and on admin root
  if (!isAuthenticated && pathname === "/admin") {
    return (
      <div className="min-h-screen bg-slate-950 text-gray-100">
        {children}
      </div>
    );
  }

  // Redirect to login if not authenticated and not on login page
  if (!isAuthenticated) {
    router.push("/admin");
    return null;
  }

  // Show admin dashboard with navigation
  return (
    <div className="min-h-screen bg-slate-950 text-gray-100">
      {/* Admin Navigation */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-indigo-400">SmartPark Admin</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push("/admin/dashboard")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/admin/dashboard"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-slate-700"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push("/admin/spots")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin/spots")
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-slate-700"
                }`}
              >
                Parking Spots
              </button>
              <button
                onClick={() => router.push("/admin/sensors")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin/sensors")
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-slate-700"
                }`}
              >
                Sensors
              </button>
              <button
                onClick={() => router.push("/admin/esp32-test")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin/esp32-test")
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-slate-700"
                }`}
              >
                ESP32 Test
              </button>
              <button
                onClick={() => router.push("/admin/code-generator")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin/code-generator")
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-slate-700"
                }`}
              >
                Code Generator
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/")}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              View Site
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}