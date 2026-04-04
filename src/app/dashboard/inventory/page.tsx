"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function InventoryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<any[]>([]);
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Quick Add Form State
    const [newName, setNewName] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [newStock, setNewStock] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data: business } = await supabase
                .from('businesses')
                .select('id')
                .eq('owner_id', user.id)
                .single();

            if (business) {
                setBusinessId(business.id);
                const { data: inventory } = await supabase
                    .from('products')
                    .select('*')
                    .eq('business_id', business.id)
                    .order('created_at', { ascending: false });

                setProducts(inventory || []);
            }
            setLoading(false);
        }
        fetchProducts();
    }, [router]);

    const handleQuickAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!businessId || !newName || !newPrice) return;
        setSaving(true);

        const { data, error } = await supabase
            .from('products')
            .insert([{
                business_id: businessId,
                name: newName,
                price: parseFloat(newPrice),
                stock: parseInt(newStock) || 0,
                category: newCategory || 'General',
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            alert('Error adding product: ' + error.message);
        } else {
            setProducts([data, ...products]);
            setIsAdding(false);
            setNewName('');
            setNewPrice('');
            setNewStock('');
            setNewCategory('');
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Permanent removal from database?')) return;
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) setProducts(products.filter(p => p.id !== id));
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-[0.3em] text-white">📡 Accessing Inventory Node...</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-white/5 p-12 space-y-12 shrink-0 bg-[#050505]">
                <Link href="/dashboard" className="block group">
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase group-hover:text-amber-400 transition-colors leading-tight">Oasis <br />Control.</h2>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500 mt-2">Boutique Management</p>
                </Link>
                
                <nav className="space-y-6 pt-8 border-t border-white/5">
                    <Link href="/dashboard" className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">
                        <span className="text-lg">🏠</span> Overview
                    </Link>
                    <Link href="/dashboard/inventory" className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-amber-400">
                        <span className="text-lg">📦</span> Inventory
                    </Link>
                    <Link href="/dashboard/orders" className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">
                        <span className="text-lg">📋</span> Global Orders
                    </Link>
                    <Link href="/dashboard/settings" className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">
                        <span className="text-lg">⚙️</span> Control Node
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 md:p-16 space-y-16">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-4">
                        <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Stock <span className="text-amber-400">Ledger.</span></h1>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Precision Inventory Persistence for the Unified Network</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-1 flex">
                            <input 
                                className="bg-transparent border-none outline-none px-6 py-3 text-xs font-bold w-48 md:w-64"
                                placeholder="Search Ledger..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={() => setIsAdding(true)}
                            className="px-8 py-4 bg-amber-400 text-black rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-amber-900/40"
                        >
                            + Quick Add
                        </button>
                    </div>
                </header>

                {/* Quick Add Form Section (Conditional) */}
                {isAdding && (
                    <div className="bg-white/5 border border-amber-400/20 rounded-[3rem] p-12 space-y-10 animate-in slide-in-from-top-12 duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-5 grayscale">
                            <span className="text-8xl italic font-black">📦</span>
                        </div>
                        <div className="flex justify-between items-center relative z-10">
                            <h2 className="text-2xl font-black italic uppercase tracking-tight">New Inventory Entry</h2>
                            <button onClick={() => setIsAdding(false)} className="text-[10px] font-black uppercase text-gray-500 hover:text-white">Cancel X</button>
                        </div>
                        
                        <form onSubmit={handleQuickAdd} className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest pl-1">Product Name</label>
                                <input required value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-black/40 border border-white/5 p-4 rounded-xl font-bold focus:border-amber-400 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest pl-1">Price ($)</label>
                                <input required type="number" step="0.01" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="w-full bg-black/40 border border-white/5 p-4 rounded-xl font-bold focus:border-amber-400 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest pl-1">Initial Stock</label>
                                <input type="number" value={newStock} onChange={e => setNewStock(e.target.value)} className="w-full bg-black/40 border border-white/5 p-4 rounded-xl font-bold focus:border-amber-400 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest pl-1">Category</label>
                                <input value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full bg-black/40 border border-white/5 p-4 rounded-xl font-bold focus:border-amber-400 outline-none" placeholder="e.g. Retail" />
                            </div>
                            <div className="md:col-span-4 flex justify-end">
                                <button type="submit" disabled={saving} className="px-12 py-5 bg-white text-black rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-amber-400 transition-all shadow-xl">
                                    {saving ? 'Transmitting Data...' : 'Commit to Database'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Inventory Table */}
                <div className="bg-[#111112] border border-white/5 rounded-[4rem] overflow-hidden shadow-3xl">
                    <table className="w-full text-left">
                        <thead className="bg-white/[0.02] border-b border-white/5">
                            <tr className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">
                                <th className="p-10">Product Detail</th>
                                <th className="p-10">Category</th>
                                <th className="p-10 text-center">In Stock</th>
                                <th className="p-10">Price (Unit)</th>
                                <th className="p-10 text-right pr-12">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredProducts.map(p => (
                                <tr key={p.id} className="group hover:bg-white/[0.01] transition-all">
                                    <td className="p-10">
                                        <div className="font-black italic text-xl tracking-tight leading-none text-white/90 group-hover:text-white transition-colors">{p.name}</div>
                                        <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1">ID: {p.id.slice(0, 8)}...</div>
                                    </td>
                                    <td className="p-10">
                                        <span className="px-4 py-1.5 bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-amber-400/60 border border-white/5">{p.category || 'RETAIL'}</span>
                                    </td>
                                    <td className="p-10 text-center">
                                        <div className="font-black text-2xl tracking-tighter">{p.stock}</div>
                                        <div className={`text-[8px] font-black uppercase tracking-widest mt-1 ${p.stock < 10 ? 'text-red-500' : 'text-green-500 opacity-40'}`}>
                                            {p.stock < 10 ? 'Low Volume' : 'Stable'}
                                        </div>
                                    </td>
                                    <td className="p-10 font-black italic text-2xl tracking-tighter text-amber-400">${Number(p.price).toFixed(2)}</td>
                                    <td className="p-10 text-right pr-12">
                                        <button 
                                            onClick={() => handleDelete(p.id)}
                                            className="px-6 py-3 bg-red-500/10 text-red-500 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            Decommission
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-40 text-center space-y-4 opacity-20">
                                        <div className="text-6xl grayscale">📦</div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Ledger Empty. Add items above.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
