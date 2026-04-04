"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function SellOnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<any>(null);

    // Form State
    const [storeName, setStoreName] = useState('');
    const [desc, setDesc] = useState('');
    const [category, setCategory] = useState('Personal Drop');
    const [location, setLocation] = useState('');

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setUserId(user.id);
                // Check if they already have a shop or their profile role
                supabase.from('profiles').select('*').eq('id', user.id).single()
                    .then(({ data }) => setUserProfile(data));
            } else {
                router.push('/login?next=/sell');
            }
        });
    }, [router]);

    const handleOnboard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;
        setLoading(true);

        const slug = storeName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');

        try {
            // 1. Create a "Micro-Boutique" for the user
            const { data: biz, error: bizError } = await supabase
                .from('businesses')
                .insert([{
                    owner_id: userId,
                    name: storeName,
                    slug,
                    category,
                    description: desc,
                    location,
                    store_features: { type: 'individual', is_p2p: true }
                }])
                .select()
                .single();

            if (bizError) throw bizError;

            // 2. Update user role to 'business' (or 'seller' if we allow mixed)
            await supabase.from('profiles').update({ role: 'business' }).eq('id', userId);

            router.push('/dashboard/inventory?tour=true');
        } catch (err: any) {
            alert('Error initiating seller protocol: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center p-6 selection:bg-amber-400 selection:text-black">
            <div className="max-w-2xl w-full space-y-12">
                <header className="text-center space-y-4">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-400/10 border border-amber-400/20 rounded-full">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400">P2P Marketplace Protocol</span>
                    </div>
                    <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none">Open Your <br /><span className="text-amber-400">Personal Boutique.</span></h1>
                    <p className="text-white/40 font-medium text-lg italic">Convert your surplus treasures into regional commerce. Start selling in the Oasis United network.</p>
                </header>

                <form onSubmit={handleOnboard} className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-12 space-y-10 shadow-3xl relative overflow-hidden backdrop-blur-3xl">
                    <div className="absolute top-0 right-0 p-12 opacity-5 grayscale pointer-events-none">
                        <span className="text-9xl italic font-black">💰</span>
                    </div>

                    <div className="space-y-8 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] pl-1">Boutique Name / Alias</label>
                            <input 
                                required
                                className="w-full bg-black/40 border border-white/10 p-6 rounded-3xl font-black italic text-xl focus:border-amber-400 outline-none transition-all"
                                placeholder="e.g. John's Thrift Corner"
                                value={storeName}
                                onChange={e => setStoreName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] pl-1">Your Pitch / Description</label>
                            <textarea 
                                required
                                className="w-full bg-black/40 border border-white/10 p-6 rounded-3xl font-medium italic text-lg focus:border-amber-400 outline-none transition-all h-32"
                                placeholder="What are you offering the community? (e.g. Vintage electronics, fresh eggs, home decor)"
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] pl-1">Category Type</label>
                                <select 
                                    className="w-full bg-black/40 border border-white/10 p-6 rounded-3xl font-black uppercase text-xs tracking-widest focus:border-amber-400 outline-none transition-all appearance-none cursor-pointer"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                >
                                    <option>Personal Drop</option>
                                    <option>Vintage & Thrift</option>
                                    <option>Handmade Art</option>
                                    <option>Local Produce</option>
                                    <option>Services & Labor</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] pl-1">Base Town / Area</label>
                                <input 
                                    required
                                    className="w-full bg-black/40 border border-white/10 p-6 rounded-3xl font-black uppercase text-xs tracking-widest focus:border-amber-400 outline-none transition-all"
                                    placeholder="e.g. Effingham Center"
                                    value={location}
                                    onChange={e => setLocation(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-8 bg-amber-400 text-black rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-amber-900/40"
                    >
                        {loading ? 'CALIBRATING SELL NODE...' : 'INHABIT THE MARKETPLACE'}
                    </button>
                </form>

                <footer className="text-center">
                    <Link href="/manual" className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors">Review the Citizen Seller Manual →</Link>
                </footer>
            </div>
        </div>
    );
}
