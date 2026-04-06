"use client";

import { motion } from "framer-motion";
import { 
  BarChart3, 
  Users, 
  AlertTriangle, 
  Clock, 
  Activity,
  CheckCircle2,
  TrendingDown,
  Loader2
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import io from "socket.io-client";

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [aiLogs, setAiLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Workflow Modal State
  const [resolutionModal, setResolutionModal] = useState<{ id: string, status: string } | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofNotes, setProofNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // Initial Fetch
    const fetchData = async () => {
      try {
        const res = await api.get('/complaints');
        setComplaints(res.data.data || []);
      } catch (err) {
        console.error("Fetch DB error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Setup WebSockets
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const socket = io(API_URL);

    socket.on('new_complaint_ai_processed', (data) => {
       console.log("Websocket AI Stream:", data);
       // Add dynamic log
       setAiLogs(prev => [{ 
         title: `Routed: ${data.category}`, 
         desc: `AI ID ${data.ticketId || data.id.slice(-6).toUpperCase()} Priority: ${data.priority} ${data.aiCostEstimate ? '| Est: ' + data.aiCostEstimate : ''}`, 
         time: "Just now" 
       }, ...prev]);
       // Fake increment total stats by pushing mock entity
       setComplaints(prev => [{ _id: data.id, ticketId: data.ticketId, status: data.status, priority: data.priority, category: data.category, authenticityScore: data.authenticityScore }, ...prev]);
    });

    socket.on('complaint_status_changed', (data) => {
       setComplaints(prev => prev.map(c => c._id === data.id ? { ...c, status: data.status } : c));
    });

    return () => {
       socket.disconnect();
    };
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
     if (status === 'resolved' || status === 'closed') {
        setResolutionModal({ id, status });
        return;
     }
     executeStatusUpdate(id, status);
  };

  const executeStatusUpdate = async (id: string, status: string, formData?: FormData) => {
     try {
       setUpdating(true);
       if (!formData) {
         formData = new FormData();
         formData.append("status", status);
       }
       await api.put(`/complaints/${id}/status`, formData, { headers: { 'Content-Type': 'multipart/form-data'} });
       setComplaints(prev => prev.map(c => c._id === id ? { ...c, status } : c));
       setResolutionModal(null);
       setProofFile(null);
       setProofNotes("");
     } catch (err) {
       alert("Failed to update status.");
     } finally {
       setUpdating(false);
     }
  };

  const submitProof = (e: React.FormEvent) => {
     e.preventDefault();
     if (!resolutionModal) return;
     const formData = new FormData();
     formData.append("status", resolutionModal.status);
     formData.append("notes", proofNotes);
     if (proofFile) formData.append("proofImage", proofFile);
     executeStatusUpdate(resolutionModal.id, resolutionModal.status, formData);
  };
  return (
    <div className="min-h-screen bg-zinc-950 text-slate-50 p-8 pb-20">
      <main className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              City Authority Dashboard
            </h1>
            <p className="text-zinc-400 mt-1">Real-time civic intelligence and monitoring.</p>
          </div>
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-semibold flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               System Nominal
             </span>
             <button className="bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 transition-colors px-4 py-2 rounded-xl text-sm font-medium">
               Generate Report
             </button>
          </div>
        </div>

        {/* Top KPI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Complaints" 
            value={loading ? "..." : complaints.length.toString()} 
            trend="+1 Live Session" 
            trendUp={true} 
            icon={<BarChart3 className="w-6 h-6 text-blue-400" />} 
          />
          <StatCard 
            title="Resolution Time" 
            value="1.2 Days" 
            trend="-15% vs last month" 
            trendUp={false} 
            icon={<Clock className="w-6 h-6 text-emerald-400" />} 
          />
          <StatCard 
            title="Active Users" 
            value="10.5K" 
            trend="+5% this week" 
            trendUp={true} 
            icon={<Users className="w-6 h-6 text-purple-400" />} 
          />
          <StatCard 
            title="Abuse/Spam Prevented" 
            value="892" 
            trend="AI detected anomalies" 
            trendUp={false} 
            icon={<AlertTriangle className="w-6 h-6 text-orange-400" />} 
            bg="bg-orange-500/5"
            border="border-orange-500/20"
          />
        </div>

        {/* Main Content Areas */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Department Performance (2 Cols) */}
          <div className="xl:col-span-2 bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-6 backdrop-blur-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" /> Department Performance
              </h2>
            </div>
            
            <div className="space-y-6">
              <DeptBar name="Roads & Highways" score={85} color="bg-emerald-500" />
              <DeptBar name="Water & Sanitation" score={62} color="bg-orange-500" />
              <DeptBar name="Electricity Grid" score={92} color="bg-green-500" />
              <DeptBar name="Public Parks" score={45} color="bg-red-500" />
            </div>
          </div>

          {/* AI Automated Actions Log (1 Col) */}
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-6 backdrop-blur-md flex flex-col">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-purple-400">
               Recent AI Interventions <span className="text-xs font-normal text-zinc-500 ml-auto animate-pulse">● Live Stream</span>
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              
              {aiLogs.map((log, idx) => (
                 <LogItem key={'ws'+idx} title={log.title} desc={log.desc} time={log.time} />
              ))}

              <LogItem 
                title="Priority Scaled: High"
                desc="Complaint processing threshold identified critical keywords."
                time="2m ago"
              />
              <LogItem 
                title="Spam Suppressed"
                desc="Blocked 15 identical submissions from singular IP range."
                time="14m ago"
              />
            </div>
          </div>

        </div>

        {/* Workflow Table */}
        <div className="mt-8 bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-6 backdrop-blur-md overflow-x-auto">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Department Workflow Board
          </h2>
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-zinc-800 text-sm text-zinc-400">
                <th className="pb-3 px-4 font-medium">Ticket ID</th>
                <th className="pb-3 px-4 font-medium">Department</th>
                <th className="pb-3 px-4 font-medium">Authencity Score</th>
                <th className="pb-3 px-4 font-medium">Status</th>
                <th className="pb-3 px-4 font-medium text-right">Actions (Authority)</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {complaints.length === 0 && (
                <tr>
                   <td colSpan={5} className="py-8 text-center text-zinc-500">No active complaints in queue.</td>
                </tr>
              )}
              {complaints.map(c => (
                 <tr key={c._id} className="border-b border-zinc-900/50 hover:bg-zinc-800/20 transition-colors">
                   <td className="py-4 px-4 font-mono text-xs text-blue-400">{c.ticketId || c._id.slice(-6).toUpperCase()}</td>
                   <td className="py-4 px-4 font-medium text-zinc-200">{c.category || 'Pending'}</td>
                   <td className="py-4 px-4">
                     {c.authenticityScore ? (
                       <span className={`px-2 py-1 rounded text-xs ${c.authenticityScore > 80 ? 'bg-emerald-500/10 text-emerald-400' : c.authenticityScore > 40 ? 'bg-orange-500/10 text-orange-400' : 'bg-red-500/10 text-red-500'}`}>
                         {c.authenticityScore}% Authentic
                       </span>
                     ) : <span className="text-zinc-600">Pending</span>}
                   </td>
                   <td className="py-4 px-4">
                     <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${c.status === 'resolved' || c.status === 'closed' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : c.status === 'in progress' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : c.status === 'rejected' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-orange-500/10 border border-orange-500/20 text-orange-400'}`}>
                       {c.status}
                     </span>
                   </td>
                   <td className="py-4 px-4 text-right flex justify-end gap-2">
                     {c.status === 'submitted' && (
                       <button onClick={() => handleUpdateStatus(c._id, 'in progress')} className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded transition">Accept Work</button>
                     )}
                     {c.status === 'in progress' && (
                       <button onClick={() => handleUpdateStatus(c._id, 'resolved')} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded transition">Mark Resolved</button>
                     )}
                     {c.status === 'resolved' && (
                       <button onClick={() => handleUpdateStatus(c._id, 'closed')} className="bg-zinc-700 hover:bg-zinc-600 text-white text-xs px-3 py-1.5 rounded transition">Close Finally</button>
                     )}
                     {['submitted', 'in progress'].includes(c.status) && (
                       <button onClick={() => handleUpdateStatus(c._id, 'rejected')} className="bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs px-3 py-1.5 rounded transition">Reject</button>
                     )}
                   </td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>

      {/* Resolution Proof Upload Modal Overlay */}
      {resolutionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
           <motion.form 
             initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
             onSubmit={submitProof}
             className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-md shadow-2xl"
           >
              <h3 className="text-xl font-bold mb-4">Required: {resolutionModal.status === 'resolved' ? 'Resolution Proof' : 'Closure Log'}</h3>
              <p className="text-sm text-zinc-400 mb-4">You are updating the status to '{resolutionModal.status}'. Please upload physical proof of work.</p>
              
              <div className="flex flex-col gap-4">
                 <div>
                   <label className="block text-xs font-medium text-zinc-400 mb-1">Upload Work Image (Optional)</label>
                   <input type="file" accept="image/*" onChange={(e)=>setProofFile(e.target.files?.[0] || null)} className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-blue-400 hover:file:bg-zinc-700" />
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-zinc-400 mb-1">Technician Notes</label>
                   <textarea required value={proofNotes} onChange={(e)=>setProofNotes(e.target.value)} rows={3} placeholder="Describe the resolution officially..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>
                 </div>
                 
                 <div className="flex justify-end gap-3 mt-2">
                   <button type="button" onClick={() => setResolutionModal(null)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition">Cancel</button>
                   <button type="submit" disabled={updating} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg font-medium shadow-lg transition">{updating ? 'Submitting...' : 'Confirm Status Update'}</button>
                 </div>
              </div>
           </motion.form>
        </div>
      )}

    </div>
  );
}

// Subcomponents
function StatCard({ title, value, trend, trendUp, icon, bg="bg-zinc-900/40", border="border-zinc-800/60" }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${bg} border ${border} rounded-3xl p-6 backdrop-blur-sm`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-zinc-950/50 rounded-2xl border border-zinc-800/50">{icon}</div>
      </div>
      <div>
        <h3 className="text-zinc-400 text-sm font-medium">{title}</h3>
        <div className="text-3xl font-bold mt-1 text-zinc-100">{value}</div>
        <div className={`text-xs mt-2 ${trendUp ? 'text-emerald-400' : 'text-zinc-500'} flex items-center gap-1`}>
          {trendUp ? null : <TrendingDown className="w-3 h-3" />} {trend}
        </div>
      </div>
    </motion.div>
  );
}

function DeptBar({ name, score, color }: any) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2 text-zinc-300">
        <span className="font-medium">{name}</span>
        <span>{score}% Resolved</span>
      </div>
      <div className="h-3 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/50">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${color}`} 
        />
      </div>
    </div>
  );
}

function LogItem({ title, desc, time }: any) {
  return (
    <div className="bg-zinc-950/50 border border-zinc-800/50 p-4 rounded-2xl">
       <div className="flex justify-between text-sm mb-1">
         <span className="font-bold text-zinc-200">{title}</span>
         <span className="text-xs text-zinc-500">{time}</span>
       </div>
       <p className="text-xs text-zinc-400">{desc}</p>
    </div>
  )
}
