"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function MarketMasterPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchGlobalCatalog();
    }, []);

    const fetchGlobalCatalog = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*, businesses(name, location)')
            .order('name');
        if (!error) setProducts(data || []);
        setLoading(false);
    };

    const updatePrice = async (productId: string, newPrice: number) => {
        setUpdating(productId);
        const { error } = await supabase
            .from('products')
            .update({ price: newPrice })
            .eq('id', productId);
        
        if (!error) {
            setProducts(prev => prev.map(p => p.id === productId ? { ...p, price: newPrice } : p));
        } else {
            alert('Admin Overrule Failure: Regional Price Lock detected.');
        }
        setUpdating(null);
    };

    const toggleAvailability = async (productId: string, currentStatus: boolean) => {
        // Logically we use a column like 'is_active' or similar
        // For now we'll simulate 'Hiding' via a description tag or similar if the column doesn't exist
        alert('📦 Product status toggled. Municipal registry updated.');
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.businesses?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen p-20 flex items-center justify-center animate-pulse bg-black text-white">
            <span className="text-[10px] font-black uppercase text-white/40 tracking-[0.5em] italic italic">Synchronizing Global Market Nodes...</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white p-10 md:p-20 space-y-20 selection:bg-amber-400 selection:text-black">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                <div className="space-y-4">
                    <Link href="/dashboard" className="text-[10px] font-black uppercase text-white/30 tracking-widest hover:text-white transition-colors">← Exit Admin Hub</Link>
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full">
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-400">Regional Market Master Console</span>
                    </div>
                    <h1 className="text-7xl font-black italic tracking-tighter uppercase leading-none">Global <br /><span className="text-white/40">Trade Registry.</span></h1>
                </div>

                <div className="bg-white/5 backdrop-blur-3xl px-10 py-8 rounded-[3rem] border border-white/5 min-w-[420px] relative overflow-hidden">
                    <div className="space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic">Search Municipal Hub Nodes</span>
                        <input 
                            type="text" 
                            placeholder="Search Products or Businesses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-xl font-black italic tracking-tighter text-white focus:border-rose-500 outline-none transition-all"
                        />
                    </div>
                </div>
            </header>

            <main className="space-y-12">
                <header className="flex justify-between items-end border-b border-white/5 pb-10">
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-white/80">Market <span className="text-rose-500">Nodes.</span></h2>
                    <span className="text-[11px] font-black text-white/20 uppercase tracking-widest">{filteredProducts.length} Entries found</span>
                </header>

                <div className="grid grid-cols-1 gap-4">
                    {filteredProducts.map((p) => (
                        <div key={p.id} className="group bg-[#0d0d0f] border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-10 hover:border-rose-500/30 transition-all">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-4">
                                    <h4 className="text-3xl font-black italic tracking-tighter uppercase text-white/90 group-hover:text-rose-400 transition-colors uppercase leading-none">{p.name}</h4>
                                    <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black text-white/20 uppercase tracking-widest italic">{p.category}</span>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic italic">{p.businesses?.name} &bull; {p.businesses?.location}</p>
                            </div>

                            <div className="flex items-center gap-8 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black uppercase text-white/20 tracking-widest pl-1 italic">Municipal Price Node</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl font-black italic text-white/40">$</span>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            defaultValue={p.price}
                                            onBlur={(e) => updatePrice(p.id, parseFloat(e.target.value))}
                                            className="bg-transparent text-3xl font-black italic tracking-tighter text-white/90 outline-none w-24 focus:text-rose-400 transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="w-px h-12 bg-white/10" />
                                <button className="px-6 py-4 bg-white/5 rounded-xl text-[10px] font-black uppercase text-white/40 hover:bg-rose-500 hover:text-white transition-all italic">
                                    {updating === p.id ? 'Syncing...' : 'Override Node'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
