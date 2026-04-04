"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface LiveTrackingProps {
    orderId: string;
}

export default function LiveTracking({ orderId }: LiveTrackingProps) {
    const [order, setOrder] = useState<any>(null);
    const [deliverer, setDeliverer] = useState<any>(null);
    const [location, setLocation] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchInitialData() {
            const { data: orderData } = await supabase
                .from('orders')
                .select('*, deliverer_profiles(*)')
                .eq('id', orderId)
                .single();

            if (orderData) {
                setOrder(orderData);
                if (orderData.deliverer_id) {
                    const { data: loc } = await supabase
                        .from('deliverer_locations')
                        .select('*')
                        .eq('deliverer_id', orderData.deliverer_id)
                        .single();
                    setLocation(loc);
                }
            }
            setLoading(false);
        }

        fetchInitialData();

        // 🛰️ Real-time Order & Location Sync
        const orderSubscription = supabase
            .channel(`order-${orderId}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, (payload) => {
                setOrder(payload.new);
            })
            .subscribe();

        return () => { supabase.removeChannel(orderSubscription); };
    }, [orderId]);

    // Sub-effect for Location Tracking if deliverer is assigned
    useEffect(() => {
        if (!order?.deliverer_id) return;

        const locSubscription = supabase
            .channel(`location-${order.deliverer_id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'deliverer_locations', filter: `deliverer_id=eq.${order.deliverer_id}` }, (payload) => {
                setLocation(payload.new);
            })
            .subscribe();

        return () => { supabase.removeChannel(locSubscription); };
    }, [order?.deliverer_id]);

    if (loading) return (
        <div className="flex items-center justify-center p-20 animate-pulse bg-white/5 rounded-[4rem]">
            <span className="text-4xl">🛰️</span>
        </div>
    );

    if (!order) return null;

    const steps = [
        { key: 'pending', label: 'Processing', icon: '🛒' },
        { key: 'processing', label: 'Preparing', icon: '🏪' },
        { key: 'transit', label: 'En Route', icon: '🚚' },
        { key: 'delivered', label: 'Delivered', icon: '🏁' }
    ];

    const currentStepIndex = steps.findIndex(s => s.key === order.status);

    return (
        <div className="bg-[#111114] rounded-[4rem] p-10 md:p-16 border border-white/5 space-y-16 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[150px] -mr-48 -mt-48 rounded-full pointer-events-none"></div>

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Live Municipal Radar</span>
                    </div>
                    <h3 className="text-5xl font-black italic tracking-tighter uppercase leading-none text-white">Tracking Dispatch.</h3>
                </div>

                {order.deliverer_id && (
                    <div className="bg-white/5 backdrop-blur-3xl px-10 py-6 rounded-[2.5rem] border border-white/5 flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-4xl shadow-xl grayscale">
                            🚚
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 italic leading-none">Oasis Agent Assigned</span>
                            <p className="text-lg font-black italic uppercase tracking-tight text-indigo-400">Transit In Progress</p>
                        </div>
                    </div>
                )}
            </header>

            {/* Premium Progress Stepper */}
            <div className="relative">
                <div className="absolute top-6 left-0 w-full h-1 bg-white/5 rounded-full"></div>
                <div 
                    className="absolute top-6 left-0 h-1 bg-indigo-500 rounded-full transition-all duration-[2000ms] ease-in-out shadow-[0_0_25px_rgba(99,102,241,0.5)]"
                    style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                ></div>

                <div className="flex justify-between relative z-10 px-2">
                    {steps.map((step, i) => (
                        <div key={step.key} className="flex flex-col items-center gap-6 group">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-1000 border-4 ${
                                i <= currentStepIndex ? 'bg-indigo-600 border-[#111114] text-white scale-110 shadow-2xl shadow-indigo-500/40' : 'bg-[#1a1a1e] border-[#111114] text-white/10'
                            }`}>
                                {step.icon}
                            </div>
                            <div className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-1000 text-center ${
                                i <= currentStepIndex ? 'text-white' : 'text-white/20'
                            }`}>
                                {step.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* GPS Simulation / Map Node */}
            <div className="h-64 md:h-80 bg-black/40 rounded-[3.5rem] border border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                
                {/* Simulated Radar Grid */}
                <div className="absolute inset-0 opacity-5">
                    <div className="w-full h-full border-2 border-white/20 rounded-full scale-50"></div>
                    <div className="w-full h-full border-2 border-white/20 rounded-full scale-[0.8]"></div>
                </div>

                {location && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 animate-in zoom-in duration-1000">
                        <div className="relative">
                            <div className="w-12 h-12 bg-indigo-600 rounded-full border-4 border-white shadow-3xl text-white flex items-center justify-center animate-bounce shadow-indigo-500/50">
                                📍
                            </div>
                            <div className="absolute -inset-4 bg-indigo-500/20 rounded-full animate-ping"></div>
                        </div>
                        <div className="px-6 py-3 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white">
                           <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest whitespace-nowrap">Agent Active In Regional Loop</span>
                        </div>
                    </div>
                )}

                {!location && order.status === 'transit' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic animate-pulse">Syncing GPS Hub...</p>
                    </div>
                )}

                <div className="absolute bottom-8 left-8 flex items-center gap-4 bg-black/60 backdrop-blur-2xl px-6 py-3 rounded-full border border-white/10">
                    <span className={`w-2 h-2 rounded-full animate-pulse ${location ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                    <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">
                        {location ? 'SECURE GPS SIGNAL: LOCKED' : 'SEARCHING FOR SIGNAL...'}
                    </span>
                </div>
            </div>
        </div>
    );
}
