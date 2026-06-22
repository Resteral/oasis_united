"use client";
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';
import Link from 'next/link';

const AI_PLACEHOLDERS = [
    "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1000&auto=format&fit=crop"
];

import InventoryAnalytics from '@/components/InventoryAnalytics';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [ddId, setDdId] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBundleMode, setIsBundleMode] = useState(false);
    const [selectedBundleItems, setSelectedBundleItems] = useState<string[]>([]);
    
    // Form State
    const [newName, setNewName] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [newCategory, setNewCategory] = useState('General');
    const [newStock, setNewStock] = useState('100');
    const [newDescription, setNewDescription] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).single();
        if (business) {
            setBusinessId(business.id);
            const { data: prods } = await supabase.from('products').select('*').eq('business_id', business.id).order('created_at', { ascending: false });
            if (prods) setProducts(prods as Product[]);
        }
        setLoading(false);
    };

    const toggleSelection = (id: string) => {
        if (isBundleMode) {
            setSelectedBundleItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        } else {
            setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Confirm decommissioning of ${selectedIds.length} assets?`)) return;
        setLoading(true);
        const { error } = await supabase.from('products').delete().in('id', selectedIds);
        if (!error) { setProducts(products.filter(p => !selectedIds.includes(p.id))); setSelectedIds([]); }
        setLoading(false);
    };

    const handleAddProduct = async () => {
        if (!newName.trim() || !newPrice || !businessId) return;
        setLoading(true);
        let finalImageUrl = "";
        if (selectedFile) {
            const fileName = `${businessId}-${Date.now()}`;
            const { data: uploadData, error: uploadError } = await supabase.storage.from('products').upload(fileName, selectedFile);
            if (!uploadError) { const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName); finalImageUrl = publicUrl; }
        }
        const { data, error } = await supabase.from('products').insert([{
            business_id: businessId, name: newName, price: parseFloat(newPrice), stock: parseInt(newStock) || 0, category: newCategory, description: newDescription,
            image_url: finalImageUrl || AI_PLACEHOLDERS[Math.floor(Math.random() * AI_PLACEHOLDERS.length)], is_featured: isFeatured, metadata: isBundleMode ? { bundle_parts: selectedBundleItems } : {}
        }]).select().single();
        if (!error && data) { setProducts([data as Product, ...products]); setIsAdding(false); setIsBundleMode(false); setSelectedBundleItems([]); resetForm(); }
        setLoading(false);
    };

    const resetForm = () => { setNewName(''); setNewPrice(''); setNewStock('100'); setNewCategory('General'); setNewDescription(''); setIsFeatured(false); setSelectedFile(null); };

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-indigo-500 pb-32">
            <div className="max-w-7xl mx-auto p-8 md:p-12 space-y-20">
                
                {/* 🛰️ TACTICAL ANALYTICS TERMNIAL */}
                {businessId && <InventoryAnalytics businessId={businessId} />}

                {/* 🚥 COMMAND HEADER */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 border-b border-white/5 pb-16">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(251,191,36,0.5)]"></span>
                            <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 italic">Asset Synchronization Terminal</h1>
                        </div>
                        <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] text-white">Merchant <br /><span className="text-indigo-500 font-black">Assets.</span></h2>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 relative z-20">
                        {selectedIds.length > 0 && (
                            <button onClick={handleBulkDelete} className="px-10 py-5 bg-rose-500 text-white rounded-[2.2rem] font-black text-[10px] tracking-[0.2em] uppercase shadow-3xl hover:bg-rose-600 transition-all animate-in slide-in-from-right duration-500 italic">Decommission Ops ({selectedIds.length})</button>
                        )}
                        <button
                            className="px-8 py-5 bg-white/5 border border-white/10 rounded-[2.2rem] font-black text-[10px] tracking-widest text-white/40 hover:text-white transition-all uppercase flex items-center gap-3 italic"
                            onClick={() => { setIsSyncing(!isSyncing); setIsAdding(false); }}
                        >
                            🚀 External Sync
                        </button>
                        <button
                            className={`px-10 py-5 rounded-[2.2rem] font-black text-[10px] tracking-widest transition-all shadow-3xl uppercase italic ${isAdding ? 'bg-white/10 text-white' : 'bg-white text-black hover:scale-105 active:scale-95'}`}
                            onClick={() => { setIsAdding(!isAdding); setIsSyncing(false); }}
                        >
                            {isAdding ? 'Abort Entry' : '+ Provision Asset'}
                        </button>
                    </div>
                </div>

                {/* 📡 LOGISTICS UPLINK (DoorDash) */}
                {isSyncing && (
                    <div className="bg-[#FF3008]/5 border border-[#FF3008]/20 p-12 rounded-[4rem] space-y-8 animate-in zoom-in duration-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF3008]/5 blur-[120px] -mr-48 -mt-48 rounded-full pointer-events-none"></div>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
                            <div className="space-y-3">
                                <h3 className="text-3xl font-black text-[#FF3008] uppercase italic leading-none">DoorDash Ingest Node.</h3>
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] italic">Establish direct catalog bridge to external logistics matrix.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                <input placeholder="STORE_IDENTIFIER_SIGNAL" value={ddId} onChange={(e) => setDdId(e.target.value)} className="px-8 py-5 bg-black/40 border border-white/10 rounded-3xl font-black text-white text-xs outline-none focus:border-[#FF3008] transition-all min-w-[320px] uppercase tracking-widest" />
                                <button className="px-12 py-5 bg-[#FF3008] text-white rounded-3xl font-black text-[10px] tracking-widest uppercase shadow-xl shadow-[#FF3008]/20 hover:scale-[1.02] transition-all italic">Initiate Sync</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 🏗️ ASSET PROVISIONING FORM */}
                {isAdding && (
                    <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-12 md:p-20 rounded-[4.5rem] shadow-3xl space-y-16 animate-in slide-in-from-bottom-12 duration-1000 relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[150px] -mr-48 -mt-48 rounded-full pointer-events-none"></div>
                         <div className="space-y-3 relative z-10">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] italic leading-none">Establishing Asset Protocol</p>
                            <h2 className="text-5xl font-black italic tracking-tighter uppercase text-white leading-none">Asset <br /><span className="text-indigo-500">Provisioning.</span></h2>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-white/20 tracking-widest italic px-2">Label Node</label>
                                <input placeholder="ASSET_NAME" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full p-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black italic text-2xl tracking-tighter text-white focus:border-indigo-400 outline-none transition-all placeholder:text-white/5 uppercase" />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-white/20 tracking-widest italic px-2">Classification</label>
                                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full p-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black italic text-2xl tracking-tighter text-white outline-none appearance-none cursor-pointer hover:border-white/20 transition-all uppercase">
                                    <option className="bg-black">General</option>
                                    <option className="bg-black">Food</option>
                                    <option className="bg-black">Retail</option>
                                </select>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-white/20 tracking-widest italic px-2">Liquidity ($)</label>
                                <input type="number" placeholder="0.00" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-full p-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black italic text-2xl tracking-tighter text-white focus:border-indigo-400 outline-none transition-all placeholder:text-white/5" />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-white/20 tracking-widest italic px-2">Stock Volume</label>
                                <input type="number" value={newStock} onChange={(e) => setNewStock(e.target.value)} className="w-full p-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black italic text-2xl tracking-tighter text-white focus:border-indigo-400 outline-none transition-all" />
                            </div>
                         </div>
                         <button onClick={handleAddProduct} className="w-full py-10 bg-indigo-600 text-white rounded-[3rem] font-black text-xs uppercase tracking-[0.5em] shadow-3xl shadow-indigo-600/20 hover:bg-indigo-500 hover:scale-[1.01] active:scale-95 transition-all italic">Synchronize Asset to Oasis Cloud</button>
                    </div>
                )}

                {/* 📦 ASSET MATRIX (GRID) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                    {products.map((product) => {
                        const isSelected = selectedIds.includes(product.id);
                        const isLowStock = product.stock <= 10;
                        return (
                            <div 
                                key={product.id} 
                                onClick={() => toggleSelection(product.id)}
                                className={`group relative bg-white/[0.02] border rounded-[3.5rem] overflow-hidden transition-all duration-700 cursor-pointer ${
                                    isSelected ? 'border-indigo-500 bg-indigo-500/10 scale-[0.98]' : 'border-white/5 hover:border-white/20 hover:-translate-y-4'
                                }`}
                            >
                                <div className="aspect-square overflow-hidden relative bg-zinc-950 flex items-center justify-center">
                                    <img src={product.image_url || AI_PLACEHOLDERS[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale group-hover:grayscale-0" alt="" />
                                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                                        <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-3xl border ${
                                            isLowStock ? 'bg-rose-500/20 border-rose-500/40 text-rose-500 animate-pulse' : 'bg-black/40 border-white/10 text-white/60'
                                        }`}>
                                            {isLowStock ? '⚠️ CRITICAL DEPLETION' : `SYNCHRONIZED: ${product.stock}U`}
                                        </div>
                                        {product.is_featured && (
                                            <div className="px-4 py-1.5 bg-amber-400 text-black rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl shadow-amber-400/20 italic">Featured Asset</div>
                                        )}
                                    </div>
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-indigo-600/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-500">
                                            <span className="text-4xl text-white">✔️</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-10 space-y-6">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em] italic leading-none">{product.category || 'Independent Asset'}</p>
                                        <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white truncate leading-none">{product.name}</h3>
                                    </div>
                                    <div className="flex justify-between items-center pt-8 border-t border-white/5">
                                        <span className="text-3xl font-black italic tracking-tighter text-white">${Number(product.price).toFixed(2)}</span>
                                        <div className="flex gap-2">
                                             <button className="p-4 bg-white/5 rounded-[1.2rem] hover:bg-white/10 transition-all text-sm group-hover:scale-110">✏️</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
                            </div>
                        );
                    })}
                </div>
                
                <p className="text-center text-white/10 text-[10px] font-black uppercase tracking-[0.5em] italic">Oasis United Asset Control &bull; Region 28 Lattice</p>
            </div>
        </div>
    );
}
