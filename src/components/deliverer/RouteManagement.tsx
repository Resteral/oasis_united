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

    useEffect(() => {
        fetchMyNetwork();
    }, []);

    // Fetch businesses when town changes
    useEffect(() => {
        if (!townId) {
            setBusinesses([]);
            return;
        }
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

        const { error } = await supabase.from('delivery_routes').insert([{
            deliverer_id: user.id,
            town_id: townId,
            name,
            stops: filteredStops
        }]);

        if (!error) {
            setName('');
            setStops([]);
            fetchMyNetwork();
        }
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
            <div className="xl:col-span-2 space-y-12">
                <section className="space-y-8 bg-white/[0.02] border border-white/5 p-12 rounded-[3.5rem] shadow-3xl">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-400/10 border border-indigo-400/20 rounded-full">
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Logistics Hub</span>
                        </div>
                        <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Map Your <br />Routes.</h2>
                        <p className="text-gray-400 text-sm font-medium max-w-sm">Define custom delivery paths within your registered territories.</p>
                    </div>

                    <form onSubmit={handleCreateRoute} className="space-y-8 mt-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 ml-4">Select Town</label>
                                <select 
                                    required
                                    value={townId}
                                    onChange={(e) => setTownId(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-white/20 font-bold text-white"
                                >
                                    <option value="" className="bg-[#0c0c0e]">-- Choose Target --</option>
                                    {towns.map(t => <option key={t.id} value={t.id} className="bg-[#0c0c0e]">{t.name}, {t.state}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 ml-4">Route Name</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="Morning Coffee Run"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-white/20 font-bold text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 ml-4">Discovery Stops (Registered Businesses)</label>
                            {stops.map((stop, idx) => (
                                <select 
                                    key={idx}
                                    required
                                    value={stop.id}
                                    onChange={(e) => updateStop(e.target.value, idx)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-bold text-white"
                                >
                                    <option value="" className="bg-[#0c0c0e]">-- Select Store --</option>
                                    {businesses.map(b => <option key={b.id} value={b.id} className="bg-[#0c0c0e]">{b.name}</option>)}
                                </select>
                            ))}
                            <button 
                                type="button" 
                                onClick={addStop}
                                disabled={!townId}
                                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-2 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-30"
                            >
                                ➕ Add Sequence Stop
                            </button>
                        </div>

                        <button className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-900/20">
                            Establish Deployment Route
                        </button>
                    </form>
                </section>
            </div>

            <aside className="space-y-8">
                <div className="space-y-4 px-4">
                    <h3 className="text-xl font-black italic tracking-tighter uppercase uppercase leading-none">Active <br />Deployments.</h3>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">My Network Status</p>
                </div>

                <div className="space-y-4">
                    {routes.map(r => (
                        <div key={r.id} className="bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] space-y-4 group hover:bg-indigo-600/5 transition-all duration-700">
                             <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h4 className="font-black italic text-lg tracking-tight uppercase leading-none">{r.name}</h4>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400/60">{r.towns?.name}</p>
                                </div>
                                <span className={r.is_active ? "w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "w-2 h-2 bg-gray-600 rounded-full"}></span>
                             </div>
                             <div className="flex flex-wrap gap-2 pt-2">
                                {r.stops?.map((s: any, i: number) => (
                                    <span key={i} className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-white/5 rounded-md border border-white/5">{s.name || s}</span>
                                ))}
                             </div>
                        </div>
                    ))}
                    {routes.length === 0 && (
                        <div className="p-12 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[2.5rem] opacity-30 italic font-medium">
                            No dispatch routes established.
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
}
