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

            const { data } = await supabase
                .from('orders')
                .select('*')
                .eq('driver_id', user.id)
                .in('status', ['claimed', 'picked_up'])
                .order('created_at', { ascending: false });

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

                    // Update Supabase deliverer_profiles
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await supabase
                            .from('deliverer_profiles')
                            .update({ 
                                last_known_location: `(${longitude},${latitude})`,
                                status: 'busy' 
                            })
                            .eq('id', user.id);
                    }
                },
                (err) => console.error("GPS Signal Interference:", err),
                { enableHighAccuracy: true }
            );
        }
        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [isTracking]);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);
        
        if (!error) {
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Tracking Toggle */}
            <div className={`p-12 rounded-[3.5rem] border transition-all duration-700 ${isTracking ? 'bg-indigo-600/10 border-indigo-400 shadow-[0_0_80px_rgba(79,70,229,0.1)]' : 'bg-white/[0.02] border-white/5 shadow-2xl'}`}>
                <div className="flex flex-col md:flex-row justify-between items-center gap-10 text-center md:text-left">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-400/10 border border-indigo-400/20 rounded-full">
                            <span className={`w-1.5 h-1.5 rounded-full ${isTracking ? 'bg-emerald-400 animate-ping' : 'bg-gray-400'}`}></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">{isTracking ? 'Fleet Signal Active' : 'Radar Standby'}</span>
                        </div>
                        <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none">GPS <span className="text-indigo-400">Telemetry.</span></h3>
                        <p className="text-gray-400 font-medium italic">Share your precise coordinates with customers and the Oasis Network.</p>
                    </div>
                    <button 
                        onClick={() => setIsTracking(!isTracking)}
                        className={`px-12 py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl ${
                            isTracking ? 'bg-amber-400 text-black hover:bg-amber-500' : 'bg-white text-black hover:bg-gray-100'
                        }`}
                    >
                        {isTracking ? 'Stop Tracking 🛑' : 'Initialize Live Tracker 🚀'}
                    </button>
                </div>

                {isTracking && location && (
                    <div className="mt-12 pt-8 border-t border-indigo-400/20 grid grid-cols-1 md:grid-cols-2 gap-8 text-[12px] font-black uppercase tracking-widest text-indigo-400 italic">
                        <div className="flex items-center gap-4">
                            <span className="opacity-40">Lat:</span>
                            <span className="font-mono text-white tracking-widest bg-white/5 px-4 py-2 rounded-xl">{location.lat.toFixed(6)}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="opacity-40">Lng:</span>
                            <span className="font-mono text-white tracking-widest bg-white/5 px-4 py-2 rounded-xl">{location.lng.toFixed(6)}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Active Commitments (Orders) */}
            <div className="space-y-8">
                <div className="flex justify-between items-end px-4">
                    <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Active <br />Commitments.</h2>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{orders.length} Deliveries Found</span>
                </div>

                {loading ? (
                    <div className="p-32 text-center opacity-20 font-black uppercase tracking-widest">Scanning Signal...</div>
                ) : orders.length === 0 ? (
                    <div className="p-40 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[4rem] opacity-30 italic font-medium text-xl">
                        Awaiting new logistical challenges.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {orders.map(order => (
                            <div key={order.id} className="p-10 bg-white/[0.02] border border-white/5 rounded-[3.5rem] group hover:border-indigo-400/20 transition-all shadow-3xl">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <h4 className="text-3xl font-black italic tracking-tighter uppercase text-white/90 group-hover:text-white transition-colors">{order.product_name}</h4>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 italic">from {order.store_name}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-[10px] font-black uppercase text-gray-500 tracking-widest italic">Destination Domain</div>
                                            <div className="text-xs font-bold leading-relaxed opacity-60">{order.delivery_address}</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 pt-4 md:pt-0">
                                        {order.status === 'claimed' && (
                                            <button 
                                                onClick={() => handleStatusUpdate(order.id, 'picked_up')}
                                                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                                            >
                                                Confirm Pickup ✅
                                            </button>
                                        )}
                                        {order.status === 'picked_up' && (
                                            <button 
                                                onClick={() => handleStatusUpdate(order.id, 'delivered')}
                                                className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                                            >
                                                Complete Dropoff 🏁
                                            </button>
                                        )}
                                        <span className="px-5 py-2 bg-indigo-400/10 border border-indigo-400/20 rounded-full text-[9px] font-black text-indigo-400 uppercase tracking-widest self-center">
                                            {order.status.replace('_', ' ')}
                                        </span>
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
