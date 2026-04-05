"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Award, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/auth/leaderboard');
        setLeaders(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-50 p-8">
      <main className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="text-center mt-10 mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center p-4 bg-yellow-500/10 rounded-full mb-6"
          >
            <Trophy className="w-12 h-12 text-yellow-400" />
          </motion.div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-400">
            Civic Heroes Leaderboard
          </h1>
          <p className="text-zinc-400 mt-4 text-lg">
            Earn Civic Points by submitting verified complaints that get resolved. Let's build a better city together.
          </p>
        </div>

        {/* Leaderboard List */}
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-6 backdrop-blur-md">
          {loading ? (
            <div className="text-center text-zinc-500 py-10">Loading Heroes...</div>
          ) : leaders.length === 0 ? (
            <div className="text-center text-zinc-500 py-10">No Civic Points awarded yet. Be the first!</div>
          ) : (
            <div className="space-y-4">
              {leaders.map((user, idx) => (
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx} 
                  className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex text-lg items-center justify-center rounded-full bg-zinc-800 text-zinc-400 font-bold">
                      #{idx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-200 flex items-center gap-2">
                        {user.name} 
                        {idx === 0 && <Medal className="w-4 h-4 text-yellow-400" />}
                        {idx === 1 && <Medal className="w-4 h-4 text-zinc-400" />}
                        {idx === 2 && <Medal className="w-4 h-4 text-orange-400" />}
                      </h3>
                      <p className="text-xs text-zinc-500">Citizen Contributor</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xl font-bold text-emerald-400">
                    <Award className="w-5 h-5 text-emerald-500" />
                    {user.civicPoints || 0} pts
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
