"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function FleetAdTicker() {
    const [ads, setAds] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        async function fetchAds() {
            const { data } = await supabase
                .from('fleet_ads')
                .select('*, businesses(name, category)')
                .eq('is_active', true);
            
            if (data) setAds(data);
        }
        fetchAds();

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (ads.length > 0 ? (prev + 1) % ads.length : 0));
        }, 15000); // 15s rotation

        return () => clearInterval(interval);
    }, [ads.length]);

    const activeAd = ads[currentIndex];

    const getTimeRemaining = (expiryDate: string) => {
        const total = Date.parse(expiryDate) - Date.parse(new Date().toString());
        const days = Math.floor(total / (1000 * 60 * 60 * 24));
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        return { days, hours, minutes };
    };

    if (!activeAd) return null;

    const time = getTimeRemaining(activeAd.campaign_expires_at);

    return (
        <div className="bg-amber-400 p-8 rounded-[3rem] text-black space-y-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 grayscale group-hover:grayscale-0 group-hover:opacity-30 transition-all">
                <span className="text-6xl italic font-black">🚐</span>
            </div>
            
            <div className="space-y-2 relative z-10">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Fleet Ad Network</span>
                    <div className="flex items-center gap-2 px-3 py-1 bg-black text-amber-400 rounded-full">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                        <span className="text-[8px] font-black uppercase tracking-widest">
                            Ends in {time.days}d {time.hours}h {time.minutes}m
                        </span>
                    </div>
                </div>
                <h3 className="text-2xl font-black italic tracking-tighter leading-none uppercase">{activeAd.headline}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Partnered Node: {activeAd.businesses?.name}</p>
            </div>

            <div className="pt-4 border-t border-black/10 flex justify-between items-end relative z-10">
                <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">Campaign Clock</span>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={`h-1 w-4 rounded-full ${i <= (5 - Math.floor(currentIndex/2)) ? 'bg-black' : 'bg-black/10'}`}></div>
                        ))}
                    </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest border-b-2 border-black inline-block">Broadcast Live →</span>
            </div>
        </div>
    );
}
