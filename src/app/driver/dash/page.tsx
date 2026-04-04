"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function FleetTerminalPage() {
    const [ads, setAds] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        async function loadAds() {
            const { data } = await supabase
                .from('fleet_ads')
                .select('*, businesses(name)')
                .eq('is_active', true);
            
            if (data && data.length > 0) {
                setAds(data);
            }
            setLoading(false);
        }
        loadAds();
    }, []);

    useEffect(() => {
        if (ads.length === 0) return;

        const currentAd = ads[currentIndex];
        const duration = (currentAd.display_duration || 15) * 1000;
        
        let startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = (elapsed / duration) * 100;
            
            if (newProgress >= 100) {
                setProgress(0);
                setCurrentIndex((prev) => (prev + 1) % ads.length);
                clearInterval(interval);
            } else {
                setProgress(newProgress);
            }
        }, 50);

        return () => clearInterval(interval);
    }, [ads, currentIndex]);

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-white font-black animate-pulse uppercase tracking-[0.5em] text-xs">Calibrating Fleet Display...</div>
        </div>
    );

    if (ads.length === 0) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-20 text-center space-y-10">
            <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center grayscale opacity-20">📡</div>
            <div className="space-y-4">
                <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">Terminal Standby.</h1>
                <p className="text-gray-600 font-medium text-lg leading-relaxed italic max-w-sm mx-auto">No active fleet campaigns detected in this regional node. Return to command center.</p>
            </div>
        </div>
    );

    const activeAd = ads[currentIndex];

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden cursor-none select-none">
            {/* Background Image / Creative */}
            <div className="absolute inset-0 z-0">
                {activeAd.image_url ? (
                    <img 
                        key={activeAd.id}
                        src={activeAd.image_url} 
                        alt="Ad Creative" 
                        className="w-full h-full object-cover opacity-60 animate-in fade-in zoom-in duration-1000"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-950 to-black"></div>
                )}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
            </div>

            {/* In-Car HUD Layers */}
            <div className="relative z-10 h-full flex flex-col justify-between p-12 md:p-24 overflow-hidden">
                {/* Top Telemetry */}
                <header className="flex justify-between items-start animate-in slide-in-from-top-8 duration-700">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-black uppercase tracking-[0.3em] text-white/60">Oasis Fleet Terminal</span>
                        </div>
                        <h2 className="text-2xl font-black italic tracking-tighter uppercase">{activeAd.businesses?.name}</h2>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-black italic tracking-tighter leading-none mb-1">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">NE-9482 // EFFINGHAM NODE</div>
                    </div>
                </header>

                {/* Main Creative Text */}
                <main className="flex-1 flex flex-col justify-center max-w-5xl animate-in zoom-in-95 duration-1000">
                    <div className="space-y-8">
                        <div className="px-6 py-2 bg-indigo-600 w-fit rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-2xl">
                            BOUTIQUE HIGHLIGHT
                        </div>
                        <h3 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.9]">
                            {activeAd.headline}
                        </h3>
                        <p className="text-2xl font-medium text-white/60 italic max-w-2xl leading-relaxed">
                            Discover artisanal treasures and essential neighborhood staples at {activeAd.businesses?.name}.
                        </p>
                    </div>
                </main>

                {/* Footer / Progress */}
                <footer className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="flex justify-between items-end">
                        <div className="flex gap-8">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Next Signal In</p>
                                <p className="text-2xl font-black italic tracking-tighter">{(activeAd.display_duration * (1 - progress/100)).toFixed(0)}s</p>
                            </div>
                            <div className="space-y-1 border-l border-white/10 pl-8">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Nearby Station</p>
                                <p className="text-2xl font-black italic tracking-tighter">PNB Eats (0.4mi)</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-4">
                            <div className="w-[300px] h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 transition-all duration-75" style={{ width: `${progress}%` }}></div>
                            </div>
                            <div className="flex gap-4">
                                {ads.map((_, i) => (
                                    <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-indigo-500 scale-125' : 'bg-white/20'}`}></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-10 flex justify-between items-center opacity-40">
                        <div className="text-[9px] font-black uppercase tracking-[0.4em]">Autonomous Retail Navigation // v1.0.17</div>
                        <div className="flex gap-10">
                            <span className="text-[9px] font-black uppercase tracking-widest">LTE+ 📡</span>
                            <span className="text-[9px] font-black uppercase tracking-widest">GPS SECURE 📍</span>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Scanner Visual Overlay */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-indigo-500/30 blur-sm animate-[scan_10s_infinite_linear]"></div>
            <style jsx global>{`
                @keyframes scan {
                    0% { top: 0; }
                    100% { top: 100vh; }
                }
            `}</style>
        </div>
    );
}
