"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import RouteMap from '@/components/RouteMap';

export default function FleetOperationsPage() {
    const [delivererProfile, setDelivererProfile] = useState<any | null>(null);
    const [routes, setRoutes] = useState<any[]>([]);
    const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
    const [routeStops, setRouteStops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFleetData() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Fetch deliverer profile
                const { data: profile } = await supabase.from('deliverer_profiles').select('*').eq('id', user.id).single();
                if (profile) {
                    setDelivererProfile(profile);
                    
                    // Fetch routes
                    const { data: fleetRoutes } = await supabase.from('delivery_routes').select('*').eq('deliverer_id', user.id).eq('is_active', true);
                    setRoutes(fleetRoutes || []);
                    if (fleetRoutes && fleetRoutes.length > 0) {
                        setSelectedRouteId(fleetRoutes[0].id);
                    }
                }
            }
            setLoading(false);
        }
        fetchFleetData();
    }, []);

    useEffect(() => {
        if (!selectedRouteId) return;
        async function fetchStops() {
            const { data: stops, error } = await supabase.rpc('get_route_stops', { p_route_id: selectedRouteId });
            if (!error) setRouteStops(stops || []);
            else console.error('Error fetching route stops:', error);
        }
        fetchStops();
    }, [selectedRouteId]);

    if (loading) return (
        <div className="min-h-screen p-20 flex items-center justify-center animate-pulse">
            <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.5em] italic">Syncing Fleet Hub...</span>
        </div>
    );

    if (!delivererProfile) return (
        <div className="min-h-screen flex items-center justify-center p-20 text-center">
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white/40 leading-none">Fleet Access Required <br /><span className="text-xl font-normal text-white/10 uppercase tracking-widest mt-4 inline-block italic">Verify regional agent status via the Hub.</span></h1>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white p-10 md:p-20 space-y-20 selection:bg-amber-400 selection:text-black">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Logistics Operations Hub</span>
                    </div>
                    <h1 className="text-7xl font-black italic tracking-tighter uppercase leading-none">Oasis <br /><span className="text-amber-400">Fleet Route.</span></h1>
                </div>

                <div className="bg-white/5 backdrop-blur-3xl px-10 py-8 rounded-[3rem] border border-white/5 min-w-[320px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 grayscale group-hover:rotate-12 transition-transform">🛰️</div>
                    <div className="relative z-10 space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic">Target Logistics Path</span>
                        <select 
                            value={selectedRouteId || ''} 
                            onChange={(e) => setSelectedRouteId(e.target.value)}
                            className="w-full bg-[#111114] border border-white/10 rounded-2xl p-4 text-xs font-black uppercase text-amber-400 focus:border-amber-400 outline-none transition-all shadow-xl appearance-none"
                        >
                            {routes.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                        <p className="text-[9px] font-black uppercase text-white/20 tracking-widest pl-1 italic">Active Regional Loop Authorization</p>
                    </div>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                {/* Discovery Radar Grid */}
                <section className="lg:col-span-8">
                    <RouteMap stops={routeStops} />
                </section>

                {/* Tactical Stop List */}
                <section className="lg:col-span-4 space-y-12">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-400 italic">Route Itinerary Nodes</h3>
                    <div className="space-y-6">
                        {routeStops.length > 0 ? routeStops.map((stop, i) => (
                            <div key={stop.id} className="group bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 flex items-center gap-6 hover:border-amber-400/20 hover:bg-white/[0.04] transition-all">
                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-2xl font-black italic shadow-xl text-white/20 group-hover:text-amber-400 transition-colors">
                                    {String(i + 1).padStart(2, '0')}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h4 className="text-2xl font-black italic tracking-tighter uppercase leading-none group-hover:text-white transition-colors text-white/80">{stop.name}</h4>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20 italic">{stop.category} Node &bull; {stop.location}</p>
                                </div>
                                <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                    Verified Stop
                                </div>
                            </div>
                        )) : (
                            <div className="p-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem] space-y-6">
                                <span className="text-5xl opacity-10 grayscale italic font-black">??</span>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 leading-relaxed italic">No retail stops found in this logistics loop. Browse the marketplace to add regional collection points.</p>
                            </div>
                        )}
                    </div>

                    {routeStops.length > 0 && (
                        <button className="w-full py-8 bg-amber-400 text-black rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-3xl shadow-amber-400/20">
                            🚀 Dispatch Active Loop
                        </button>
                    )}
                </section>
            </main>
        </div>
    );
}
