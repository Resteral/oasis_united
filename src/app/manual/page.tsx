"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function FieldManualPage() {
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [rewards, setRewards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchManualData() {
            setLoading(true);
            const [bResp, rResp] = await Promise.all([
                supabase.from('businesses').select('id, name, town_id, towns(name), rating').order('rating', { ascending: false }).limit(5),
                supabase.from('rewards').select('*')
            ]);
            
            setLeaderboard(bResp.data || []);
            setRewards(rResp.data || []);
            setLoading(false);
        }
        fetchManualData();
    }, []);

    if (loading) return <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center animate-pulse text-white/40 font-black uppercase tracking-widest text-[10px]">Syncing Field Manual...</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white p-10 md:p-32 space-y-32">
            <header className="max-w-4xl space-y-8">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-400/10 border border-amber-400/20 rounded-full">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></span>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400">Merchant Operational Manual 1.0</span>
                </div>
                <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.8] text-white">Field <br /><span className="text-amber-400">Manual.</span></h1>
                <p className="text-xl md:text-2xl font-medium text-white/40 italic leading-relaxed max-w-2xl">
                    Scaling decentralized commerce through neighborhood intelligence and logistical excellence.
                </p>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                {/* Protocol Sections */}
                <section className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                        { title: 'Provisioning', desc: 'Node initialization and catalog synchronization.', icon: '📦' },
                        { title: 'Logistics', desc: 'Regional fleet dispatch and route integrity.', icon: '🚐' },
                        { title: 'Governance', desc: 'Municipal Custodianship and node sovereignty.', icon: '🏛️' },
                        { title: 'Topology', desc: 'Using Town Scan to monitor municipal density.', icon: '📡' }
                    ].map(proto => (
                        <div key={proto.title} className="bg-white/5 border border-white/10 p-10 rounded-[3rem] space-y-4 hover:border-amber-400/30 transition-all group">
                             <div className="text-4xl group-hover:scale-110 transition-transform">{proto.icon}</div>
                             <h3 className="text-xl font-black italic uppercase tracking-tighter">{proto.title} Protocol</h3>
                             <p className="text-[10px] font-medium text-white/30 italic leading-relaxed">{proto.desc}</p>
                        </div>
                    ))}
                </section>

                {/* Tactical Operations Guide */}
                <section className="lg:col-span-12 bg-indigo-600/5 border border-indigo-500/20 p-16 rounded-[4rem] space-y-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-20 opacity-[0.03] select-none pointer-events-none group-hover:opacity-10 transition-opacity">
                         <span className="text-[150px] font-black italic leading-none">SCAN</span>
                    </div>
                    <div className="max-w-3xl space-y-8 relative z-10">
                        <div className="inline-flex px-3 py-1 bg-indigo-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest">Tactical Briefing</div>
                        <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Utilizing the <br /><span className="text-indigo-400">Town Topology Radar.</span></h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-white/40 italic font-medium leading-relaxed">
                            <p>Drivers acting as <b>Municipal Custodians</b> can activate the Town Scan tool to visualize every merchant node in their jurisdiction. This identifies coverage gaps and provides a graph of independent boutique density for regional planning.</p>
                            <p>By marking shops as <b>Marketing Partners</b>, custodians priority-rank these nodes in the Global Discovery Compass, effectively acting as regional advertising scouts for local boutiques.</p>
                        </div>
                    </div>
                </section>

                {/* Meritocracy Leaderboard */}
                <section className="lg:col-span-7 space-y-12">
                    <header className="space-y-2">
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Community <span className="text-amber-400">Leaderboard.</span></h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">The Regional Success Pulse</p>
                    </header>

                    <div className="bg-[#111114] border border-white/5 rounded-[4rem] overflow-hidden shadow-4xl">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/5">
                                <tr>
                                    <th className="p-8 text-[10px] font-black uppercase text-white/40 tracking-widest">Merchant Rank</th>
                                    <th className="p-8 text-[10px] font-black uppercase text-white/40 tracking-widest">Town Node</th>
                                    <th className="p-8 text-[10px] font-black uppercase text-white/40 tracking-widest text-right">Merit Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {leaderboard.map((biz, i) => (
                                    <tr key={biz.id} className="group hover:bg-white/5 transition-all">
                                        <td className="p-8 flex items-center gap-6">
                                            <span className="text-2xl font-black italic text-white/20">#{i + 1}</span>
                                            <div>
                                                <div className="text-xl font-black italic uppercase text-white group-hover:text-amber-400 transition-colors">{biz.name}</div>
                                                <div className="text-[9px] font-bold uppercase text-white/20 tracking-tighter mt-1 italic">Premium Partner</div>
                                            </div>
                                        </td>
                                        <td className="p-8 text-xs font-black uppercase text-white/40 tracking-widest">{biz.towns?.name || 'Oasis Central'}</td>
                                        <td className="p-8 text-right font-black italic text-amber-400 text-xl tracking-tighter">{(biz.rating * 10).toFixed(1)} <span className="text-[10px] opacity-40">M</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Rewards Cabinet */}
                <section className="lg:col-span-5 space-y-12">
                     <header className="space-y-2">
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Merit <span className="text-indigo-400">Badges.</span></h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Operational Rewards Tiers</p>
                    </header>

                    <div className="grid grid-cols-1 gap-6">
                        {rewards.map(reward => (
                            <div key={reward.id} className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] flex gap-8 items-center group hover:bg-indigo-600/10 hover:border-indigo-500/20 transition-all">
                                <div className="text-4xl filter grayscale group-hover:grayscale-0 transition-all opacity-50 group-hover:opacity-100">{reward.icon}</div>
                                <div className="space-y-1">
                                    <h4 className="text-lg font-black italic uppercase tracking-tighter group-hover:text-indigo-400 transition-colors">{reward.name}</h4>
                                    <p className="text-[9px] font-medium text-white/30 italic leading-relaxed">{reward.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8">
                        <Link href="/dashboard/rewards" className="block w-full py-6 bg-white text-black text-center rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-2xl">
                            Unlock Your Merit Score →
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="pt-20 border-t border-white/5 flex justify-between items-center text-[9px] font-black uppercase text-white/20 tracking-widest">
                <span>&copy; 2026 OASIS UNITED NETWORK</span>
                <span className="italic">Refined neighborhood protocol v23.4</span>
            </footer>
        </div>
    );
}
