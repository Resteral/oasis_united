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

            <main className="max-w-7xl mx-auto px-8 -mt-24 pb-32 space-y-48">
                
                {/* Category Interaction Section */}
                <section className="relative z-50">
                    <Suspense fallback={<div className="h-16 w-full max-w-2xl mx-auto bg-white/5 animate-pulse rounded-full"></div>}>
                        <CategoryNav onCategoryChange={setActiveCategory} />
                    </Suspense>
                </section>

                {/* Discovery Feed Section */}
                <section className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex justify-between items-end px-4">
                        <div className="space-y-2">
                            <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                                {activeCategory === 'All' ? 'Oasis Discovery' : `${activeCategory} Drop.`}
                            </h2>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1">Curated Fresh Arrivals from our Premium Partners</p>
                        </div>
                    </div>
                    <DiscoveryFeed />
                </section>

                {/* Regional Insight Section */}
                <TownDiscovery />

                {/* Logistics Section */}
                <ActiveRoutes />

                {/* Featured Boutiques Grid */}
                {(featured.businesses?.length > 0) && (
                    <section className="space-y-12">
                        <div className="flex justify-between items-end px-4">
                            <div className="space-y-2">
                                <h2 className="text-4xl font-black italic tracking-tight uppercase">Featured {activeCategory !== 'All' ? activeCategory : 'Boutiques'}</h2>
                                <p className="text-[10px] font-black text-[hsl(var(--primary))] uppercase tracking-widest px-1">Verified Independent Merchants</p>
                            </div>
                        </div>

                        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                            {featured.businesses.map((biz: any) => (
                                <Link key={biz.id} href={`/shop/${biz.id}`} className="group relative bg-[hsl(var(--card))/0.5] rounded-[3.5rem] p-10 border border-white/5 hover:bg-[hsl(var(--card))] hover:border-primary/20 transition-all overflow-hidden h-72 flex flex-col justify-end shadow-2xl hover:scale-105 duration-500">
                                    <div className="absolute top-10 left-10 w-16 h-16 bg-[hsl(var(--background))] rounded-3xl flex items-center justify-center text-3xl font-black italic text-[hsl(var(--primary))] border border-white/5 group-hover:scale-110 transition-transform shadow-2xl">
                                        {biz.name[0]}
                                    </div>
                                    <div className="space-y-2 relative z-10">
                                        <h3 className="font-black italic text-2xl tracking-tighter group-hover:text-[hsl(var(--primary))] transition-colors truncate">{biz.name}</h3>
                                        <div className="flex gap-3">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-[hsl(var(--muted-foreground))]">{biz.category}</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">{biz.location || 'Local'}</span>
                                            {biz.store_features?.is_founding_partner && (
                                                <span className="text-[7px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-amber-400 text-black rounded-full shadow-lg">Founding Partner</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-[hsl(var(--primary))/0.1] blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Founding Partners / Deliverer Recognition */}
                <section className="space-y-12">
                     <div className="flex justify-between items-end px-4">
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black italic tracking-tight uppercase">Founding <span className="text-indigo-500">Partners.</span></h2>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest px-1">Citizens Building the Global Oasis</p>
                        </div>
                    </div>

                    <div className="flex gap-8 overflow-x-auto pb-12 no-scrollbar">
                        {[
                            { name: "Walt's Carpentry", role: 'Founding Carpenter', icon: '🔨', stats: 'Regional Infrastructure Build' },
                            { name: 'Local Dave', role: 'Elite Deliverer', icon: '🚐', stats: '24 Shops Onboarded' },
                            { name: 'Sarah NH', role: 'Expansion Scout', icon: '🗺️', stats: '8 Towns Opened' },
                            { name: 'Marcus R.', role: 'Logistics Lead', icon: '🛰️', stats: '12 Active Routes' },
                            { name: 'Citizen Phil', role: 'Vanguard', icon: '🛡️', stats: '4 Towns Registered' },
                        ].map((partner) => (
                            <div key={partner.name} className="flex-shrink-0 w-72 bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 space-y-6 hover:bg-white/[0.04] transition-all group">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">{partner.icon}</div>
                                <div className="space-y-2">
                                    <h3 className="font-black italic text-xl tracking-tighter">{partner.name}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{partner.role}</p>
                                </div>
                                <div className="pt-4 border-t border-white/5">
                                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">{partner.stats}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Global Shoutouts / Network Updates */}
                <section className="bg-[hsl(var(--card))] rounded-[4rem] p-12 md:p-24 shadow-3xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none grayscale group-hover:grayscale-0 group-hover:opacity-10 transition-all duration-1000">
                        <span className="text-[320px] italic font-black select-none leading-none">📢</span>
                    </div>
                    
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
                        <div className="space-y-10">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-400/10 border border-amber-400/20 rounded-full">
                                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Live Networking</span>
                                </div>
                                <h2 className="text-8xl font-black italic tracking-tighter leading-none uppercase">Global <br />Shoutouts.</h2>
                            </div>
                            <p className="text-gray-400 font-medium text-xl max-w-sm leading-relaxed">Discover updates, daily drops, and community events directly from the boutiques.</p>
                            <Link href="/register-business" className="inline-block px-12 py-5 bg-amber-400 text-black font-black uppercase tracking-widest text-[11px] rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-amber-900/10">Broadcast Your Business</Link>
                        </div>

                        <div className="space-y-8">
                            {shoutouts.length > 0 ? shoutouts.map((shout: any) => (
                                <div key={shout.id} className="bg-white/[0.02] backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white/5 flex items-start gap-10 hover:bg-white/[0.04] hover:border-white/10 transition-all group/shout cursor-default relative overflow-hidden">
                                    <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-4xl shrink-0 border border-white/5 group-hover/shout:scale-110 transition-transform duration-700">
                                        {shout.type === 'promo' ? '💎' : shout.type === 'alert' ? '✨' : '📝'}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-400">{shout.businesses?.name || 'Local Partner'}</span>
                                            <span className="text-[9px] font-bold uppercase opacity-30">{new Date(shout.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="font-bold text-lg tracking-tight leading-relaxed text-white/90">{shout.content}</p>
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-amber-400/5 blur-3xl rounded-full"></div>
                                </div>
                            )) : (
                                <div className="bg-white/[0.01] border border-dashed border-white/5 rounded-[4rem] py-32 px-12 text-center space-y-6 opacity-30">
                                    <div className="text-5xl">📡</div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.5em]">Waiting for transmission...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Trending Grid with Merchant/Items Toggles */}
                <section className="space-y-12 pb-32">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 px-4">
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black italic tracking-tight uppercase">Trending <span className="text-amber-500 italic font-black">Drops.</span></h2>
                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest px-1">Independently Sourced Treasures</p>
                        </div>

                        {/* View Switcher Toggles */}
                        <div className="flex bg-white/5 p-1.5 rounded-[2rem] border border-white/5">
                            {['Items', 'Sellers'].map((view) => (
                                <button
                                    key={view}
                                    onClick={() => setTrendingView(view as 'Items' | 'Sellers')}
                                    className={`px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
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

                    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 transition-all duration-500 ${loading ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
                        {trendingView === 'Items' ? (
                            featured.products?.length > 0 ? featured.products.map((product: any) => (
                                <Link key={product.id} href={`/shop/${product.business_id}`} className="group space-y-8 animate-in fade-in zoom-in duration-500">
                                    <div className="aspect-[4/5] bg-white/[0.02] rounded-[4rem] overflow-hidden relative border border-white/5 transition-all duration-700 group-hover:border-amber-400/30 group-hover:-translate-y-4 shadow-3xl">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-100" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-5xl bg-white/[0.01] opacity-20 group-hover:scale-125 transition-transform duration-1000">💎</div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity"></div>
                                        <div className="absolute bottom-12 left-12 right-12 p-1 translate-y-32 group-hover:translate-y-0 transition-transform duration-700">
                                            <button className="w-full py-5 bg-white text-black rounded-[1.5rem] font-black text-[12px] uppercase tracking-widest shadow-2xl">Discover</button>
                                        </div>
                                    </div>
                                    <div className="px-8 flex justify-between items-end">
                                        <div className="space-y-4">
                                            <h3 className="font-black italic text-2xl tracking-tighter leading-none group-hover:text-amber-400 transition-colors truncate max-w-[180px]">{product.name}</h3>
                                            <p className="text-[10px] font-bold uppercase text-gray-500 tracking-widest leading-none">Drop from {product.businesses?.name}</p>
                                        </div>
                                        <div className="text-3xl font-black italic text-white/90 tracking-tighter">${Number(product.price).toFixed(2)}</div>
                                    </div>
                                </Link>
                            )) : (
                                [1,2,3,4].map(i => (
                                    <div key={i} className="aspect-[4/5] bg-white/5 rounded-[4rem] border border-dashed border-white/10 flex items-center justify-center flex-col gap-6 opacity-20">
                                        <div className="text-4xl animate-bounce">✨</div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Awaiting Discovery</p>
                                    </div>
                                ))
                            )
                        ) : (
                            /* Sellers View - People selling stuff */
                            featured.businesses?.length > 0 ? featured.businesses.slice(0, 4).map((biz: any) => (
                                <Link key={biz.id} href={`/shop/${biz.id}`} className="group relative bg-[#1a1a1e] rounded-[4rem] p-12 border border-white/5 hover:border-amber-500/30 transition-all overflow-hidden h-[450px] flex flex-col items-center text-center shadow-3xl hover:scale-105 duration-700 animate-in slide-in-from-bottom-12">
                                     <div className="w-32 h-32 bg-amber-500/10 rounded-[2.5rem] flex items-center justify-center text-5xl font-black italic text-amber-500 border border-amber-500/20 mb-8 group-hover:scale-110 transition-transform shadow-2xl">
                                        {biz.name[0]}
                                    </div>
                                    <div className="space-y-6 flex-1">
                                        <div className="space-y-2">
                                            <h3 className="font-black italic text-3xl tracking-tighter group-hover:text-amber-500 transition-colors">{biz.name}</h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/40">{biz.location}</p>
                                        </div>
                                        <p className="text-sm font-medium text-gray-400 line-clamp-2 px-4">{biz.description || 'Verified Independent Merchant in the Oasis United network.'}</p>
                                        
                                        <div className="pt-8 flex flex-wrap justify-center gap-2">
                                            {biz.category.split('&').map((cat: string) => (
                                                <span key={cat} className="text-[8px] font-black uppercase tracking-widest px-3 py-1.5 bg-white/5 rounded-full border border-white/5">{cat.trim()}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-full pt-8 border-t border-white/5">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Visit Boutique →</span>
                                    </div>
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </Link>
                            )) : (
                                [1,2,3,4].map(i => (
                                    <div key={i} className="h-[450px] bg-white/5 rounded-[4rem] border border-dashed border-white/10 flex items-center justify-center flex-col gap-6 opacity-20">
                                        <div className="text-4xl">👨‍🌾</div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Finding Sellers</p>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                </section>
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
