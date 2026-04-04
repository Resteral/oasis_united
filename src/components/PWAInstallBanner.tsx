"use client";
import { useEffect, useState } from 'react';

export default function PWAInstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleReady = () => setShow(true);
    window.addEventListener('oasis_pwa_ready', handleReady);
    return () => window.removeEventListener('oasis_pwa_ready', handleReady);
  }, []);

  const handleInstall = async () => {
    const prompt = (window as any).deferredPrompt;
    if (!prompt) return;
    prompt.prompt();
    const result = await prompt.userChoice;
    if (result.outcome === 'accepted') {
      console.log('Oasis Deployed to Citizen Core');
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-8 right-8 z-[100] animate-in slide-in-from-bottom-32 duration-1000">
      <div className="bg-indigo-600 rounded-[3rem] p-4 flex items-center justify-between shadow-3xl shadow-indigo-900/40 border border-white/20 backdrop-blur-xl">
        <div className="flex items-center gap-6 px-4">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-3xl">🧭</div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 leading-none mb-1">Native Access</span>
            <span className="text-sm font-black italic text-white tracking-tight">Deploy Oasis to Homescreen?</span>
          </div>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setShow(false)} className="px-6 py-4 bg-black/20 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black/30 transition-all">Later</button>
            <button onClick={handleInstall} className="px-8 py-4 bg-white text-indigo-600 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">Deploy Now</button>
        </div>
      </div>
    </div>
  );
}
