"use client";
import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import GlobalSearch from '@/components/GlobalSearch';
import CategoryNav from '@/components/CategoryNav';
import DiscoveryFeed from '@/components/DiscoveryFeed';
import Link from 'next/link';

interface MarketplaceClientProps {
    initialFeatured: any;
    initialShoutouts: any[];
}

export default function MarketplaceClient({ initialFeatured, initialShoutouts }: MarketplaceClientProps) {
    const [featured, setFeatured] = useState<any>(initialFeatured);
    const [shoutouts, setShoutouts] = useState<any[]>(initialShoutouts);
    const [activeCategory, setActiveCategory] = useState('All');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Only fetch if category is not the initial state or we need fresh data
        if (activeCategory === 'All' && featured === initialFeatured) return;

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
    }, [activeCategory]);

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] selection:bg-[hsl(var(--primary))] selection:text-[hsl(var(--primary-foreground))]">
            {/* Global Marketplace Hero */}
            <div className="relative pt-32 pb-48 px-8 overflow-hidden oasis-gradient">
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30"></div>
                <div className="absolute top-[20%] right-[-10%] w-[50%] h-[60%] bg-[hsl(var(--primary))/0.05] blur-[150px] rounded-full"></div>

                <div className="max-w-7xl mx-auto relative z-10 text-center space-y-12">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-[hsl(var(--primary))/0.1] border border-[hsl(var(--primary))/0.2] rounded-full">
                            <span className="w-1.5 h-1.5 bg-[hsl(var(--primary))] rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[hsl(var(--primary))]">The Global Oasis</span>
                        </div>
                        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter leading-none">
                            Discover <span className="text-[hsl(var(--primary))]">Everything.</span>
                        </h1>
                        <p className="max-w-xl mx-auto text-[hsl(var(--muted-foreground))] font-medium text-lg leading-relaxed">
                            Boutiques, treasures, and experiences from the world's most premium independent ecosystem.
                        </p>
                    </div>

                    <Suspense fallback={<div className="h-16 w-full max-w-2xl mx-auto bg-white/5 animate-pulse rounded-full"></div>}>
                        <div className="max-w-xl mx-auto glass p-1 rounded-[3rem]">
                            <GlobalSearch />
                        </div>
                    </Suspense>
                </div>
            </div>

            {/* Global Discovery Grid */}
            <main className="max-w-7xl mx-auto px-8 -mt-24 pb-32 space-y-32">
                <section className="relative z-50">
                    <Suspense fallback={<div className="h-16 w-full max-w-2xl mx-auto bg-white/5 animate-pulse rounded-full"></div>}>
                        <CategoryNav onCategoryChange={setActiveCategory} />
                    </Suspense>
                </section>

                <section className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex justify-between items-end px-4">
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black italic tracking-tighter uppercase">{activeCategory === 'All' ? 'Oasis Discovery' : `${activeCategory} Drop.`}</h2>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1">Curated Fresh Arrivals</p>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-[10px] font-black text-indigo-400/40 uppercase tracking-widest animate-pulse">Live Feed • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                    <DiscoveryFeed />
                </section>

                <section className="space-y-12">
                    <div className="flex justify-between items-end px-4">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black italic tracking-tight uppercase">Neighborhood <span className="text-amber-500 italic">Live.</span></h2>
                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest px-1">Local Business Insights</p>
                        </div>
                        <Link href="/local" className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">See Full Map →</Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 group bg-white/[0.02] rounded-[4rem] p-12 border border-white/5 hover:bg-white/[0.04] transition-all relative overflow-hidden group">
                           <div className="absolute top-0 right-12 text-[160px] opacity-[0.03] select-none italic font-black group-hover:opacity-10 transition-opacity">
                              🏠
                           </div>
                           <div className="relative z-10 space-y-6">
                              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 text-amber-400 rounded-full border border-amber-400/20 text-[9px] font-black uppercase">Local Spotlight</div>
                              <h3 className="text-5xl font-black italic tracking-tighter">Effingham Hub.</h3>
                              <p className="text-gray-400 max-w-sm text-sm font-medium">Discover 28+ verified physical businesses in the Ossipee/Tamworth regional network. Direct pick-up and local dispatch enabled.</p>
                              <div className="pt-4 flex gap-4">
                                 <Link href="/local" className="px-8 py-4 bg-white text-black rounded-3xl font-black text-[10px] uppercase shadow-2xl hover:scale-105 transition-all">Launch Registry</Link>
                                 <button className="px-8 py-4 border border-white/10 rounded-3xl font-black text-[10px] uppercase hover:bg-white/5 transition-all">Near Me</button>
                              </div>
                           </div>
                        </div>

                        <div className="bg-amber-400 rounded-[4rem] p-10 text-black flex flex-col justify-between shadow-2xl shadow-amber-900/20">
                           <div className="space-y-4">
                              <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Verified Partners</div>
                              <h3 className="text-4xl font-black italic tracking-tighter">Growth <br />Network.</h3>
                           </div>
                           <div className="space-y-6 mt-8">
                              <div className="space-y-2">
                                 <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                                    <span>Regional Data Density</span>
                                    <span>98%</span>
                                 </div>
                                 <div className="h-1 bg-black/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-black w-[98%] rounded-full"></div>
                                 </div>
                              </div>
                              <p className="text-[11px] font-bold uppercase leading-tight opacity-50">Providing real-time logistics for the united lakes community.</p>
                           </div>
                        </div>
                    </div>
                </section>

                {(featured.businesses?.length > 0) && (
                    <section className="space-y-12">
                        <div className="flex justify-between items-end px-4">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black italic tracking-tight uppercase">Featured {activeCategory !== 'All' ? activeCategory : 'Boutiques'}</h2>
                                <p className="text-[10px] font-black text-[hsl(var(--primary))] uppercase tracking-widest px-1">Selected for Excellence</p>
                            </div>
                        </div>

                        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                            {featured.businesses.map((biz: any) => (
                                <Link key={biz.id} href={`/shop/${biz.id}`} className="group relative bg-[hsl(var(--card))/0.5] rounded-[2.5rem] p-8 border border-[hsl(var(--border))] hover:bg-[hsl(var(--card))] hover:border-[hsl(var(--primary))/0.3] transition-all overflow-hidden h-64 flex flex-col justify-end">
                                    <div className="absolute top-8 left-8 w-12 h-12 bg-[hsl(var(--background))] rounded-2xl flex items-center justify-center text-xl font-black italic text-[hsl(var(--primary))] border border-[hsl(var(--border))] group-hover:scale-110 transition-transform shadow-lg">
                                        {biz.name[0]}
                                    </div>
                                    <div className="space-y-1 relative z-10">
                                        <h3 className="font-bold text-lg group-hover:text-[hsl(var(--primary))] transition-colors truncate">{biz.name}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-tight text-[hsl(var(--muted-foreground))] truncate">{biz.category}</p>
                                    </div>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(var(--primary))/0.05] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                <section className="bg-[#0c0c0e] text-white rounded-[4rem] p-12 md:p-20 shadow-2xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none grayscale group-hover:grayscale-0 group-hover:opacity-20 transition-all duration-1000">
                        <span className="text-[240px] italic font-black select-none leading-none">📢</span>
                    </div>
                    <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full"></div>

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-400/10 border border-amber-400/20 rounded-full">
                                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Live Networking</span>
                                </div>
                                <h2 className="text-7xl font-black italic tracking-tighter leading-none">Global <br />Shoutouts.</h2>
                            </div>
                            <p className="text-gray-400 font-medium text-lg max-w-sm leading-relaxed">Discover updates, drops, and community events from independent boutiques across the world.</p>
                        </div>

                        <div className="space-y-6">
                            {shoutouts.length > 0 ? shoutouts.map((shout: any) => (
                                <div key={shout.id} className="bg-white/[0.03] backdrop-blur-3xl p-8 rounded-[3rem] border border-white/10 flex items-start gap-6 hover:bg-white/[0.05] hover:border-white/20 transition-all group/shout cursor-default">
                                    <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center text-3xl shrink-0 border border-white/5">
                                        {shout.type === 'promo' ? '💎' : shout.type === 'alert' ? '✨' : '📝'}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">{shout.businesses?.name || 'Local Partner'}</span>
                                            <span className="text-[9px] font-bold uppercase opacity-30">{new Date(shout.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="font-bold text-base tracking-tight leading-snug text-white/90">{shout.content}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem] py-24 px-8 text-center space-y-4">
                                    <div className="text-4xl opacity-20">📡</div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Waiting for next transmission...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="space-y-12">
                    <div className="flex justify-between items-end px-4">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black italic tracking-tight uppercase">Trending Treasures</h2>
                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest px-1">Global Best Sellers</p>
                        </div>
                    </div>

                    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                        {featured.products?.length > 0 ? featured.products.map((product: any) => (
                            <Link key={product.id} href={`/shop/${product.business_id}`} className="group space-y-6">
                                <div className="aspect-[4/5] bg-[#1a1a1e] rounded-[3.5rem] overflow-hidden relative border border-white/5 shadow-3xl transition-all duration-500 group-hover:border-amber-400/30 group-hover:-translate-y-2">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-80 group-hover:opacity-100" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl bg-white/[0.02] opacity-40 group-hover:scale-110 transition-transform duration-700">💎</div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                                    <div className="absolute bottom-10 left-10 right-10 p-5 bg-white/10 backdrop-blur-2xl rounded-[2rem] border border-white/20 translate-y-32 group-hover:translate-y-0 transition-transform duration-700 shadow-2xl">
                                        <button className="w-full py-4 bg-white text-black rounded-[1.2rem] font-bold text-[11px] uppercase tracking-widest">Discover Now</button>
                                    </div>
                                </div>
                                <div className="px-6 flex justify-between items-end">
                                    <div className="space-y-3">
                                        <h3 className="font-black italic text-xl tracking-tighter leading-none group-hover:text-amber-400 transition-colors truncate max-w-[150px]">{product.name}</h3>
                                        <p className="text-[10px] font-bold uppercase text-gray-500 tracking-widest leading-none">From {product.businesses?.name}</p>
                                    </div>
                                    <div className="text-2xl font-black italic text-white/90">${Number(product.price).toFixed(2)}</div>
                                </div>
                            </Link>
                        )) : (
                            [1,2,3,4].map(i => (
                                <div key={i} className="aspect-[4/5] bg-white/5 rounded-[3.5rem] border border-dashed border-white/10 flex items-center justify-center flex-col gap-4 opacity-40">
                                    <div className="text-3xl">✨</div>
                                    <p className="text-[9px] font-black uppercase tracking-widest">Awaiting Treasure {i}</p>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>

            <footer className="max-w-7xl mx-auto px-8 py-32 border-t border-[hsl(var(--border))] grid grid-cols-1 md:grid-cols-4 gap-16 opacity-40">
                <div className="space-y-6">
                    <h2 className="text-3xl font-black italic tracking-tighter text-[hsl(var(--foreground))]">Oasis.</h2>
                    <p className="text-sm font-medium">Elevating local independent boutiques into a global discovery engine.</p>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--primary))]">Explore</h4>
                    <ul className="space-y-2 text-sm font-medium"><li>Top Gems</li><li>New Drops</li><li>Gift Cards</li></ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--primary))]">Sell</h4>
                    <ul className="space-y-2 text-sm font-medium"><li>Open a Boutique</li><li>Pricing</li><li>Success Stories</li></ul>
                </div>
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--primary))]">Social</h4>
                    <ul className="space-y-2 text-sm font-medium"><li>Instagram</li><li>Twitter</li><li>Our Journal</li></ul>
                </div>
            </footer>
        </div>
    );
}
