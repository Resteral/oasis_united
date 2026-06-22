"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import SeatingArrangement from '@/components/SeatingArrangement';
import Link from 'next/link';

export default function SeatingManagementPage() {
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState({
        totalTables: 0,
        occupiedCount: 0,
        avgBill: 45.20,
        busiestZone: 'Main Floor',
        activeStaff: 3
    });

    useEffect(() => {
        async function getBusiness() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('businesses')
                    .select('id')
                    .eq('owner_id', user.id)
                    .single();
                if (data) {
                    setBusinessId(data.id);
                    // Mock additional analytics for "in-depth" feel
                    setAnalytics({
                        totalTables: 12,
                        occupiedCount: 8,
                        avgBill: 68.50,
                        busiestZone: 'Main Floor',
                        activeStaff: 4
                    });
                }
            }
            setLoading(false);
        }
        getBusiness();
    }, []);

    if (loading) return (
        <div className="p-12 flex items-center justify-center min-h-[60vh]">
            <div className="text-white/20 font-black animate-pulse uppercase tracking-[0.5em] text-xs">Synchronizing Seating Lattice...</div>
        </div>
    );

    if (!businessId) return (
        <div className="p-12 text-center space-y-8 max-w-xl mx-auto py-32">
            <div className="text-8xl p-10 bg-white/5 rounded-full inline-block">🏢</div>
            <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white">No Boutique Detected</h2>
            <p className="text-white/40 font-medium leading-relaxed italic uppercase text-xs tracking-widest">Provision an Oasis storefront to activate seating protocols.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 lg:p-12 max-w-[1600px] mx-auto space-y-16 animate-in fade-in duration-1000">
            {/* Design Header */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 pt-12 pb-24 border-b border-white/5">
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-4 px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 italic">Operations Grid &bull; LIVE</span>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase leading-none">Boutique <br /><span className="text-indigo-600">Layout.</span></h1>
                        <p className="text-white/30 font-medium text-lg lg:text-2xl max-w-xl italic leading-relaxed">Structural architect and real-time floor management protocol for the modern merchant.</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-6">
                    <div className="px-10 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex flex-col justify-between min-w-[200px] hover:border-indigo-500/30 transition-all">
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">Occupancy</span>
                        <span className="text-5xl font-black italic tracking-tighter mt-4">{Math.round((analytics.occupiedCount / analytics.totalTables) * 100)}%</span>
                        <div className="w-full h-1.5 bg-white/5 rounded-full mt-6 overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(analytics.occupiedCount / analytics.totalTables) * 100}%` }}></div>
                        </div>
                    </div>
                    <div className="px-10 py-8 bg-indigo-600 rounded-[2.5rem] flex flex-col justify-between min-w-[200px] shadow-2xl shadow-indigo-600/20 hover:scale-105 transition-all">
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/60">Revenue Floor</span>
                        <span className="text-5xl font-black italic tracking-tighter mt-4">${analytics.avgBill}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest mt-6 opacity-50">Avg Net per Seat</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 items-start">
                {/* Main Interactive Map */}
                <div className="lg:col-span-3 space-y-12">
                    <div className="bg-[#0a0a0b] border border-white/5 rounded-[5rem] p-4 lg:p-20 shadow-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-24 opacity-[0.02] select-none pointer-events-none grayscale group-hover:opacity-[0.05] transition-opacity">
                            <span className="text-[300px] font-black italic leading-none">GRID</span>
                        </div>
                        <SeatingArrangement businessId={businessId} merchantMode={true} />
                    </div>

                    {/* Zone Analytics HookUp */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {['Main Floor', 'Patio', 'Bar Seating'].map(zone => (
                            <div key={zone} className="bg-white/5 border border-white/5 p-10 rounded-[3.5rem] space-y-6 hover:bg-white/10 transition-all">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-xl font-black italic tracking-tighter uppercase text-white/80">{zone}</h4>
                                    <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full uppercase">Optimal</span>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-3xl font-black italic tracking-tighter">{zone === 'Main Floor' ? '08/12' : '04/06'} <span className="text-xs uppercase text-white/20 not-italic tracking-widest">Units Active</span></p>
                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{ width: zone === 'Main Floor' ? '66%' : '75%' }}></div>
                                    </div>
                                </div>
                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] italic leading-relaxed pt-2">Busiest cluster detected in the northeast sector of this node.</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tactical Operations Sidebar */}
                <aside className="space-y-16 lg:sticky lg:top-12">
                   {/* Live Staff Ticker */}
                   <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Operations Staff</h3>
                            <span className="px-3 py-1 bg-white/5 text-[9px] font-black rounded-full text-white/30 uppercase tracking-widest leading-none">{analytics.activeStaff} Active</span>
                        </div>
                        <div className="space-y-4">
                            {[
                                { name: 'Sarah Chen', role: 'Server', tables: 'T1, T4, T5', status: 'In-Service' },
                                { name: 'Marcus Bell', role: 'Server', tables: 'T2, T3', status: 'In-Service' },
                                { name: 'Elena Rossi', role: 'Lead Host', tables: 'Reception', status: 'Ready' },
                                { name: 'James Oasis', role: 'Merchant', tables: 'Global', status: 'Architect' }
                            ].map((s, i) => (
                                <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] group hover:border-indigo-500/30 transition-all">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="text-lg font-black italic tracking-tighter uppercase text-white leading-none">{s.name}</p>
                                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-none">{s.role}</p>
                                        </div>
                                        <div className={`w-2 h-2 rounded-full ${s.status === 'Architect' ? 'bg-indigo-500 shadow-[0_0_10px_indigo]' : 'bg-emerald-500 animate-pulse'}`}></div>
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Load: {s.tables}</p>
                                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">{s.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                   </div>

                   {/* Quick Commands */}
                   <div className="bg-white text-black p-12 rounded-[4rem] space-y-10 group shadow-3xl hover:bg-indigo-600 hover:text-white transition-all duration-700">
                        <div className="space-y-4">
                            <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-[0.85]">Tactical <br />Commands.</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">System Override Active</p>
                        </div>
                        <div className="space-y-3">
                            <button className="w-full py-5 bg-black/5 hover:bg-black text-[10px] font-black uppercase tracking-[0.2em] rounded-3xl border border-black/10 transition-all hover:text-white">Flush All Availability</button>
                            <button className="w-full py-5 bg-black/5 hover:bg-black text-[10px] font-black uppercase tracking-[0.2em] rounded-3xl border border-black/10 transition-all hover:text-white">Lock Seating Registry</button>
                            <button className="w-full py-5 bg-black text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] font-sans hover:scale-[1.05] transition-transform">Report Operational Malfunction</button>
                        </div>
                        <p className="text-[8px] font-black text-center uppercase tracking-widest italic opacity-20">Authorized Merchant Uplink v2.4.5</p>
                   </div>

                   <Link href="/dashboard" className="block p-10 bg-white/5 border border-white/5 rounded-[3.5rem] group hover:bg-white/10 transition-all text-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-white transition-colors">Return to Central Intelligence</span>
                   </Link>
                </aside>
            </div>
        </div>
    );
}
