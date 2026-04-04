"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import TrackingMap from '@/components/TrackingMap';
import Link from 'next/link';

export default function OrderTrackingPage() {
    const [orderId, setOrderId] = useState('');
    const [activeOrder, setActiveOrder] = useState<any | null>(null);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showChat, setShowChat] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        async function fetchInitial() {
            // Fetch all currently active drivers
            const { data: activeDrivers } = await supabase
                .from('deliverer_profiles')
                .select('*, profiles(full_name, avatar_url)')
                .eq('is_active', true);
            
            setDrivers(activeDrivers || []);
            setLoading(false);
        }
        fetchInitial();

        // Subscribe to real-time status updates
        const channel = supabase.channel('logistics-pulse')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
                if (activeOrder && payload.new.id === activeOrder.id) {
                    setActiveOrder(payload.new);
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [activeOrder]);

    const handleTrackOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*, businesses(name, location), deliverer_profiles(id, status, profiles(full_name))')
            .eq('id', orderId)
            .single();
        
        if (data) setActiveOrder(data);
        else alert('Logistics Node Not Found. Verify your Order ID.');
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-amber-400 selection:text-black font-sans">
            
            {/* Header: Logistics Telemetry */}
            <header className="p-8 md:p-12 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 bg-black/40 backdrop-blur-2xl sticky top-0 z-50">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-3 px-3 py-1 bg-amber-400/10 border border-amber-400/20 rounded-full">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Regional Tracking Relay</span>
                    </div>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Oasis <span className="text-indigo-500">Track.</span></h1>
                </div>

                <form onSubmit={handleTrackOrder} className="flex gap-4 w-full md:w-auto">
                    <input 
                        placeholder="Enter Order ID / Tracking #" 
                        className="flex-1 md:w-80 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold font-mono tracking-widest focus:border-amber-400 outline-none transition-all"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                    />
                    <button type="submit" className="px-8 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Locate</button>
                </form>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-160px)]">
                
                {/* Tactical Sidebar: Status & Comms */}
                <aside className="lg:col-span-3 border-r border-white/5 p-8 md:p-12 overflow-y-auto space-y-12 bg-black/20">
                    
                    {activeOrder ? (
                        <div className="space-y-12 animate-in slide-in-from-left duration-500">
                            <section className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic px-2">ORDER STATUS</h3>
                                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-4 shadow-2xl relative overflow-hidden">
                                     <div className="absolute top-0 right-0 p-4 grayscale opacity-10">📦</div>
                                     <div className="flex justify-between items-end">
                                        <span className="text-4xl font-black italic tracking-tighter uppercase">{activeOrder.status}</span>
                                        <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-1 italic">Transit Lock Active</span>
                                     </div>
                                     <p className="text-[9px] font-medium text-white/40 uppercase tracking-tight leading-relaxed">Originating from {activeOrder.businesses?.name} &bull; {activeOrder.businesses?.location}</p>
                                </div>
                            </section>

                            {activeOrder.deliverer_id && (
                                <section className="space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic px-2">CARRIER UPLINK</h3>
                                    <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-[3rem] p-8 flex items-center gap-6 group hover:bg-indigo-600/20 transition-all cursor-pointer" onClick={() => setShowChat(true)}>
                                        <div className="w-16 h-16 bg-indigo-500 rounded-3xl flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 transition-transform">🚐</div>
                                        <div className="flex-1">
                                            <h4 className="text-xl font-black italic tracking-tighter uppercase leading-none mb-1">{activeOrder.deliverer_profiles?.profiles?.full_name || 'Regional Agent'}</h4>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 italic">Connected &bull; {activeOrder.deliverer_profiles?.status}</p>
                                        </div>
                                        <div className="text-2xl opacity-40 group-hover:opacity-100 transition-opacity">💬</div>
                                    </div>
                                    <button 
                                        className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] transition-all italic text-white/40"
                                        onClick={() => setShowChat(true)}
                                    >
                                        Open Text-to-Message Terminal
                                    </button>
                                </section>
                            )}

                            <section className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic px-2">DESTINATION NODE</h3>
                                <div className="text-xs font-bold leading-relaxed text-white/60 p-6 bg-white/[0.02] border border-white/5 rounded-3xl italic">
                                    {activeOrder.address}
                                </div>
                            </section>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col justify-center items-center text-center space-y-10 py-20 grayscale opacity-20">
                           <span className="text-8xl italic font-black">??</span>
                           <p className="text-[10px] font-black uppercase tracking-[0.5em] leading-relaxed max-w-[200px]">Awaiting Regional Uplink Signature</p>
                        </div>
                    )}

                </aside>

                {/* Main: Regional Discovery Tracking Map */}
                <section className="lg:col-span-9 relative">
                    <TrackingMap activeDrivers={drivers} focusedOrder={activeOrder} />
                    
                    {/* Map UI Overlays */}
                    <div className="absolute top-10 left-10 pointer-events-none">
                        <div className="bg-black/60 backdrop-blur-3xl px-6 py-3 rounded-full border border-white/10 flex items-center gap-4">
                            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Logistics Radar: {drivers.length} Agents Online</span>
                        </div>
                    </div>

                    <div className="absolute bottom-10 right-10 flex gap-4">
                        <div className="bg-[#111114] border border-white/10 p-6 rounded-[2.5rem] shadow-3xl text-right space-y-1">
                            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Municipal Region</p>
                            <p className="text-xl font-black italic tracking-tighter uppercase text-amber-400 leading-none">EFF-NH LOOP 01</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Chat Modal (Text-to-Message Simulator) */}
            {showChat && activeOrder && (
                <div className="fixed bottom-10 right-10 z-[60] w-[400px] bg-[#111114] border border-white/10 rounded-[3rem] shadow-4xl overflow-hidden animate-in slide-in-from-bottom-12 duration-500">
                    <header className="bg-indigo-600 p-8 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <span className="text-2xl">⚡</span>
                            <div>
                                <h4 className="font-black italic uppercase tracking-tighter leading-none text-white">{activeOrder.deliverer_profiles?.profiles?.full_name}</h4>
                                <p className="text-[8px] font-black uppercase tracking-widest text-indigo-200 opacity-60">Regional Logistics Comms</p>
                            </div>
                        </div>
                        <button onClick={() => setShowChat(false)} className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center font-black hover:bg-black/40 transition-all">×</button>
                    </header>
                    <div className="h-80 p-8 space-y-6 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-lg italic border border-white/10 shrink-0">🚐</div>
                            <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10 text-xs font-bold leading-relaxed text-white/80 italic">
                                Hello! I'm on my way with your order from {activeOrder.businesses?.name}. Transit status is currently "Good".
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-black/40 border-t border-white/5 flex gap-4">
                        <input 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message to your driver..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-bold outline-none focus:border-indigo-400"
                        />
                        <button className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition-all shadow-xl shadow-indigo-600/20">🛰️</button>
                    </div>
                </div>
            )}
        </div>
    );
}
