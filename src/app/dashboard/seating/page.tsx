"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import SeatingArrangement from '@/components/SeatingArrangement';

export default function SeatingManagementPage() {
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getBusiness() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('businesses')
                    .select('id')
                    .eq('owner_id', user.id)
                    .single();
                if (data) setBusinessId(data.id);
            }
            setLoading(false);
        }
        getBusiness();
    }, []);

    if (loading) return (
        <div className="p-12 flex items-center justify-center min-h-[60vh]">
            <div className="text-gray-400 font-black animate-pulse uppercase tracking-[0.3em]">Synching Seating Protocol...</div>
        </div>
    );

    if (!businessId) return (
        <div className="p-12 text-center space-y-8 max-w-xl mx-auto py-32">
            <div className="text-6xl">🏢</div>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase">No Boutique Detected</h2>
            <p className="text-gray-500 font-medium leading-relaxed">It seems you haven't provisioned an Oasis storefront yet. Please register your business first.</p>
        </div>
    );

    return (
        <div className="p-12 max-w-7xl mx-auto space-y-16 animate-in slide-in-from-bottom-12 duration-1000">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 italic underline decoration-indigo-500/30">Store Management &bull; OPS</span>
                    </div>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Live <span className="text-indigo-500">Seating.</span></h1>
                    <p className="text-gray-500 font-medium text-lg max-w-lg">Manage your boutique's interactive seating layout in real-time. Toggle table occupancy and optimize for your citizens.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-10 py-5 bg-white/5 border border-white/10 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all">Edit Layout</button>
                    <button className="px-10 py-5 bg-indigo-600 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-3xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all">Export Report</button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                {/* Main Interaction Area: The Floor Plan */}
                <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-[4rem] p-12 shadow-3xl relative overflow-hidden backdrop-blur-3xl group">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] select-none pointer-events-none grayscale group-hover:opacity-10 transition-opacity">
                        <span className="text-[200px] font-black italic leading-none">MAP</span>
                    </div>
                    <SeatingArrangement businessId={businessId} merchantMode={true} />
                    
                    <div className="mt-12 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex gap-8">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Total Tables</p>
                                <p className="text-2xl font-black italic tracking-tighter">09</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Available</p>
                                <p className="text-2xl font-black italic tracking-tighter">04</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Occupied</p>
                                <p className="text-2xl font-black italic tracking-tighter">05</p>
                            </div>
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/20 italic italic italic italic italic">Changes sync instantly with live customer discovery carts.</p>
                    </div>
                </div>

                {/* Right: Operations & Intelligence Panel */}
                <aside className="space-y-12">
                   {/* Table Intelligence Card */}
                   <div className="bg-white p-10 rounded-[3.5rem] space-y-8 border border-gray-100 shadow-sm transition-all hover:shadow-2xl">
                       <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight italic">Ops Intelligence</h3>
                       <div className="space-y-6">
                           {[
                               { label: 'Avg Occupation Time', value: '42m', icon: '⏳' },
                               { label: 'Premium Table Revenue', value: '$840', icon: '💎' },
                               { label: 'Citizens Waiting', value: '0', icon: '👥' }
                           ].map((stat, i) => (
                               <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-indigo-200 transition-colors">
                                   <div className="flex items-center gap-3">
                                       <span className="text-xl group-hover:scale-110 transition-transform">{stat.icon}</span>
                                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">{stat.label}</span>
                                   </div>
                                   <span className="text-lg font-black text-gray-900 italic tracking-tighter">{stat.value}</span>
                               </div>
                           ))}
                       </div>
                   </div>

                   {/* Quick Actions (Boutique Rules) */}
                   <div className="bg-indigo-600 p-10 rounded-[3.5rem] text-white space-y-6 shadow-3xl shadow-indigo-900/40 group overflow-hidden relative">
                       <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-700">🛡️</div>
                       <h3 className="text-2xl font-black italic tracking-tighter uppercase relative z-10">Boutique <br />Protocols.</h3>
                       <div className="space-y-3 relative z-10">
                           <button className="w-full py-4 bg-black/20 hover:bg-black/30 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">Mark All Available</button>
                           <button className="w-full py-4 bg-black/20 hover:bg-black/30 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">Toggle 'Busy' Mode</button>
                           <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-xl">Contact Regional Ops</button>
                       </div>
                   </div>
                </aside>
            </div>
        </div>
    );
}
