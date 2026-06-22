"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface TownRadarNode {
    id: string;
    name: string;
    description: string;
    capacity: number; // 0-100
    active_routes: number;
    boutique_count: number;
    status: 'stable' | 'peak' | 'latent';
    flag: string;
}

export default function TownDiscovery() {
    const [towns, setTowns] = useState<TownRadarNode[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadTownRadar() {
            setLoading(true);
            const { data } = await supabase
                .from('towns')
                .select('id, name, description, businesses(id)');
            
            if (data) {
                const radarNodes: TownRadarNode[] = data.map(t => ({
                    id: t.id,
                    name: t.name,
                    description: t.description || 'Regional Settlement',
                    boutique_count: t.businesses?.length || 0,
                    capacity: Math.floor(Math.random() * 40) + 60, // Mocked live capacity
                    active_routes: Math.floor(Math.random() * 8) + 2,
                    status: Math.random() > 0.7 ? 'peak' : 'stable',
                    flag: t.name === 'Effingham' ? '🏡' : t.name === 'Freedom' ? '🌳' : t.name === 'Ossipee' ? '🏔️' : '⛪'
                }));
                setTowns(radarNodes);
            }
            setLoading(false);
        }
        loadRadarNodes(); // Using a wrapper to avoid naming conflicts if necessary, but naming it directly is fine.
        async function loadRadarNodes() { await loadTownRadar(); }
    }, []);

    const displayTowns = towns.length > 0 ? towns : [
        { id: '1', name: 'Effingham', boutique_count: 4, capacity: 92, active_routes: 12, status: 'peak', flag: '🏡', description: 'North Gateway' },
        { id: '2', name: 'Freedom', boutique_count: 2, capacity: 45, active_routes: 4, status: 'stable', flag: '🌳', description: 'Central Hub' },
        { id: '3', name: 'Ossipee', boutique_count: 2, capacity: 78, active_routes: 8, status: 'stable', flag: '🏔️', description: 'Mountain Node' }
    ];

    return (
        <section className="space-y-12 animate-in fade-in duration-1000">
            <div className="flex justify-between items-end px-4">
                <div className="space-y-2">
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white">Live <span className="text-indigo-500">Node Radar.</span></h2>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1">Regional Settlement Capacity & Transit Latency</p>
                </div>
                <Link href="/towns" className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-all">Regional Scan →</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {displayTowns.slice(0, 3).map((town: any) => (
                    <Link 
                        key={town.name} 
                        href={`/search?town=${town.name}`} 
                        className="group relative bg-white/[0.03] border border-white/5 rounded-[3.5rem] p-12 hover:bg-white/[0.06] transition-all overflow-hidden flex flex-col justify-between min-h-[300px]"
                    >
                        {/* Status Pulse Background */}
                        <div className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-[80px] opacity-10 transition-all duration-1000 group-hover:scale-150 ${town.status === 'peak' ? 'bg-amber-400' : 'bg-indigo-500'}`}></div>

                        <div className="space-y-6 relative z-10">
                            <div className="flex justify-between items-start">
                                <span className="text-5xl group-hover:scale-110 transition-transform duration-700">{town.flag || '📍'}</span>
                                <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${town.status === 'peak' ? 'bg-amber-400/20 text-amber-400 border-amber-400/30 animate-pulse' : 'bg-white/5 text-white/40 border-white/10'}`}>
                                    {town.status === 'peak' ? '● PEAK FLOW' : '○ STABLE'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white leading-none">{town.name}</h3>
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{town.description}</p>
                            </div>
                        </div>

                        <div className="pt-8 grid grid-cols-2 gap-6 relative z-10 border-t border-white/5">
                            <div className="space-y-1">
                                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40">Boutiques</p>
                                <p className="text-2xl font-black italic text-white leading-none">{town.boutique_count}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-indigo-400">Routes</p>
                                <p className="text-2xl font-black italic text-indigo-400 leading-none">{town.active_routes}</p>
                            </div>
                        </div>

                        {/* Capacity Percentage Indicator */}
                        <div className="absolute bottom-12 right-12 text-right">
                             <p className="text-5xl font-black italic tracking-tighter text-white/5 group-hover:text-white/10 transition-colors">{town.capacity}%</p>
                             <p className="text-[7px] font-black uppercase tracking-widest text-white/10 italic">Occupancy Lattice</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
