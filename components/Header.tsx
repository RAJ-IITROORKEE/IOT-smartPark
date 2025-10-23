// app/components/Header.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wifi, Info, Home, Menu, X } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const [online, setOnline] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Check server status
  async function checkStatus() {
    try {
      const res = await fetch("/api/update");
      if (!res.ok) return;
      setOnline(true);
    } catch {
      setOnline(false);
    }
  }

  useEffect(() => {
    checkStatus();
    const id = setInterval(checkStatus, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="w-full bg-gray-850 border-b border-gray-700">
      {/* Main Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Left Side - Logo and Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Wifi className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400 flex-shrink-0" />
          <h1 className="text-lg sm:text-xl font-semibold text-gray-100 truncate">
            <span className="hidden sm:inline">IoT Car Parking System</span>
            <span className="sm:hidden">SmartPark</span>
          </h1>
          <Badge className={`ml-2 sm:ml-3 text-xs ${online ? "bg-green-600 text-black" : "bg-gray-600 text-gray-200"} hidden xs:inline-flex`}>
            {online ? "Online" : "Offline"}
          </Badge>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-3">
          <Link href="/">
            <Button
              size="sm"
              variant="ghost"
              className="flex items-center gap-2 px-3 py-1 text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
          </Link>
          
          <Link href="/about">
            <Button
              size="sm"
              variant="ghost"
              className="flex items-center gap-2 px-3 py-1 text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <Info className="w-4 h-4" />
              About
            </Button>
          </Link>

          <Link href="/admin">
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-2 px-3 py-1 border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors"
            >
              <Wifi className="w-4 h-4" />
              Admin
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-slate-700"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-700 bg-gray-900">
          <nav className="px-4 py-3 space-y-2">
            {/* Server Status on Mobile */}
            <div className="flex items-center justify-center pb-2 xs:hidden">
              <Badge className={`text-xs ${online ? "bg-green-600 text-black" : "bg-gray-600 text-gray-200"}`}>
                {online ? "Server Online" : "Offline"}
              </Badge>
            </div>
            
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 py-3 text-gray-300 hover:text-white hover:bg-slate-700"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
            </Link>
            
            <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 py-3 text-gray-300 hover:text-white hover:bg-slate-700"
              >
                <Info className="w-4 h-4" />
                About
              </Button>
            </Link>

            <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 py-3 border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white"
              >
                <Wifi className="w-4 h-4" />
                Admin Panel
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
