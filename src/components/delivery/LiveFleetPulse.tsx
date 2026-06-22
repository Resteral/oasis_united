"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function LiveFleetPulse() {
    const [isTracking, setIsTracking] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

    useEffect(() => {
        async function fetchActiveOrders() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase.from('orders').select('*').eq('driver_id', user.id).in('status', ['claimed', 'picked_up']).order('created_at', { ascending: false });
            setOrders(data || []);
            setLoading(false);
        }
        fetchActiveOrders();
    }, []);

    useEffect(() => {
        let watchId: number;
        if (isTracking && navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ lat: latitude, lng: longitude });
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await supabase.from('deliverer_profiles').update({ last_known_location: `(${longitude},${latitude})`, status: 'busy' }).eq('id', user.id);
                    }
                },
                (err) => console.error("GPS Signal Interference:", err),
                { enableHighAccuracy: true }
            );
        }
        return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
    }, [isTracking]);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
        if (!error) setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    };

    return (
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            
            {/* 🛰️ GPS TELEMETRY TERMINAL */}
            <div className={`p-16 rounded-[4.5rem] border transition-all duration-1000 relative overflow-hidden ${isTracking ? 'bg-indigo-600/10 border-indigo-400/30' : 'bg-white/[0.02] border-white/5'}`}>
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px] -mr-48 -mt-48 rounded-full pointer-events-none transition-opacity duration-1000" style={{ opacity: isTracking ? 1 : 0.2 }}></div>
                
                <div className="flex flex-col lg:flex-row justify-between items-center gap-12 text-center lg:text-left relative z-10">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-4 px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                            <span className={`w-2 h-2 rounded-full ${isTracking ? 'bg-emerald-500 animate-ping' : 'bg-white/20'}`}></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">{isTracking ? 'FLEET SIGNAL: ACTIVE' : 'RADAR SYSTEM: STANDBY'}</span>
                        </div>
                        <h3 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase leading-none text-white">Lattice <br /><span className="text-indigo-500">Telemetry.</span></h3>
                        <p className="text-white/40 font-medium text-lg md:text-xl italic max-w-lg">Synchronize your precise regional coordinates with the Oasis Global Market discoveries.</p>
                    </div>
                    
                    <button 
                        onClick={() => setIsTracking(!isTracking)}
                        className={`px-14 py-7 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[11px] transition-all shadow-3xl hover:scale-[1.03] active:scale-95 italic ${
                            isTracking ? 'bg-amber-400 text-black shadow-amber-400/20' : 'bg-white text-black hover:bg-white'
                        }`}
                    >
                        {isTracking ? 'Deactivate Radar' : 'Initialize Dispatch 🚀'}
                    </button>
                </div>

                {isTracking && (
                    <div className="mt-16 pt-12 border-t border-white/5 space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">Hub Latitude</p>
                                <div className="text-3xl font-black italic text-white tracking-tighter bg-white/5 px-8 py-4 rounded-3xl border border-white/5 font-mono">
                                    {location?.lat.toFixed(6) || 'LOCKING...'}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">Hub Longitude</p>
                                <div className="text-3xl font-black italic text-white tracking-tighter bg-white/5 px-8 py-4 rounded-3xl border border-white/5 font-mono">
                                    {location?.lng.toFixed(6) || 'LOCKING...'}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">Operational Status</p>
                                <div className="text-3xl font-black italic text-indigo-400 tracking-tighter bg-indigo-500/10 px-8 py-4 rounded-3xl border border-indigo-500/20">
                                    TRANSMITTING
                                </div>
                            </div>
                         </div>
                    </div>
                )}
            </div>

            {/* 📦 ACTIVE COMMITMENT LATTICE */}
            <div className="space-y-12">
                <div className="flex justify-between items-end px-4 border-b border-white/5 pb-8">
                    <div className="space-y-2">
                        <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none text-white">Active <br />Commitments.</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">Regional fulfillment deployments</p>
                    </div>
                    <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest italic">{orders.length} ACTIVE ASSETS</span>
                </div>

                {loading ? (
                    <div className="p-40 text-center opacity-20 font-black uppercase tracking-[0.4em] italic text-xs animate-pulse">Scanning Sub-Lattice...</div>
                ) : orders.length === 0 ? (
                    <div className="p-48 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[4.5rem] opacity-30 italic font-medium text-2xl">
                        Awaiting new logistical challenges in this loop.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {orders.map(order => (
                            <div key={order.id} className="relative p-12 bg-white/[0.02] border border-white/5 rounded-[4rem] group hover:bg-white/[0.04] hover:border-indigo-400/20 transition-all duration-700 overflow-hidden shadow-3xl">
                                <div className="absolute top-0 right-0 p-12 opacity-[0.03] scale-150 rotate-12 group-hover:scale-125 transition-transform duration-1000">📦</div>
                                
                                <div className="flex flex-col gap-10 relative z-10">
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 italic">Target Node: {order.store_name}</p>
                                            <h4 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none whitespace-nowrap overflow-hidden text-ellipsis">{order.product_name}</h4>
                                        </div>
                                        <div className="space-y-3 pt-4">
                                            <p className="text-[10px] font-black uppercase text-white/20 tracking-widest italic leading-none whitespace-nowrap">DISTRIBUTION TARGET</p>
                                            <p className="text-lg font-bold text-white/60 leading-tight italic truncate">{order.delivery_address}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-white/5 mt-auto">
                                         <div className="flex items-center gap-3">
                                              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest italic">{order.status.replace('_', ' ')}</span>
                                         </div>
                                         
                                         <div className="flex gap-3">
                                            {order.status === 'claimed' && (
                                                <button 
                                                    onClick={() => handleStatusUpdate(order.id, 'picked_up')}
                                                    className="px-8 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl italic"
                                                >
                                                    Confirm Pickup
                                                </button>
                                            )}
                                            {order.status === 'picked_up' && (
                                                <button 
                                                    onClick={() => handleStatusUpdate(order.id, 'delivered')}
                                                    className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl italic"
                                                >
                                                    Complete Dispatch
                                                </button>
                                            )}
                                         </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
