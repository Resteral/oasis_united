"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import FieldManual from '@/components/hub/FieldManual';
import OasisLogo from '@/components/OasisLogo';

export default function HubClient() {
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [businessName, setBusinessName] = useState<string | null>(null);

    useEffect(() => {
        async function getSession() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                setRole(profile?.role || 'citizen');
                if (profile?.role === 'business') {
                    const { data: bizs } = await supabase.from('businesses').select('name').eq('owner_id', user.id).limit(1);
                    const biz = bizs && bizs.length > 0 ? bizs[0] : null;
                    setBusinessName(biz?.name || null);
                }
            }
            setLoading(false);
        }
        getSession();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
            <div className="text-center space-y-6">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[10px] italic">Synchronizing Global Hub...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-indigo-500 overflow-hidden relative selection:text-white">
            {/* 🛰️ IMMERSIVE AMBIENCE */}
            <div className="absolute top-0 left-0 w-full h-[1000px] bg-gradient-to-b from-indigo-500/10 via-[#0a0a0b] to-transparent pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[150px] -mr-48 -mt-48 rounded-full pointer-events-none"></div>

            <main className="max-w-7xl mx-auto px-8 pt-40 pb-48 relative z-10 space-y-24">
                
                {/* 🚥 COMMAND HEADER */}
                <header className="flex flex-col lg:flex-row gap-16 items-start lg:items-end group animate-in slide-in-from-top-12 duration-1000">
                    <div className="hover:scale-110 transition-transform duration-700 bg-white/5 p-4 rounded-[2.5rem] border border-white/5">
                        <OasisLogo size="lg" />
                    </div>
                    <div className="space-y-6 max-w-3xl">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Central Operational Gateway</span>
                        </div>
                        <h1 className="text-8xl md:text-[11rem] font-black italic tracking-tighter leading-[0.8] uppercase text-white">
                            The <span className="text-indigo-500">Hub.</span>
                        </h1>
                        <p className="text-white/40 font-medium text-xl md:text-2xl leading-relaxed italic">
                            Welcome, {user ? (user.email.split('@')[0]) : 'Citizen'}. Accessing your unified operational node for the Oasis Unified protocol.
                        </p>
                    </div>
                </header>

                {/* 🛡️ DYNAMIC QUICK-LINK MATRIX */}
                <section className="bg-white/[0.02] border border-white/5 p-12 md:p-16 rounded-[4.5rem] space-y-12 animate-in fade-in duration-1000 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none scale-[2]">🛰️</div>
                    
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">
                        <span>DETECTED ROLE: <span className="text-indigo-400">{role?.toUpperCase()}</span></span>
                        <span className="flex items-center gap-3">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            PROTOCOL STATUS: SECURE_UPLINK
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         {role === 'business' ? (
                            <Link href="/dashboard" className="p-10 bg-indigo-600 rounded-[3rem] shadow-3xl shadow-indigo-900/40 space-y-4 hover:scale-[1.03] transition-all group overflow-hidden relative">
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <h4 className="text-2xl font-black italic uppercase italic relative z-10">Resume Management</h4>
                                <p className="text-[10px] font-black uppercase text-indigo-100 opacity-60 relative z-10">Control {businessName || 'Your Boutique'}</p>
                            </Link>
                         ) : role === 'deliverer' ? (
                            <Link href="/deliverer/dashboard" className="p-10 bg-indigo-600 rounded-[3rem] shadow-3xl shadow-indigo-900/40 space-y-4 hover:scale-[1.03] transition-all group overflow-hidden relative">
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <h4 className="text-2xl font-black italic uppercase italic relative z-10">Resume Logistics</h4>
                                <p className="text-[10px] font-black uppercase text-indigo-100 opacity-60 relative z-10">Control regional routes</p>
                            </Link>
                         ) : (
                            <Link href="/register-business" className="p-10 bg-emerald-600 rounded-[3rem] shadow-3xl shadow-emerald-900/40 space-y-4 hover:scale-[1.03] transition-all group overflow-hidden relative">
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <h4 className="text-2xl font-black italic uppercase italic relative z-10">Register Node</h4>
                                <p className="text-[10px] font-black uppercase text-emerald-100 opacity-60 relative z-10">Establish your Oasis Partner Node</p>
                            </Link>
                         )}

                         <Link href="/marketplace" className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-4 hover:bg-white/10 transition-all group">
                            <h4 className="text-2xl font-black italic uppercase italic">Regional Radar</h4>
                            <p className="text-[10px] font-black uppercase text-white/40">Enter High-Discovery Market</p>
                         </Link>

                         <Link href="/messages" className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-4 hover:bg-white/10 transition-all group">
                            <h4 className="text-2xl font-black italic uppercase italic">Social Uplink</h4>
                            <p className="text-[10px] font-black uppercase text-white/40">Connect with local citizens</p>
                         </Link>
                    </div>
                </section>

                {/* 🔭 THE CORE DISPATCH NODES */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <Link href="/dashboard" className="group p-12 bg-white/[0.02] border border-white/5 rounded-[4.5rem] flex flex-col gap-16 hover:bg-white/[0.04] transition-all hover:-translate-y-4 duration-700 relative overflow-hidden">
                        <div className="w-24 h-24 bg-white/5 rounded-[2.8rem] flex items-center justify-center text-5xl group-hover:scale-110 transition-transform">📊</div>
                        <div className="space-y-4">
                            <h3 className="text-5xl font-black italic tracking-tighter uppercase leading-[0.8] text-white">Merchant <br />Dashboard.</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Inventory & Sales Intelligence</p>
                        </div>
                        <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-indigo-500/5 blur-[80px] rounded-full group-hover:bg-indigo-500/10 transition-all"></div>
                    </Link>

                    <Link href="/deliverer/dashboard" className="group p-12 bg-white/[0.02] border border-white/5 rounded-[4.5rem] flex flex-col gap-16 hover:bg-white/[0.04] transition-all hover:-translate-y-4 duration-700 relative overflow-hidden">
                        <div className="w-24 h-24 bg-indigo-500/10 rounded-[2.8rem] flex items-center justify-center text-5xl group-hover:scale-110 transition-transform">🛰️</div>
                        <div className="space-y-4">
                            <h3 className="text-5xl font-black italic tracking-tighter uppercase leading-[0.8] text-white">Express <br />Network.</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Routes & Fleet Expansion</p>
                        </div>
                    </Link>

                    <Link href="/marketplace" className="group p-12 bg-white/[0.02] border border-white/5 rounded-[4.5rem] flex flex-col gap-16 hover:bg-white/[0.04] transition-all hover:-translate-y-4 duration-700 relative overflow-hidden">
                        <div className="w-24 h-24 bg-white/5 rounded-[2.8rem] flex items-center justify-center text-5xl group-hover:scale-110 transition-transform">🌍</div>
                        <div className="space-y-4">
                            <h3 className="text-5xl font-black italic tracking-tighter uppercase leading-[0.8] text-white">Discovery <br />Engine.</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Regional Market Discovery</p>
                        </div>
                    </Link>
                </div>
                
                {/* 📖 THE FIELD PROTOCOL */}
                <FieldManual />

                {/* 💹 NETWORK TELEMETRY */}
                <section className="pt-24 border-t border-white/5 space-y-20">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                        <div className="space-y-4">
                            <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase text-white leading-none">Network <br /><span className="text-emerald-500">Telemetry.</span></h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 italic">Real-time regional trade flow monitoring</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                         <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Total Settlement</p>
                            <h4 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">$128.4k</h4>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[78%]"></div>
                            </div>
                         </div>
                         <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Verified Hubs</p>
                            <h4 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">28</h4>
                            <p className="text-[8px] font-black uppercase text-white/30 tracking-widest leading-none">Active Settlements</p>
                         </div>
                         <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Route Latency</p>
                            <h4 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">0.82s</h4>
                            <p className="text-[8px] font-black uppercase text-emerald-500 tracking-widest leading-none">Optimal Performance</p>
                         </div>
                         <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Merchant Nodes</p>
                            <h4 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">412</h4>
                            <p className="text-[8px] font-black uppercase text-white/30 tracking-widest leading-none">+12.4% vs Previous Cycle</p>
                         </div>
                    </div>

                    {/* 🚀 CALL TO ACTION: FOUNDER PROTOCOL */}
                    <div className="relative p-16 md:p-24 bg-indigo-600 rounded-[4.5rem] overflow-hidden group shadow-3xl shadow-indigo-900/40">
                         <div className="absolute top-0 right-0 p-16 opacity-10 pointer-events-none group-hover:scale-125 transition-transform duration-1000 rotate-12">
                              <OasisLogo size="lg" />
                         </div>
                         <div className="relative z-10 space-y-10 text-center md:text-left">
                            <div className="space-y-4 max-w-2xl">
                                <h3 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-none uppercase text-white">Oasis <br />Founder <span className="text-indigo-200">Protocol.</span></h3>
                                <p className="text-indigo-100 font-bold uppercase tracking-widest text-xs md:text-sm leading-relaxed italic opacity-80">Phase 01: Onboard local businesses to become an official Oasis Founder. Earn recurring equity in the municipal trade lattice.</p>
                            </div>
                            <Link href="/register-business" className="inline-flex px-14 py-7 bg-white text-indigo-600 font-black uppercase tracking-[0.2em] text-[11px] rounded-[2.5rem] hover:scale-105 active:scale-95 transition-all shadow-2xl italic">Activate Onboarding Uplink</Link>
                         </div>
                    </div>
                </section>

                <footer className="text-center pt-20 border-t border-white/5">
                     <p className="text-white/10 text-[10px] font-black uppercase tracking-[0.6em] italic italic">Oasis United HQ &bull; San Francisco Hub &bull; Lattice 0.4.1</p>
                </footer>
            </main>
        </div>
    );
}
