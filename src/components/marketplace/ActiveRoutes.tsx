"use client";
import { useEffect, useState } from 'react';

export default function ActiveRoutes() {
    const liveRoutes = [
        { id: 1, driver: 'Local Dave', route: 'Effingham Main Loop', status: 'In Transit', active: true },
        { id: 2, driver: 'Freedom Phil', route: 'Village Supply Run', status: 'Loading', active: true },
    ];

    return (
        <section className="bg-[hsl(var(--secondary))/0.05] rounded-[4rem] p-12 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none grayscale group-hover:grayscale-0 group-hover:opacity-20 transition-all duration-1000">
                <span className="text-[120px] italic font-black select-none leading-none">🚚</span>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-400/10 border border-indigo-400/20 rounded-full">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Live Logistics</span>
                    </div>
                    <h2 className="text-5xl font-black italic tracking-tighter leading-none">Network <br />Dispatch.</h2>
                </div>
                <p className="text-gray-400 font-medium text-lg max-w-sm leading-relaxed">View real-time delivery loops defined by local community drivers. Order now to catch a moving dispatch.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {liveRoutes.map((route) => (
                    <div key={route.id} className="bg-white/[0.03] backdrop-blur-3xl p-8 rounded-[3rem] border border-white/10 flex items-start gap-6 hover:bg-white/[0.05] hover:border-white/20 transition-all group/route cursor-default group">
                        <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center text-3xl shrink-0 border border-white/5 group-hover:scale-110 transition-transform">
                            📍
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">{route.driver}</span>
                                <span className="text-[9px] font-bold uppercase py-1 px-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">{route.status}</span>
                            </div>
                            <h3 className="font-bold text-xl tracking-tight leading-snug text-white/90">{route.route}</h3>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                                <div className="h-full bg-indigo-500 w-[65%] rounded-full animate-pulse transition-all"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
