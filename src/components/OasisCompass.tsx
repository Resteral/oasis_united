"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function OasisCompass() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{ towns: any[], businesses: any[], products: any[] }>({ towns: [], businesses: [], products: [] });
    const [activeScan, setActiveScan] = useState(false);
    const [stats, setStats] = useState({ nodes: 0, routes: 0 });
    const compassRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchStats() {
            const [tCount, rCount] = await Promise.all([
                supabase.from('towns').select('id', { count: 'exact' }),
                supabase.from('delivery_routes').select('id', { count: 'exact', head: true }).eq('is_active', true)
            ]);
            setStats({ nodes: tCount.count || 28, routes: rCount.count || 8 });
        }
        fetchStats();
    }, []);

    useEffect(() => {
        if (query.length < 2) {
            setResults({ towns: [], businesses: [], products: [] });
            return;
        }

        const scanNetwork = async () => {
            setActiveScan(true);
            const [tResp, bResp, pResp] = await Promise.all([
                supabase.from('towns').select('*').ilike('name', `%${query}%`).limit(3),
                supabase.from('businesses').select('*').ilike('name', `%${query}%`).limit(5),
                supabase.from('products').select('*, businesses(name)').ilike('name', `%${query}%`).limit(5)
            ]);

            setResults({
                towns: tResp.data || [],
                businesses: bResp.data || [],
                products: pResp.data || []
            });
            setActiveScan(false);
        };

        const timer = setTimeout(scanNetwork, 300);
        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="relative w-full max-w-4xl mx-auto" ref={compassRef}>
            {/* The Compass Terminal */}
            <div className={`relative z-20 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-4 transition-all duration-500 overflow-hidden ${query.length > 0 ? 'rounded-b-none shadow-4xl' : 'shadow-2xl'}`}>
                
                {/* Scan Pulse Layer */}
                <div className={`absolute inset-0 bg-indigo-500/5 pointer-events-none transition-opacity duration-1000 ${activeScan ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-full h-full animate-pulse border-y border-indigo-500/20"></div>
                </div>

                <div className="relative flex items-center gap-6 px-10 py-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-700 ${activeScan ? 'rotate-[360deg] bg-indigo-600 shadow-lg shadow-indigo-600/40' : 'bg-white/5 border border-white/10 grayscale'}`}>
                        {activeScan ? '📡' : '🧭'}
                    </div>
                    
                    <input 
                        type="text"
                        placeholder="Search for towns, boutique items, or logistics routes..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-2xl font-black italic tracking-tighter uppercase placeholder:text-white/20 placeholder:italic transition-all"
                    />

                    <div className="flex items-center gap-4 text-left">
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 italic">Active Nodes</p>
                            <p className="text-sm font-black italic tracking-tighter text-amber-400">{stats.nodes.toString().padStart(2, '0')}</p>
                        </div>
                        <div className="w-[1px] h-8 bg-white/10"></div>
                        <div className="space-y-0.5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 italic">Transit Hooks</p>
                            <p className="text-sm font-black italic tracking-tighter text-indigo-400">{stats.routes.toString().padStart(2, '0')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Discovery Overlay */}
            {query.length >= 2 && (
                <div className="absolute top-full left-0 right-0 z-10 bg-black/80 backdrop-blur-3xl border-x border-b border-white/10 rounded-b-[3.5rem] p-10 space-y-10 shadow-4xl animate-in slide-in-from-top-12 duration-500">
                    
                    {/* Towns Discovery */}
                    {results.towns.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500 italic px-2">Municipal Hubs Found</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {results.towns.map(town => (
                                    <button key={town.id} onClick={() => router.push(`/marketplace?town=${town.id}`)} className="bg-white/5 border border-white/10 p-6 rounded-3xl text-left group hover:bg-amber-400 hover:border-amber-400 transition-all shadow-xl">
                                        <h5 className="font-black italic text-xl uppercase tracking-tighter group-hover:text-black">{town.name}</h5>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/30 group-hover:text-black/60 italic">{town.state} Node 0{Math.floor(Math.random() * 9) + 1}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Content Matrix (Businesses & Products) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4 border-t border-white/5">
                        <section className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 italic px-2">Independent Sellers</h4>
                            <div className="space-y-3">
                                {results.businesses.length > 0 ? results.businesses.map(biz => (
                                    <button key={biz.id} onClick={() => router.push(`/shop/${biz.id}`)} className="w-full bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center gap-6 group hover:bg-white/10 transition-all">
                                        <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all font-black italic text-indigo-400">{biz.name[0]}</div>
                                        <div className="text-left flex-1">
                                            <h5 className="font-black italic text-sm uppercase tracking-tight">{biz.name}</h5>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-white/30 italic">{biz.category} Node</p>
                                        </div>
                                        <span className="text-xs opacity-0 group-hover:opacity-100 transition-all text-white/40">🛰️</span>
                                    </button>
                                )) : <p className="text-[9px] font-black uppercase text-white/10 p-4">Awaiting Signal...</p>}
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 italic px-2">Targeted Catalog Drops</h4>
                            <div className="space-y-3">
                                {results.products.length > 0 ? results.products.map(prod => (
                                    <button key={prod.id} onClick={() => router.push(`/shop/${prod.business_id}`)} className="w-full bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center gap-6 group hover:bg-white/10 transition-all text-left">
                                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-transform">💎</div>
                                        <div className="flex-1">
                                            <h5 className="font-black italic text-sm uppercase tracking-tight truncate max-w-[150px]">{prod.name}</h5>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-indigo-400 italic">via {prod.businesses?.name}</p>
                                        </div>
                                        <div className="text-lg font-black italic text-amber-400 shadow-sm">${Number(prod.price).toFixed(2)}</div>
                                    </button>
                                )) : <p className="text-[9px] font-black uppercase text-white/10 p-4">No Inventory Nodes Found.</p>}
                            </div>
                        </section>
                    </div>

                    <footer className="pt-6 border-t border-white/5 text-center">
                         <p className="text-[8px] font-black uppercase tracking-[0.6em] text-white/10 italic">Secured Discovery Protocol &bull; Localized Intelligence Engine v2.9.4</p>
                    </footer>
                </div>
            )}

            {/* Background Compass Ring (Only visible when not searching) */}
            {query.length === 0 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] aspect-square border border-white/5 rounded-full pointer-events-none z-0">
                    <div className="absolute inset-0 border border-white/5 rounded-full animate-ping opacity-10"></div>
                    <div className="absolute inset-0 border border-white/5 rounded-full rotate-45"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-black text-indigo-500 uppercase tracking-widest italic bg-[#0c0c0e] px-4">NORTHERN MUNICIPAL GRID</div>
                </div>
            )}
        </div>
    );
}
