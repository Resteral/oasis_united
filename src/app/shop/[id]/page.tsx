"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function BusinessProfilePage() {
    const { id } = useParams();
    const [business, setBusiness] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        async function fetchStoreData() {
            setLoading(true);
            const { data: biz } = await supabase
                .from('businesses')
                .select('*, towns(name, state)')
                .eq('id', id)
                .single();

            const { data: prods } = await supabase
                .from('products')
                .select('*')
                .eq('business_id', id);

            setBusiness(biz);
            setProducts(prods || []);
            setLoading(false);
        }

        fetchStoreData();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-[#0c0c0e] flex items-center justify-center">
            <div className="text-white font-black animate-pulse uppercase tracking-[0.4em]">Calibrating Profile...</div>
        </div>
    );

    if (!business) return (
        <div className="min-h-screen bg-[#0c0c0e] flex items-center justify-center text-white">
            <h1 className="text-4xl font-black">Business Not Found</h1>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0c0c0e] text-white">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-end p-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-black/40 to-transparent z-10"></div>
                {business.image_url ? (
                    <img 
                        src={business.image_url} 
                        className="absolute inset-0 w-full h-full object-cover grayscale opacity-40" 
                        alt={business.name}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[300px] opacity-5 pointer-events-none grayscale">
                        🏢
                    </div>
                )}
                
                <div className="relative z-20 space-y-4 max-w-4xl">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Verified Marketplace Partner</span>
                    </div>
                    <h1 className="text-7xl md:text-9xl font-black italic tracking-tight uppercase leading-none">{business.name}</h1>
                    <div className="flex flex-wrap gap-8 pt-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none mb-2">Category</span>
                            <span className="text-xl font-black italic text-indigo-400 uppercase">{business.category}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none mb-2">Territory</span>
                            <span className="text-xl font-black italic uppercase">{business.towns?.name}, {business.towns?.state}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Grid */}
            <main className="max-w-7xl mx-auto p-12 grid grid-cols-1 lg:grid-cols-3 gap-16">
                
                {/* Information / Sidebar */}
                <div className="space-y-12">
                    <section className="space-y-6">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40">Marketplace Insight</h3>
                        <p className="text-lg font-medium text-white/70 leading-relaxed italic">{business.description}</p>
                    </section>

                    {/* Store Features (Requested: Seating Arrangement) */}
                    {business.store_features && (
                        <section className="space-y-6 pt-8 border-t border-white/5">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-indigo-400">In-Store Features</h3>
                            <div className="space-y-4">
                                {business.store_features.seating && (
                                    <div className="flex justify-between items-center bg-white/[0.03] border border-white/5 p-6 rounded-3xl">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Seating Alignment</span>
                                            <span className="text-lg font-black uppercase italic">{business.store_features.seating.type}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Capacity</span>
                                            <span className="text-lg font-black uppercase italic">{business.store_features.seating.capacity} Guests</span>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-center bg-white/[0.03] border border-white/5 p-6 rounded-3xl">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Public Network</span>
                                        <span className="text-lg font-black uppercase italic">{business.store_features.wifi ? 'Wireless-G Enabled' : 'Local Only'}</span>
                                    </div>
                                    <div className="text-2xl font-black text-indigo-500">
                                        {business.store_features.wifi ? '⚡' : '📶'}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    <Link href="/marketplace" className="inline-block py-5 px-12 bg-white text-black rounded-full font-black text-[12px] uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-black">
                        ← Back to Marketplace
                    </Link>
                </div>

                {/* Products Grid */}
                <div className="lg:col-span-2 space-y-12">
                    <div className="flex justify-between items-end border-b border-white/5 pb-8">
                        <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">The <br />Inventory.</h2>
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">{products.length} Items Listed</span>
                    </div>

                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {products.map((product) => (
                                <div key={product.id} className="group bg-white/[0.02] border border-white/5 rounded-[3rem] p-4 hover:border-indigo-500/30 transition-all">
                                    <div className="aspect-square bg-white/[0.03] rounded-[2.5rem] overflow-hidden relative mb-6">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-5xl opacity-10">📦</div>
                                        )}
                                        <div className="absolute top-6 right-6">
                                            <span className="px-4 py-2 bg-black border border-white/10 rounded-full text-[10px] font-black text-white italic tracking-tighter shadow-2xl">
                                                ${product.price}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="px-4 pb-4 space-y-2">
                                        <h3 className="font-black italic text-2xl tracking-tighter group-hover:text-indigo-400 transition-colors">{product.name}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{product.category}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-32 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-[4rem] opacity-30 italic font-medium text-xl">
                            Inventory deployment currently in transit.
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
