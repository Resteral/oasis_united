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

    if (loading) return <div className="p-32 text-center text-white/30 font-black uppercase tracking-[0.5em] text-xs animate-pulse">Synchronizing Fleet Console...</div>;

    return (
        <div className="p-8 md:p-12 space-y-16 max-w-7xl mx-auto min-h-[80vh] bg-[#0a0a0b] text-white">
            {/* Header Matrix */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-3 px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Regional Screen Network</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.85]">Portal <br /><span className="text-indigo-500">Marketing.</span></h1>
                    <p className="text-white/40 font-medium italic text-xl leading-relaxed max-w-2xl">Broadcast your Boutique's premium assets directly to the digital side-screens of the decentralized logistics fleet.</p>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="px-10 py-5 bg-white text-black rounded-full font-black uppercase tracking-[0.3em] text-[10px] shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all italic"
                >
                    {isAdding ? 'Abort Campaign Setup' : '+ Setup Fleet Screen'}
                </button>
            </header>

            {/* Addition Terminal */}
            {isAdding && (
                <div className="bg-white/[0.02] p-12 md:p-16 rounded-[4.5rem] shadow-3xl border border-white/5 space-y-12 animate-in fade-in slide-in-from-top-8 duration-700 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none scale-150 rotate-12 group-hover:scale-110 transition-transform duration-1000">📺</div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] px-2 italic">Broadcast Headline</label>
                            <input 
                                value={headline}
                                onChange={(e) => setHeadline(e.target.value)}
                                placeholder="e.g. Neon Espresso Live until 4AM"
                                className="w-full p-8 bg-white/5 rounded-[2.5rem] border border-white/10 outline-none focus:border-indigo-500/50 font-black text-2xl italic tracking-tighter text-white uppercase placeholder:text-white/20 transition-all"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] px-2 italic">Exposure Time</label>
                            <select 
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full p-8 bg-white/5 rounded-[2.5rem] border border-white/10 outline-none font-black text-2xl italic tracking-tighter text-white uppercase appearance-none cursor-pointer focus:border-indigo-500/50 transition-all"
                            >
                                <option value="10" className="bg-[#0a0a0b]">10 Second Loop</option>
                                <option value="15" className="bg-[#0a0a0b]">15 Second Loop</option>
                                <option value="30" className="bg-[#0a0a0b]">30 Second Feature</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-4 relative z-10">
                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] px-2 italic">Cinematic Asset (Full Screen URL)</label>
                        <input 
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full p-8 bg-white/5 rounded-[2.5rem] border border-white/10 outline-none font-mono text-sm text-white/80 placeholder:text-white/20 focus:border-indigo-500/50 transition-all"
                        />
                    </div>
                    <button 
                        onClick={handleAddAd}
                        className="w-full py-8 bg-indigo-600 text-white rounded-[3rem] font-black uppercase tracking-[0.5em] text-xs shadow-3xl shadow-indigo-600/20 hover:scale-[1.01] active:scale-95 transition-all italic"
                    >
                        Activate Fleet Broadcast Uplink
                    </button>
                </div>
            )}

            {/* Campaign Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {ads.map((ad) => (
                    <div key={ad.id} className="relative group bg-[#0c0c0e] rounded-[4rem] overflow-hidden aspect-[4/3] shadow-3xl border border-white/5 hover:border-indigo-500/30 transition-all duration-700">
                        {ad.image_url && (
                             <img src={ad.image_url} alt="Ad Visual" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-1000" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                        <div className="relative h-full flex flex-col justify-end p-12 space-y-6">
                            <div className="flex justify-between items-end gap-6">
                                <div className="space-y-3">
                                    <h3 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase leading-none line-clamp-3 text-white drop-shadow-2xl">{ad.headline}</h3>
                                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em] italic drop-shadow-md">Loop: {ad.display_duration}s &bull; Operational</p>
                                </div>
                                <div className={`w-3 h-3 rounded-full shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.8)] ${ad.is_active !== false ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {ads.length === 0 && !isAdding && (
                <div className="col-span-full py-40 flex flex-col items-center justify-center bg-white/[0.01] rounded-[4.5rem] border border-dashed border-white/10 opacity-60 group hover:opacity-100 transition-opacity duration-700">
                    <span className="text-[100px] mb-8 filter grayscale group-hover:grayscale-0 transition-all duration-700 opacity-50 rotate-12">🛰️</span>
                    <h3 className="text-4xl font-black italic tracking-tighter uppercase text-white">Silent Node.</h3>
                    <p className="text-white/40 font-medium italic mt-2 text-lg">Your identity is not currently active on the regional fleet terminal.</p>
                </div>
            )}
        </div>
    );
}
