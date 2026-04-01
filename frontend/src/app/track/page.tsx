"use client";

import { motion } from "framer-motion";
import { Search, MapPin, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";
import api from "../../lib/api";

export default function TrackComplaint() {
  const [ticketId, setTicketId] = useState("");
  const [searched, setSearched] = useState(false);
  const [complaintData, setComplaintData] = useState<any>(null);
  const [historyEvents, setHistoryEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
     if(!ticketId) return;
     setLoading(true);
     setError("");
     setSearched(false);
     try {
       const res = await api.get(`/complaints/${ticketId}`);
       setComplaintData(res.data.data);
       setHistoryEvents(res.data.history);
       setSearched(true);
     } catch (err: any) {
       setError("Complaint not found or invalid format.");
     } finally {
       setLoading(false);
     }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-50 py-20 px-6">
      <main className="max-w-4xl mx-auto flex flex-col gap-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-400 mb-4">
            Track Your Complaint
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Enter your unique Complaint ID to check real-time updates and view direct AI-generated priority adjustments.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative max-w-2xl mx-auto w-full group"
        >
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors w-6 h-6" />
          <input
            type="text"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            placeholder="e.g. CPT-894-XYZ"
            className="w-full bg-zinc-900/50 border-2 border-zinc-800 rounded-full py-4 pl-16 pr-36 text-zinc-200 outline-none focus:border-blue-500/50 transition-all font-mono text-lg shadow-lg"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-full font-medium transition-colors shadow-md"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </motion.div>

        {error && (
          <div className="text-red-400 text-center font-medium mt-4">{error}</div>
        )}

        {/* Dynamic Tracking Result */}
        {searched && complaintData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mt-8 bg-zinc-900 border border-zinc-800 rounded-3xl p-8 backdrop-blur-md"
          >
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 border-b border-zinc-800 pb-8">
              <div>
                <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase mb-2 block">
                  Complaint Details
                </span>
                <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
                  {complaintData.title}
                  <span className={`bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs px-2 py-0.5 rounded-full`}>
                    {complaintData.priority} Priority
                  </span>
                </h2>
                <div className="flex items-center text-sm text-zinc-400 mt-2 gap-4">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> Lat: {complaintData.location?.latitude || 'Unknown'}, Lng: {complaintData.location?.longitude || 'Unknown'}</span>
                  <span className="flex items-center gap-1"><AlertCircle className="w-4 h-4"/> {complaintData.category}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl text-blue-400 font-medium whitespace-nowrap capitalize">
                <Clock className="w-5 h-5 animate-pulse" />
                {complaintData.status}
              </div>
            </div>

            {/* Timeline mapped from DB */}
            <div className="space-y-8 pl-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
              
              {historyEvents.map((event, idx) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-zinc-950 ${event.status === 'resolved' ? 'bg-emerald-500' : 'bg-blue-500'} text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow ring-4 ring-blue-500/20`}>
                    {event.status === 'resolved' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5 animate-spin-slow" />}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-zinc-800/50 p-4 rounded-xl shadow border border-zinc-700/50">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-zinc-200 capitalize">Status: {event.status}</div>
                      <time className="font-mono text-xs text-zinc-500">{new Date(event.timestamp).toLocaleTimeString()}</time>
                    </div>
                    <div className="text-zinc-400 text-sm">{event.remarks || "Status updated."}</div>
                  </div>
                </div>
              ))}
            </div>

          </motion.div>
        )}
      </main>
    </div>
  );
}
