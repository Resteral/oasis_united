"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function TownDiscovery() {
    const [towns, setTowns] = useState<any[]>([]);

    useEffect(() => {
        async function loadTowns() {
            // Fetch towns with their associated business counts
            const { data } = await supabase
                .from('towns')
                .select('name, id, businesses(id)')
                .limit(4);
            
            if (data) {
                const formatted = data.map(t => ({
                    name: t.name,
                    count: t.businesses?.length || 0,
                    flag: t.name === 'Effingham' ? '🏡' : t.name === 'Freedom' ? '🌳' : t.name === 'Ossipee' ? '🏔️' : '⛪'
                }));
                setTowns(formatted);
            }
        }
        loadTowns();
    }, []);

    const displayTowns = towns.length > 0 ? towns : [
        { name: 'Effingham', count: 4, flag: '🏡' },
        { name: 'Freedom', count: 2, flag: '🌳' },
        { name: 'Ossipee', count: 2, flag: '🏔️' },
        { name: 'Tamworth', count: 2, flag: '⛪' }
    ];

    return (
        <section className="space-y-12">
            <div className="flex justify-between items-end px-4">
                <div className="space-y-2">
                    <h2 className="text-3xl font-black italic tracking-tight uppercase">Town <span className="text-primary italic">Discovery.</span></h2>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest px-1">Global Independent Settlements</p>
                </div>
                <Link href="/towns" className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">All Towns →</Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {displayTowns.map((town) => (
                    <Link key={town.name} href={`/search?town=${town.name}`} className="group bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 hover:bg-white/[0.04] transition-all relative overflow-hidden text-center hover:scale-[1.02] active:scale-95 duration-500">
                        <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all transform group-hover:scale-125 duration-700">{town.flag || '📍'}</div>
                        <h3 className="font-black italic text-2xl tracking-tighter">{town.name}</h3>
                        <p className="text-[10px] mt-2 font-black uppercase tracking-[0.2em] text-white/30 group-hover:text-primary transition-colors">{town.count} Boutiques</p>
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </Link>
                ))}
                
                <Link href="/deliverer/dashboard" className="group bg-white/[0.01] border border-white/5 border-dashed rounded-[3rem] p-10 hover:bg-white/[0.02] transition-all flex flex-col items-center justify-center text-center opacity-40 hover:opacity-100">
                    <div className="text-2xl mb-4">+</div>
                    <h3 className="font-black italic text-lg tracking-tighter uppercase whitespace-nowrap">Open Your <br />Town</h3>
                </Link>
            </div>
        </section>
    );
}
