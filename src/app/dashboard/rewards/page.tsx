"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function MerchantRewardsPage() {
    const [earnedRewards, setEarnedRewards] = useState<any[]>([]);
    const [availableRewards, setAvailableRewards] = useState<any[]>([]);
    const [business, setBusiness] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadMerchantRewards() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: bus } = await supabase
                .from('businesses')
                .select('*, towns(name)')
                .eq('owner_id', user.id)
                .single();

            if (bus) {
                setBusiness(bus);
                const [earned, available] = await Promise.all([
                    supabase.from('business_rewards').select('*, rewards(*)').eq('business_id', bus.id),
                    supabase.from('rewards').select('*')
                ]);

                if (earned.data) setEarnedRewards(earned.data.map(e => e.rewards));
                if (available.data) setAvailableRewards(available.data);
            }
            setLoading(false);
        }
        loadMerchantRewards();
    }, []);

    if (loading) return <div className="p-12 min-h-screen bg-[#0a0a0b] flex items-center justify-center font-black uppercase text-white/20 text-[10px] animate-pulse italic">Syncing Merit Cabinet...</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white p-8 md:p-12 space-y-12 max-w-7xl mx-auto selection:bg-amber-400 selection:text-black">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Regional Meritocracy Protocol</span>
                    </div>
                    <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none">Merit <span className="text-indigo-400">Cabinet.</span></h1>
                    <p className="text-white/40 font-medium max-w-lg italic text-lg leading-relaxed">Your collection of earned regional distinctions and municipal excellence badges.</p>
                </div>
                <Link href="/manual" className="px-10 py-5 bg-white/5 border border-white/10 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                    View Leaderboard <span className="text-lg">📊</span>
                </Link>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Earned Rewards Showcase */}
                <section className="lg:col-span-8 space-y-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 px-2 italic">Earned Distinctions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {earnedRewards.length === 0 ? (
                            <div className="md:col-span-2 py-32 bg-white/[0.02] border border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center text-center space-y-6">
                                <span className="text-6xl opacity-10">🛡️</span>
                                <div className="space-y-2">
                                    <p className="text-xl font-black italic uppercase text-white/20">Cabinet Currently Empty.</p>
                                    <p className="text-[10px] font-black uppercase text-white/10 tracking-widest">Perform regional excellence to earn badges.</p>
                                </div>
                            </div>
                        ) : (
                            earnedRewards.map(reward => (
                                <div key={reward.id} className="bg-gradient-to-br from-indigo-600/10 to-transparent border border-indigo-500/30 p-10 rounded-[3.5rem] space-y-6 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                                    <div className="absolute -top-10 -right-10 text-9xl opacity-[0.05] grayscale group-hover:grayscale-0 transition-all">{reward.icon}</div>
                                    <div className="text-5xl">{reward.icon}</div>
                                    <div className="space-y-2 relative z-10">
                                        <h4 className="text-2xl font-black italic uppercase tracking-tighter">{reward.name}</h4>
                                        <p className="text-[11px] font-medium text-white/40 italic leading-relaxed">{reward.description}</p>
                                    </div>
                                    <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-indigo-400">
                                        <span>Verified Node Asset</span>
                                        <span className="text-white/20 italic">Unlocked</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Available Rewards / Requirements */}
                <section className="lg:col-span-4 space-y-8">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 px-2 italic">Network Potential</h3>
                     <div className="bg-white/5 border border-white/5 p-10 rounded-[3rem] space-y-10">
                        {availableRewards.map(reward => {
                            const isEarned = earnedRewards.some(er => er.id === reward.id);
                            return (
                                <div key={reward.id} className={`flex items-start gap-6 group transition-all ${isEarned ? 'opacity-30' : 'opacity-100'}`}>
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-amber-400 transition-all group-hover:text-black">
                                        {reward.icon}
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-sm font-black italic uppercase tracking-tight">{reward.name}</h4>
                                            {isEarned && <span className="text-[9px] font-black uppercase text-amber-500 tracking-tighter italic">EARNED</span>}
                                        </div>
                                        <p className="text-[9px] font-medium text-white/20 italic leading-snug">{reward.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="pt-6 border-t border-white/5">
                            <p className="text-[10px] font-bold text-white/40 italic text-center">Maintain high throughput and regional rating to level up your node.</p>
                        </div>
                     </div>
                </section>
            </main>

            <footer className="pt-20 border-t border-white/5 text-[9px] font-black uppercase text-white/10 tracking-[0.4em] flex justify-between items-center">
                <span>Meritocracy Engine v1.02</span>
                <span className="italic">Oasis United Regional Governance</span>
            </footer>
        </div>
    );
}
