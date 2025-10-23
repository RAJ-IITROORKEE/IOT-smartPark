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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Auto-collapse sidebar on mobile and handle screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // On desktop, close mobile sidebar if it's open
        setIsMobileSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile sidebar when pressing escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
    };

    if (isMobileSidebarOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when mobile sidebar is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMobileSidebarOpen]);

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
    <div className="min-h-screen bg-slate-950 text-gray-100 flex relative">
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 md:hidden"
          style={{ zIndex: 50 }}
          onClick={() => setIsMobileSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsMobileSidebarOpen(false);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col
          ${isMobileSidebarOpen 
            ? 'fixed inset-y-0 left-0 w-64 shadow-2xl z-50 md:hidden' 
            : 'hidden'
          }
          md:flex md:relative md:inset-auto md:z-auto
          ${isSidebarCollapsed ? 'md:w-16' : 'md:w-64'}
        `}
        style={isMobileSidebarOpen ? { zIndex: 51 } : {}}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            {(!isSidebarCollapsed || isMobileSidebarOpen) && (
              <h1 className="text-xl font-bold text-indigo-400">SmartPark</h1>
            )}
            {/* Desktop Collapse Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex text-gray-400 hover:text-white hover:bg-slate-800"
            >
              {isSidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
            {/* Mobile Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden text-gray-400 hover:text-white hover:bg-slate-800"
              title="Close navigation menu"
            >
              <X className="h-4 w-4" />
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
                onClick={() => {
                  router.push(item.path);
                  setIsMobileSidebarOpen(false); // Close mobile menu on navigation
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-slate-800"
                } ${isSidebarCollapsed && !isMobileSidebarOpen ? 'justify-center' : ''}`}
                title={isSidebarCollapsed && !isMobileSidebarOpen ? item.name : ''}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {(!isSidebarCollapsed || isMobileSidebarOpen) && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => {
              router.push("/");
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-800 transition-colors ${
              isSidebarCollapsed && !isMobileSidebarOpen ? 'justify-center' : ''
            }`}
            title={isSidebarCollapsed && !isMobileSidebarOpen ? 'View Site' : ''}
          >
            <Home className="h-4 w-4 flex-shrink-0" />
            {(!isSidebarCollapsed || isMobileSidebarOpen) && <span>View Site</span>}
          </button>
          <button
            onClick={() => {
              handleLogout();
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-800 text-white transition-colors ${
              isSidebarCollapsed && !isMobileSidebarOpen ? 'justify-center' : ''
            }`}
            title={isSidebarCollapsed && !isMobileSidebarOpen ? 'Logout' : ''}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {(!isSidebarCollapsed || isMobileSidebarOpen) && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-slate-800"
                title="Open navigation menu"
              >
                <Menu className="h-4 w-4" />
              </Button>
              
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white truncate">
                  <span className="hidden sm:inline">
                    {navigationItems.find(item => pathname.startsWith(item.path))?.name || 'Admin Panel'}
                  </span>
                  <span className="sm:hidden">
                    Admin
                  </span>
                </h2>
              </div>
            </div>
            
            <div className="text-xs sm:text-sm text-gray-400 hidden xs:block">
              Welcome back, {localStorage.getItem("admin_token") ? "Admin" : "Guest"}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800 bg-slate-900 px-4 sm:px-6 py-3 sm:py-4">
          <div className="text-center space-y-1">
            <p className="text-gray-400 text-xs sm:text-sm">
              © {new Date().getFullYear()} SmartPark IoT System. All rights reserved.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="text-gray-500 hidden sm:inline">Design and developed by</span>
              <span className="text-gray-500 sm:hidden">By</span>
              <a 
                href="https://rajrabidas.me" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                  <path d="M2 12h20"/>
                </svg>
                Raj Rabidas
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}