"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterBusinessClient() {
    const router = useRouter();
    const [towns, setTowns] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [townId, setTownId] = useState('');
    const [slug, setSlug] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#4F46E5');

    useEffect(() => {
        const fetchTowns = async () => {
            const { data } = await supabase.from('towns').select('*').order('name');
            if (data) setTowns(data);
        };
        fetchTowns();
    }, []);

    // Slug generation logic (simple but reactive)
    useEffect(() => {
        if (name) {
            const cleanSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            setSlug(cleanSlug);
        }
    }, [name]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!name || !category || !townId || !slug) {
            setError('Please fill in all mandatory fields.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/businesses/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    category,
                    description,
                    townId,
                    slug,
                    imageUrl,
                    theme: { primaryColor, backgroundColor: '#0a0a0b' }
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');

            router.push(`/dashboard`);
        } catch (err: any) {
            console.error('Registration failed:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-indigo-500 selection:text-white py-40 overflow-hidden relative">
            {/* Background Ambient Glows */}
            <div className="absolute top-0 left-0 w-[50vw] h-[50vw] bg-indigo-600/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[40vw] h-[40vw] bg-amber-400/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

            <main className="max-w-7xl mx-auto px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-32 items-start">
                
                {/* Left: Manifest / Brand Intro */}
                <div className="space-y-16 py-10">
                    <div className="space-y-6">
                        <Link href="/marketplace" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-indigo-400 transition-colors">
                            <span>← Back to Marketplace</span>
                        </Link>
                        <h1 className="text-[12rem] font-black italic tracking-tighter leading-[0.7] uppercase animate-in slide-in-from-left duration-700">Open <br /><span className="text-indigo-500">Shop.</span></h1>
                    </div>
                    
                    <div className="space-y-10 max-w-lg">
                        <section className="space-y-4">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Merchant Provisioning Manual</h3>
                            <p className="text-2xl font-medium text-white/50 leading-relaxed italic group hover:text-white transition-colors duration-500">
                                "Oasis United is the platform for the independent citizen. Provisioning a boutique means joining a regional discovery network of 28+ verified partners."
                            </p>
                        </section>
                        
                        <div className="pt-10 border-t border-white/5 space-y-6">
                            {[
                                { title: 'Seamless Settlement', desc: 'Secure, real-time payment protocol integration for every sale.' },
                                { title: 'Regional Discovery', desc: 'Auto-discovery in regional hubs across 8+ towns in New Hampshire.' },
                                { title: 'Fleet-Ready', desc: 'Direct connection to the Oasis Express delivery fleet.' }
                            ].map((feature, i) => (
                                <div key={i} className="flex gap-6 group/item">
                                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0 group-hover/item:border-indigo-400/50 transition-colors">⚡</div>
                                    <div className="space-y-1">
                                        <h4 className="font-black italic text-lg tracking-tighter uppercase">{feature.title}</h4>
                                        <p className="text-[11px] font-medium text-white/30 group-hover/item:text-white/60 transition-colors">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: The Provisioning Terminal (Form) */}
                <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-16 md:p-24 rounded-[5rem] shadow-3xl space-y-12 animate-in slide-in-from-bottom-12 duration-1000">
                    <header>
                        <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-2">The <span className="text-indigo-400">Terminal.</span></h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Citizen credentials verified &bull; Secure Uplink Active</p>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="space-y-8">
                            {/* Business Identity */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block px-1">Boutique Identity</label>
                                <input 
                                    type="text" 
                                    placeholder="Business Name" 
                                    className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl font-black italic text-2xl tracking-tighter placeholder:text-white/10 focus:border-indigo-400/50 transition-all outline-none"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                                <div className="flex bg-black/40 border border-white/5 p-4 rounded-2xl items-center gap-2 group">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20 px-2 shrink-0 italic">Slug:</span>
                                    <input 
                                        type="text" 
                                        className="bg-transparent w-full text-xs font-bold text-white/50 focus:text-white outline-none" 
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        required
                                    />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 group-hover:animate-pulse"> oasis.united/{slug}</span>
                                </div>
                            </div>

                            {/* Classification */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block px-1">Classification</label>
                                    <select 
                                        className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl font-black italic text-xl tracking-tighter outline-none focus:border-indigo-400/50 appearance-none transition-all cursor-pointer"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled className="bg-[#0a0a0b]">Select Category</option>
                                        <option value="Restaurant" className="bg-[#0a0a0b]">Restaurant</option>
                                        <option value="Grocery" className="bg-[#0a0a0b]">Grocery</option>
                                        <option value="Hardware" className="bg-[#0a0a0b]">Hardware</option>
                                        <option value="Retail" className="bg-[#0a0a0b]">Retail</option>
                                        <option value="Art & Decor" className="bg-[#0a0a0b]">Art & Decor</option>
                                        <option value="Outdoor" className="bg-[#0a0a0b]">Outdoor</option>
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block px-1">Regional Anchor</label>
                                    <select 
                                        className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl font-black italic text-xl tracking-tighter outline-none focus:border-indigo-400/50 appearance-none transition-all cursor-pointer"
                                        value={townId}
                                        onChange={(e) => setTownId(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled className="bg-[#0a0a0b]">Select Town</option>
                                        {towns.map(town => (
                                            <option key={town.id} value={town.id} className="bg-[#0a0a0b]">{town.name}, {town.state}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block px-1">Merchant Directive</label>
                                <textarea 
                                    placeholder="Briefly describe your boutique mission..." 
                                    className="w-full bg-white/5 border border-white/10 p-8 rounded-[2.5rem] font-medium text-lg tracking-tight placeholder:italic placeholder:text-white/10 focus:border-indigo-400/50 transition-all outline-none min-h-[160px]"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            {/* Visual Calibration (Theme) */}
                            <div className="space-y-6 pt-10 border-t border-white/5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block px-1">Visual Calibration</label>
                                <div className="flex items-center gap-8 bg-black/40 p-10 rounded-[3rem] border border-white/5">
                                    <div className="space-y-2 shrink-0">
                                        <div className="w-20 h-20 rounded-3xl overflow-hidden border border-white/10 p-1 bg-white/5">
                                            <input 
                                                type="color" 
                                                className="w-full h-full bg-transparent cursor-pointer scale-150 rotate-45"
                                                value={primaryColor}
                                                onInput={(e: any) => setPrimaryColor(e.target.value)}
                                            />
                                        </div>
                                        <p className="text-[8px] font-black text-center uppercase text-white/30">Primary</p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-black italic text-2xl tracking-tighter uppercase leading-none">The Preview.</h4>
                                        <p className="text-[10px] font-medium text-white/40 max-w-[200px]">Your Primary aesthetic color: <span className="text-white font-bold">{primaryColor.toUpperCase()}</span></p>
                                        <div className="flex gap-2">
                                           {['#4F46E5', '#F59E0B', '#10B981', '#EF4444', '#EC4899'].map(c => (
                                               <button key={c} type="button" onClick={() => setPrimaryColor(c)} className="w-6 h-6 rounded-full border border-white/10" style={{ backgroundColor: c }}></button>
                                           ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-500 text-[11px] font-black uppercase tracking-widest text-center animate-in shake-in">
                                🚨 Incident Detected: {error}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`group relative w-full py-8 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.5em] transition-all overflow-hidden ${
                                loading ? 'bg-indigo-600/50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 shadow-2xl shadow-indigo-500/20'
                            }`}
                        >
                            <span className="relative z-10 text-white italic">{loading ? 'Provisioning Uplink...' : 'Provision Secure Boutique'}</span>
                            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12"></div>
                        </button>
                    </form>
                    
                    <footer className="pt-10 text-center">
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10">Authorized Regional Access &bull; Oasis Unified v2.4.9</p>
                    </footer>
                </div>
            </main>
        </div>
    );
}
