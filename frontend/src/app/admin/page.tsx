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
       setAiLogs(prev => [{ title: `Routed: ${data.category}`, desc: `AI ID ${data.id.slice(-6).toUpperCase()} Priority: ${data.priority}`, time: "Just now" }, ...prev]);
       // Fake increment total stats by pushing mock entity
       setComplaints(prev => [{ _id: data.id, status: data.status, priority: data.priority }, ...prev]);
    });

    socket.on('complaint_status_changed', (data) => {
       setComplaints(prev => prev.map(c => c._id === data.id ? { ...c, status: data.status } : c));
    });

    return () => {
       socket.disconnect();
    };
  }, []);
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
              <LogItem 
                title="Duplicate Merged"
                desc="Merged 3 complaints regarding 'Main Street Water Leak' (98% similarity)"
                time="1h ago"
              />
              <LogItem 
                title="Auto-Routed to Roads"
                desc="Visual AI confirmed 'Pothole' image input #412."
                time="2h ago"
              />

            </div>
          </div>

        </div>

      </main>
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
