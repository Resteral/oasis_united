"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import LiveTracking from '@/components/LiveTracking';

export default function OrderPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [business, setBusiness] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrder() {
            if (!id) return;
            const { data: orderData, error: orderError } = await supabase.from('orders').select('*').eq('id', id).single();
            if (orderError || !orderData) { setLoading(false); return; }
            setOrder(orderData);
            const { data: bizData } = await supabase.from('businesses').select('name, theme, location, owner_id').eq('id', orderData.business_id).single();
            if (bizData) setBusiness(bizData);
            setLoading(false);
        }
        fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
                <div className="text-center space-y-6">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[10px] italic">Synchronizing Receipt Matrix...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] p-8">
                <div className="text-center max-w-md w-full p-12 bg-white/[0.03] border border-white/5 rounded-[4rem] animate-in zoom-in duration-700">
                    <span className="text-6xl block mb-6 opacity-40">🔎</span>
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white mb-2 leading-none">Order Not <br /><span className="text-indigo-500">Located.</span></h1>
                    <p className="text-white/40 text-sm font-medium italic mb-10">We couldn't synchronize the requested order node. Please verify your portal link or contact the regional administrator.</p>
                    <Link href="/" className="px-10 py-5 bg-white text-black rounded-[2.5rem] font-black text-[10px] tracking-widest uppercase hover:scale-105 active:scale-95 transition-all block">Return to Discovery Hub</Link>
                </div>
            </div>
        );
    }

    const theme = business?.theme || { primaryColor: '#4f46e5', backgroundColor: '#0a0a0b' };

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white py-24 px-6 md:px-10 selection:bg-indigo-500 selection:text-white">
            <div className="max-w-4xl mx-auto space-y-12">
                
                {/* 🛰️ IMMERSIVE SUCCESS HEADER */}
                <header className="relative p-16 md:p-24 bg-white/[0.02] border border-white/5 rounded-[4rem] overflow-hidden text-center space-y-8 animate-in fade-in slide-in-from-top-12 duration-1000">
                     {/* Identity Hue Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-10 blur-[100px] rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${theme.primaryColor} 0%, transparent 70%)` }}></div>

                    <div className="relative z-10 space-y-6">
                        <div className="w-24 h-24 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center mx-auto text-4xl shadow-3xl shadow-indigo-600/30 animate-in zoom-in duration-700">
                            {order.type === 'takeout' ? '🛍️' : order.type === 'inhouse' ? '🍽️' : '🚀'}
                        </div>
                        <div className="space-y-2">
                             <div className="inline-flex items-center gap-3 px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400">
                                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                                 Settlement Confirmed
                             </div>
                             <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.85]">Mission <br /><span className="text-indigo-500">Accomplished.</span></h1>
                        </div>
                        <p className="text-lg md:text-xl font-medium text-white/40 italic">Your {order.type} order from <span className="text-white font-black">{business?.name || 'A Boutique Node'}</span> has been synchronized with the regional matrix.</p>
                    </div>
                </header>

                {/* 📦 THE ORDER LEDGER */}
                <section className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                    
                    {/* Items & Fulfillment (Left) */}
                    <div className="lg:col-span-3 space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
                        
                        {/* THE RECEIPT MATRIX */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-[3.5rem] p-12 space-y-10">
                             <div className="flex justify-between items-end border-b border-white/5 pb-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">RECEIPT LEDGER</p>
                                    <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white leading-none">Asset Summary.</h3>
                                </div>
                                <span className="text-white/20 font-black italic text-xl tracking-tighter">#{order.id.slice(0, 8).toUpperCase()}</span>
                             </div>

                             <div className="space-y-6">
                                {order.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-black text-xs text-white/40 border border-white/5 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all">
                                                {item.quantity}x
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-black italic text-xl tracking-tighter text-white uppercase leading-none">{item.name}</p>
                                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none">${item.price.toFixed(2)} / Unit</p>
                                            </div>
                                        </div>
                                        <span className="text-2xl font-black italic tracking-tighter text-white">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                             </div>

                             {/* Settlements Column */}
                             <div className="pt-10 border-t border-white/5 space-y-4">
                                <div className="flex justify-between items-center text-white/30 text-[10px] font-black uppercase tracking-widest italic">
                                    <span>Base Remission</span>
                                    <span>${(order.total - (order.type === 'shipping' ? (order.total - order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)) : 0)).toFixed(2)}</span>
                                </div>
                                {order.type === 'shipping' && (
                                    <div className="flex justify-between items-center text-indigo-400 text-[10px] font-black uppercase tracking-widest italic">
                                        <span>Logistics Transit Fee</span>
                                        <span>${(order.total - order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-6">
                                    <span className="text-xl font-black italic text-white uppercase tracking-tighter italic">Total Settlement</span>
                                    <span className="text-5xl font-black italic text-indigo-500 tracking-tighter italic">${order.total.toFixed(2)}</span>
                                </div>
                             </div>
                        </div>

                        {/* LIVE TRANSIT INTERFACE (If Shipping) */}
                        {order.type === 'shipping' && (
                            <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
                                <LiveTracking orderId={order.id} />
                            </div>
                        )}
                    </div>

                    {/* Meta & Actions (Right) */}
                    <div className="lg:col-span-2 space-y-10 animate-in fade-in slide-in-from-right-8 duration-1000">
                         
                         {/* FULFILLMENT PROTOCOL COORDINATES */}
                         <div className="bg-white/[0.02] border border-white/5 rounded-[3.5rem] p-12 space-y-10">
                             <div className="space-y-8">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic uppercase">IDENTITY UPLINK</p>
                                    <div className="space-y-1">
                                        <p className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none">{order.customer_name}</p>
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{order.customer_contact}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic uppercase">{order.type === 'takeout' ? 'COLLECTION HUB' : order.type === 'inhouse' ? 'TABLE ASSIGNMENT' : 'DISPATCH TARGET'}</p>
                                    <p className="text-lg font-bold text-white leading-tight italic">
                                        {order.type === 'takeout' ? (business?.location || 'Store Node Co-ordinates pending.') : 
                                         order.type === 'inhouse' ? `STATION #${order.table_number || 'TBD'}` : 
                                         order.address}
                                    </p>
                                </div>
                             </div>

                             {/* Tactical Actions */}
                             <div className="pt-8 border-t border-white/5 space-y-4">
                                <button
                                    onClick={() => window.print()}
                                    className="w-full py-6 bg-white text-black rounded-3xl font-black text-[10px] tracking-[0.4em] uppercase hover:scale-[1.02] transition-all flex items-center justify-center gap-4 shadow-3xl shadow-white/5"
                                >
                                    🖨️ ARCHIVE RECEIPT
                                </button>
                                <Link
                                    href="/"
                                    className="w-full py-6 bg-white/5 border border-white/10 rounded-3xl font-black text-[10px] tracking-[0.4em] uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-4 text-white/40"
                                >
                                    🏠 RETURN TO HUB
                                </Link>
                             </div>
                         </div>

                         {/* Regional Integrity Note */}
                         <div className="p-10 bg-indigo-500/5 border border-indigo-500/10 rounded-[3rem] text-center">
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em] italic leading-relaxed">"Oasis United verified regional trade node. Peer-to-peer logistics active in this loop."</p>
                         </div>
                    </div>
                </section>

                <p className="text-center text-white/10 text-[9px] font-black uppercase tracking-[0.5em] italic pb-20">SYSTEM LOG: NODE_{order.id.slice(0, 12).toUpperCase()} SYNCED</p>
            </div>
        </div>
    );
}
