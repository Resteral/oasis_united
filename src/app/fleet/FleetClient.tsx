"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OasisLogo from '@/components/OasisLogo';

export default function FleetClient() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [activeFleet, setActiveFleet] = useState<'marketing' | 'delivery' | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        details: '', // Shared for simplicity, label changes based on fleet
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login?redirect=/fleet');
            return;
        }

        try {
            const res = await fetch('/api/fleet/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    type: activeFleet === 'marketing' ? 'marketing_slot' : 'hourly_pay',
                    details: { registration_note: formData.details }
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');

            setStatus({ type: 'success', message: 'Uplink Established. Oasis HQ will contact you soon.' });
            setFormData({ fullName: '', email: '', phone: '', details: '' });
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message || 'Transmission Error.' });
        } finally {
            setLoading(false);
        }
    };

    if (activeFleet) {
        return (
            <div className="min-h-screen bg-[#050505] text-white py-32 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 z-0">
                    <div className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] opacity-20 animate-pulse ${activeFleet === 'marketing' ? 'bg-amber-400' : 'bg-indigo-600'}`}></div>
                </div>

                <div className="max-w-xl w-full mx-auto px-6 relative z-10 space-y-12">
                    <button onClick={() => { setActiveFleet(null); setStatus(null); }} className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-all">
                        <span className="group-hover:-translate-x-2 transition-transform">←</span> Return to Fleet Nexus
                    </button>

                    <header className="space-y-4">
                        <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none">
                            Join <br />
                            <span className={activeFleet === 'marketing' ? 'text-amber-400' : 'text-indigo-500'}>
                                {activeFleet === 'marketing' ? 'Marketing.' : 'Logistics.'}
                            </span>
                        </h2>
                        <p className="text-white/40 font-medium italic text-lg leading-relaxed">
                            {activeFleet === 'marketing' 
                                ? 'Authorize your recruitment to become a regional marketing specialist.' 
                                : 'Authorize your entry into the Oasis logistics and delivery network.'}
                        </p>
                    </header>

                    <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-3xl border border-white/10 p-12 rounded-[3.5rem] shadow-3xl space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 px-1">Full Citizen Name</label>
                                <input name="fullName" value={formData.fullName} onChange={handleInputChange} required className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold focus:border-white/30 outline-none" placeholder="First Last" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 px-1">Uplink Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold focus:border-white/30 outline-none" placeholder="name@domain.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 px-1">Uplink Phone</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-bold focus:border-white/30 outline-none" placeholder="555-000-0000" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 px-1">{activeFleet === 'marketing' ? 'Target Territories' : 'Availability / Vehicle'}</label>
                                <textarea name="details" value={formData.details} onChange={handleInputChange} required className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-medium focus:border-white/30 outline-none min-h-[120px]" placeholder={activeFleet === 'marketing' ? "Which towns or neighborhoods do you want to manage?" : "Working hours and vehicle details..."} />
                            </div>
                        </div>

                        {status && (
                            <div className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-center ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                                {status.message}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] transition-all shadow-2xl ${activeFleet === 'marketing' ? 'bg-amber-400 text-black hover:bg-amber-300' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'} disabled:opacity-50`}>
                            {loading ? 'Transmitting...' : 'Establish Uplink'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-amber-400 selection:text-black py-48 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
                <div className="absolute top-[10%] left-[-10%] w-[800px] h-[800px] bg-amber-400/10 rounded-full blur-[180px] animate-pulse"></div>
                <div className="absolute bottom-[10%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[180px] animate-pulse delay-1000"></div>
            </div>

            <main className="max-w-7xl mx-auto px-6 relative z-10 space-y-32">
                <header className="text-center space-y-8">
                   <div className="inline-block hover:scale-105 transition-transform">
                        <OasisLogo size="lg" />
                   </div>
                   <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 whitespace-nowrap">Choose Your Vector</span>
                        </div>
                        <h1 className="text-7xl md:text-[10rem] font-black italic tracking-tighter uppercase leading-[0.8] animate-in slide-in-from-bottom duration-1000">
                             Fleet <br />
                             <span className="text-white">Nexus.</span>
                        </h1>
                   </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-stretch">
                    {/* Marketing Expansion Fleet */}
                    <div 
                        onClick={() => setActiveFleet('marketing')}
                        className="group relative bg-white/[0.02] border border-white/5 rounded-[4rem] p-16 flex flex-col justify-between hover:border-amber-400/30 transition-all cursor-pointer overflow-hidden shadow-2xl hover:scale-[1.02] duration-500"
                    >
                        <div className="absolute top-0 right-0 p-16 opacity-[0.02] grayscale group-hover:opacity-10 transition-opacity">
                            <span className="text-[240px] font-black italic leading-none">📢</span>
                        </div>
                        <div className="relative z-10 space-y-12">
                            <div className="space-y-6">
                                <div className="inline-flex px-4 py-1 bg-amber-400 text-black rounded-full text-[9px] font-black uppercase tracking-widest">Growth Vector</div>
                                <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none">Marketing <br /><span className="text-amber-400">Specials.</span></h2>
                                <p className="text-white/40 font-medium text-xl italic max-w-sm leading-relaxed translate-y-2 group-hover:translate-y-0 transition-transform">
                                    Establish regional hubs, list independent boutiques, and control your own local markets.
                                </p>
                            </div>
                            <div className="space-y-4 pt-10 border-t border-white/5">
                                {['Commission on Partner Onboarding', 'Regional Settlement Sovereignty', 'Merchant Management Tools'].map((p, i) => (
                                    <div key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/60">
                                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span> {p}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="pt-16 relative z-10">
                            <div className="w-full py-6 bg-amber-400 text-black rounded-2xl font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3">
                                Join Marketing Fleet <span>→</span>
                            </div>
                        </div>
                    </div>

                    {/* Logistics Delivery Fleet */}
                    <div 
                        onClick={() => setActiveFleet('delivery')}
                        className="group relative bg-[#0a0a0b] border border-white/5 rounded-[4rem] p-16 flex flex-col justify-between hover:border-indigo-400/30 transition-all cursor-pointer overflow-hidden shadow-2xl hover:scale-[1.02] duration-500"
                    >
                        <div className="absolute top-0 right-0 p-16 opacity-[0.02] grayscale group-hover:opacity-10 transition-opacity">
                            <span className="text-[240px] font-black italic leading-none">🚐</span>
                        </div>
                        <div className="relative z-10 space-y-12">
                            <div className="space-y-6">
                                <div className="inline-flex px-4 py-1 bg-indigo-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest">Logistics Vector</div>
                                <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none">Delivery <br /><span className="text-indigo-500">Force.</span></h2>
                                <p className="text-white/40 font-medium text-xl italic max-w-sm leading-relaxed translate-y-2 group-hover:translate-y-0 transition-transform">
                                    High-fidelity local delivery with DoorDash Drive fallback for 100% route integrity.
                                </p>
                            </div>
                            <div className="space-y-4 pt-10 border-t border-white/5">
                                {['Stable Hourly Pay Options', 'P2P Logistics Independence', 'DoorDash Integration Overflow'].map((p, i) => (
                                    <div key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/60">
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> {p}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="pt-16 relative z-10">
                            <div className="w-full py-6 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3">
                                Join Delivery Force <span>→</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DoorDash Specific Highlight */}
                <section className="bg-white/5 border border-white/5 p-16 lg:p-24 rounded-[4rem] flex flex-col items-center text-center space-y-10 group">
                    <div className="w-24 h-24 bg-[#FF3008] rounded-3xl flex items-center justify-center text-5xl shadow-[0_0_50px_rgba(255,48,8,0.2)] group-hover:scale-110 transition-all">🏎️</div>
                    <div className="space-y-4">
                        <h3 className="text-4xl font-black italic tracking-tighter uppercase">Elastic <span className="text-[#FF3008]">DoorDash</span> Overflow.</h3>
                        <p className="max-w-2xl mx-auto text-lg text-white/40 font-medium italic">
                            Running at 100% capacity? Our DoorDash Drive integration kicks in automatically to ensure your town's commerce never stops. Available to all merchants and fleet partners.
                        </p>
                    </div>
                    <Link href="/manual" className="px-10 py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#FF3008] hover:text-white transition-all">
                        Review Logistics Manual
                    </Link>
                </section>
            </main>
        </div>
    );
}
