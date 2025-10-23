"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  MapPin, 
  Cpu, 
  Wifi, 
  Code, 
  LogOut, 
  Home, 
  Menu, 
  X,
  Database
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Parking Spots', path: '/admin/spots', icon: MapPin },
    { name: 'Sensors', path: '/admin/sensors', icon: Cpu },
    { name: 'ESP32 Test', path: '/admin/esp32-test', icon: Wifi },
    { name: 'Code Generator', path: '/admin/code-generator', icon: Code },
    { name: 'Initialize DB', path: '/admin/initialize', icon: Database },
  ];

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

  // Show admin dashboard with sidebar navigation
  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 flex">
      {/* Sidebar */}
      <div className={`bg-slate-900 border-r border-slate-800 transition-all duration-300 ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      } flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            {!isSidebarCollapsed && (
              <h1 className="text-xl font-bold text-indigo-400">SmartPark</h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="text-gray-400 hover:text-white hover:bg-slate-800"
            >
              {isSidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-slate-800"
                } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                title={isSidebarCollapsed ? item.name : ''}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isSidebarCollapsed && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => router.push("/")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-800 transition-colors ${
              isSidebarCollapsed ? 'justify-center' : ''
            }`}
            title={isSidebarCollapsed ? 'View Site' : ''}
          >
            <Home className="h-4 w-4 flex-shrink-0" />
            {!isSidebarCollapsed && <span>View Site</span>}
          </button>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-800 text-white transition-colors ${
              isSidebarCollapsed ? 'justify-center' : ''
            }`}
            title={isSidebarCollapsed ? 'Logout' : ''}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                {navigationItems.find(item => pathname.startsWith(item.path))?.name || 'Admin Panel'}
              </h2>
            </div>
            <div className="text-sm text-gray-400">
              Welcome back, {localStorage.getItem("admin_token") ? "Admin" : "Guest"}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}