"use client";
import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function PriceCompassPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [neighborTowns, setNeighborTowns] = useState<any[]>([]);
    const [activeTown, setActiveTown] = useState<string | null>(null);

    useEffect(() => {
        // Load local towns to filter comparison
        supabase.from('towns').select('*').limit(10).then(({ data }) => {
            setNeighborTowns(data || []);
            if (data?.[0]) setActiveTown(data[0].name);
        });
    }, []);

    const searchPrices = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;
        setLoading(true);

        try {
            const { data, error } = await supabase
                .from('products')
                .select('*, businesses!inner(name, location, category)')
                .ilike('name', `%${query}%`)
                .order('price', { ascending: true });

            if (data) {
                // Group by price range if needed, or just show the sorted list
                setResults(data);
            }
        } catch (err) {
            console.error("Price search failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const cheapest = results.length > 0 ? results[0] : null;

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-amber-400 selection:text-black pb-32">
            {/* Dynamic Glass Header */}
            <header className="fixed top-0 left-0 w-full z-[100] border-b border-white/5 bg-black/40 backdrop-blur-3xl">
                <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-amber-400/10 border border-amber-400/20 rounded-2xl flex items-center justify-center text-2xl">📡</div>
                        <div>
                            <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">Oasis <span className="text-amber-400">Compass.</span></h1>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mt-1 italic">Regional Price Intelligence Network</p>
                        </div>
                    </div>
                    <Link href="/marketplace" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">Return to Marketplace →</Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 pt-48 space-y-24">
                {/* Search / Pulse Section */}
                <section className="max-w-3xl mx-auto text-center space-y-12">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-400/10 border border-amber-400/20 rounded-full">
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400">Live Price Synchronization</span>
                        </div>
                        <h2 className="text-7xl font-black italic tracking-tighter leading-none uppercase">Scan Your <br /><span className="text-amber-400">Neighborhood.</span></h2>
                        <p className="text-white/30 font-medium text-lg italic leading-relaxed">Instantly verify prices across all independent boutiques in your regional node. Save time, support local.</p>
                    </div>

                    <form onSubmit={searchPrices} className="relative group">
                        <input 
                            required
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search for a daily staple (e.g. Milk, Eggs, Nails)..."
                            className="w-full bg-white/[0.03] border border-white/10 p-10 rounded-[3.5rem] font-black italic text-2xl focus:border-amber-400 outline-none transition-all placeholder:text-white/10 text-center shadow-3xl"
                        />
                        <button 
                            type="submit"
                            disabled={loading}
                            className="absolute right-4 top-4 bottom-4 px-12 bg-amber-400 text-black rounded-[2.8rem] font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-amber-900/40"
                        >
                            {loading ? 'PULSING...' : 'SCAN PRICES'}
                        </button>
                    </form>

                    {/* Town Toggles */}
                    <div className="flex flex-wrap justify-center gap-3">
                        {neighborTowns.map(town => (
                            <button 
                                key={town.id}
                                onClick={() => setActiveTown(town.name)}
                                className={`px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeTown === town.name ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'}`}
                            >
                                {town.name}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Results Visual Interface */}
                {results.length > 0 && (
                    <section className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                        {/* Best Value Highlight */}
                        {cheapest && (
                            <div className="bg-amber-400 text-black rounded-[4rem] p-12 md:p-20 relative overflow-hidden group shadow-3xl">
                                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none grayscale group-hover:grayscale-0 group-hover:opacity-30 transition-all duration-1000">
                                    <span className="text-[320px] italic font-black select-none leading-none">💰</span>
                                </div>
                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-16 text-center md:text-left">
                                    <div className="space-y-6">
                                        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-black/10 rounded-full border border-black/5">
                                            <span className="text-[10px] font-black uppercase tracking-widest">Regional Advantage</span>
                                        </div>
                                        <h3 className="text-7xl font-black italic tracking-tighter leading-none uppercase max-w-xl">
                                            Best Local <br />Value Found.
                                        </h3>
                                        <p className="text-black/60 font-bold text-xl italic max-w-sm">"{cheapest.name}" is currently most accessible at {cheapest.businesses?.name}.</p>
                                    </div>
                                    <div className="bg-black/5 p-12 rounded-[3.5rem] border border-black/5 backdrop-blur-md flex flex-col items-center gap-6">
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Lowest Unit Price</p>
                                        <span className="text-9xl font-black italic tracking-tighter">${cheapest.price.toFixed(2)}</span>
                                        <Link href={`/shop/${cheapest.business_id}`} className="px-12 py-5 bg-black text-white font-black uppercase tracking-widest text-[11px] rounded-full hover:scale-105 active:scale-95 transition-all">Claim at Boutique</Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Comparative Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="col-span-full pb-6 border-b border-white/5 flex justify-between items-end px-4 font-black italic uppercase tracking-tight">
                                <span className="text-3xl">Comparison <span className="text-amber-400">Grid.</span></span>
                                <span className="text-[10px] text-white/30 tracking-[0.2em]">{results.length} Nodes Matched</span>
                            </div>

                            {results.map((product, idx) => (
                                <div key={product.id} className="group bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 space-y-8 hover:bg-white/[0.04] hover:border-amber-400/20 transition-all flex flex-col justify-between shadow-2xl relative overflow-hidden animate-in slide-in-from-right-8" style={{ animationDelay: `${idx * 50}ms` }}>
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="space-y-2">
                                            <h4 className="text-3xl font-black italic tracking-tighter uppercase leading-tight group-hover:text-amber-400 transition-colors">{product.name}</h4>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{product.businesses?.name}</p>
                                        </div>
                                        <div className="text-4xl font-black italic tracking-tighter opacity-90">${product.price.toFixed(2)}</div>
                                    </div>
                                    
                                    <div className="space-y-6 relative z-10">
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-white/20 uppercase tracking-widest italic group-hover:text-white/40 transition-colors">
                                            <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                                            <span>{product.businesses?.location || 'Local Oasis'}</span>
                                        </div>
                                        
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-amber-400 transition-all duration-1000" 
                                                style={{ width: `${(cheapest!.price / product.price) * 100}%` }}
                                            ></div>
                                        </div>
                                        
                                        <Link href={`/shop/${product.business_id}`} className="block w-full py-5 border border-white/5 rounded-2xl text-[10px] font-black text-center uppercase tracking-widest text-white/20 hover:text-white hover:bg-white/10 transition-all">View In Shop</Link>
                                    </div>
                                    
                                    {/* Delta Indicator */}
                                    <div className="absolute top-0 right-0 p-8">
                                        {idx === 0 ? (
                                            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 animate-pulse">Alpha Node</span>
                                        ) : (
                                            <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">+{(((product.price - cheapest!.price) / cheapest!.price) * 100).toFixed(0)}% Delta</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Empty State */}
                {!loading && results.length === 0 && query && (
                    <div className="py-48 text-center space-y-8 opacity-20 border-2 border-dashed border-white/5 rounded-[4rem]">
                        <span className="text-7xl">🔭</span>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter">No Frequency Matches.</h3>
                            <p className="font-medium text-lg italic max-w-sm mx-auto leading-relaxed">We couldn't synchronize prices for "{query}". Try scanning for common staples like "Coffee" or "Pizza".</p>
                        </div>
                    </div>
                )}
            </main>

            {/* Price Radar Footer */}
            <footer className="max-w-7xl mx-auto px-8 pt-48 border-t border-white/5 grid grid-cols-1 md:grid-cols-4 gap-24 opacity-30 hover:opacity-60 transition-opacity duration-1000">
                <div className="space-y-8">
                    <h2 className="text-5xl font-black italic tracking-tighter text-white uppercase">Compass.</h2>
                    <p className="text-base font-medium leading-relaxed italic">Hyper-local regional price discovery for unified settlements.</p>
                </div>
                <div className="space-y-6 col-span-2">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-amber-400 italic font-black">Regional Nodes</h4>
                    <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-tighter">
                        {neighborTowns.map(t => <span key={t.id}>{t.name} • {t.state}</span>)}
                    </div>
                </div>
                <div className="space-y-6">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">Intelligence</h4>
                    <ul className="space-y-3 text-sm font-bold uppercase tracking-tighter"><li>Price Ledgers</li><li>Stock Audits</li><li>Town Comparisons</li><li>Data API</li></ul>
                </div>
            </footer>
        </div>
    );
}
