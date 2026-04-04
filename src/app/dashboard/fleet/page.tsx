"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import RouteMap from '@/components/RouteMap';

export default function FleetOperationsPage() {
    const [delivererProfile, setDelivererProfile] = useState<any | null>(null);
    const [routes, setRoutes] = useState<any[]>([]);
    const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
    const [routeStops, setRouteStops] = useState<any[]>([]);
    const [openOrders, setOpenOrders] = useState<any[]>([]);
    const [towns, setTowns] = useState<any[]>([]);
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTownModal, setShowTownModal] = useState(false);
    const [showRouteModal, setShowRouteModal] = useState(false);
    const [dutyHours, setDutyHours] = useState(4);
    const [currentTime, setCurrentTime] = useState(new Date());

    // New Town State
    const [newTown, setNewTown] = useState({ name: '', state: 'NH' });
    const [newRoute, setNewRoute] = useState({ name: '', stops: [] as string[] });

    const REGIONAL_SUGGESTIONS = ['Effingham', 'Freedom', 'Wolfeboro', 'Ossipee Lake', 'Sandwich', 'Tamworth', 'Madison', 'Eaton'];

    useEffect(() => {
        async function fetchInitialData() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // 1. Deliverer Profile
                const { data: profile } = await supabase.from('deliverer_profiles').select('*').eq('id', user.id).single();
                if (!profile) {
                    // Auto-provision profile if it doesn't exist
                    const { data: newProfile } = await supabase.from('deliverer_profiles').insert([{ id: user.id }]).select().single();
                    setDelivererProfile(newProfile);
                } else {
                    setDelivererProfile(profile);
                }

                // 2. Load Logistics Data
                const [rResp, tResp, bResp, oResp] = await Promise.all([
                    supabase.from('delivery_routes').select('*').eq('deliverer_id', user.id),
                    supabase.from('towns').select('*').order('name'),
                    supabase.from('businesses').select('*').order('name'),
                    supabase.from('orders').select('*, businesses(name)').eq('status', 'pending').eq('delivery_type', 'delivery')
                ]);

                setRoutes(rResp.data || []);
                setTowns(tResp.data || []);
                setBusinesses(bResp.data || []);
                setOpenOrders(oResp.data || []);
                
                if (rResp.data && rResp.data.length > 0) {
                    setSelectedRouteId(rResp.data[0].id);
                }
            }
            setLoading(false);
        }
        fetchInitialData();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleCreateTown = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { error } = await supabase.from('towns').insert([{ ...newTown, added_by: user.id }]);
        if (error) alert(error.message);
        else {
            setShowTownModal(false);
            setNewTown({ name: '', state: 'NH' });
            alert('🏘️ Municipal Node Provisioned Successfully.');
        }
    };

    const handleCreateRoute = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: route, error } = await supabase.from('delivery_routes').insert([{ name: newRoute.name, deliverer_id: user.id }]).select().single();
        if (route) {
            const stopsToInsert = newRoute.stops.map((bizId, index) => ({
                route_id: route.id,
                business_id: bizId,
                order_index: index
            }));
            await supabase.from('route_stops').insert(stopsToInsert);
            setRoutes([...routes, route]);
            setShowRouteModal(false);
            alert('🛰️ Logistics Loop Synchronized.');
        } else alert(error?.message);
    };

    const claimOrder = async (orderId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from('orders').update({ deliverer_id: user?.id, status: 'processing' }).eq('id', orderId);
        if (!error) {
            setOpenOrders(openOrders.filter(o => o.id !== orderId));
            alert('📦 Delivery Claimed. Provisioning pickup path...');
        }
    };

    const goActive = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const activeUntil = new Date();
        activeUntil.setHours(activeUntil.getHours() + dutyHours);
        const { error } = await supabase.from('deliverer_profiles').update({ is_active: true, status: 'available', active_until: activeUntil.toISOString() }).eq('id', user.id);
        if (!error) {
            setDelivererProfile({ ...delivererProfile, is_active: true, status: 'available', active_until: activeUntil.toISOString() });
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center animate-pulse">
            <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.5em] italic">Syncing Fleet Hub...</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white p-10 md:p-20 space-y-20 selection:bg-amber-400 selection:text-black">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 italic">Regional Fleet Terminal</span>
                    </div>
                    <h1 className="text-7xl font-black italic tracking-tighter uppercase leading-[0.8]">Logistics <br /><span className="text-amber-400">Radar.</span></h1>
                </div>

                <div className="flex flex-wrap gap-4">
                    <button 
                        onClick={() => setShowTownModal(true)}
                        className="px-8 py-5 bg-white/5 border border-white/10 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all border-b-4 border-b-white/5 active:translate-y-1"
                    >
                        🏘️ Register Town
                    </button>
                    <button 
                        onClick={() => setShowRouteModal(true)}
                        className="px-8 py-5 bg-indigo-600 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 border-b-4 border-b-indigo-800 active:translate-y-1"
                    >
                        🛰️ Draft New Route
                    </button>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                {/* Discovery Radar Grid */}
                <section className="lg:col-span-8 space-y-12">
                    <RouteMap stops={routeStops} />
                    
                    {/* Open Dispatch Queue */}
                    <div className="space-y-8">
                        <div className="flex justify-between items-center px-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-400 italic">Open Dispatch Queue</h3>
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest italic">{openOrders.length} Ready for Pickup</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {openOrders.length > 0 ? openOrders.map(order => (
                                <div key={order.id} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-6 group hover:border-amber-400/20 transition-all">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h4 className="text-xl font-black italic tracking-tighter uppercase text-white/80">{order.businesses?.name}</h4>
                                            <p className="text-[9px] font-black uppercase text-white/20 tracking-widest">Order {order.id.slice(0, 8)}</p>
                                        </div>
                                        <div className="px-3 py-1 bg-amber-400/10 text-amber-500 rounded-full text-[9px] font-black italic uppercase">Ready</div>
                                    </div>
                                    <div className="flex justify-between items-end border-t border-white/5 pt-6">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase text-white/20">Destination</p>
                                            <p className="text-xs font-bold text-white/60 truncate max-w-[150px]">{order.address}</p>
                                        </div>
                                        <button 
                                            onClick={() => claimOrder(order.id)}
                                            className="px-6 py-3 bg-amber-400 text-black rounded-2xl font-black text-[9px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                                        >
                                            Claim & Pick Up
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full p-20 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem] text-white/10 font-black italic uppercase tracking-widest">
                                    Queue Clear. Awaiting regional pickup signals.
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Tactical Controls & Timing */}
                <section className="lg:col-span-4 space-y-12">
                    <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 space-y-8">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">Active Loop Control</h3>
                        <select 
                            value={selectedRouteId || ''} 
                            onChange={(e) => setSelectedRouteId(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-xl font-black italic tracking-tighter uppercase text-amber-400 focus:border-amber-400 outline-none transition-all shadow-xl appearance-none cursor-pointer"
                        >
                            <option value="" disabled>Select Logistics Path</option>
                            {routes.map(r => (
                                <option key={r.id} value={r.id} className="bg-[#0a0a0b]">{r.name}</option>
                            ))}
                        </select>
                        
                        <div className="space-y-6 pt-4">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/20">
                                <span>Duty commitment</span>
                                <span className={dutyHours > 0 ? 'text-amber-400' : ''}>{dutyHours} HRS LOCK</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {[2, 4, 8].map(h => (
                                    <button 
                                        key={h}
                                        onClick={() => setDutyHours(h)}
                                        className={`py-3 rounded-xl font-black text-[10px] transition-all ${dutyHours === h ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}
                                    >
                                        {h} HR
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={goActive}
                                className="w-full py-8 bg-indigo-600 rounded-[2rem] font-black italic text-sm tracking-tighter uppercase text-white shadow-2xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                🛰️ Start Active Route Loop
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 grayscale">📡</div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Marketing Uplink (Car Ads)</h3>
                        <p className="text-sm font-black italic text-white/40 leading-relaxed uppercase tracking-tighter">Monetize your transit path. Local businesses can bid for digital ad slots on your active fleet terminal.</p>
                        <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white/30 hover:bg-indigo-600 hover:text-white transition-all">
                            Open Marketing Terminal →
                        </button>
                    </div>
                </section>
            </main>

            {/* MODALS */}
            {showTownModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-2xl bg-black/60">
                    <div className="bg-[#111114] border border-white/10 p-12 rounded-[3.5rem] w-full max-w-lg space-y-10 shadow-3xl animate-in zoom-in duration-300">
                        <header className="space-y-2">
                            <h2 className="text-4xl font-black italic tracking-tighter uppercase">Provision <span className="text-amber-400">Town Node.</span></h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Establishing Municipal Authority Hub</p>
                        </header>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-indigo-400 pl-1 italic">Suggested Regional Nodes</label>
                                <div className="flex flex-wrap gap-2">
                                    {REGIONAL_SUGGESTIONS.map(t => (
                                        <button 
                                            key={t}
                                            onClick={() => setNewTown({...newTown, name: t})}
                                            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase hover:bg-amber-400 hover:text-black transition-all"
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <input 
                                placeholder="Town Name (e.g. Ossipee Lake)" 
                                className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl font-black italic text-xl outline-none focus:border-amber-400/50"
                                value={newTown.name}
                                onChange={(e) => setNewTown({...newTown, name: e.target.value})}
                            />
                            <select 
                                className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl font-black italic text-xl outline-none appearance-none"
                                value={newTown.state}
                                onChange={(e) => setNewTown({...newTown, state: e.target.value})}
                            >
                                <option value="NH">New Hampshire (CORE)</option>
                                <option value="ME">Maine</option>
                            </select>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setShowTownModal(false)} className="flex-1 py-5 bg-white/5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white/30">Abort</button>
                            <button onClick={handleCreateTown} className="flex-[2] py-5 bg-amber-400 rounded-2xl font-black text-[10px] uppercase tracking-widest text-black shadow-xl shadow-amber-400/20">Establish Node</button>
                        </div>
                    </div>
                </div>
            )}

            {showRouteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-2xl bg-black/60">
                    <div className="bg-[#111114] border border-white/10 p-12 rounded-[3.5rem] w-full max-w-2xl space-y-10 shadow-3xl animate-in zoom-in duration-300">
                        <header className="space-y-2">
                            <h2 className="text-4xl font-black italic tracking-tighter uppercase">Sync <span className="text-indigo-400">Trade Loop.</span></h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Drafting Regional Logistics Path</p>
                        </header>
                        <div className="space-y-8">
                            <input 
                                placeholder="Route Name (e.g. Lakeshore Delivery)" 
                                className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl font-black italic text-xl outline-none focus:border-indigo-400/50"
                                onChange={(e) => setNewRoute({...newRoute, name: e.target.value})}
                            />
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 pl-1 italic">Assign Store Stops (Node Matrix)</p>
                                <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto p-2 scrollbar-hide">
                                    {businesses.map(biz => (
                                        <button 
                                            key={biz.id} 
                                            onClick={() => {
                                                const exists = newRoute.stops.includes(biz.id);
                                                setNewRoute({
                                                    ...newRoute,
                                                    stops: exists ? newRoute.stops.filter(id => id !== biz.id) : [...newRoute.stops, biz.id]
                                                });
                                            }}
                                            className={`p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                                                newRoute.stops.includes(biz.id) ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
                                            }`}
                                        >
                                            <span className="text-xs font-black italic uppercase tracking-tight">{biz.name}</span>
                                            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">{biz.category}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setShowRouteModal(false)} className="flex-1 py-5 bg-white/5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white/30">Abort</button>
                            <button onClick={handleCreateRoute} className="flex-[2] py-5 bg-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl shadow-indigo-600/20">Draft Path</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
