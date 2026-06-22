"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function RouteManagement() {
    const [towns, setTowns] = useState<any[]>([]);
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [routes, setRoutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [name, setName] = useState('');
    const [townId, setTownId] = useState('');
    const [stops, setStops] = useState<{id: string, name: string}[]>([]);
    
    const fetchMyNetwork = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: myTowns } = await supabase.from('towns').select('*').eq('added_by', user.id);
        const { data: myRoutes } = await supabase.from('delivery_routes').select('*, towns(name)').eq('deliverer_id', user.id);
        setTowns(myTowns || []);
        setRoutes(myRoutes || []);
        setLoading(false);
    };

    useEffect(() => { fetchMyNetwork(); }, []);

    useEffect(() => {
        if (!townId) { setBusinesses([]); return; }
        async function fetchBusinesses() {
            const { data } = await supabase.from('businesses').select('id, name').eq('town_id', townId);
            setBusinesses(data || []);
        }
        fetchBusinesses();
    }, [townId]);

    const addStop = () => setStops([...stops, {id: '', name: ''}]);
    const updateStop = (bizId: string, idx: number) => {
        const biz = businesses.find(b => b.id === bizId);
        if (!biz) return;
        const newStops = [...stops];
        newStops[idx] = { id: biz.id, name: biz.name };
        setStops(newStops);
    };

    const handleCreateRoute = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const filteredStops = stops.filter(s => s.id !== '');
        const { error } = await supabase.from('delivery_routes').insert([{ deliverer_id: user.id, town_id: townId, name, stops: filteredStops }]);
        if (!error) { setName(''); setStops([]); fetchMyNetwork(); }
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            
            {/* 🏗️ ROUTE ESTABLISHMENT TERMINAL */}
            <div className="xl:col-span-7 space-y-12">
                <section className="bg-white/[0.02] border border-white/5 p-12 md:p-16 rounded-[4.5rem] shadow-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none scale-150 rotate-45 group-hover:scale-125 transition-transform duration-1000">🗺️</div>
                    
                    <div className="space-y-8 relative z-10">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-3 px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Route Deployment Uplink</span>
                            </div>
                            <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none text-white whitespace-nowrap">Map Your <br /><span className="text-indigo-500">Deployments.</span></h2>
                            <p className="text-white/40 font-medium text-lg italic max-w-sm">Establish custom logistical paths within your specific regional territories.</p>
                        </div>

                        <form onSubmit={handleCreateRoute} className="space-y-12 mt-16 pb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic px-2">Regional Hub Target</label>
                                    <select 
                                        required
                                        value={townId}
                                        onChange={(e) => setTownId(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-8 focus:border-indigo-500/50 outline-none transition-all font-black text-2xl italic tracking-tighter text-white appearance-none cursor-pointer uppercase"
                                    >
                                        <option value="" className="bg-[#0a0a0b]">Select Regional Node</option>
                                        {towns.map(t => <option key={t.id} value={t.id} className="bg-[#0a0a0b]">{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic px-2">Deployment Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="MORNING_CORE_LOOP"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-8 focus:border-indigo-500/50 outline-none transition-all placeholder:text-white/5 font-black text-2xl italic tracking-tighter text-white uppercase"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 italic px-2">Node Sequence (Discovery Stops)</label>
                                <div className="space-y-4">
                                    {stops.map((stop, idx) => (
                                        <div key={idx} className="flex gap-4 animate-in slide-in-from-right-4 duration-500">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black italic text-white/40 shrink-0">0{idx + 1}</div>
                                            <select 
                                                required
                                                value={stop.id}
                                                onChange={(e) => updateStop(e.target.value, idx)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-indigo-500/50 outline-none transition-all font-bold text-white uppercase tracking-tight italic"
                                            >
                                                <option value="" className="bg-[#0a0a0b]">Select Boutique Node</option>
                                                {businesses.map(b => <option key={b.id} value={b.id} className="bg-[#0a0a0b]">{b.name}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    type="button" 
                                    onClick={addStop}
                                    disabled={!townId}
                                    className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-4 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all disabled:opacity-20 italic"
                                >
                                    ➕ ADD_SEQUENCE_NODE
                                </button>
                            </div>

                            <button className="w-full py-8 md:py-10 bg-indigo-600 text-white rounded-[3rem] font-black uppercase tracking-[0.5em] text-xs hover:scale-[1.01] active:scale-95 transition-all shadow-3xl shadow-indigo-600/20 italic">
                                Activate Deployment Route
                            </button>
                        </form>
                    </div>
                </section>
            </div>

            {/* 🚥 ACTIVE DEPLOYMENTS SIDEBAR */}
            <div className="xl:col-span-5 space-y-12">
                <div className="space-y-3 px-4 border-b border-white/5 pb-8">
                    <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-white">Active <br />Deployments.</h3>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] italic">Operational Network Loop</p>
                </div>

                <div className="space-y-6">
                    {routes.map(r => (
                        <div key={r.id} className="relative p-10 bg-white/[0.02] border border-white/5 rounded-[4rem] group hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all duration-700 shadow-3xl overflow-hidden">
                             <div className="absolute top-0 right-0 p-10 opacity-[0.03] scale-150 group-hover:scale-110 transition-transform duration-1000 rotate-12">🏁</div>
                             <div className="flex justify-between items-start relative z-10">
                                <div className="space-y-2">
                                    <h4 className="font-black italic text-2xl tracking-tighter uppercase text-white leading-none whitespace-nowrap overflow-hidden text-ellipsis">{r.name}</h4>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400/60 italic">{r.towns?.name}</p>
                                </div>
                                <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)] ${r.is_active ? 'bg-indigo-500 animate-pulse' : 'bg-white/10'}`}></div>
                             </div>
                             <div className="flex flex-wrap gap-2 pt-8 relative z-10">
                                {r.stops?.map((s: any, i: number) => (
                                    <span key={i} className="text-[8px] font-black uppercase tracking-widest px-4 py-2 bg-white/5 rounded-2xl border border-white/5 text-white/40 italic group-hover:border-indigo-400/20 group-hover:text-white transition-all">
                                        {s.name || s}
                                    </span>
                                ))}
                             </div>
                        </div>
                    ))}
                    {routes.length === 0 && (
                        <div className="p-20 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[4.5rem] opacity-20 italic font-medium text-xl">
                            No dispatch routes established.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
