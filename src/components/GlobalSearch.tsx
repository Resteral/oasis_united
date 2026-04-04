"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any>({ products: [], businesses: [] });
    const [nearbyBusinesses, setNearbyBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isAiMode, setIsAiMode] = useState(false);
    const [userTown, setUserTown] = useState<string | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    // Initial load: Fetch user town and nearby businesses
    useEffect(() => {
        const fetchInitialDiscovery = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            let town = 'Effingham'; // Default fallback

            if (user) {
                const { data: profile } = await supabase.from('profiles').select('town').eq('id', user.id).single();
                if (profile?.town) {
                    town = profile.town;
                    setUserTown(town);
                }
            }

            // 📍 Coordinate-based Discovery (SerpApi)
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(`/api/places?query=shops&lat=${latitude}&lng=${longitude}`);
                    const data = await res.json();
                    if (data.results) {
                        const external = data.results.map((p: any) => ({
                            id: p.place_id,
                            name: p.name,
                            location: p.formatted_address,
                            category: 'Global Network',
                            isExternal: true,
                            rating: p.rating,
                            status: p.open_state
                        }));
                        setNearbyBusinesses(prev => [...prev, ...external].slice(0, 8));
                    }
                });
            }

            // Fetch internal businesses in the user's town
            const { data: nearby } = await supabase
                .from('businesses')
                .select('id, name, category, location, image_url')
                .ilike('location', `%${town}%`)
                .limit(4);

             setNearbyBusinesses(prev => [...(nearby || []), ...prev].slice(0, 8));
        };

        fetchInitialDiscovery();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [isZipSearch, setIsZipSearch] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim().length > 1) {
                setLoading(true);
                // Detect zip
                const isZip = /^\d{5}$/.test(query);
                setIsZipSearch(isZip);

                let res;
                if (isAiMode) {
                    res = await fetch('/api/search/v2', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query })
                    });
                } else {
                    res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                }
                const data = await res.json();

                let finalBusinesses = data.results?.businesses || [];
                let finalProducts = data.results?.products || [];

                if (data.success && isAiMode) {
                    finalProducts = data.results;
                    finalBusinesses = [];
                }

                if (finalBusinesses.length === 0 && !isAiMode) {
                    try {
                        const placesRes = await fetch(`/api/places?query=${encodeURIComponent(query)}`);
                        const placesData = await placesRes.json();
                        if (placesData.results && placesData.results.length > 0) {
                            finalBusinesses = placesData.results.map((p: any) => ({
                                id: p.place_id,
                                name: p.name,
                                location: p.formatted_address,
                                category: 'Global Discovery',
                                isExternal: true
                            }));
                        }
                    } catch (e) {
                        console.error("Places API Default Fallback Error", e);
                    }
                }

                setResults({ products: finalProducts, businesses: finalBusinesses });
                setIsOpen(true);
                setLoading(false);
            } else {
                setResults({ products: [], businesses: [] });
                setIsZipSearch(false);
                if (query.length === 0) setIsOpen(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query, isAiMode]);

    return (
        <div ref={searchRef} className="relative w-full max-w-2xl mx-auto z-[100] group/search">
            {/* The Discovery Command Pill */}
            <div className={`relative p-1.5 rounded-[3.5rem] border transition-all duration-700 ${isOpen ? 'bg-[#0d0d0f] border-amber-400 shadow-[0_0_80px_rgba(251,191,36,0.15)] scale-[1.02]' : 'bg-white/5 backdrop-blur-3xl border-white/5 shadow-2xl hover:bg-white/10'}`}>
                <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none gap-4">
                    <div className="relative">
                        <span className={`text-2xl transition-all duration-700 block ${loading || isAiMode ? 'animate-pulse scale-110' : 'grayscale group-hover/search:grayscale-0'}`}>
                           {isAiMode ? '🤖' : isZipSearch ? '📍' : loading ? '📡' : '🛰️'}
                        </span>
                        {loading && (
                            <div className="absolute inset-0 border-2 border-amber-400 rounded-full animate-ping opacity-20 scale-150"></div>
                        )}
                    </div>
                    {(isAiMode || isZipSearch) && (
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 animate-pulse">
                              {isAiMode ? 'AI Agent Active' : 'Zip Territory Locked'}
                           </span>
                        </div>
                    )}
                </div>

                <input
                    type="text"
                    placeholder={isAiMode ? "Ask Oasis Intelligence..." : `Discovery near ${userTown || 'you'}...`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    className="w-full bg-transparent text-white pl-28 pr-32 py-7 rounded-[3rem] text-lg font-bold tracking-tight outline-none placeholder:text-white/20 transition-all font-mono"
                />

                <div className="absolute inset-y-0 right-6 flex items-center gap-3">
                    <button
                        onClick={() => setIsAiMode(!isAiMode)}
                        className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border ${isAiMode
                            ? 'bg-amber-400 text-black border-amber-400 shadow-xl shadow-amber-400/20'
                            : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'
                        }`}
                    >
                        {isAiMode ? 'Neural Search' : 'Basic Radar'}
                    </button>
                    {query && (
                        <button onClick={() => setQuery('')} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                           ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Immersive Discovery Overlay */}
            {isOpen && (
                <div className="absolute top-full mt-8 w-full bg-[#0d0d0f]/95 backdrop-blur-3xl rounded-[4rem] shadow-[0_64px_128px_-24px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-12 duration-700">
                    <div className="max-h-[75vh] overflow-y-auto custom-scrollbar p-10 space-y-12">
                        
                        {/* Default Suggestions: Near You */}
                        {query.length < 2 && nearbyBusinesses.length > 0 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
                                <div className="flex justify-between items-center px-4">
                                    <h3 className="text-[11px] font-black text-amber-400 uppercase tracking-[0.4em]">Nearby Legends in {userTown || 'Oasis'}</h3>
                                    <div className="h-[1px] flex-1 mx-8 bg-white/5"></div>
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest animate-pulse">Live Radar</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {nearbyBusinesses.map((biz) => (
                                        <Link
                                            key={biz.id}
                                            href={`/shop/${biz.id}`}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-6 p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-amber-400/30 hover:bg-white/5 transition-all group"
                                        >
                                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl overflow-hidden shadow-2xl grayscale group-hover:grayscale-0 transition-all group-hover:scale-105">
                                                {biz.image_url ? <img src={biz.image_url} className="w-full h-full object-cover" /> : biz.name[0]}
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xl font-black italic tracking-tighter uppercase group-hover:text-amber-400 transition-colors truncate">{biz.name}</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{biz.category} • {biz.location}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Active Search Results: Businesses */}
                        {query.length >= 2 && results.businesses?.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] px-4">Boutique Match Detected</h3>
                                <div className="space-y-4">
                                    {results.businesses.map((biz: any) => (
                                        <Link
                                            key={biz.id}
                                            href={biz.isExternal ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(biz.name + ' ' + biz.location)}` : `/shop/${biz.id}`}
                                            target={biz.isExternal ? "_blank" : undefined}
                                            onClick={() => !biz.isExternal && setIsOpen(false)}
                                            className="flex justify-between items-center p-8 rounded-[3rem] bg-white/[0.03] border border-white/5 hover:border-amber-400/20 hover:bg-white/5 transition-all group"
                                        >
                                            <div className="flex items-center gap-8">
                                                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-4xl font-black italic text-amber-400 group-hover:rotate-6 transition-all shadow-2xl">
                                                    {biz.name[0]}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <h4 className="text-2xl font-black italic tracking-tighter uppercase group-hover:text-amber-400 transition-colors">{biz.name}</h4>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">{biz.category} • {biz.location}</p>
                                                </div>
                                            </div>
                                            {biz.isExternal && (
                                                <span className="px-5 py-2 bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20 space-x-2">
                                                   🌍 Global Discovery
                                                </span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Active Search Results: Products */}
                        {query.length >= 2 && results.products?.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em] px-4">Catalog Extraction</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {results.products.map((p: any) => (
                                        <Link
                                            key={p.id}
                                            href={`/shop/${p.business_id}?buy=${p.id}`}
                                            onClick={() => setIsOpen(false)}
                                            className="group flex gap-6 p-8 rounded-[3rem] bg-white/[0.03] border border-white/5 hover:border-amber-400/30 transition-all"
                                        >
                                            <div className="w-24 h-24 bg-black/40 rounded-[2rem] overflow-hidden grayscale group-hover:grayscale-0 transition-all group-hover:scale-105">
                                                {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full text-4xl opacity-10">📦</span>}
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between py-2">
                                                <div className="space-y-1">
                                                    <h4 className="text-xl font-black italic uppercase tracking-tighter leading-none group-hover:text-amber-400 transition-colors truncate">{p.name}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 italic">Available at {p.businesses?.name || 'Local Merchant'}</span>
                                                        <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{p.businesses?.location || 'Nearby'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <p className="text-2xl font-black italic tracking-tighter text-white">${Number(p.price).toFixed(2)}</p>
                                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 group-hover:text-amber-400 transition-colors">View Store →</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {query.length >= 2 && results.products.length === 0 && results.businesses.length === 0 && !loading && (
                            <div className="py-40 text-center space-y-8 opacity-40 italic font-black uppercase tracking-[0.4em]">
                                <span className="text-8xl">🏜️</span>
                                <p>Signal Lost. No discovery detected.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
