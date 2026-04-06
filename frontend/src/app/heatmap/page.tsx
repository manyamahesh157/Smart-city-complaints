"use client";

import { motion } from "framer-motion";
import { Map as MapIcon, Layers, RefreshCcw } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import api from "../../lib/api";
import Map from "../components/Map";

export default function HeatmapView() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [showCritical, setShowCritical] = useState(true);
  const [showWaterSan, setShowWaterSan] = useState(true);
  const [showElectrical, setShowElectrical] = useState(true);

  const fetchComplaints = async () => {
     try {
       const res = await api.get('/complaints');
       setComplaints(res.data.data.filter((c: any) => c.status !== 'resolved'));
     } catch (err) {}
  };

  useEffect(() => {
     fetchComplaints();
  }, []);

  const heatmapData = useMemo(() => {
    return complaints.filter(c => {
       if (c.priority === 'critical' && showCritical) return true;
       if ((c.category === 'water' || c.department === 'Water' || c.category === 'sanitation' || c.department === 'Sanitation') && showWaterSan) return true;
       if ((c.category === 'electricity' || c.department === 'Electricity') && showElectrical) return true;
       // show default if no filter match but priority is not critical/water/electric, wait no just match simple rules
       if (!showCritical && !showWaterSan && !showElectrical) return false;
       // if we want to show everything else... actually filtering exactly based on checks:
       const isCritical = c.priority === 'critical';
       const isWaterSan = c.category === 'water' || c.department === 'Water' || c.category === 'sanitation' || c.department === 'Sanitation';
       const isElec = c.category === 'electricity' || c.department === 'Electricity';
       if (!isCritical && !isWaterSan && !isElec) return true; // show unclassified always for now
       return false;
    }).map(c => {
       const color = c.priority === 'critical' ? 'red' :
                     c.priority === 'high' ? 'orange' :
                     c.priority === 'medium' ? 'yellow' : 'blue';
       // check if location is valid
       const lat = c.location?.latitude ? parseFloat(c.location.latitude) : 40.7128 + (Math.random()*0.02 - 0.01);
       const lng = c.location?.longitude ? parseFloat(c.location.longitude) : -74.0060 + (Math.random()*0.02 - 0.01);
       return { lat, lng, color, popup: c.title };
    });
  }, [complaints, showCritical, showWaterSan, showElectrical]);

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-50 py-12 px-6">
      <main className="max-w-7xl mx-auto flex flex-col gap-8 h-full">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400 flex items-center gap-3">
              <MapIcon className="w-8 h-8 text-orange-400" /> Live Complaint Heatmap
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
            
            <label className="flex items-center gap-3 text-sm text-zinc-400 cursor-pointer">
              <input type="checkbox" checked={showCritical} onChange={e => setShowCritical(e.target.checked)} className="accent-orange-500 rounded bg-zinc-900 border-zinc-700 w-4 h-4" />
              Critical Hazards (<span className="text-red-400">High Density</span>)
            </label>
             <label className="flex items-center gap-3 text-sm text-zinc-400 cursor-pointer">
              <input type="checkbox" checked={showWaterSan} onChange={e => setShowWaterSan(e.target.checked)} className="accent-blue-500 rounded bg-zinc-900 border-zinc-700 w-4 h-4" />
              Water/Sanitation
            </label>
             <label className="flex items-center gap-3 text-sm text-zinc-400 cursor-pointer">
              <input type="checkbox" checked={showElectrical} onChange={e => setShowElectrical(e.target.checked)} className="accent-emerald-500 rounded bg-zinc-900 border-zinc-700 w-4 h-4" />
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

          {/* Map Interactive Graph */}
          <div className="absolute inset-0 z-0">
             <Map center={[40.7128, -74.0060]} zoom={13} heatmapData={heatmapData} />
          </div>
        </motion.div>

      </main>
    </div>
  );
}
