"use client";

import { motion } from "framer-motion";
import { Lock, Mail, ShieldCheck, KeyRound } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../../lib/api";

export default function Login() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // Math CAPTCHA State
  const [captchaParams, setCaptchaParams] = useState({ a: 0, b: 0 });
  const [captchaInput, setCaptchaInput] = useState("");
  
  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    setCaptchaParams({
      a: Math.floor(Math.random() * 10) + 1,
      b: Math.floor(Math.random() * 10) + 1
    });
    setCaptchaInput("");
  };

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(captchaInput) !== (captchaParams.a + captchaParams.b)) {
       alert("Security Verification Failed. Incorrect CAPTCHA.");
       generateCaptcha();
       return;
    }

    setLoading(true);
    try {
      const trimmedEmail = email.trim();
      const res = await api.post('/auth/login/step1', { email: trimmedEmail, password });
      if(res.data.success) {
         setStep(2);
         if (res.data.prototypeOtp) {
            alert(`[PROTOTYPE MODE]\nYour OTP Code is: ${res.data.prototypeOtp}\n\n(In production, this strictly goes to email only)`);
         } else {
            alert("OTP has been dispatched to your registered email securely.");
         }
      }
    } catch(err: any) {
      alert("Login Failed: " + (err.response?.data?.msg || err.message));
      generateCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const trimmedEmail = email.trim();
      const res = await api.post('/auth/login/step2', { email: trimmedEmail, otp: otp.trim() });
      if(res.data.token) {
         localStorage.setItem('token', res.data.token);
         
         // Start Activity Session Timer (e.g. timeout on 15m)
         localStorage.setItem('session_start', Date.now().toString());

         alert("Authentication Verified! Redirecting to Secure Dashboard...");
         window.location.href = "/dashboard";
      }
    } catch(err: any) {
      alert("OTP Verification Failed: " + (err.response?.data?.msg || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <h2 className="mt-6 text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Authority & Citizen Portal
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Secure Authentication Gateway
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10">
          
          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleStep1}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300">Official Email</label>
                <div className="mt-2 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="block w-full pl-10 pr-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950/50 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                    placeholder="officer@smartcity.gov"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-zinc-300">Password</label>
                <div className="mt-2 relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="block w-full pl-10 pr-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950/50 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Bot Verification: What is {captchaParams.a} + {captchaParams.b}?
                </label>
                <input
                  type="number" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} required
                  className="block w-full px-3 py-2 border border-zinc-700 rounded-lg bg-zinc-900 text-zinc-100 focus:ring-blue-500/50 focus:border-blue-500/50 sm:text-sm"
                  placeholder="Answer"
                />
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Request Security OTP'}
              </button>
            </form>
          ) : (
            <motion.form 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6" 
              onSubmit={handleStep2}
            >
              <div className="text-center rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 mb-4">
                 <ShieldCheck className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                 <p className="text-sm font-medium text-blue-200">OTP Code Sent</p>
                 <p className="text-xs text-blue-300">Check your email for the 6-digit access code. It expires in 10 minutes.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300">Enter OTP</label>
                <div className="mt-2 relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6}
                    className="block w-full pl-10 pr-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950/50 text-zinc-100 focus:ring-blue-500/50 transition-all text-center tracking-widest text-lg font-mono"
                    placeholder="000000"
                  />
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-zinc-900 bg-emerald-400 hover:bg-emerald-300 transition-colors disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Secure Login'}
              </button>
              
              <p className="text-center text-xs text-zinc-500 mt-4 cursor-pointer hover:text-blue-400" onClick={() => setStep(1)}>
                 &larr; Back to Email/Password
              </p>
            </motion.form>
          )}

        </div>
      </motion.div>
    </div>
  );
}
