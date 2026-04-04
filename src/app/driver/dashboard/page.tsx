"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DriverDashboard() {
    const [driver, setDriver] = useState<any>(null);
    const [deliveries, setDeliveries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ todayEarnings: 0, completedCount: 0 });

    useEffect(() => {
        async function loadDriverData() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Updated to deliverer_profiles table as per the latest schema
            const { data: drv } = await supabase
                .from('deliverer_profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (drv) {
                setDriver(drv);
                // In a production app, we'd fetch actual today earnings/count
                setStats({ todayEarnings: 142.50, completedCount: 8 });
                
                // Fetch deliveries if driver is active
                if (drv.status !== 'offline') {
                    const res = await fetch(`/api/logistics?driverId=${drv.id}`);
                    const data = await res.json();
                    if (data.success) setDeliveries(data.deliveries);
                }
            }
            setLoading(false);
        }
        loadDriverData();
    }, []);

    const toggleActiveStatus = async () => {
        if (!driver) return;
        const newStatus = driver.status === 'offline' ? 'available' : 'offline';
        
        const { error } = await supabase
            .from('deliverer_profiles')
            .update({ 
                status: newStatus,
                is_active: newStatus === 'available'
            })
            .eq('id', driver.id);

        if (!error) {
            setDriver({ ...driver, status: newStatus, is_active: newStatus === 'available' });
        }
    };

    const updateLocation = async () => {
        if (!driver || driver.status === 'offline') return;
        // Mocking GPS update for development using the deliverer_profile POINT
        const lat = 47.6062 + (Math.random() - 0.5) * 0.01;
        const lng = -122.3321 + (Math.random() - 0.5) * 0.01;

        const { error } = await supabase
            .from('deliverer_profiles')
            .update({
                last_known_location: `(${lat}, ${lng})`
            })
            .eq('id', driver.id);

        if (!error) {
            setDriver({ ...driver, last_known_location: { x: lat, y: lng } });
            alert('📍 Location broadcasted to dispatch network.');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center">
            <div className="text-indigo-500 font-black animate-pulse uppercase tracking-[0.4em] text-xs">Synchronizing Fleet...</div>
        </div>
    );

    if (!driver) return (
        <div className="min-h-screen bg-[#0d0d0f] p-12 flex flex-col items-center justify-center text-center space-y-10">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-6xl opacity-20 grayscale">🚚</span>
            </div>
            <div className="space-y-4">
                <h1 className="text-4xl font-black italic tracking-tighter uppercase">Fleet Profile <span className="text-indigo-500">Not Found.</span></h1>
                <p className="text-gray-500 max-w-sm mx-auto font-medium text-lg leading-relaxed italic">You haven't been registered in the Oasis delivery node. Contact a regional agent to join.</p>
            </div>
            <button className="px-10 py-5 bg-indigo-600 text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-105 active:scale-95 transition-all">Request Commission</button>
        </div>
    );

    const isActive = driver.status !== 'offline';

    return (
        <div className="min-h-screen bg-[#0d0d0f] text-white selection:bg-indigo-500 selection:text-white">
            {/* Top Performance Header */}
            <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-[100]">
                <div className="max-w-7xl mx-auto px-8 md:px-12 py-6 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-2xl">⚡</div>
                        <div>
                            <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">Network <span className="text-indigo-500">Dispatch</span></h1>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mt-1">Fleet Node: {driver.id.slice(0, 8)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-10">
                        <div className="text-right hidden sm:block">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-0.5">Today's Earnings</p>
                            <p className="text-2xl font-black italic tracking-tighter text-emerald-400">${stats.todayEarnings.toFixed(2)}</p>
                        </div>
                        <div className="text-right hidden sm:block border-l border-white/10 pl-10">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-0.5">Success Rate</p>
                            <p className="text-2xl font-black italic tracking-tighter">98.4%</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-8 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    
                    {/* Left Column: Control Center */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Dispatch Toggle Console */}
                        <div className={`relative p-1 rounded-[3.5rem] border-2 transition-all duration-700 ${isActive ? 'border-indigo-500 shadow-[0_0_80px_rgba(99,102,241,0.1)]' : 'border-white/10 hover:border-white/20'}`}>
                            <div className="bg-[#1a1a1f] p-10 rounded-[3.2rem] space-y-10 relative overflow-hidden group">
                                {isActive && (
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.05)_0%,_transparent_70%)] animate-pulse"></div>
                                )}
                                
                                <div className="space-y-4 relative z-10 text-center">
                                    <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6 shadow-2xl transition-all duration-700 ${isActive ? 'bg-indigo-600 scale-110' : 'bg-white/5 opacity-50 grayscale'}`}>
                                        {isActive ? '📡' : '💤'}
                                    </div>
                                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                                        {isActive ? 'Live' : 'Offline'}
                                    </h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 leading-relaxed max-w-[200px] mx-auto">
                                        {isActive ? 'Active on the dispatch network and ready for deliveries.' : 'System standby. Activate console to start shift.'}
                                    </p>
                                </div>

                                <button
                                    onClick={toggleActiveStatus}
                                    className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 shadow-2xl ${
                                        isActive 
                                        ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-900/40 text-white' 
                                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/40 text-white'
                                    }`}
                                >
                                    {isActive ? 'End Dispatch Shift' : 'Initiate Active Protocol'}
                                </button>
                            </div>
                        </div>

                        {/* Telemetry Actions */}
                        <div className="bg-white/[0.03] border border-white/5 rounded-[3rem] p-8 space-y-6">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30 px-2">Telematics Console</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    disabled={!isActive}
                                    onClick={updateLocation}
                                    className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group disabled:opacity-30 disabled:pointer-events-none"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Broadcast Position</span>
                                    <span className="text-xl group-hover:rotate-12 transition-transform">📍</span>
                                </button>
                                <button
                                    className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 text-left">Route Analytics</span>
                                    <span className="text-xl group-hover:rotate-12 transition-transform">📊</span>
                                </button>
                            </div>
                        </div>

                        {/* Recent Stats Summary */}
                        <div className="bg-white/[0.03] border border-white/5 rounded-[3rem] p-8">
                            <div className="grid grid-cols-2 gap-8 text-center uppercase tracking-tighter italic">
                                <div>
                                    <p className="text-[8px] font-black text-white/40 mb-2">Shift Stops</p>
                                    <p className="text-4xl font-black text-white">{stats.completedCount}</p>
                                </div>
                                <div className="border-l border-white/10">
                                    <p className="text-[8px] font-black text-white/40 mb-2">Network Rank</p>
                                    <p className="text-4xl font-black text-indigo-500">#4</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Active Queue & Real-time Info */}
                    <div className="lg:col-span-3 space-y-12">
                        {!isActive ? (
                            <div className="bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center py-48 text-center space-y-8 animate-in fade-in duration-1000">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] animate-pulse"></div>
                                    <div className="relative w-32 h-32 bg-white/5 rounded-full flex items-center justify-center text-7xl grayscale opacity-30">
                                        🌑
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white/20">Awaiting Signal.</h2>
                                    <p className="text-gray-600 font-medium text-lg italic max-w-sm">Dispatch is currently offline. Activate your node to synchronize with regional order flow.</p>
                                </div>
                                <button 
                                    onClick={toggleActiveStatus}
                                    className="px-8 py-4 bg-indigo-600 text-white rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl transform hover:scale-105 active:scale-95 transition-all"
                                >
                                    Activate System
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="flex justify-between items-end px-4">
                                    <div className="space-y-2">
                                        <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Active <span className="text-indigo-500">Dispatch.</span></h2>
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1">Current Delivery Chain Sequence</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all italic">Sort By Priority</button>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {deliveries.length === 0 ? (
                                        <div className="bg-white/5 border border-white/5 rounded-[3.5rem] p-32 text-center space-y-8 group relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-12 opacity-5 grayscale pointer-events-none group-hover:opacity-10 transition-opacity">
                                                <span className="text-[200px] font-black italic leading-none text-white">READY</span>
                                            </div>
                                            <div className="relative z-10 space-y-6">
                                                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-4xl shadow-2xl border border-indigo-500/20">✨</div>
                                                <div className="space-y-2">
                                                    <p className="font-black text-3xl italic uppercase tracking-tighter">Queue Clear.</p>
                                                    <p className="text-white/20 text-sm font-medium italic max-w-md mx-auto">Marketplace pulse is steady. You will be notified the moment a new route is calculated.</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        deliveries.map((del, idx) => (
                                            <div key={del.id} className="group bg-[#1a1a1f] border border-white/5 rounded-[4rem] p-10 hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all flex flex-col md:flex-row items-center gap-10 shadow-3xl animate-in slide-in-from-right-8 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                                {/* Sequence ID with Visual Connection */}
                                                <div className="relative flex flex-col items-center gap-4">
                                                    <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-4xl font-black italic shadow-2xl group-hover:scale-110 transition-transform duration-700">
                                                        {idx + 1}
                                                    </div>
                                                </div>

                                                <div className="flex-1 space-y-6 text-center md:text-left">
                                                    <div className="space-y-2">
                                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                                            <h3 className="font-black text-3xl tracking-tighter uppercase leading-none group-hover:text-indigo-400 transition-colors">{del.orders?.customer_name || 'Boutique Treasure'}</h3>
                                                            <span className="px-4 py-1.5 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-widest text-indigo-400 border border-white/5 self-start md:self-auto mx-auto md:mx-0">
                                                                {del.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-lg text-white/40 font-medium italic">{del.orders?.delivery_address}</p>
                                                    </div>
                                                    
                                                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                                        <div className="px-4 py-2 bg-black rounded-xl border border-white/5 flex items-center gap-2">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Value</span>
                                                            <span className="text-sm font-black italic text-emerald-400">${del.orders?.total}</span>
                                                        </div>
                                                        <div className="px-4 py-2 bg-black rounded-xl border border-white/5 flex items-center gap-2">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Items</span>
                                                            <span className="text-sm font-black italic">{Object.keys(del.orders?.items || {}).length} Units</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button className="w-full md:w-auto px-12 py-6 bg-white text-indigo-600 rounded-[2rem] font-black text-[12px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-3xl hover:bg-indigo-600 hover:text-white">
                                                    Mark Delivered
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
