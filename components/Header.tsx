// app/components/Header.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wifi, Info, Home } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const [online, setOnline] = useState<boolean>(false);

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
    <header className="w-full flex items-center justify-between px-6 py-4 bg-gray-850 border-b border-gray-700">
      <div className="flex items-center gap-3">
        <Wifi className="w-6 h-6 text-indigo-400" />
        <h1 className="text-xl font-semibold text-gray-100">
          IoT Car Parking System
        </h1>
        <Badge className={`ml-3 ${online ? "bg-green-600 text-black" : "bg-gray-600 text-gray-200"}`}>
          {online ? "Server Online" : "Offline"}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
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
      </div>
    </header>
  );
}
