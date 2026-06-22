"use client";
import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Cart from '@/components/Cart';
import ChatInterface from '@/components/ChatInterface';
import ReviewModal from '@/components/ReviewModal';
import BusinessFeed from '@/components/BusinessFeed';
import { Business } from '@/lib/types';
import AIPanel from '@/components/AIPanel';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

interface ShopClientProps {
    business: Business;
    products: any[];
    posts: any[];
}

export default function ShopClient(props: ShopClientProps) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-20 animate-pulse text-white/20 font-black uppercase tracking-[0.5em]">Synchronizing Inventory...</div>}>
            <ShopClientInner {...props} />
        </Suspense>
    );
}

function ShopClientInner({ business, products, posts }: ShopClientProps) {
    const searchParams = useSearchParams();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const theme = business.theme || { primaryColor: '#4F46E5', backgroundColor: '#0a0a0b' };
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const loadUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        };
        loadUser();
    }, []);

    useEffect(() => {
        const buyId = searchParams.get('buy');
        if (buyId && products.length > 0) {
            const product = products.find(p => p.id === buyId);
            if (product) {
                setCartItems(prev => {
                    if (prev.some(i => i.id === buyId)) return prev;
                    return [...prev, { id: product.id, name: product.name, price: Number(product.price), quantity: 1 }];
                });
            }
        }
    }, [searchParams, products]);

    useEffect(() => {
        const checkFollowStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('follows')
                .select('id')
                .eq('user_id', user.id)
                .eq('business_id', business.id)
                .single();

            if (data) setIsFollowing(true);
        };
        checkFollowStatus();
    }, [business.id]);

    const handleFollow = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('Please sign in to follow businesses!');
            return;
        }

        if (isFollowing) {
            await supabase
                .from('follows')
                .delete()
                .eq('user_id', user.id)
                .eq('business_id', business.id);
            setIsFollowing(false);
        } else {
            await supabase
                .from('follows')
                .insert({ user_id: user.id, business_id: business.id });
            setIsFollowing(true);
        }
    };

    const addToCart = (product: any) => {
        setCartItems(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) {
                return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { id: product.id, name: product.name, price: Number(product.price), quantity: 1 }];
        });
    };

    return (
        <div className={`min-h-screen text-white selection:bg-indigo-500 selection:text-white pb-32 ${theme.bgTheme === 'neon' ? 'neon-grid' : ''}`}>
            <style jsx global>{`
                :root {
                    --primary: ${theme.primaryColor || '#4F46E5'};
                }
                .btn-primary {
                    background-color: ${theme.primaryColor || '#4F46E5'} !important;
                    border-color: ${theme.primaryColor || '#4F46E5'} !important;
                    box-shadow: 0 10px 40px -10px ${theme.primaryColor || '#4F46E5'}44;
                }
                .text-primary {
                    color: ${theme.primaryColor || '#4F46E5'} !important;
                }
                body {
                    background-color: ${
                        theme.bgTheme === 'cozy' ? '#12100e' : 
                        theme.bgTheme === 'neon' ? '#020205' : '#0a0a0b'
                    } !important;
                    font-family: ${
                        theme.fontFamily === 'serif' ? 'Georgia, serif' :
                        theme.fontFamily === 'mono' ? 'monospace' : 'var(--font-outfit), sans-serif'
                    } !important;
                }
                .neon-grid {
                    background-image: linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px),
                                      linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px);
                    background-size: 50px 50px;
                }
            `}</style>

            {/* Immersive Cinematic Hero */}
            <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-white/5 bg-[#0c0c0e]">
                {/* Brand Identity Hue Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] opacity-20 blur-[120px] rounded-full pointer-events-none transition-all duration-1000" style={{ background: `radial-gradient(circle, ${theme.primaryColor} 0%, transparent 70%)` }}></div>
                <div className="absolute bottom-0 right-0 p-32 opacity-[0.03] select-none pointer-events-none group-hover:opacity-10 transition-all italic leading-none">
                     <span className="text-[240px] font-black italic tracking-tighter uppercase text-white">{business.name[0]}</span>
                </div>

                <div className="max-w-7xl mx-auto px-8 w-full relative z-10 text-center space-y-12">
                     <div className="space-y-4">
                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-700">
                             <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: theme.primaryColor }}></span>
                             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Verified Oasis Independent Node</span>
                        </div>
                        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.85] text-white animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            {business.name.split(' ').map((word, i) => (
                                <span key={i}>{i === 0 ? word : <><br /><span style={{ color: theme.primaryColor }}>{word}.</span></>}</span>
                            ))}
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg md:text-xl font-medium text-white/40 leading-relaxed italic animate-in fade-in slide-in-from-bottom-4 delay-500 duration-1000">{business.description || "Welcome to our regional discovery hub."}</p>
                        {business.integrations?.twilio?.phone && (
                            <div className="inline-flex items-center gap-4 px-6 py-4 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl max-w-md mx-auto text-left animate-in fade-in slide-in-from-bottom-4 delay-700 duration-1000">
                                <span className="text-2xl animate-pulse">💬</span>
                                <div>
                                    <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">Order via SMS Text</h4>
                                    <p className="text-[11px] font-black text-white mt-1">Text us directly at <span className="underline select-all text-white font-mono">{business.integrations.twilio.phone}</span> to place orders via AI Chat!</p>
                                </div>
                            </div>
                        )}
                     </div>

                     {/* Tactical Actions Matrix */}
                     <div className="flex flex-wrap items-center justify-center gap-6 animate-in fade-in zoom-in delay-700 duration-1000">
                        <button className="px-12 py-6 bg-white text-black rounded-3xl font-black text-xs uppercase tracking-[0.4em] hover:scale-105 transition-all shadow-2xl active:scale-95">Establish Order</button>
                        <button 
                            onClick={handleFollow}
                            className={`px-10 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] border transition-all ${isFollowing ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/10 text-white/60 hover:border-white/40'}`}
                        >
                            {isFollowing ? '✓ Synchronized' : '+ Sync Node'}
                        </button>
                        <button onClick={() => setIsMessageModalOpen(true)} className="px-10 py-6 bg-white/5 border border-white/10 rounded-3xl font-black text-xs uppercase tracking-[0.4em] text-white/60 hover:bg-white/10 transition-all">Direct Uplink</button>
                     </div>

                     {/* Interactive Seating Radar Peek */}
                     {(business.category === 'Restaurant' || business.category === 'Cafe') && (
                        <div className="mt-20 p-10 bg-black/20 border border-white/5 rounded-[4rem] backdrop-blur-3xl inline-block group hover:scale-[1.02] transition-all duration-700">
                            <div className="flex items-center gap-6 text-left">
                                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                                    <span className="text-2xl animate-pulse">🛰️</span>
                                </div>
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Tactical Seating Grid</h3>
                                    <p className="text-lg font-black italic text-white uppercase tracking-tighter leading-none mt-1">Live Occupancy Audit</p>
                                </div>
                            </div>
                        </div>
                     )}
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-8 py-32 space-y-32">
                {/* 1. Global Logistics & Map Integration */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="bg-white/[0.03] border border-white/5 rounded-[4rem] p-12 space-y-8 flex flex-col justify-between group hover:bg-white/[0.05] transition-all">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic italic">PHYSICAL CO-ORDINATES</p>
                            <h3 className="text-5xl font-black italic tracking-tighter uppercase text-white leading-none">Visit <br />Node.</h3>
                            <p className="text-xl font-medium text-white/60">{business.location || "Co-ordinates pending."}</p>
                        </div>
                        <div className="flex gap-4">
                             <button className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Navigate To Node</button>
                             <button className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all" onClick={() => setIsMessageModalOpen(true)}>Secure Channel</button>
                        </div>
                    </div>
                    
                    <div className="bg-white/[0.03] border border-white/5 rounded-[4rem] p-12 space-y-8 group hover:bg-white/[0.05] transition-all">
                         <div className="flex justify-between items-start">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">LOGISTICS STATUS</p>
                                <h3 className="text-5xl font-black italic tracking-tighter uppercase text-white leading-none">Regional <br />Transit.</h3>
                            </div>
                            <span className="text-4xl">🚚</span>
                         </div>
                         <div className="p-8 bg-black/20 border border-white/5 rounded-[2.5rem] items-center gap-6">
                            <p className="text-sm font-bold text-white/80 leading-relaxed italic">"Verified local delivery active across the Oasis regional matrix. Automated dispatch on settlement."</p>
                         </div>
                    </div>
                </section>

                {/* 2. THE BOUTIQUE MENU (Oasis Dark Item Cards) */}
                <section className="space-y-16">
                    <div className="flex justify-between items-end">
                        <div className="space-y-4">
                            <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none">Boutique <span style={{ color: theme.primaryColor }}>Inventory.</span></h2>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Autonomous asset drops for {business.name}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {products.length > 0 ? products.map((product) => (
                            <div key={product.id} className="group relative bg-white/[0.03] rounded-[3.5rem] overflow-hidden border border-white/5 hover:border-white/20 transition-all shadow-3xl hover:-translate-y-4 duration-700">
                                <div className="aspect-square overflow-hidden relative bg-zinc-900 flex items-center justify-center">
                                    {product.image_url ? (
                                        <img src={product.image_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" alt="" />
                                    ) : (
                                        <span className="text-[120px] font-black italic text-white/5 select-none">{product.name[0]}</span>
                                    )}
                                    <div className="absolute top-6 left-6">
                                        <div className="px-4 py-1.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-white/60">
                                            {product.stock > 0 ? 'Verified Stock' : 'Node Depleted'}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-10 space-y-6 relative">
                                    <div className="space-y-2">
                                        <h4 className="font-black italic text-3xl tracking-tighter uppercase truncate text-white leading-none">{product.name}</h4>
                                        <button
                                            onClick={() => { setSelectedProduct(product); setIsReviewModalOpen(true); }}
                                            className="text-[8px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 hover:opacity-100 opacity-60 transition-all"
                                        >
                                            ★ VIEW PEER REVIEWS
                                        </button>
                                    </div>
                                    <p className="text-sm font-medium text-white/40 line-clamp-2 h-10">{product.description}</p>
                                    <div className="flex items-center justify-between pt-8 border-t border-white/5">
                                        <div className="text-3xl font-black italic tracking-tighter" style={{ color: theme.primaryColor }}>${product.price}</div>
                                        {product.stock > 0 ? (
                                            <button
                                                className="px-8 py-3 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95"
                                                onClick={() => addToCart(product)}
                                            >
                                                Add to Cart
                                            </button>
                                        ) : (
                                            <span className="text-[10px] font-black uppercase text-white/20 italic">Awaiting Restock</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-20 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-[4rem]">
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">Node Inventory Currently Offline</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 3. BUSINESS UPDATES & FEED */}
                <section className="space-y-16">
                    <div className="space-y-4">
                         <h2 className="text-5xl font-black italic tracking-tighter uppercase text-white leading-none">Node <span className="text-white/20">Pulse.</span></h2>
                         <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Direct broadcast from the {business.name} command center</p>
                    </div>
                    
                    {posts && posts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {posts.map((post: any) => (
                                <div key={post.id} className="bg-white/[0.03] border border-white/5 p-10 rounded-[3rem] space-y-6 hover:bg-white/[0.05] transition-all">
                                    <div className="flex justify-between items-start">
                                        <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-[0.4em] text-white/40">
                                            {post.type}
                                        </span>
                                        <span className="text-[9px] font-black text-white/20 uppercase">
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-lg font-bold text-white/80 leading-relaxed italic">{post.content}</p>
                                    {post.event_date && (
                                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full">
                                            <span className="text-xs">📅</span>
                                            <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">{new Date(post.event_date).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-[4rem]">
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">Satellite Silent</p>
                        </div>
                    )}
                </section>
                
                <BusinessFeed businessId={business.id} />
            </main>

            <Cart businessId={business.id} items={cartItems} setItems={setCartItems} />

            {isMessageModalOpen && currentUser && (
                <ChatInterface
                    customerId={currentUser.id}
                    businessId={business.id}
                    senderId={currentUser.id}
                    businessName={business.name}
                    onClose={() => setIsMessageModalOpen(false)}
                />
            )}

            {selectedProduct && (
                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    businessId={business.id}
                    productId={selectedProduct.id}
                    productName={selectedProduct.name}
                    theme={theme}
                />
            )}

            <AIPanel
                businessId={business.id}
                businessName={business.name}
                primaryColor={theme.primaryColor}
                onOrderPlaced={() => {
                    window.location.reload();
                }}
            />
        </div>
    );
}
