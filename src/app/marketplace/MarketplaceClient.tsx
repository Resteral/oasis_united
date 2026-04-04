"use client";
import { useEffect, useState, Suspense } from 'react';
import CategoryNav from '@/components/CategoryNav';
import DiscoveryFeed from '@/components/DiscoveryFeed';
import Link from 'next/link';

// New Modular Components
import MarketplaceHero from '@/components/marketplace/MarketplaceHero';
import TownDiscovery from '@/components/marketplace/TownDiscovery';
import ActiveRoutes from '@/components/marketplace/ActiveRoutes';

interface MarketplaceClientProps {
    initialFeatured: any;
    initialShoutouts: any[];
}

export default function MarketplaceClient({ initialFeatured, initialShoutouts }: MarketplaceClientProps) {
    const [featured, setFeatured] = useState<any>(initialFeatured);
    const [shoutouts] = useState<any[]>(initialShoutouts);
    const [activeCategory, setActiveCategory] = useState('All');
    const [trendingView, setTrendingView] = useState<'Items' | 'Sellers'>('Items');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeCategory === 'All' && JSON.stringify(featured) === JSON.stringify(initialFeatured)) return;

        async function loadCategory() {
            setLoading(true);
            try {
                const res = await fetch(`/api/search?category=${activeCategory}`);
                const data = await res.json();
                if (data.featured) {
                    setFeatured(data.featured);
                } else if (data.results) {
                    setFeatured({ businesses: data.results.businesses, products: data.results.products });
                }
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setLoading(false);
            }
        }
        loadCategory();
    }, [activeCategory, initialFeatured]);

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] selection:bg-[hsl(var(--primary))] selection:text-[hsl(var(--primary-foreground))]">
            
            <MarketplaceHero />

            <main className="max-w-7xl mx-auto px-8 -mt-24 pb-32 space-y-32">
                
                {/* 1. Core Navigation & Primary Search */}
                <section className="relative z-50">
                    <Suspense fallback={<div className="h-16 w-full max-w-2xl mx-auto bg-white/5 animate-pulse rounded-full"></div>}>
                        <CategoryNav onCategoryChange={setActiveCategory} />
                    </Suspense>
                </section>

                {/* 2. THE DISCOVERY GRID (Boutiques & Items) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    {/* Left: Main Discovery Feed (8 Cols) */}
                    <div className="lg:col-span-8 space-y-32">
                        
                        {/* Trending Section - Elevated */}
                        <section className="space-y-12">
                            <div className="flex justify-between items-end px-4">
                                <div className="space-y-2">
                                    <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none">
                                        {activeCategory === 'All' ? 'Oasis Discovery' : `${activeCategory} Drop.`}
                                    </h2>
                                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest px-1">Curated Fresh Arrivals from our Regional Partners</p>
                                </div>
                                <div className="flex bg-white/5 p-1.5 rounded-[2rem] border border-white/5">
                                    {['Items', 'Sellers'].map((view) => (
                                        <button
                                            key={view}
                                            onClick={() => setTrendingView(view as 'Items' | 'Sellers')}
                                            className={`px-6 py-2.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                                                trendingView === view 
                                                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                                                : 'text-amber-500/40 hover:text-white'
                                            }`}
                                        >
                                            {view}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-all duration-500 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                                {trendingView === 'Items' ? (
                                    featured.products?.slice(0, 6).map((product: any) => (
                                        <Link key={product.id} href={`/shop/${product.business_id}`} className="group relative bg-[hsl(var(--card))/0.4] rounded-[3rem] p-8 border border-white/5 hover:border-amber-400/30 transition-all flex gap-8 items-center shadow-3xl">
                                            <div className="w-32 h-32 bg-white/5 rounded-2xl overflow-hidden shrink-0">
                                                {product.image_url ? (
                                                    <img src={product.image_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                                                ) : <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">💎</div>}
                                            </div>
                                            <div className="space-y-2 overflow-hidden">
                                                <h3 className="font-black italic text-xl tracking-tighter uppercase truncate">{product.name}</h3>
                                                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{product.businesses?.name}</p>
                                                <div className="text-2xl font-black italic text-amber-400 mt-2">${Number(product.price).toFixed(2)}</div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    featured.businesses?.slice(0, 6).map((biz: any) => (
                                        <Link key={biz.id} href={`/shop/${biz.id}`} className="group relative bg-[#1a1a1e] rounded-[3rem] p-8 border border-white/5 hover:border-amber-500/30 transition-all flex gap-8 items-center shadow-3xl">
                                            <div className="w-32 h-32 bg-amber-500/10 rounded-2xl flex items-center justify-center text-4xl font-black italic text-amber-500 border border-amber-500/20 group-hover:scale-110 transition-transform shrink-0">
                                                {biz.name[0]}
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-black italic text-xl tracking-tighter uppercase truncate">{biz.name}</h3>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-amber-500/40">{biz.location}</p>
                                                <span className="inline-block mt-2 px-3 py-1 bg-white/5 rounded-full text-[7px] font-black uppercase text-white/30 tracking-widest leading-none">{biz.category}</span>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Recent Network Activity */}
                        <section className="space-y-12">
                            <div className="flex justify-between items-end px-4">
                                <div className="space-y-2">
                                    <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-indigo-400">Live Pulse.</h2>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1 leading-none italic">Real-time status of independent routes & discoveries</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-[hsl(var(--card))/0.2] border border-white/5 rounded-[4rem] p-10 h-[500px] overflow-hidden relative group transition-all hover:bg-[hsl(var(--card))/0.4]">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 grayscale group-hover:opacity-20 transition-opacity">
                                        <span className="text-[120px] font-black italic">📢</span>
                                    </div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-10">Global Shoutouts</h3>
                                    <div className="space-y-6 overflow-y-auto max-h-full pr-4 custom-scrollbar">
                                        {shoutouts.slice(0, 5).map((shout: any) => (
                                            <div key={shout.id} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-3 hover:bg-white/[0.08] transition-all">
                                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-amber-400">
                                                    <span>{shout.businesses?.name}</span>
                                                    <span className="opacity-30">{new Date(shout.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <p className="text-sm font-bold tracking-tight text-white/80 leading-relaxed">{shout.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-8">
                                    <div className="h-1/2 bg-indigo-600/5 border border-indigo-500/10 rounded-[3rem] p-10 relative overflow-hidden group">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-6">Active Logistics</h3>
                                        <ActiveRoutes />
                                    </div>
                                    <div className="h-1/2 bg-amber-400/5 border border-amber-500/10 rounded-[3rem] p-10 relative overflow-hidden group">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400 mb-6">Regional Hubs</h3>
                                        <TownDiscovery />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right: Discovery Tools & Foundings (4 Cols) */}
                    <aside className="lg:col-span-4 space-y-12 lg:sticky lg:top-12">
                        
                        {/* Price Compass / Tools */}
                        <section className="bg-white/5 rounded-[4rem] p-10 border border-white/10 space-y-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Network Utilities</h3>
                            <Link href="/price-compass" className="block p-8 bg-zinc-900 border border-white/5 rounded-3xl group hover:border-amber-400/30 transition-all">
                                <div className="flex items-center gap-6">
                                    <span className="text-4xl group-hover:scale-125 transition-transform duration-500">📡</span>
                                    <div className="space-y-1">
                                        <h4 className="font-black italic text-xl uppercase tracking-tighter text-white/80 group-hover:text-amber-400">Price Compass</h4>
                                        <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Global Market Scan</p>
                                    </div>
                                </div>
                            </Link>
                            <Link href="/track" className="block p-8 bg-zinc-900 border border-white/5 rounded-3xl group hover:border-indigo-400/30 transition-all">
                                <div className="flex items-center gap-6">
                                    <span className="text-4xl group-hover:scale-125 transition-transform duration-500">🛰️</span>
                                    <div className="space-y-1">
                                        <h4 className="font-black italic text-xl uppercase tracking-tighter text-white/80 group-hover:text-indigo-400">Logistics Track</h4>
                                        <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Active Regional Transit</p>
                                    </div>
                                </div>
                            </Link>
                        </section>

                        {/* Founding Partners Vanguards */}
                        <section className="space-y-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 px-4">Founding Vanguards</h3>
                            <div className="space-y-4">
                                {[
                                    { name: "Walt's Carpentry", role: 'Founding Carpenter', icon: '🔨' },
                                    { name: 'Local Dave', role: 'Elite Deliverer', icon: '🚐' },
                                    { name: 'Sarah NH', role: 'Expansion Scout', icon: '🗺️' },
                                ].map((partner) => (
                                    <div key={partner.name} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex items-center gap-6 group hover:bg-white/5 transition-all">
                                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">{partner.icon}</div>
                                        <div className="space-y-1">
                                            <h4 className="font-black italic text-sm tracking-tighter uppercase">{partner.name}</h4>
                                            <p className="text-[8px] font-bold uppercase text-indigo-400 tracking-widest">{partner.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Marketplace Recognition */}
                        <div className="bg-amber-400 p-12 rounded-[4rem] text-black space-y-6 shadow-2xl shadow-amber-400/20 group hover:scale-[1.02] transition-all">
                            <h3 className="text-2xl font-black italic tracking-tighter shadow-sm leading-none uppercase">Scale Your Discovery.</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed opacity-60">Broadcast your independent boutique across the unified Oasis regional network.</p>
                            <Link href="/register-business" className="block w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest text-center rounded-2xl hover:scale-105 transition-all shadow-xl">Onboard Node</Link>
                        </div>
                    </aside>
                </div>
            </main>

            <footer className="max-w-7xl mx-auto px-8 py-48 border-t border-white/5 grid grid-cols-1 md:grid-cols-4 gap-24 opacity-30 group hover:opacity-60 transition-opacity duration-1000">
                <div className="space-y-8">
                    <h2 className="text-5xl font-black italic tracking-tighter text-white uppercase">Oasis.</h2>
                    <p className="text-base font-medium leading-relaxed">The premier independent discovery engine for unified communities.</p>
                    <div className="flex gap-6 mt-12 text-2xl grayscale group-hover:grayscale-0 transition-all opacity-40 group-hover:opacity-100">
                        <span>📸</span><span>🐦</span><span>💼</span>
                    </div>
                </div>
                <div className="space-y-6">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">Discover</h4>
                    <ul className="space-y-3 text-sm font-bold uppercase tracking-tighter"><li>Top Treasures</li><li>New Towns</li><li>Active Routes</li><li>Gift Registry</li></ul>
                </div>
                <div className="space-y-6">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">Operate</h4>
                    <ul className="space-y-3 text-sm font-bold uppercase tracking-tighter"><li>Register a Town</li><li>Define a Route</li><li>Boutique Portal</li><li>Onboarding Manual</li></ul>
                </div>
                <div className="space-y-6">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">Governance</h4>
                    <ul className="space-y-3 text-sm font-bold uppercase tracking-tighter"><li>The Ledger</li><li>Privacy Protocol</li><li>Network Status</li><li>Terms of Oasis</li></ul>
                </div>
            </footer>
        </div>
    );
}
