"use client";

import { motion } from "framer-motion";
import { FolderKanban, CheckSquare, Settings2, Clock, Filter, FileText, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function UserDashboard() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/complaints');
        setComplaints(res.data.data || []);
      } catch (err) {
        console.error("Failed fetching complaints", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);
  return (
    <div className="min-h-screen bg-zinc-950 text-slate-50 p-8 pb-20">
      <main className="max-w-6xl mx-auto flex flex-col gap-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              My Complaints Dashboard
            </h1>
            <p className="text-zinc-400 mt-1">Manage and monitor the history of your submitted civic issues.</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white transition-colors px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/20">
            <span className="text-xl">+</span> New Report
          </button>
        </div>

        {/* Dashboard Filters */}
        <div className="flex flex-wrap gap-4 items-center bg-zinc-900/50 p-4 border border-zinc-800 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-zinc-400 mr-4">
             <Filter className="w-5 h-5" /> 
             <span className="font-medium text-sm">Filters:</span>
          </div>
          
          <FilterBadge active text="All Status" />
          <FilterBadge text="Submitted" />
          <FilterBadge text="In Progress" />
          <FilterBadge text="Resolved" />
          
          <div className="ml-auto flex items-center gap-2">
             <span className="text-xs text-zinc-500">Sort by:</span>
             <select className="bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-300 py-1.5 px-3 outline-none focus:ring-1 focus:ring-blue-500/50">
               <option>Newest First</option>
               <option>Oldest First</option>
               <option>Highest Priority</option>
             </select>
          </div>
        </div>

        {/* Complaints Grid/List */}
        {loading ? (
           <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {complaints.map(c => (
               <DashboardCard 
                 key={c._id}
                 title={c.title} 
                 status={c.status} 
                 id={c._id.slice(-6).toUpperCase()} 
                 category={c.category} 
                 priority={c.priority} 
               />
            ))}
            {complaints.length === 0 && <p className="text-zinc-500 col-span-2 text-center py-10">No complaints filed yet.</p>}
          </div>
        )}

      </main>
    </div>
  );
}

function FilterBadge({ text, active }: { text: string, active?: boolean }) {
  return (
    <button className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${active ? 'bg-zinc-200 text-zinc-900 shadow-md' : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 border border-zinc-700/50'}`}>
       {text}
    </button>
  );
}

function DashboardCard({ title, status, date, id, category, priority }: any) {
  const isResolved = status === "Resolved";
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative group bg-zinc-900/40 border ${isResolved ? 'border-zinc-800/40 opacity-70' : 'border-zinc-800/80'} rounded-3xl p-6 backdrop-blur-md hover:bg-zinc-800/50 transition-colors`}
    >
       <div className="flex justify-between items-start mb-4">
         <div className="px-3 py-1 bg-zinc-950 border border-zinc-700/50 rounded-lg text-xs font-mono text-zinc-400">
           {id}
         </div>
         <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
            status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
            status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
            'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
         }`}>
           {status === 'Resolved' && <CheckSquare className="w-3.5 h-3.5" />}
           {status === 'In Progress' && <Clock className="w-3.5 h-3.5 animate-pulse" />}
           {status}
         </div>
       </div>
       
       <h3 className="text-xl font-bold text-zinc-100 mb-2 group-hover:text-blue-400 transition-colors">{title}</h3>
       
       <div className="flex flex-wrap gap-3 mt-6">
         <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
           <FolderKanban className="w-4 h-4 text-purple-400" /> Dept: {category}
         </div>
         <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium ml-4">
           <Settings2 className="w-4 h-4 text-orange-400" /> Priority: <span className={priority === 'Critical' ? 'text-red-400' : ''}>{priority}</span>
         </div>
       </div>

       {/* Detailed Expand Placeholder */}
       <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
         <button className="bg-zinc-800 border-zinc-700 text-white rounded-full p-2 hover:bg-blue-600 transition-colors">
            <FileText className="w-4 h-4" />
         </button>
       </div>
    </motion.div>
  );
}
