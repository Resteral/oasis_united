"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function RouteArchitectPage() {
    const [towns, setTowns] = useState<any[]>([]);
    const [selectedTownId, setSelectedTownId] = useState<string | null>(null);
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [routes, setRoutes] = useState<any[]>([]);
    const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        async function loadInitialData() {
            setLoading(true);
            const { data: townList } = await supabase.from('towns').select('*').order('name');
            setTowns(townList || []);
            
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: fleetRoutes } = await supabase.from('delivery_routes').select('*').eq('deliverer_id', user.id);
                setRoutes(fleetRoutes || []);
                if (fleetRoutes && fleetRoutes.length > 0) setSelectedRouteId(fleetRoutes[0].id);
            }
            setLoading(false);
        }
        loadInitialData();
    }, []);

    const scanTown = async () => {
        if (!selectedTownId) return;
        setScanning(true);
        const { data: bizList } = await supabase
            .from('businesses')
            .select('*, towns(name)')
            .eq('town_id', selectedTownId);
        setBusinesses(bizList || []);
        setScanning(false);
    };

    const addStopToRoute = async (bizId: string) => {
        if (!selectedRouteId) return;
        const { error } = await supabase.rpc('add_stop_to_route', { 
            p_route_id: selectedRouteId, 
            p_business_id: bizId 
        });
        if (error) alert('Protocol Failure: Node Link Aborted.');
        else alert('🛰️ Municipal Node linked to Logistics Loop!');
    };

    if (loading) return (
        <div className="min-h-screen p-20 flex items-center justify-center animate-pulse bg-[#0a0a0b] text-white">
            <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.5em] italic">Syncing Regional Architect Hub...</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white p-10 md:p-20 space-y-20 selection:bg-indigo-500 selection:text-white">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                <div className="space-y-4">
                    <Link href="/dashboard/fleet" className="text-[10px] font-black uppercase text-white/30 tracking-widest hover:text-white transition-colors">← Back to Fleet Dashboard</Link>
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-400/10 border border-amber-400/20 rounded-full">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Logistics Architect Console</span>
                    </div>
                    <h1 className="text-7xl font-black italic tracking-tighter uppercase leading-none">Route <br /><span className="text-white/40 italic">Sync Engine.</span></h1>
                </div>

                <div className="bg-white/5 backdrop-blur-3xl px-10 py-8 rounded-[3rem] border border-white/5 min-w-[320px] relative overflow-hidden">
                    <div className="space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic">Active Logistics Matrix</span>
                        <select 
                            value={selectedRouteId || ''} 
                            onChange={(e) => setSelectedRouteId(e.target.value)}
                            className="w-full bg-[#111114] border border-white/10 rounded-2xl p-4 text-xs font-black uppercase text-indigo-400 focus:border-indigo-400 outline-none transition-all shadow-xl appearance-none"
                        >
                            {routes.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-24">
                {/* Left: Regional Scanning Nodes */}
                <div className="lg:col-span-4 space-y-12">
                    <section className="space-y-8 bg-white/[0.02] border border-white/5 p-10 rounded-[3rem]">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400">Regional Scan Target</h3>
                        <div className="space-y-6">
                            <select 
                                value={selectedTownId || ''} 
                                onChange={(e) => setSelectedTownId(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-xl font-black italic tracking-tighter text-white focus:border-indigo-500 outline-none transition-all"
                            >
                                <option value="">Select Town Node...</option>
                                {towns.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            <button 
                                onClick={scanTown}
                                disabled={!selectedTownId || scanning}
                                className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/30 disabled:opacity-50 disabled:grayscale"
                            >
                                {scanning ? 'SCANNING MUNICIPAL GRID...' : '⚡ SCAN TOWN DISCOVERY MATRIX'}
                            </button>
                        </div>
                    </section>

                    <section className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30">Architect Directive</h4>
                        <p className="text-sm font-medium italic text-white/50 leading-relaxed">
                            "Drivers can autonomously provision their routes by scanning established municipal nodes. Syncing a business will link its entire inventory registry to your regional logistics loop."
                        </p>
                    </section>
                </div>

                {/* Right: Detected Retail Nodes */}
                <div className="lg:col-span-8 space-y-12">
                    <header className="flex justify-between items-end border-b border-white/5 pb-10">
                        <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Detected <br /><span className="text-indigo-500">Retail Nodes.</span></h2>
                        <span className="text-[11px] font-black text-white/20 uppercase tracking-widest">{businesses.length} Hubs Found</span>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {businesses.length > 0 ? businesses.map((biz) => (
                            <div key={biz.id} className="group bg-[#121215] border border-white/5 rounded-[3.5rem] p-8 hover:border-indigo-500/30 transition-all duration-700 hover:-translate-y-2 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5 grayscale group-hover:rotate-12 transition-transform">🏪</div>
                                <div className="space-y-6 relative z-10">
                                    <div className="space-y-1">
                                        <h4 className="text-3xl font-black italic tracking-tighter uppercase leading-none text-white/90 group-hover:text-indigo-400 transition-colors uppercase">{biz.name}</h4>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">{biz.category} Node &bull; {biz.towns?.name}</p>
                                    </div>
                                    <p className="text-xs font-medium text-white/40 line-clamp-2 leading-relaxed italic">"{biz.description}"</p>
                                    
                                    <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                                        <button 
                                            onClick={() => addStopToRoute(biz.id)}
                                            className="w-full py-4 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                                        >
                                            🛰️ Linked to Loop
                                        </button>
                                        <Link 
                                            href={`/shop/${biz.id}`}
                                            className="w-full py-4 bg-white/5 text-white/30 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center hover:bg-white/10 hover:text-white transition-all"
                                        >
                                            📦 Inspect Inventory Nodes
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="md:col-span-2 p-40 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-[5rem] space-y-8">
                                <div className="text-8xl opacity-10 grayscale italic font-black">??</div>
                                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/10 leading-relaxed italic uppercase">Initiate Municipal Scan to Detect Regional Hubs...</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
