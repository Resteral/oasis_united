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

    const [hasBusiness, setHasBusiness] = useState<boolean | null>(null);
    const [step, setStep] = useState(1);

    useEffect(() => {
        const checkExisting = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('businesses').select('id').eq('owner_id', user.id).single();
                if (data) setHasBusiness(true);
                else setHasBusiness(false);
            } else {
                setHasBusiness(false);
            }
        };
        checkExisting();

        const fetchTowns = async () => {
            const { data } = await supabase.from('towns').select('*').order('name');
            if (data) setTowns(data);
        };
        fetchTowns();
    }, []);

    useEffect(() => {
        if (name) {
            const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            // Append a short random suffix to ensure uniqueness in the global discovery matrix
            const uniqueSuffix = Math.random().toString(36).substring(2, 6);
            setSlug(`${baseSlug}-${uniqueSuffix}`);
        }
    }, [name]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');

        if (!name || !category || !townId || !slug) {
            setError('Registry Protocol Error: All mandatory fields (Identity, Classification, and Hub) must be established.');
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
            if (!res.ok) throw new Error(data.error || 'Uplink synchronization failed');

            // Success: Push to dashboard with identity confirmed pulse
            router.push(`/dashboard?provisioned=true`);
        } catch (err: any) {
            console.error('Registry Failure:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        setError('');
        if (step === 1 && (!name || !category)) {
            setError('Please define your Identity and Classification before proceeding.');
            return;
        }
        if (step === 2 && !townId) {
            setError('A Regional Hub must be selected to anchor your node.');
            return;
        }
        setStep(prev => Math.min(prev + 1, 3));
    };

    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-indigo-500 selection:text-white py-40 overflow-hidden relative">
            {/* Background Ambient Glows */}
            <div className="absolute top-0 left-0 w-[50vw] h-[50vw] bg-indigo-600/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[40vw] h-[40vw] bg-amber-400/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

            <main className="max-w-7xl mx-auto px-8 relative z-10 lg:px-20">
                <div className="max-w-3xl space-y-16 py-10">
                    <div className="space-y-8">
                        <Link href="/marketplace" className="inline-flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-indigo-400 transition-colors">
                            <span>← Abort to Discovery Hub</span>
                        </Link>
                        <h1 className="text-7xl md:text-[10rem] font-black italic tracking-tighter leading-[0.8] uppercase animate-in slide-in-from-left duration-700">Open <br /><span className="text-indigo-500">Node.</span></h1>
                    </div>

                    {/* Step Progress Bar */}
                    <div className="flex items-center gap-6 max-w-md">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex-1 h-1.5 rounded-full bg-white/5 relative overflow-hidden">
                                <div className={`absolute inset-0 bg-indigo-500 transition-all duration-700 ${step >= s ? 'translate-x-0' : '-translate-x-full'}`}></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start pt-10">
                    {/* Instructions Side (Contextual to Step) */}
                    <div className="lg:col-span-5 space-y-12 py-10 hidden lg:block">
                        {step === 1 && (
                            <section className="space-y-6 animate-in slide-in-from-left duration-500">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Phase 01: Identity</h3>
                                <p className="text-3xl font-medium text-white/50 leading-relaxed italic">
                                    Define the core signature of your boutique. This is how the Oasis citizens will identify your presence in the global discovery compass.
                                </p>
                            </section>
                        )}
                        {step === 2 && (
                            <section className="space-y-6 animate-in slide-in-from-left duration-500">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Phase 02: Logistics</h3>
                                <p className="text-3xl font-medium text-white/50 leading-relaxed italic">
                                    Anchor your presence to a physical regional hub. This determines your primary delivery fleet coverage and municipal discovery ranking.
                                </p>
                            </section>
                        )}
                        {step === 3 && (
                            <section className="space-y-6 animate-in slide-in-from-left duration-500">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Phase 03: Aesthetic</h3>
                                <p className="text-3xl font-medium text-white/50 leading-relaxed italic">
                                    Calibrate your visual signal. Your chosen directive and color palette will theme your autonomous shop front on the network.
                                </p>
                            </section>
                        )}
                    </div>

                    {/* The Provisioning Terminal (Form) */}
                    <div className="lg:col-span-7 bg-white/[0.02] backdrop-blur-3xl border border-white/10 p-12 md:p-20 rounded-[4rem] shadow-3xl space-y-12">
                        <header className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">The <span className="text-indigo-400">Terminal.</span></h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Phase 0{step} &bull; Uplink Secure</p>
                            </div>
                            {hasBusiness && (
                                <div className="flex items-center gap-4">
                                     <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black uppercase tracking-widest text-emerald-400 animate-in fade-in duration-1000">
                                         <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></span>
                                         Boutique Active
                                     </div>
                                     <Link href="/dashboard" className="px-5 py-2 bg-white text-black rounded-full text-[8px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                                         Resume Ops →
                                     </Link>
                                </div>
                            )}
                        </header>

                        <form onSubmit={(e) => { e.preventDefault(); if(step < 3) nextStep(); else handleSubmit(e); }} className="space-y-12">
                            {step === 1 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
                                    <div className="space-y-4">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-indigo-400 block px-1">Boutique Identity</label>
                                        <input 
                                            type="text" 
                                            placeholder="Business Name" 
                                            className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl font-black italic text-4xl tracking-tighter placeholder:text-white/5 focus:border-indigo-400/50 transition-all outline-none"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-indigo-400 block px-1">Classification</label>
                                        <div className="relative">
                                            <select 
                                                className="w-full bg-white/5 border border-white/10 p-8 rounded-3xl font-black italic text-xl tracking-tighter outline-none focus:border-indigo-400/50 appearance-none transition-all cursor-pointer"
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                            >
                                                <option value="" disabled className="bg-[#0a0a0b]">Select Category</option>
                                                <option value="Restaurant" className="bg-[#0a0a0b]">Restaurant</option>
                                                <option value="Grocery" className="bg-[#0a0a0b]">Grocery</option>
                                                <option value="Hardware" className="bg-[#0a0a0b]">Hardware</option>
                                                <option value="Retail" className="bg-[#0a0a0b]">Retail</option>
                                            </select>
                                            <div className="absolute right-8 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none">▼</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
                                    <div className="space-y-4">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-indigo-400 block px-1">Regional Anchor Token</label>
                                        <div className="relative">
                                            <select 
                                                className="w-full bg-white/5 border border-white/10 p-8 rounded-3xl font-black italic text-xl tracking-tighter outline-none focus:border-indigo-400/50 appearance-none transition-all cursor-pointer"
                                                value={townId}
                                                onChange={(e) => setTownId(e.target.value)}
                                            >
                                                <option value="" disabled className="bg-[#0a0a0b]">Select Regional Hub</option>
                                                {towns.map(town => (
                                                    <option key={town.id} value={town.id} className="bg-[#0a0a0b]">{town.name}, {town.state}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-8 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none">🗺️</div>
                                        </div>
                                    </div>
                                    <div className="p-8 bg-indigo-600/5 border border-indigo-500/10 rounded-3xl space-y-2">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-indigo-400">Discovery Slug (Persistent)</p>
                                        <p className="text-xl font-black italic text-white flex gap-2">oasis.united/<span className="text-indigo-400">{slug || '...'}</span></p>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
                                    <div className="space-y-4">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-indigo-400 block px-1">Merchant Directive</label>
                                        <textarea 
                                            placeholder="The mission statement for your autonomous node..." 
                                            className="w-full bg-white/5 border border-white/10 p-8 rounded-[2.5rem] font-medium text-lg tracking-tight focus:border-indigo-400/50 transition-all outline-none min-h-[160px]"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-indigo-400 block px-1">Visual Signal Strength</label>
                                        <div className="flex items-center gap-6 bg-black/40 p-8 rounded-3xl border border-white/5">
                                            <input 
                                                type="color" 
                                                className="w-16 h-16 bg-transparent cursor-pointer rounded-2xl overflow-hidden scale-150"
                                                value={primaryColor}
                                                onInput={(e: any) => setPrimaryColor(e.target.value)}
                                            />
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black italic uppercase text-white tracking-widest leading-none">Aesthetic Calibration</p>
                                                <p className="text-[8px] font-bold text-white/30 tracking-tight uppercase">Current Hue: {primaryColor}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-500 text-[9px] font-black uppercase tracking-widest text-center animate-pulse">
                                    Registry Interaction Failed: {error}
                                </div>
                            )}

                            <div className="flex gap-4">
                                {step > 1 && (
                                    <button 
                                        type="button" 
                                        onClick={prevStep}
                                        className="px-10 py-6 bg-white/5 border border-white/10 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:text-white transition-all"
                                    >
                                        Return
                                    </button>
                                )}
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className={`group relative flex-1 py-6 rounded-3xl font-black text-[10px] uppercase tracking-[0.5em] transition-all overflow-hidden ${
                                        loading ? 'bg-indigo-600/50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'
                                    }`}
                                >
                                    <span className="relative z-10 text-white italic">
                                        {loading ? 'Transmitting Data...' : (step < 3 ? 'Target Next Phase' : 'Provision Final Uplink')}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
