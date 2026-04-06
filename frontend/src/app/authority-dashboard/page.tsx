"use client";

import { motion } from "framer-motion";
import { 
  Building2, 
  MapPin, 
  Clock, 
  AlertTriangle,
  RefreshCcw,
  CheckCircle2,
  ListTodo
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import io from "socket.io-client";

export default function AuthorityDashboard() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingParams, setUpdatingParams] = useState<any>({});
  
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints/department');
      setComplaints(res.data.data || []);
    } catch (err: any) {
      if(err.response?.status === 401) {
        window.location.href = "/authority-login";
      }
      console.error("Fetch DB error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Setup WebSockets for live status
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const socket = io(API_URL);

    socket.on('complaint_status_changed', (data) => {
       fetchData(); // Simplest way to refresh remarks and status
    });

    socket.on('new_complaint_ai_processed', (data) => {
       fetchData();
    });

    return () => {
       socket.disconnect();
    };
  }, []);

  const handleUpdate = async (id: string, currentStatus: string) => {
    const status = updatingParams[id]?.status || currentStatus;
    const remarks = updatingParams[id]?.remarks || "";
    try {
      await api.put(`/complaints/${id}/status`, { status, remarks });
      alert("Successfully updated complaint!");
      // clear local state
      setUpdatingParams((prev: any) => ({ ...prev, [id]: undefined }));
      fetchData();
    } catch(err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  if (loading) {
     return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><p className="text-zinc-500 animate-pulse">Loading Department Data...</p></div>
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-50 p-8 pb-20">
      <main className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-400 flex items-center gap-2">
              <Building2 className="w-8 h-8 text-orange-500" /> Department Actions
            </h1>
            <p className="text-zinc-400 mt-1">Review and action complaints routed to your specific department.</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={fetchData} className="bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 transition-colors px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
               <RefreshCcw className="w-4 h-4" /> Refresh
             </button>
             <button onClick={() => { localStorage.removeItem('token'); window.location.href='/authority-login'; }} className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors px-4 py-2 rounded-xl text-sm font-medium">
               Logout
             </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-sm">Status:</span>
            <select 
               className="bg-zinc-950 border border-zinc-700 text-sm text-zinc-200 rounded-lg p-2 focus:outline-none"
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="in progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-sm">Priority:</span>
            <select 
               className="bg-zinc-950 border border-zinc-700 text-sm text-zinc-200 rounded-lg p-2 focus:outline-none"
               value={filterPriority}
               onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Complaints List */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {complaints
            .filter(c => filterStatus === 'all' || c.status === filterStatus)
            .filter(c => filterPriority === 'all' || c.priority === filterPriority)
            .length === 0 && (
             <div className="xl:col-span-3 text-center py-12 border border-dashed border-zinc-800 rounded-3xl text-zinc-500">
                No active complaints matching filters.
             </div>
          )}

          {complaints
            .filter(c => filterStatus === 'all' || c.status === filterStatus)
            .filter(c => filterPriority === 'all' || c.priority === filterPriority)
            .map((c) => (
            <motion.div 
               key={c._id}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-6 backdrop-blur-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${c.status === 'resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' : c.status === 'in progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                    {c.status.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${c.priority === 'critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                    {c.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
                <h3 className="text-xl font-bold text-zinc-100">{c.title}</h3>
                <p className="text-sm text-zinc-400 mt-2 line-clamp-3">{c.description}</p>
                <div className="text-xs text-zinc-500 mt-4 flex items-center gap-1">
                   <Clock className="w-3 h-3" /> {new Date(c.createdAt).toLocaleString()}
                </div>
                {c.remarks && (
                   <div className="mt-4 p-3 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                     <p className="text-xs text-zinc-500 font-bold mb-1">Official Remarks:</p>
                     <p className="text-sm text-zinc-300 italic">"{c.remarks}"</p>
                   </div>
                )}
              </div>
              
              <div className="mt-6 border-t border-zinc-800 pt-4 flex flex-col gap-3">
                <select 
                  className="bg-zinc-950 border border-zinc-700 text-sm text-zinc-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  value={updatingParams[c._id]?.status || c.status}
                  onChange={(e) => setUpdatingParams((prev: any) => ({ ...prev, [c._id]: { ...prev[c._id], status: e.target.value } }))}
                >
                  <option value="submitted">Submitted</option>
                  <option value="in progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Officer Remarks..." 
                  className="bg-zinc-950 border border-zinc-700 text-sm text-zinc-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  value={updatingParams[c._id]?.remarks || ''}
                  onChange={(e) => setUpdatingParams((prev: any) => ({ ...prev, [c._id]: { ...prev[c._id], remarks: e.target.value } }))}
                />
                <button 
                  onClick={() => handleUpdate(c._id, c.status)}
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white rounded-lg p-2 text-sm font-bold shadow-md transition-colors"
                >
                  Commit Update
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
