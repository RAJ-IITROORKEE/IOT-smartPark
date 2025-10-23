"use client";

import { Globe } from "lucide-react";

interface FooterProps {
  className?: string;
}

export default function Footer({ className = "" }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`border-t border-slate-800 bg-slate-950 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="text-center space-y-2">
          <p className="text-gray-400 text-sm">
            © {currentYear} SmartPark IoT System. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-gray-500">Design and developed by</span>
            <a 
              href="https://rajrabidas.me" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
            >
              <Globe className="h-3 w-3" />
              Raj Rabidas
            </a>
          </div>
          <p className="text-gray-500 text-xs">
            IIT Roorkee | Metallurgical and Materials Engineering
          </p>
        </div>
      </div>
    </footer>
  );
}