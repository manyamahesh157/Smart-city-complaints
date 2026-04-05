"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Upload, Mic, MapPin, Send } from "lucide-react";
import api from "../../lib/api";

export default function SubmitComplaint() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [location, setLocation] = useState<{ lat: string; lng: string } | null>(null);
  const [manualAddress, setManualAddress] = useState("");

  const detectLocation = () => {
     if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
           (position) => setLocation({ lat: position.coords.latitude.toFixed(6), lng: position.coords.longitude.toFixed(6) }),
           () => alert("Location access denied or unavailable.")
        );
     } else {
        alert("Geolocation is not supported by your browser");
     }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      
      if (location) {
         formData.append("location[latitude]", location.lat); 
         formData.append("location[longitude]", location.lng);
      } else if (manualAddress) {
         formData.append("location[address]", manualAddress);
      } else {
         formData.append("location[latitude]", "40.7128"); 
         formData.append("location[longitude]", "-74.0060");
      }
      
      if (voiceFile) formData.append("voiceMemo", voiceFile);
      if (imageFile) formData.append("image", imageFile);

      const response = await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
         const trackingId = response.data.data.ticketId;
         alert(`Success! Your Official Tracking Ticket ID is: ${trackingId}`);
         setTitle("");
         setDescription("");
         setVoiceFile(null);
         setImageFile(null);
         setLocation(null);
         setManualAddress("");
      }
    } catch (err: any) {
      alert("Submission blocked: " + (err.response?.data?.msg || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-50 py-20 px-6">
      <main className="max-w-3xl mx-auto">
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
            Report a Civic Issue
          </h1>
          <p className="text-zinc-400">
            Our AI assistants will instantly categorize and prioritize your report to dispatch it to the appropriate structural authorities.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl flex flex-col gap-6"
        >
          {/* Title input */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Issue Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              placeholder="e.g. Deep Pothole on Main Street"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-zinc-600 transition-all"
            />
          </div>

          {/* Description input */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Detailed Description <span className="text-zinc-500 font-normal">(AI Assitant available)</span>
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the issue, hazards, and exact circumstances..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-zinc-600 transition-all resize-none"
            />
          </div>

          {/* Multi-modal inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <button type="button" className="flex flex-col items-center justify-center gap-2 bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 hover:bg-zinc-800 transition-all group relative overflow-hidden">
              <input 
                 type="file" 
                 name="image" 
                 accept="image/*" 
                 onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                 className="absolute inset-0 opacity-0 cursor-pointer" 
              />
              <Upload className={`w-6 h-6 ${imageFile ? 'text-emerald-400' : 'text-blue-400'} group-hover:scale-110 transition-transform`} />
              <span className="text-sm text-zinc-400">{imageFile ? 'Image Attached' : 'Upload Image'}</span>
            </button>
            
            <button type="button" className="flex flex-col items-center justify-center gap-2 bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 hover:bg-zinc-800 transition-all group relative overflow-hidden">
              <input 
                 type="file" 
                 name="voiceMemo" 
                 accept="audio/*" 
                 onChange={(e) => setVoiceFile(e.target.files?.[0] || null)}
                 className="absolute inset-0 opacity-0 cursor-pointer" 
              />
              <Mic className={`w-6 h-6 ${voiceFile ? 'text-emerald-400' : 'text-purple-400'} group-hover:scale-110 transition-transform`} />
              <span className="text-sm text-zinc-400">{voiceFile ? 'Audio Attached' : 'Voice Memo'}</span>
            </button>
            
            <button type="button" onClick={detectLocation} className="flex flex-col items-center justify-center gap-2 bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 hover:bg-zinc-800 transition-all group relative">
              <MapPin className={`w-6 h-6 ${location ? 'text-blue-400' : 'text-emerald-400'} group-hover:scale-110 transition-transform`} />
              <span className="text-sm text-zinc-400">{location ? `Detected` : 'Auto-Detect Location'}</span>
            </button>
            
          </div>

          {!location && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Location Detection Failed? Enter Address Manually</label>
              <input
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                type="text"
                placeholder="e.g. 123 Main St, Near the park"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-zinc-600 transition-all"
              />
            </div>
          )}

          {/* Map View */}
          <div className="h-48 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center overflow-hidden relative">
            {location ? (
               <iframe 
                 width="100%" 
                 height="100%" 
                 frameBorder="0" 
                 src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(location.lng)-0.01},${parseFloat(location.lat)-0.01},${parseFloat(location.lng)+0.01},${parseFloat(location.lat)+0.01}&layer=mapnik&marker=${location.lat},${location.lng}`}
                 className="absolute inset-0 z-0"
               ></iframe>
            ) : manualAddress ? (
               <span className="relative z-10 text-green-500 text-sm flex items-center gap-2">
                 <MapPin className="w-4 h-4" /> Custom Address Registered: {manualAddress}
               </span>
            ) : (
              <>
                 <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=40.7128,-74.0060&zoom=13&size=800x400&sensor=false')] opacity-20 bg-cover bg-center grayscale" />
                 <span className="relative z-10 text-zinc-500 text-sm flex items-center gap-2">
                   <MapPin className="w-4 h-4" /> Map View Unavailable
                 </span>
              </>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 flex items-center justify-center gap-2 w-full py-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-500/25 transition-all outline-none focus:ring-2 focus:ring-blue-500/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Processing via AI..." : "Submit Complaint"}
            {!isSubmitting && <Send className="w-4 h-4" />}
          </button>

        </motion.form>
      </main>
    </div>
  );
}
