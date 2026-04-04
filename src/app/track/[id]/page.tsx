"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function OrderTrackingPage() {
    const { id } = useParams();
    const [order, setOrder] = useState<any>(null);
    const [driver, setDriver] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        async function fetchOrderData() {
            setLoading(true);
            const { data: orderData } = await supabase
                .from('orders')
                .select('*')
                .eq('id', id)
                .single();

            if (orderData) {
                setOrder(orderData);
                if (orderData.driver_id) {
                    const { data: driverData } = await supabase
                        .from('deliverer_profiles')
                        .select('*, profiles(full_name, avatar_url)')
                        .eq('id', orderData.driver_id)
                        .single();
                    setDriver(driverData);
                }
            }
            setLoading(false);
        }

        fetchOrderData();

        // Subscribe to Realtime Updates
        const channel = supabase
            .channel(`order_tracking_${id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` }, 
                payload => setOrder(payload.new))
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-20">
            <div className="text-indigo-400 font-black animate-pulse uppercase tracking-[0.5em] flex flex-col items-center gap-8">
                <span className="text-8xl">🛰️</span>
                <span>Locking GPS Signal...</span>
            </div>
        </div>
    );

    if (!order) return (
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-white p-20 text-center">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Mission Disconnected <br /><span className="text-white/20 text-xl font-normal">Check your logistics link or order ID.</span></h1>
        </div>
    );

    const stages = ['pending', 'claimed', 'picked_up', 'delivered'];
    const currentStageIndex = stages.indexOf(order.status);

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-indigo-400 selection:text-black pb-48">
            {/* Header */}
            <header className="p-10 md:p-20 border-b border-white/5 space-y-12">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                    <div className="space-y-6">
                        <Link href="/my-oasis" className="px-6 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/10 transition-all">← Back to My Oasis</Link>
                        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">Oasis <br /><span className="text-indigo-500">Logistics Link.</span></h1>
                    </div>
                    <div className="text-right space-y-2">
                        <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Order Identifier</span>
                        <p className="text-xl font-mono text-indigo-400 font-black bg-white/5 px-6 py-2 rounded-2xl border border-white/5 uppercase tracking-tighter">#{order.id.split('-')[0]}</p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-10 md:px-20 pt-24 grid grid-cols-1 lg:grid-cols-12 gap-24">
                
                {/* Left: Progress Radar */}
                <div className="lg:col-span-12 space-y-20">
                    <section className="relative p-12 bg-white/[0.02] border border-white/5 rounded-[4rem] overflow-hidden shadow-3xl">
                        {/* Status Bar */}
                        <div className="relative z-10 flex flex-col md:flex-row justify-around items-center gap-10">
                            {stages.map((stage, idx) => (
                                <div key={stage} className={`flex flex-col items-center gap-4 transition-all duration-1000 ${idx <= currentStageIndex ? 'opacity-100' : 'opacity-20'}`}>
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2 transition-all duration-700 ${idx <= currentStageIndex ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_40px_rgba(79,70,229,0.4)]' : 'border-white/10'}`}>
                                        {stage === 'pending' ? '📜' : stage === 'claimed' ? '🚚' : stage === 'picked_up' ? '📦' : '🏁'}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">{stage.replace('_', ' ')}</span>
                                </div>
                            ))}
                        </div>
                        {/* Connecting Line */}
                        <div className="absolute top-[50%] left-[10%] right-[10%] h-[2px] bg-white/5 -z-0 hidden md:block">
                            <div 
                                className="h-full bg-indigo-600 transition-all duration-[2000ms] ease-out shadow-[0_0_20px_#4f46e5]" 
                                style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
                            ></div>
                        </div>
                    </section>
                </div>

                {/* Left: Driver Profile & Vehicle */}
                <div className="lg:col-span-5 space-y-16">
                     {driver ? (
                         <section className="p-12 bg-indigo-600/5 border border-indigo-400/20 rounded-[4rem] space-y-10 group hover:bg-indigo-600/10 transition-all duration-700">
                             <div className="flex items-center gap-8">
                                 <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-5xl grayscale group-hover:grayscale-0 transition-all">
                                     {driver.profiles?.avatar_url ? <img src={driver.profiles.avatar_url} className="w-full h-full object-cover rounded-[2rem]" /> : '👨‍✈️'}
                                 </div>
                                 <div className="space-y-1">
                                     <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">{driver.profiles?.full_name || 'Autonomous Agent'}</h3>
                                     <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Master Logistics Partner</p>
                                 </div>
                             </div>

                             <div className="grid grid-cols-2 gap-6">
                                 <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-2">
                                     <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Transport Mode</span>
                                     <p className="text-xl font-black uppercase italic tracking-tighter">{driver.vehicle_type || 'Stealth walk'}</p>
                                 </div>
                                 <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-2">
                                     <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Network Status</span>
                                     <p className="text-xl font-black uppercase italic tracking-tighter text-emerald-400 animate-pulse">{driver.status || 'Active'}</p>
                                 </div>
                             </div>
                         </section>
                     ) : (
                         <div className="p-20 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-[4rem] space-y-6 opacity-30">
                             <div className="text-6xl">🤖</div>
                             <p className="text-[11px] font-black uppercase tracking-[0.5em]">Awaiting Dispatch Calibration...</p>
                         </div>
                     )}

                     <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3.5rem] space-y-6">
                         <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400">Order Summary</h3>
                         <div className="space-y-4">
                             <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                 <span className="text-xs font-medium text-white/40 italic">Asset</span>
                                 <span className="text-lg font-black uppercase italic tracking-tighter">{order.product_name}</span>
                             </div>
                             <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                 <span className="text-xs font-medium text-white/40 italic">Merchant Node</span>
                                 <span className="text-lg font-black uppercase italic tracking-tighter truncate max-w-[150px]">{order.store_name}</span>
                             </div>
                         </div>
                     </div>
                </div>

                {/* Right: GPS Telemetry View */}
                <div className="lg:col-span-7 space-y-12">
                    <header className="flex justify-between items-end border-b border-white/5 pb-8 px-4">
                        <div className="space-y-2">
                            <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">GPS <br /><span className="text-indigo-400">Telemetry.</span></h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Independent Regional Grid</p>
                        </div>
                        <div className="text-right">
                           {order.status === 'delivered' ? (
                               <span className="px-6 py-2.5 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em]">Dropoff Finalized</span>
                           ) : (
                               <span className="px-6 py-2.5 bg-indigo-600 animate-pulse text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em]">Acquiring Signal</span>
                           )}
                        </div>
                    </header>

                    <div className="aspect-video bg-white/[0.02] border border-white/5 rounded-[5rem] overflow-hidden relative shadow-3xl group select-none">
                        <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=43.8329,-71.0772&zoom=13&size=800x450&scale=2&maptype=roadmap&style=feature:all|element:labels|visibility:off&style=feature:landscape|color:0x000000&style=feature:road|color:0x1a1a1a&style=feature:water|color:0x0a0a0a&key=YOUR_API_KEY')] bg-cover opacity-20 grayscale transition-all duration-[3000ms] group-hover:opacity-40 group-hover:grayscale-0"></div>
                        
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                {/* Pulse Effect */}
                                <div className="absolute inset-0 bg-indigo-500/40 rounded-full animate-ping scale-[3]"></div>
                                <div className="relative w-12 h-12 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center text-2xl shadow-2xl">
                                    {driver?.vehicle_type === 'bike' ? '🚲' : driver?.vehicle_type === 'truck' ? '🚚' : '🚗'}
                                </div>
                            </div>
                        </div>

                        {/* Telemetry Overlays */}
                        <div className="absolute bottom-10 left-10 p-6 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-3xl space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Distance Remaining</span>
                            <p className="text-2xl font-black italic tracking-tighter uppercase">Calculated Upon Signal Lock</p>
                        </div>
                    </div>

                    <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[4rem] relative overflow-hidden">
                        <div className="flex gap-10 items-center">
                            <div className="text-4xl">📡</div>
                            <div className="space-y-1">
                                <h4 className="text-xl font-black italic uppercase tracking-tighter">Logistics Protocol 14</h4>
                                <p className="text-xs font-medium text-white/40 italic">Regional deliverers operate independently. Contact for delivery nuances or specific gate codes.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
