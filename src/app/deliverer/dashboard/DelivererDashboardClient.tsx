"use client";
import { useState, Suspense } from 'react';
import TownRegistrationForm from '@/components/deliverer/TownRegistrationForm';
import RouteManagement from '@/components/deliverer/RouteManagement';
import LiveFleetPulse from '@/components/delivery/LiveFleetPulse';
import Link from 'next/link';

export default function DelivererDashboardClient() {
    const [activeTab, setActiveTab] = useState<'towns' | 'routes' | 'pulse'>('towns');

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] selection:bg-[hsl(var(--primary))] selection:text-[hsl(var(--primary-foreground))] pb-48">
            
            {/* Header / Hero */}
            <header className="relative pt-32 pb-48 px-8 overflow-hidden oasis-gradient-dark">
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30">
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
                </div>
                <div className="absolute top-[20%] right-[-10%] w-[50%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full"></div>

                <div className="max-w-7xl mx-auto relative z-10 space-y-12">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-400/10 border border-indigo-400/20 rounded-full">
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Network Command Centre</span>
                        </div>
                        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter leading-none uppercase">Deliverer <br />Control <span className="text-indigo-500">Hub.</span></h1>
                        <p className="max-w-xl text-[hsl(var(--muted-foreground))] font-medium text-lg leading-relaxed italic">The independent dashboard for logistics masters, territory owners, and regional expansionists.</p>
                    </div>

                    <nav className="flex gap-4 p-1 glass-dark rounded-[1.5rem] w-fit overflow-x-auto">
                        {['towns', 'routes', 'pulse'].map((tab) => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-10 py-5 rounded-[1.2rem] font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap ${
                                    activeTab === tab ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/20 shadow-indigo-600/40' : 'text-white/40 hover:text-white/80'
                                }`}
                            >
                                {tab === 'towns' ? '🛰️ Town Hubs' : tab === 'routes' ? '🚚 Deployment Routes' : '⚡ Live Fleet Pulse'}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 -mt-24 pb-32">
                <div className="space-y-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    {activeTab === 'towns' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                            <TownRegistrationForm onComplete={() => setActiveTab('routes')} />
                            <div className="space-y-12 pt-12">
                                <div className="space-y-6">
                                    <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Territory <br />Insight.</h2>
                                    <p className="text-gray-400 font-medium text-lg leading-relaxed">Expand the Oasis Network by establishing new regional hubs. As an opener, you control the first delivery dispatches for these areas.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-4 shadow-xl">
                                        <div className="text-2xl">🌍</div>
                                        <h4 className="font-black italic text-lg tracking-tighter uppercase leading-none">Global Link.</h4>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 opacity-60 leading-tight">Towns you open are mirrored across the entire network discovery engine.</p>
                                    </div>
                                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-4 shadow-xl">
                                        <div className="text-2xl">💰</div>
                                        <h4 className="font-black italic text-lg tracking-tighter uppercase leading-none">Priority.</h4>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 opacity-60 leading-tight">Independent partners get priority access to orders in their established settlements.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'routes' ? (
                        <RouteManagement />
                    ) : (
                        <LiveFleetPulse />
                    )}

                    <section className="bg-indigo-600 rounded-[4rem] p-12 md:p-24 shadow-3xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none grayscale group-hover:grayscale-0 group-hover:opacity-20 transition-all duration-1000">
                             <span className="text-[320px] italic font-black select-none leading-none">🏗️</span>
                         </div>
                         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-16">
                            <div className="space-y-6">
                                <h2 className="text-7xl font-black italic tracking-tighter text-white uppercase leading-none">Community <br />Onboarding.</h2>
                                <p className="text-indigo-100/60 font-medium text-xl max-w-sm italic">Ready to add local independent stores to your new town?</p>
                            </div>
                            <Link href="/manual" className="px-12 py-6 bg-white text-indigo-600 font-black uppercase tracking-widest text-[11px] rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl">Launch Merchant Manual</Link>
                         </div>
                    </section>
                </div>
            </main>

            <footer className="max-w-7xl mx-auto px-8 pt-48 border-t border-white/5 grid grid-cols-1 md:grid-cols-4 gap-24 opacity-30 hover:opacity-60 transition-opacity duration-1000">
                <div className="space-y-8">
                    <h2 className="text-5xl font-black italic tracking-tighter text-white uppercase">Oasis.</h2>
                    <p className="text-base font-medium leading-relaxed italic">Empowering the decentralized delivery force of the future.</p>
                </div>
                <div className="space-y-6">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">Operate</h4>
                    <ul className="space-y-3 text-sm font-bold uppercase tracking-tighter"><li>My Settlements</li><li>Active Routes</li><li>Fleet Protocol</li><li>Earnings Ledger</li></ul>
                </div>
                <div className="space-y-6">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">Expand</h4>
                    <ul className="space-y-3 text-sm font-bold uppercase tracking-tighter"><li>Open Town</li><li>Partner Manual</li><li>Global Map</li><li>Recruitment</li></ul>
                </div>
                <div className="space-y-6">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">Nexus</h4>
                    <ul className="space-y-3 text-sm font-bold uppercase tracking-tighter"><li>Driver News</li><li>Network Alerts</li><li>Status Board</li><li>Support</li></ul>
                </div>
            </footer>
        </div>
    );
}
