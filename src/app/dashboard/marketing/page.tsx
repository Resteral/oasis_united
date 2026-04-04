"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function FleetMarketingPage() {
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [business, setBusiness] = useState<any>(null);
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [headline, setHeadline] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [duration, setDuration] = useState('15');

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: biz } = await supabase
                .from('businesses')
                .select('*')
                .eq('owner_id', user.id)
                .single();

            if (biz) {
                setBusiness(biz);
                const { data: existingAds } = await supabase
                    .from('fleet_ads')
                    .select('*')
                    .eq('business_id', biz.id)
                    .order('created_at', { ascending: false });
                
                if (existingAds) setAds(existingAds);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    const handleAddAd = async () => {
        if (!headline || !business) return;

        const { data, error } = await supabase
            .from('fleet_ads')
            .insert([{
                business_id: business.id,
                headline,
                image_url: imageUrl,
                display_duration: parseInt(duration) || 15
            }])
            .select()
            .single();

        if (!error && data) {
            setAds([data, ...ads]);
            setIsAdding(false);
            setHeadline('');
            setImageUrl('');
        }
    };

    if (loading) return <div className="p-12 text-center animate-pulse">Loading Fleet Console...</div>;

    return (
        <div className="p-8 md:p-12 space-y-12 max-w-6xl mx-auto">
            <header className="flex justify-between items-end">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 border border-amber-400/20 rounded-full">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Regional Fleet Ready</span>
                    </div>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Fleet <span className="text-indigo-600">Marketing.</span></h1>
                    <p className="text-gray-500 font-medium italic text-lg leading-relaxed max-w-xl">Broadcast your Boutique highlights directly to in-car screens across the regional delivery network.</p>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-105 transition-all"
                >
                    {isAdding ? 'Cancel' : '+ New Campaign'}
                </button>
            </header>

            {isAdding && (
                <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dashboard Headline</label>
                            <input 
                                value={headline}
                                onChange={(e) => setHeadline(e.target.value)}
                                placeholder="e.g. Artisanal Coffee Served Fresh."
                                className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-indigo-500 font-bold italic"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Display Duration (Seconds)</label>
                            <select 
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold"
                            >
                                <option value="10">10 Seconds</option>
                                <option value="15">15 Seconds</option>
                                <option value="30">30 Seconds</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Background Creative (Image URL)</label>
                        <input 
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="Dashboard-optimized high-contrast image..."
                            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-mono text-xs"
                        />
                    </div>
                    <button 
                        onClick={handleAddAd}
                        className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl hover:bg-indigo-600 transition-all"
                    >
                        Activate Fleet Broadcast
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {ads.map((ad) => (
                    <div key={ad.id} className="relative group bg-gray-900 rounded-[3.5rem] overflow-hidden aspect-video shadow-2xl border border-white/5">
                        {ad.image_url && (
                             <img src={ad.image_url} alt="Ad" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                        <div className="relative h-full flex flex-col justify-end p-10 space-y-4">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-tight line-clamp-2">{ad.headline}</h3>
                                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em]">Campaign Active // {ad.display_duration}s Cycle</p>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${ad.is_active ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-gray-600'}`}></div>
                            </div>
                        </div>
                    </div>
                ))}
                {ads.length === 0 && !isAdding && (
                    <div className="col-span-full py-48 text-center bg-gray-50 rounded-[4rem] border-2 border-dashed border-gray-200 opacity-50">
                        <span className="text-6xl">📡</span>
                        <h3 className="mt-6 text-2xl font-black italic tracking-tighter uppercase">No Active Airwaves.</h3>
                        <p className="text-gray-400 font-medium italic">Your Boutique is currently silent on the regional fleet terminal.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
