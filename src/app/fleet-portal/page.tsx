"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Mocking some ads for the demo if none exist
const DEMO_ADS = [
    {
        id: '1',
        title: 'Oasis United Launch',
        description: 'Empowering the independent node.',
        image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1920&auto=format&fit=crop',
        business_name: 'Oasis Network',
        primary_color: '#4F46E5'
    },
    {
        id: '2',
        title: 'Neon Nights Cafe',
        description: 'Now open until 3AM in the core sector.',
        image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1920&auto=format&fit=crop',
        business_name: 'Neon Coffee',
        primary_color: '#EC4899'
    }
];

export default function FleetPortalMonitor() {
    const [ads, setAds] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAds() {
            // we will query the 'posts' table with a special 'ad' flag, or just use posts that are featured
            // For now, let's just grab featured products and turn them into ads dynamically for the demo
            const { data } = await supabase
                .from('products')
                .select('id, name, description, image_url, businesses(name, theme)')
                .eq('is_featured', true)
                .limit(5);

            if (data && data.length > 0) {
                    const formattedAds = data.map(p => {
                    const biz = Array.isArray(p.businesses) ? p.businesses[0] : p.businesses;
                    return {
                        id: p.id,
                        title: p.name,
                        description: p.description || 'Discover this asset on Oasis United.',
                        image_url: p.image_url,
                        business_name: biz?.name || 'Local Node',
                        primary_color: biz?.theme?.primaryColor || '#4F46E5'
                    };
                });
                setAds(formattedAds);
            } else {
                setAds(DEMO_ADS);
            }
            setLoading(false);
        }
        fetchAds();
    }, []);

    // Auto-scroll through ads
    useEffect(() => {
        if (ads.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % ads.length);
        }, 8000); // Rotate every 8 seconds
        return () => clearInterval(interval);
    }, [ads]);

    if (loading) return <div className="h-screen w-screen bg-black flex items-center justify-center text-white/20 font-black tracking-[0.5em] uppercase text-xs animate-pulse">Initializing Portal Node...</div>;

    const currentAd = ads[currentIndex];

    // High fidelity full-screen display for car monitors
    return (
        <div className="h-screen w-screen bg-black text-white overflow-hidden relative cursor-none select-none">
            {/* Transitioning Background */}
            {ads.map((ad, idx) => (
                <div 
                    key={ad.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${currentIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    <div className="absolute inset-0 bg-black/60 z-10"></div>
                    <img 
                        src={ad.image_url || DEMO_ADS[0].image_url} 
                        alt={ad.title} 
                        className={`w-full h-full object-cover transition-transform duration-[10000ms] ${currentIndex === idx ? 'scale-110' : 'scale-100'}`}
                    />
                    
                    {/* Grand Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
                    
                    {/* Brand Glow Overlay */}
                    <div 
                        className="absolute bottom-0 right-0 w-[800px] h-[800px] blur-[200px] rounded-full z-10 opacity-30 mix-blend-screen"
                        style={{ backgroundColor: ad.primary_color }}
                    ></div>
                </div>
            ))}

            {/* UI Overlay */}
            <div className="absolute inset-0 z-20 flex flex-col justify-between p-16 md:p-24">
                
                {/* Header (Status) */}
                <header className="flex justify-between items-center animate-in fade-in duration-1000">
                    <div className="flex items-center gap-4 px-6 py-3 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-full">
                        <span className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse"></span>
                        <span className="text-xs font-black uppercase tracking-[0.4em] text-white/60">Fleet Portal Uplink Active</span>
                    </div>
                    <div className="flex gap-2">
                        {ads.map((_, idx) => (
                            <div key={idx} className={`h-1.5 rounded-full transition-all duration-500 ${currentIndex === idx ? 'w-12 bg-white' : 'w-4 bg-white/20'}`}></div>
                        ))}
                    </div>
                </header>

                {/* Content (Title & Info) */}
                <main className="max-w-4xl space-y-10 animate-in slide-in-from-bottom-24 duration-1000">
                    <div className="space-y-6">
                        <div 
                            className="inline-block px-8 py-4 rounded-3xl backdrop-blur-3xl border bg-black/20"
                            style={{ borderColor: `${currentAd.primary_color}40`, color: currentAd.primary_color }}
                        >
                            <span className="text-sm font-black uppercase tracking-[0.5em] italic">{currentAd.business_name}</span>
                        </div>
                        <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.8] text-white drop-shadow-2xl">
                            {currentAd.title}
                        </h1>
                        <p className="text-2xl md:text-4xl font-medium italic text-white/80 leading-snug drop-shadow-lg max-w-3xl">
                            {currentAd.description}
                        </p>
                    </div>

                    <div className="pt-12">
                        <div className="inline-flex items-center gap-6 px-10 py-5 bg-white text-black rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform -rotate-1 hover:rotate-0 transition-transform">
                            <span className="text-xl font-black uppercase tracking-widest italic">Order on Oasis United Map</span>
                            <span className="text-3xl">📍</span>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
