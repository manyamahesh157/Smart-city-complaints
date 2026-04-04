"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    window.location.href = "/login";
  };

  return (
    <nav className="w-full flex justify-between items-center px-6 py-4 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-lg fixed top-0 z-50">
      <Link href="/" className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">SmartCity AI</Link>
      <div className="flex gap-6 text-sm font-medium text-zinc-400">
        <Link href="/submit" className="hover:text-white transition">Submit</Link>
        <Link href="/track" className="hover:text-white transition">Track</Link>
        <Link href="/heatmap" className="hover:text-white transition">Heatmap</Link>
        <Link href="/dashboard" className="hover:text-white transition">My Dashboard</Link>
      </div>
      <div>
        {isAuthenticated ? (
          <button onClick={handleLogout} className="text-sm font-semibold bg-red-600/80 hover:bg-red-500 text-white px-4 py-2 rounded-full transition">
            Logout
          </button>
        ) : (
          <Link href="/login" className="text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full transition">
            Login / Register
          </Link>
        )}
      </div>
    </nav>
  );
}
