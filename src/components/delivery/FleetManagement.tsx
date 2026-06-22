"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface FleetAgent {
    id: string;
    name: string;
    type: 'marketing' | 'delivery';
    status: 'active' | 'idle' | 'busy' | 'recharging';
    location: string;
    reach?: number; // Marketing reach
    latency?: number; // Delivery speed
    evStatus?: number; // 0-100 fuel/battery
}

export default function FleetManagement() {
    const [agents, setAgents] = useState<FleetAgent[]>([
        { id: 'm1', name: 'Agent Atlas', type: 'marketing', status: 'active', location: 'Freedom Sq', reach: 4500 },
        { id: 'm2', name: 'Agent Vista', type: 'marketing', status: 'busy', location: 'Commercial Row', reach: 8200 },
        { id: 'd1', name: 'Racer Zero', type: 'delivery', status: 'active', location: 'Main & 4th', latency: 4.2, evStatus: 88 },
        { id: 'd2', name: 'Racer Flux', type: 'delivery', status: 'recharging', location: 'Node Station Alpha', latency: 6.8, evStatus: 12 }
    ]);
    const [doordashEnabled, setDoordashEnabled] = useState(false);
    const [viewMode, setViewMode] = useState<'roster' | 'radar'>('roster');

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Fleet Perspective Switch */}
            <div className="flex bg-white/5 p-2 rounded-[2rem] border border-white/5 w-fit">
                <button 
                    onClick={() => setViewMode('roster')}
                    className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'roster' ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white'}`}
                >
                    Tactical Roster
                </button>
                <button 
                    onClick={() => setViewMode('radar')}
                    className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'radar' ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white'}`}
                >
                    Live Node Radar
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Left: Marketing Engine */}
                <div className="bg-[#0c0c0e] border border-amber-400/10 p-12 rounded-[4rem] space-y-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-16 opacity-[0.03] select-none pointer-events-none group-hover:opacity-10 transition-opacity">
                        <span className="text-[120px] font-black italic leading-none text-amber-400">PROPEL</span>
                    </div>
                    
                    <div className="flex justify-between items-start relative z-10">
                        <div className="space-y-3">
                            <h3 className="text-4xl font-black italic tracking-tighter uppercase text-white">Marketing <span className="text-amber-400">Agents.</span></h3>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Amplifying regional boutique reach</p>
                        </div>
                        <div className="p-4 bg-amber-400/10 border border-amber-400/20 rounded-3xl">
                            <span className="text-2xl">📢</span>
                        </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                        {agents.filter(a => a.type === 'marketing').map(agent => (
                            <div key={agent.id} className="flex items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-3xl hover:bg-white/[0.05] transition-all">
                                <div className="flex items-center gap-5">
                                    <div className={`w-3 h-3 rounded-full ${agent.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                                    <div>
                                        <p className="text-sm font-black text-white uppercase italic">{agent.name}</p>
                                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Active at {agent.location}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-amber-400 uppercase tracking-widest">Global Reach</p>
                                    <p className="text-xl font-black italic text-white leading-none">{agent.reach?.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full py-6 bg-amber-400 text-black rounded-[2.2rem] font-black text-[12px] uppercase tracking-[0.4em] hover:scale-[1.02] shadow-2xl transition-all">Dispatch Marketing Protocol</button>
                </div>

                {/* Right: Logistics Force */}
                <div className="bg-[#0c0c0e] border border-indigo-500/10 p-12 rounded-[4rem] space-y-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-16 opacity-[0.03] select-none pointer-events-none group-hover:opacity-10 transition-opacity">
                        <span className="text-[120px] font-black italic leading-none text-indigo-500">KINETIC</span>
                    </div>

                    <div className="flex justify-between items-start relative z-10">
                        <div className="space-y-3">
                            <h3 className="text-4xl font-black italic tracking-tighter uppercase text-white">Delivery <span className="text-indigo-500">Force.</span></h3>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Autonomous logistics & door-to-node dispatch</p>
                        </div>
                        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl">
                            <span className="text-2xl">🚚</span>
                        </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                        {agents.filter(a => a.type === 'delivery').map(agent => (
                            <div key={agent.id} className="p-6 bg-white/[0.03] border border-white/5 rounded-[2.5rem] space-y-5 hover:bg-white/[0.05] transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-3 h-3 rounded-full ${agent.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                                        <div>
                                            <p className="text-sm font-black text-white uppercase italic">{agent.name}</p>
                                            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{agent.location}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Latency (Min)</p>
                                        <p className="text-xl font-black italic text-white leading-none">{agent.latency}m</p>
                                    </div>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full transition-all duration-1000 ${agent.evStatus! < 20 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${agent.evStatus}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <button className="flex-[2] py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.4em] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">Sync Fleet Matrix</button>
                        <button 
                            onClick={() => setDoordashEnabled(!doordashEnabled)}
                            className={`flex-1 py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest border transition-all ${doordashEnabled ? 'bg-[#FF3008] border-[#FF3008] text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
                        >
                            {doordashEnabled ? 'DoorDash: ON' : 'Overflow: OFF'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Global Efficiency Pulse */}
            <div className="bg-white/[0.02] border border-white/5 p-12 rounded-[4rem] flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="space-y-2 text-center md:text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">System Performance Metrics</p>
                    <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter">Decentralized Logistics <span className="text-indigo-400">Node Sync.</span></h4>
                </div>
                <div className="flex gap-12">
                    <div className="text-center">
                        <p className="text-4xl font-black italic text-white">99.8%</p>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Uptime Latency</p>
                    </div>
                    <div className="text-center">
                        <p className="text-4xl font-black italic text-emerald-500">v1.0.8</p>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Operational Core</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
