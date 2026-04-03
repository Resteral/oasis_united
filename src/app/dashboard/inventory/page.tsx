"use client";
import { useState } from 'react';
import Link from 'next/link';

const INITIAL_INVENTORY = [
  { id: 'SKU-001', name: 'Fresh Pizza Dough', category: 'Dough', stock: 45, unit: 'units', price: 8.50, status: 'In Stock' },
  { id: 'SKU-002', name: 'Premium Pepperoni', category: 'Meat', stock: 12, unit: 'lb', price: 14.00, status: 'Low Stock' },
  { id: 'SKU-003', name: 'Artisan Sourdough', category: 'Bakery', stock: 5, unit: 'loaves', price: 9.00, status: 'Critical' },
  { id: 'SKU-004', name: 'Whole Milk (Gal)', category: 'Dairy', stock: 85, unit: 'units', price: 5.50, status: 'In Stock' },
  { id: 'SKU-005', name: 'Organic Honey (Lt)', category: 'Pantry', stock: 24, unit: 'jars', price: 18.00, status: 'In Stock' },
];

export default function InventoryDashboard() {
    const [inventory, setInventory] = useState(INITIAL_INVENTORY);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredInventory = inventory.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white flex">
            {/* Unified Dashboard Sidebar */}
            <aside className="w-64 border-r border-white/5 p-8 space-y-12 shrink-0">
                <Link href="/" className="block">
                    <img src="/logo.png" alt="Oasis" className="h-12 w-auto opacity-80" />
                </Link>
                
                <nav className="space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Store Ops</div>
                    <Link href="/dashboard/analytics" className="flex items-center gap-4 text-xs font-bold text-gray-500 hover:text-white transition-colors"><span>📊</span> Analytics</Link>
                    <Link href="/dashboard/orders" className="flex items-center gap-4 text-xs font-bold text-gray-500 hover:text-white transition-colors"><span>📋</span> Orders</Link>
                    <Link href="/dashboard/inventory" className="flex items-center gap-4 text-xs font-bold text-amber-400 bg-white/5 p-3 rounded-2xl"><span>📦</span> Inventory</Link>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-12 overflow-y-auto">
                <header className="flex justify-between items-center mb-16">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black italic tracking-tighter">Inventory <span className="text-amber-400">Database.</span></h1>
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-widest leading-none">Tracking 300+ SKU across your digital storefront</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 rounded-3xl p-1 border border-white/10">
                        <input 
                            type="text" 
                            placeholder="Search SKU or Name..." 
                            className="bg-transparent border-none outline-none px-6 py-2 text-sm w-64 focus:ring-0"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="bg-amber-400 text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-amber-900/40 hover:scale-105 transition-all">Search</button>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-[3rem] p-12 overflow-hidden shadow-3xl">
                        <table className="w-full text-left">
                            <thead className="border-b border-white/5">
                                <tr className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <th className="pb-8 pl-4">Product Detail</th>
                                    <th className="pb-8">Category</th>
                                    <th className="pb-8">Stock Level</th>
                                    <th className="pb-8">Unit Price</th>
                                    <th className="pb-8">Status</th>
                                    <th className="pb-8 pr-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredInventory.map((item) => (
                                    <tr key={item.id} className="group hover:bg-white/[0.03] transition-all">
                                        <td className="py-8 pl-4 space-y-1">
                                            <div className="font-black italic text-lg tracking-tight leading-none">{item.name}</div>
                                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.id}</div>
                                        </td>
                                        <td className="py-8 font-black text-xs text-white/60 tracking-wider italic uppercase">{item.category}</td>
                                        <td className="py-8">
                                            <div className="font-bold text-base">{item.stock} {item.unit}</div>
                                            <div className="h-1 w-24 bg-white/5 rounded-full mt-2 overflow-hidden">
                                                <div className={`h-full rounded-full ${
                                                    item.status === 'In Stock' ? 'bg-green-400 w-full' :
                                                    item.status === 'Low Stock' ? 'bg-amber-400 w-1/3' : 'bg-red-500 w-[10%]'
                                                }`} />
                                            </div>
                                        </td>
                                        <td className="py-8 font-black italic tracking-tighter text-lg text-amber-400">${item.price.toFixed(2)}</td>
                                        <td className="py-8">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-xl ${
                                                item.status === 'In Stock' ? 'bg-green-400/10 text-green-400 border border-green-400/20' :
                                                item.status === 'Low Stock' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' :
                                                'bg-red-400/10 text-red-500 border border-red-500/20'
                                            }`}>{item.status}</span>
                                        </td>
                                        <td className="py-8 pr-4 text-right">
                                            <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">Edit Point</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
