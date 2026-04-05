"use client";

import { motion } from "framer-motion";
import { Map, Layers, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function HeatmapView() {
  const [complaints, setComplaints] = useState<any[]>([]);
  // Active Filters State
  const [showResolved, setShowResolved] = useState(false);
  const [showInProgress, setShowInProgress] = useState(true);
  const [showSubmitted, setShowSubmitted] = useState(true);
  
  const [showCritical, setShowCritical] = useState(true);
  const [showWater, setShowWater] = useState(true);
  const [showElectrical, setShowElectrical] = useState(true);

  const fetchComplaints = async () => {
     try {
       const res = await api.get('/complaints');
       setComplaints(res.data.data);
     } catch (err) {}
  };

  useEffect(() => {
     fetchComplaints();
  }, []);

  // Compute final list based on filters
  const filteredComplaints = complaints.filter(c => {
     // Status Filter
     if (c.status === 'resolved' && !showResolved) return false;
     if (c.status === 'in progress' && !showInProgress) return false;
     if (c.status === 'submitted' && !showSubmitted) return false;

     // Category/Priority Filter
     if (c.priority === 'critical' && !showCritical) return false;
     if ((c.category === 'water' || c.category === 'sanitation') && !showWater) return false;
     if (c.category === 'electricity' && !showElectrical) return false;

     return true;
  });
  return (
    <div className="min-h-screen bg-zinc-950 text-slate-50 py-12 px-6">
      <main className="max-w-7xl mx-auto flex flex-col gap-8 h-full">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400 flex items-center gap-3">
              <Map className="w-8 h-8 text-orange-400" /> Live Complaint Heatmap
            </h1>
            <p className="text-zinc-400 mt-1 max-w-2xl">
              Visualize real-time infrastructural issues mapped across the city utilizing aggregate geographic densities. Active clustered zones represent immediate critical priorities.
            </p>
          </div>
          
          <div className="flex bg-zinc-900 rounded-xl p-1 border border-zinc-800">
            <button className="px-4 py-2 bg-zinc-800 rounded-lg text-sm font-medium shadow">City View</button>
            <button className="px-4 py-2 text-zinc-400 hover:text-white rounded-lg text-sm font-medium transition">Districts</button>
          </div>
        </div>

        {/* Heatmap Visualization Container */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full h-[65vh] rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900 group shadow-2xl shadow-orange-500/5"
        >
          {/* Overlay UI elements on the map */}
          <div className="absolute top-4 left-4 z-10 bg-zinc-950/80 backdrop-blur-md p-4 rounded-xl border border-zinc-800/80 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-zinc-300 font-medium pb-2 border-b border-zinc-800">
              <Layers className="w-4 h-4 text-orange-400" /> Filters
            </div>
            
            <div className="flex flex-col gap-2 mb-2 pb-2 border-b border-zinc-800">
               <label className="flex items-center gap-3 text-sm text-zinc-400 cursor-pointer">
                 <input type="checkbox" checked={showSubmitted} onChange={(e)=>setShowSubmitted(e.target.checked)} className="accent-blue-500 rounded w-4 h-4" />
                 Status: Submitted
               </label>
               <label className="flex items-center gap-3 text-sm text-zinc-400 cursor-pointer">
                 <input type="checkbox" checked={showInProgress} onChange={(e)=>setShowInProgress(e.target.checked)} className="accent-orange-500 rounded w-4 h-4" />
                 Status: In Progress
               </label>
               <label className="flex items-center gap-3 text-sm text-zinc-400 cursor-pointer">
                 <input type="checkbox" checked={showResolved} onChange={(e)=>setShowResolved(e.target.checked)} className="accent-emerald-500 rounded w-4 h-4" />
                 Status: Resolved
               </label>
            </div>
            
            <label className="flex items-center gap-3 text-sm text-zinc-400 cursor-pointer">
              <input type="checkbox" checked={showCritical} onChange={(e)=>setShowCritical(e.target.checked)} className="accent-orange-500 rounded bg-zinc-900 border-zinc-700 w-4 h-4" />
              Critical Hazards (<span className="text-red-400">High Density</span>)
            </label>
             <label className="flex items-center gap-3 text-sm text-zinc-400 cursor-pointer">
              <input type="checkbox" checked={showWater} onChange={(e)=>setShowWater(e.target.checked)} className="accent-blue-500 rounded bg-zinc-900 border-zinc-700 w-4 h-4" />
              Water/Sanitation
            </label>
             <label className="flex items-center gap-3 text-sm text-zinc-400 cursor-pointer">
              <input type="checkbox" checked={showElectrical} onChange={(e)=>setShowElectrical(e.target.checked)} className="accent-emerald-500 rounded bg-zinc-900 border-zinc-700 w-4 h-4" />
              Electrical Grid
            </label>
          </div>

          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button onClick={fetchComplaints} className="bg-zinc-950/80 backdrop-blur-md hover:bg-zinc-800 p-3 rounded-full border border-zinc-800 text-zinc-300 transition-colors" title="Sync Live Data">
              <RefreshCcw className="w-5 h-5" />
            </button>
          </div>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-zinc-950/80 backdrop-blur-md px-6 py-3 rounded-full border border-zinc-800 shadow-xl flex items-center gap-4 text-sm font-medium">
             <span className="text-zinc-400">Intensity:</span>
             <div className="flex items-center gap-1">
               <span className="w-4 h-4 rounded-full bg-blue-500/50"></span>
               <span className="w-4 h-4 rounded-full bg-yellow-500/60"></span>
               <span className="w-4 h-4 rounded-full bg-orange-500/80"></span>
               <span className="w-4 h-4 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]"></span>
             </div>
             <span className="text-xs text-red-400 ml-2 animate-pulse">Live</span>
          </div>

          {/* Actual Map Graphic Placeholder */}
          <div className="w-full h-full bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=40.7128,-74.0060&zoom=12&size=1000x800&style=feature:all|element:labels.text.fill|color:0x8ec3b9&style=feature:all|element:labels.text.stroke|color:0x1a3646&style=feature:administrative.country|element:geometry.stroke|color:0x4b6878&style=feature:administrative.land_parcel|element:labels.text.fill|color:0x64779e&style=feature:administrative.province|element:geometry.stroke|color:0x4b6878&style=feature:landscape.man_made|element:geometry.stroke|color:0x334e87&style=feature:landscape.natural|element:geometry|color:0x021019&style=feature:poi|element:geometry|color:0x283d6a&style=feature:poi|element:labels.text.fill|color:0x6f9ba5&style=feature:poi|element:labels.text.stroke|color:0x1d2c4d&style=feature:road|element:geometry|color:0x304a7d&style=feature:road|element:labels.text.fill|color:0x98a5be&style=feature:road|element:labels.text.stroke|color:0x1d2c4d&style=feature:road.highway|element:geometry|color:0x2c6675&style=feature:road.highway|element:geometry.stroke|color:0x255763&style=feature:road.highway|element:labels.text.fill|color:0xb0d5ce&style=feature:road.highway|element:labels.text.stroke|color:0x023e58&style=feature:transit|element:labels.text.fill|color:0x98a5be&style=feature:transit|element:labels.text.stroke|color:0x1d2c4d&style=feature:transit.line|element:geometry.fill|color:0x283d6a&style=feature:transit.station|element:geometry|color:0x3a4762&style=feature:water|element:geometry|color:0x0e1626&style=feature:water|element:labels.text.fill|color:0x4e6d70&sensor=false')] bg-cover bg-center brightness-75 contrast-125 saturate-50 transition-all duration-1000">
             
             {/* Render Dynamic Database Mappings as Heat Clusters */}
             {filteredComplaints.map((c, i) => {
                // Generate a stable visual offset on the CSS layout based on string ID hash just for demo logic
                const hash = c._id.charCodeAt(c._id.length-1);
                const t = 20 + (hash % 60);
                const l = 20 + ((hash * 3) % 60);
                
                const cColor = c.priority === 'critical' ? 'bg-red-600/60 shadow-[0_0_40px_rgba(220,38,38,1)]' :
                               c.priority === 'high' ? 'bg-orange-500/60 shadow-[0_0_30px_rgba(249,115,22,1)]' :
                               c.priority === 'medium' ? 'bg-yellow-500/60 shadow-[0_0_20px_rgba(234,179,8,1)]' :
                               'bg-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,1)]';

                return (
                  <motion.div 
                    key={c._id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute w-[40px] h-[40px] rounded-full blur-[10px] mix-blend-screen animate-pulse pointer-events-none ${cColor}`} 
                    style={{ top: `${t}%`, left: `${l}%` }}
                  />
                );
             })}
          </div>
        </motion.div>

      </main>
    </div>
  );
}
