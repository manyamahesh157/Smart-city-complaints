"use client";

import { motion } from "framer-motion";
import { ArrowRight, Activity, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-[100dvh] flex flex-col justify-center items-center overflow-hidden bg-zinc-950 text-slate-50">
      
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-purple-500/20 blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <main className="relative z-10 flex flex-col items-center justify-center w-full px-6 text-center">
        
        {/* Decorative Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 px-3 py-1 text-sm font-medium border border-zinc-800 bg-zinc-900/50 rounded-full backdrop-blur-sm text-zinc-300"
        >
          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          Live Platform
        </motion.div>

        {/* Hero Heading as per Request */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-500 max-w-4xl"
        >
          Smart Complaint Resolution
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl text-center leading-relaxed"
        >
          An autonomous system designed to seamlessly process, priority-route, and resolve civic issues within your city faster than ever.
        </motion.p>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center w-full"
        >
          <Link href="/submit" className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-full shadow-lg shadow-blue-500/25 transition-all outline-none focus:ring-2 focus:ring-blue-500/50 active:scale-95">
            Submit Issue <ArrowRight className="w-4 h-4" />
          </Link>
          
          <Link href="/track" className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-zinc-300 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-full transition-all outline-none focus:ring-2 focus:ring-zinc-700 active:scale-95 backdrop-blur-sm">
            Track Status
          </Link>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full text-left"
        >
          <div className="p-6 rounded-2xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-md">
            <Activity className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-zinc-100 font-medium mb-2">Automated Routing</h3>
            <p className="text-zinc-400 text-sm">Issues are instantly categorized and dispatched to the correct municipal authority.</p>
          </div>
          
          <div className="p-6 rounded-2xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-md">
            <MapPin className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-zinc-100 font-medium mb-2">Geolocation</h3>
            <p className="text-zinc-400 text-sm">Pinpoint accuracy for precise targeting of infrastructural damage or maintenance.</p>
          </div>
          
          <div className="p-6 rounded-2xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-md">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-zinc-100 font-medium mb-2">Verified Claims</h3>
            <p className="text-zinc-400 text-sm">Pre-validation of images and text entries to reduce spam and focus on real issues.</p>
          </div>
        </motion.div>

      </main>
      
    </div>
  );
}
