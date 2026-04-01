import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Smart Complaint Resolution Portal",
  description: "Agentic AI platform for smart city complaint routing and resolution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-slate-50 min-h-screen flex flex-col`}
      >
        <nav className="w-full flex justify-between items-center px-6 py-4 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-lg fixed top-0 z-50">
           <Link href="/" className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">SmartCity AI</Link>
           <div className="flex gap-6 text-sm font-medium text-zinc-400">
             <Link href="/submit" className="hover:text-white transition">Submit</Link>
             <Link href="/track" className="hover:text-white transition">Track</Link>
             <Link href="/heatmap" className="hover:text-white transition">Heatmap</Link>
             <Link href="/dashboard" className="hover:text-white transition">My Dashboard</Link>
           </div>
           <Link href="/login" className="text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full transition">Authority Login</Link>
        </nav>
        
        <main className="flex-1 mt-[72px]">
          {children}
        </main>
      </body>
    </html>
  );
}
