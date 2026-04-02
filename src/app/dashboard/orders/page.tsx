"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function OrderDashboard() {
    const [orders, setOrders] = useState([
        { id: '#4401', user: 'Sean @ Effingham', type: 'Receipt Order', status: 'Verifying', items: '2x4 Lumber, Hardware Kit', time: '2m ago' },
        { id: '#4400', user: 'Maria @ Wolfeboro', type: 'Instant Pay', status: 'Dispatched', items: 'Lobster Roll, Candle', time: '15m ago' },
    ]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex">
            {/* Minimal Dashboard Sidebar */}
            <aside className="w-64 border-r border-white/5 p-8 space-y-12 shrink-0">
                <Link href="/" className="block">
                    <img src="/logo.png" alt="Oasis" className="h-12 w-auto opacity-80" />
                </Link>
                
                <nav className="space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Store Ops</div>
                    <Link href="/dashboard" className="flex items-center gap-4 text-xs font-bold text-gray-500 hover:text-white transition-colors"><span>📊</span> Overview</Link>
                    <Link href="/dashboard/orders" className="flex items-center gap-4 text-xs font-bold text-indigo-400 bg-white/5 p-3 rounded-2xl"><span>📋</span> Real-time Orders</Link>
                    <Link href="/dashboard/inventory" className="flex items-center gap-4 text-xs font-bold text-gray-500 hover:text-white transition-colors"><span>📦</span> Inventory</Link>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-12 overflow-y-auto">
                <header className="flex justify-between items-center mb-16">
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter">Order <span className="text-indigo-500">Flow.</span></h1>
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mt-2">Managing 18+ Effingham Region Storefronts</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="h-12 w-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-xl">🔔</div>
                        <div className="bg-indigo-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-indigo-500/20">Live Sync Active</div>
                    </div>
                </header>

                <section className="grid grid-cols-1 gap-8">
                    {/* Active Queue */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center px-4">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 italic">Incoming Stream</h2>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{orders.length} ACTIVE ORDERS</span>
                        </div>

                        {orders.map((order) => (
                            <div key={order.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex items-center justify-between group hover:bg-white/[0.07] transition-all">
                                <div className="flex items-center gap-8">
                                    <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-2xl border border-white/10 italic">
                                        {order.type === 'Receipt Order' ? '📸' : '💎'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-black italic text-lg">{order.id}</span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                                order.status === 'Verifying' ? 'bg-amber-400 text-black' : 'bg-indigo-600 text-white'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="text-xs font-medium text-gray-400">{order.user} &bull; {order.time}</div>
                                    </div>
                                </div>

                                <div className="flex-1 px-12">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2 italic">MANIFEST</div>
                                    <div className="text-xs font-bold tracking-tight text-gray-200 truncate max-w-xs">{order.items}</div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">Inspect</button>
                                    <button className="px-6 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-xl">Dispatch Driver</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
