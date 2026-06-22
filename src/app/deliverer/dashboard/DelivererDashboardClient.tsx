"use client";
import { useState, Suspense } from 'react';
import TownRegistrationForm from '@/components/deliverer/TownRegistrationForm';
import RouteManagement from '@/components/deliverer/RouteManagement';
import LiveFleetPulse from '@/components/delivery/LiveFleetPulse';
import Link from 'next/link';

export default function DelivererDashboardClient() {
    const [activeTab, setActiveTab] = useState<'towns' | 'routes' | 'pulse'>('towns');

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-indigo-500 pb-48 selection:text-white">
            
            {/* 🛰️ IMMERSIVE LOGISTICS HEADER */}
            <header className="relative pt-40 pb-56 px-8 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1000px] bg-gradient-to-b from-indigo-500/10 via-[#0a0a0b] to-transparent pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 blur-[150px] -mr-48 -mt-48 rounded-full pointer-events-none"></div>

                <div className="max-w-7xl mx-auto relative z-10 space-y-16 animate-in slide-in-from-top-12 duration-1000">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Regional Fleet Command Centre</span>
                        </div>
                        <h1 className="text-8xl md:text-[11rem] font-black italic tracking-tighter leading-[0.8] uppercase text-white">
                            Fleet <br /><span className="text-indigo-500">Command.</span>
                        </h1>
                        <p className="max-w-2xl text-white/40 font-medium text-xl md:text-2xl leading-relaxed italic">
                            The independent operational node for logistics masters, regional expansionists, and decentralized fleet agents.
                        </p>
                    </div>

                    <nav className="flex gap-4 p-2 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] w-fit overflow-x-auto no-scrollbar shadow-3xl">
                        {[
                            { id: 'towns', label: 'Settlement Hubs', icon: '🛰️' },
                            { id: 'routes', label: 'Deployment Routes', icon: '🚚' },
                            { id: 'pulse', label: 'Fleet Telemetry', icon: '⚡' }
                        ].map((tab) => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all whitespace-nowrap italic flex items-center gap-4 ${
                                    activeTab === tab.id ? 'bg-white text-black shadow-2xl scale-105' : 'text-white/40 hover:text-white/80'
                                }`}
                            >
                                <span className="text-lg">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                        <div className="w-[1px] h-10 bg-white/10 self-center mx-2"></div>
                        <Link 
                            href="/fleet-portal"
                            target="_blank"
                            className="px-8 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] whitespace-nowrap italic flex items-center gap-4 bg-indigo-600 text-white shadow-3xl shadow-indigo-600/40 hover:scale-105 transition-all outline-none"
                        >
                            <span className="text-lg">📺</span>
                            Launch Portal Monitor
                        </Link>
                    </nav>
                </div>
            </header>


            <main className="max-w-7xl mx-auto px-8 -mt-32 pb-32">
                <div className="space-y-32 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                    
                    {activeTab === 'towns' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
                             <div className="lg:col-span-7">
                                <TownRegistrationForm onComplete={() => setActiveTab('routes')} />
                             </div>
                             
                             <div className="lg:col-span-5 space-y-16 py-12">
                                <div className="space-y-6">
                                    <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none text-white">Territory <br /><span className="text-indigo-500">Intelligence.</span></h2>
                                    <p className="text-white/40 font-medium text-xl leading-relaxed italic">Expand the Oasis regional trade lattice by establishing new municipal hubs. As an anchor agent, you control the autonomous delivery dispatch for these settlements.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3.5rem] space-y-6 shadow-3xl group hover:bg-white/[0.04] transition-all">
                                        <div className="text-4xl filter grayscale group-hover:grayscale-0 transition-all duration-700">🌍</div>
                                        <div className="space-y-2">
                                            <h4 className="font-black italic text-xl tracking-tighter uppercase leading-none text-white">Lattice Mirror.</h4>
                                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400 opacity-60 leading-relaxed italic">Towns established are immediately synchronized across the global discovery matrix.</p>
                                        </div>
                                    </div>
                                    <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3.5rem] space-y-6 shadow-3xl group hover:bg-white/[0.04] transition-all">
                                        <div className="text-4xl filter grayscale group-hover:grayscale-0 transition-all duration-700">💰</div>
                                        <div className="space-y-2">
                                            <h4 className="font-black italic text-xl tracking-tighter uppercase leading-none text-white">Asset Priority.</h4>
                                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400 opacity-60 leading-relaxed italic">Independent partners retain first-right dispatch for settlements they establish.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-10 bg-indigo-500/5 border border-indigo-500/10 rounded-[3rem] text-center">
                                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.5em] italic">"Operational autonomy confirmed for Region 28 Lattice"</p>
                                </div>
                             </div>
                        </div>
                    ) : activeTab === 'routes' ? (
                        <RouteManagement />
                    ) : (
                        <LiveFleetPulse />
                    )}

                    {/* 🏗️ FOUNDER ONBOARDING PORTAL */}
                    <section className="relative p-16 md:p-24 bg-white/[0.02] border border-white/5 rounded-[5rem] overflow-hidden group shadow-3xl">
                         <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none scale-[2.5] rotate-12 group-hover:scale-[2.8] transition-transform duration-1000">🚛</div>
                         <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-16">
                            <div className="space-y-6 max-w-2xl text-center lg:text-left">
                                <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white uppercase leading-[0.8]">Merchant <br /><span className="text-indigo-500">Onboarding.</span></h2>
                                <p className="text-white/40 font-medium text-xl md:text-2xl italic leading-relaxed">Ready to sequence local independent boutiques into your regional dispatch loop?</p>
                            </div>
                            <Link href="/manual" className="px-14 py-7 bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl italic">Activate Merchant Manual</Link>
                         </div>
                    </section>
                </div>
            </main>

            {/* 🚥 TACTICAL FOOTER */}
            <footer className="max-w-7xl mx-auto px-8 pt-48 border-t border-white/5 grid grid-cols-1 md:grid-cols-4 gap-20 pb-20">
                <div className="space-y-8">
                    <h2 className="text-6xl font-black italic tracking-tighter text-white uppercase leading-none">Oasis <br /><span className="text-indigo-500">Force.</span></h2>
                    <p className="text-lg font-medium leading-relaxed italic text-white/20 uppercase tracking-tight">Decentralized logistics for the independent regional lattice.</p>
                </div>
                <div className="space-y-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Operate Protocol</h4>
                    <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest text-white/40 italic">
                        <li className="hover:text-white cursor-pointer transition-colors">My Settlements</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Deployment Routes</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Fleet Telemetry</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Earnings Ledger</li>
                    </ul>
                </div>
                <div className="space-y-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Regional Expansion</h4>
                    <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest text-white/40 italic">
                        <li className="hover:text-white cursor-pointer transition-colors">Open Town Hub</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Partner Directives</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Global Discovery</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Recruitment</li>
                    </ul>
                </div>
                <div className="space-y-8 text-right">
                    <p className="text-[9px] font-black uppercase tracking-[0.6em] text-white/10 italic">SYSTEM_UPLINK v0.4.1</p>
                    <p className="text-[9px] font-black uppercase tracking-[0.6em] text-white/10 italic">LATTICE_INTEGRITY: 100%</p>
                </div>
            </footer>
        </div>
    );
}
