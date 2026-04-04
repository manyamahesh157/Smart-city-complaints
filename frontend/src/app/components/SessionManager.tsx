"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function SessionManager() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Exclude public paths from session management
    if (pathname === '/login' || pathname === '/') return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // Set to 15 minutes (900000 ms) idle timeout
      timeoutId = setTimeout(() => {
        const token = localStorage.getItem('token');
        if (token) {
           localStorage.removeItem('token');
           localStorage.removeItem('session_start');
           alert('Session expired due to inactivity. Please login again.');
           router.push('/login');
        }
      }, 900000); 
    };

    // Attach listeners for activity
    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    
    // Initial setup
    const token = localStorage.getItem('token');
    if (token) {
      resetTimer();
      events.forEach(event => window.addEventListener(event, resetTimer));
    }

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [pathname, router]);

  return null; // Headless component
}
