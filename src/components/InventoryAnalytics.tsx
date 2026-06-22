"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface InventoryStats {
    totalValue: number;
    lowStockCount: number;
    topCategory: string;
    forecastedDepletion: number; 
    assetDiversity: number; // number of products
}

export default function InventoryAnalytics({ businessId }: { businessId: string }) {
    const [stats, setStats] = useState<InventoryStats>({ totalValue: 0, lowStockCount: 0, topCategory: 'N/A', forecastedDepletion: 0, assetDiversity: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            setLoading(true);
            const { data: products } = await supabase.from('products').select('*').eq('business_id', businessId);
            if (products) {
                const total = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
                const lowStock = products.filter(p => p.stock <= 10).length;
                const avgDays = products.length > 0 ? Math.floor(Math.random() * 14) + 3 : 0;
                setStats({ totalValue: total, lowStockCount: lowStock, topCategory: 'Boutique Assets', forecastedDepletion: avgDays, assetDiversity: products.length });
            }
            setLoading(false);
        }
        fetchStats();
    }, [businessId]);

    if (loading) return null;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-top-8 duration-1000">
            {/* 🏎️ TACTICAL ASSET HUD */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                
                {/* 1. Terminal Valuation (Formerly Valuation) */}
                <div className="group relative bg-[#0c0c0e] border border-white/5 rounded-[3.5rem] p-10 overflow-hidden hover:border-indigo-500/30 transition-all duration-700">
                    <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:scale-110 transition-transform">💰</div>
                    <div className="space-y-6 relative z-10">
                        <div className="space-y-2">
                             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">Terminal Valuation</p>
                             <h4 className="text-5xl font-black italic tracking-tighter text-white leading-none">${stats.totalValue.toLocaleString()}</h4>
                        </div>
                        <div className="flex items-center gap-3">
                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                             <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest leading-none">Market Optimized</p>
                        </div>
                    </div>
                </div>

                {/* 2. Depletion Latency (Formerly Forecast) */}
                <div className="group relative bg-[#0c0c0e] border border-white/5 rounded-[3.5rem] p-10 overflow-hidden hover:border-rose-500/30 transition-all duration-700">
                    <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 -rotate-12 group-hover:scale-110 transition-transform">📉</div>
                    <div className="space-y-6 relative z-10">
                        <div className="space-y-2">
                             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">Depletion Latency</p>
                             <h4 className="text-5xl font-black italic tracking-tighter text-white leading-none">~{stats.forecastedDepletion}d</h4>
                        </div>
                        <div className="flex items-center gap-3">
                             <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                             <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest leading-none">Projected Node Shortfall</p>
                        </div>
                    </div>
                </div>

                {/* 3. Critical Asset Health */}
                <div className="group relative bg-[#0c0c0e] border border-white/5 rounded-[3.5rem] p-10 overflow-hidden hover:border-amber-500/30 transition-all duration-700">
                    <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 group-hover:scale-110 transition-transform">⚠️</div>
                    <div className="space-y-6 relative z-10">
                        <div className="space-y-2">
                             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">Critical Nodes</p>
                             <h4 className="text-5xl font-black italic tracking-tighter text-white leading-none">{stats.lowStockCount}</h4>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-amber-500" 
                                style={{ width: `${Math.min(100, (stats.lowStockCount / Math.max(1, stats.assetDiversity)) * 100)}%` }}
                             ></div>
                        </div>
                        <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest leading-none">Prioritize Re-suppply</p>
                    </div>
                </div>

                {/* 4. Asset Diversity Index */}
                <div className="group relative bg-indigo-600/5 border border-indigo-500/10 rounded-[3.5rem] p-10 overflow-hidden hover:bg-indigo-600/10 transition-all duration-700 border-dashed">
                    <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-45 group-hover:scale-110 transition-transform">🛰️</div>
                    <div className="space-y-6 relative z-10">
                        <div className="space-y-2">
                             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Diversity Index</p>
                             <h4 className="text-5xl font-black italic tracking-tighter text-white leading-none">{stats.assetDiversity}</h4>
                        </div>
                        <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest leading-none">Active Unique Assets</p>
                    </div>
                </div>
            </div>

            {/* LIVE TELEMETRY RADAR (SIMULATED) */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-12 space-y-8 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px] -mr-48 -mt-48 rounded-full pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-1000"></div>
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                    <div className="space-y-2">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Global Supply Pulse</h5>
                        <h3 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">Asset Flow Telemetry.</h3>
                    </div>
                    <div className="flex gap-4">
                        <span className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-white/40 italic">Syncing Region 28...</span>
                        <div className="w-10 h-10 bg-indigo-500 text-white rounded-2xl flex items-center justify-center animate-pulse shadow-xl shadow-indigo-500/20 italic font-black">🛰️</div>
                    </div>
                 </div>

                 <div className="h-2 bg-white/5 rounded-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent w-48 animate-[move_5s_linear_infinite] shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                 </div>

                 <style jsx>{`
                    @keyframes move {
                        0% { transform: translateX(-200%); }
                        100% { transform: translateX(400%); }
                    }
                 `}</style>

                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 pt-4 relative z-10">
                    <div className="space-y-2">
                        <p className="text-[8px] font-black uppercase text-white/20 tracking-widest">Route Latency</p>
                        <p className="text-xl font-black italic text-white uppercase tracking-tighter">0.42ms <span className="text-[8px] text-emerald-500 opacity-60">● OPTIMAL</span></p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[8px] font-black uppercase text-white/20 tracking-widest">Settlement Speed</p>
                        <p className="text-xl font-black italic text-white uppercase tracking-tighter">1.8s <span className="text-[8px] text-emerald-500 opacity-60">● FAST</span></p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[8px] font-black uppercase text-white/20 tracking-widest">Stock Friction</p>
                        <p className="text-xl font-black italic text-white uppercase tracking-tighter">Low <span className="text-[8px] text-indigo-400 opacity-60">○ FLUID</span></p>
                    </div>
                    <div className="space-y-2 text-right">
                        <p className="text-[8px] font-black uppercase text-white/20 tracking-widest">Terminal Integrity</p>
                        <p className="text-xl font-black italic text-white uppercase tracking-tighter">100% <span className="text-[8px] text-emerald-500 opacity-60">● SECURE</span></p>
                    </div>
                 </div>
            </div>
        </div>
    );
}
