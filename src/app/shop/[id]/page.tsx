"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function BusinessProfilePage() {
    const { id } = useParams();
    const [business, setBusiness] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
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
                .eq('business_id', id)
                .order('created_at', { ascending: false });

            // Fetch some dynamic stats if migration exists
            const { data: dailyStats } = await supabase
                .from('daily_business_stats')
                .select('total_views')
                .eq('business_id', id)
                .single();

            setBusiness(biz);
            setProducts(prods || []);
            setStats(dailyStats || { total_views: 0 });
            setLoading(false);
        }

        fetchStoreData();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-20">
            <div className="text-white font-black animate-pulse uppercase tracking-[0.5em] flex flex-col items-center gap-8">
                <span className="text-8xl">🏜️</span>
                <span>Calibrating Boutique Profile...</span>
            </div>
        </div>
    );

    if (!business) return (
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-white p-20 text-center">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Boutique Not Found <br /><span className="text-white/20 text-xl font-normal">Check the discovery route or return to the Marketplace.</span></h1>
        </div>
    );

    const primaryColor = business.theme?.primaryColor || '#4F46E5';

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-amber-400 selection:text-black pb-48">
            {/* Immersive Shop Hero */}
            <section className="relative h-[65vh] flex items-end p-10 md:p-20 overflow-hidden group">
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0a0a0b] via-black/40 to-transparent"></div>
                
                {/* Parallax Background */}
                <div className="absolute inset-0 opacity-40 grayscale group-hover:scale-105 transition-transform duration-[3000ms]">
                    {business.image_url ? (
                        <img src={business.image_url} className="w-full h-full object-cover" alt={business.name} />
                    ) : (
                        <div className="w-full h-full bg-[#111114] flex items-center justify-center text-[25vw] opacity-5">🏬</div>
                    )}
                </div>

                <div className="relative z-10 max-w-7xl mx-auto w-full space-y-10 animate-in fade-in slide-in-from-bottom-20 duration-1000">
                    <div className="flex gap-4">
                        <Link href="/marketplace" className="px-6 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/10 transition-all">← Back to Marketplace</Link>
                        <div className="px-6 py-2.5 bg-amber-400 text-black rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">Official Oasis Partner</div>
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-7xl md:text-[10rem] font-black italic tracking-[calc(-0.04em)] uppercase leading-[0.8]">{business.name}</h1>
                        <div className="flex flex-wrap gap-12 pt-10 border-t border-white/10">
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em]">Core Category</span>
                                <p className="text-2xl font-black italic tracking-tighter uppercase text-amber-400 leading-none">{business.category}</p>
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em]">Discovery Domain</span>
                                <p className="text-2xl font-black italic tracking-tighter uppercase leading-none">{business.towns?.name || 'Local Region'} <span className="text-white/20 italic">{business.towns?.state}</span></p>
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em]">Network Reach</span>
                                <p className="text-2xl font-black italic tracking-tighter uppercase leading-none">{stats?.total_views || 0} Citizens Found</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Node */}
            <main className="max-w-7xl mx-auto px-10 md:px-20 grid grid-cols-1 lg:grid-cols-12 gap-24 pt-20">
                
                {/* Left: Metadata & Infrastructure */}
                <div className="lg:col-span-4 space-y-20">
                    <section className="space-y-8">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-400">Merchant Directive</h3>
                        <p className="text-2xl font-medium italic text-white/60 leading-relaxed group hover:text-white transition-colors duration-500">
                            "{business.description}"
                        </p>
                    </section>

                    {/* Integrated Store Features */}
                    {(business.store_features) && (
                        <section className="space-y-10 p-10 bg-white/[0.02] border border-white/5 rounded-[3.5rem] relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10 grayscale">
                                <span className="text-6xl italic font-black">⚙️</span>
                            </div>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-400 relative z-10">Premises Infrastructure</h3>
                            <div className="space-y-6 relative z-10">
                                {business.store_features.seating && (
                                    <div className="flex justify-between items-center bg-black/40 p-6 rounded-3xl border border-white/5 hover:border-amber-400/20 transition-all group/feat">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/30 group-hover/feat:text-amber-400 transition-colors">Seating Layout</span>
                                            <span className="text-xl font-black uppercase italic tracking-tighter">{business.store_features.seating.type} Mode</span>
                                        </div>
                                        <div className="text-right flex flex-col gap-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Capacity</span>
                                            <span className="text-xl font-black uppercase italic tracking-tighter">{business.store_features.seating.capacity} 👥</span>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-center bg-black/40 p-6 rounded-3xl border border-white/5 hover:border-amber-400/20 transition-all group/feat">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/30 group-hover/feat:text-amber-400 transition-colors">Connectivity</span>
                                        <span className="text-xl font-black uppercase italic tracking-tighter">{business.store_features.wifi ? 'Wireless Oasis' : 'Offline Sanctuary'}</span>
                                    </div>
                                    <div className="text-3xl font-black">
                                        {business.store_features.wifi ? '⚡' : '📶'}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Social/Integration Pulse */}
                    <div className="flex flex-col gap-4">
                        <Link href={`/shop/${business.id}/order`} className="w-full py-6 bg-amber-400 text-black rounded-[2rem] font-black text-xs uppercase tracking-widest text-center hover:scale-[1.02] shadow-2xl shadow-amber-400/20 transition-all">
                           🚀 Initiate Order Protocol
                        </Link>
                        <button onClick={() => alert('Launching Secure Oasis Pay...')} className="w-full py-6 bg-white/5 border border-white/10 text-white/50 rounded-[2rem] font-black text-xs uppercase tracking-widest text-center hover:bg-white/10 transition-colors">
                           💎 Digital Wallet Sync
                        </button>
                    </div>
                </div>

                {/* Right: The Inventory Grid */}
                <div className="lg:col-span-8 space-y-16">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
                        <div className="space-y-4">
                            <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">The <br /><span className="text-amber-400">Inventory.</span></h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">Locally Sourced independently verified items</p>
                        </div>
                        <span className="text-[11px] font-black text-white/20 uppercase tracking-widest">{products.length} Drops available</span>
                    </header>

                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {products.map((p) => (
                                <div key={p.id} className="group bg-[#121215] border border-white/5 rounded-[4rem] p-6 hover:border-amber-400/20 transition-all duration-700 hover:-translate-y-4 shadow-3xl overflow-hidden relative">
                                    <div className="aspect-[4/5] bg-black/40 rounded-[3rem] overflow-hidden relative mb-8">
                                        {p.image_url ? (
                                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[1000ms]" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[120px] opacity-10 grayscale group-hover:opacity-30 group-hover:rotate-12 transition-all">📦</div>
                                        )}
                                        {/* Premium Price Overlay */}
                                        <div className="absolute bottom-8 left-8">
                                           <div className="px-6 py-3 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-2xl">
                                              <span className="text-2xl font-black italic tracking-tighter text-amber-400">${Number(p.price).toFixed(2)}</span>
                                           </div>
                                        </div>
                                        {p.stock < 5 && (
                                            <div className="absolute top-8 right-8">
                                                <div className="px-4 py-1.5 bg-red-500/80 backdrop-blur-sm text-white rounded-full text-[8px] font-black uppercase tracking-widest">
                                                    Critical Supply
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="px-6 pb-6 space-y-4">
                                        <div className="space-y-1">
                                            <h3 className="font-black italic text-4xl tracking-tighter leading-none group-hover:text-amber-400 transition-colors uppercase truncate">{p.name}</h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">{p.category || 'REGIONAL ASSET'}</p>
                                        </div>
                                        <p className="text-xs font-medium text-white/40 line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-700">{p.description || 'Verified local independent drop from ' + (business.name)}.</p>
                                        <button className="w-full py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700 shadow-xl">
                                            Add to Oasis Cart
                                        </button>
                                    </div>
                                    {/* Subtle Ambient Glow */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-40 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-[5rem] space-y-8 animate-pulse">
                            <div className="text-8xl opacity-10">📡</div>
                            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20">Awaiting Inventory Transmission...</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
