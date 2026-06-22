"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import OasisLogo from './OasisLogo';

export default function UnifiedHeader() {
    const pathname = usePathname();
    const [role, setRole] = useState<string | null>(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        async function getRole() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                setRole(profile?.role || 'consumer');
            }
        }
        getRole();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Hide header on landing page sections if needed, or keep it consistent
    const isLanding = pathname === '/';

    return (
        <header className={`fixed top-0 left-0 right-0 z-[150] transition-all duration-500 ${
            scrolled ? 'bg-black/80 backdrop-blur-2xl py-3 border-b border-white/5' : 'bg-transparent py-6'
        }`}>
            <div className="max-w-7xl mx-auto px-6 md:px-10 flex justify-between items-center">
                <Link href="/" className="hover:scale-105 transition-transform">
                    <OasisLogo size="sm" />
                </Link>

                <div className="flex items-center gap-6">
                    {/* Status Signal Node */}
                    <div className="hidden lg:flex items-center gap-4 px-5 py-2 bg-white/[0.03] border border-white/5 rounded-full backdrop-blur-3xl">
                        <span className={`w-1.5 h-1.5 rounded-full animate-ping ${
                            role === 'business' ? 'bg-amber-400' : role === 'deliverer' ? 'bg-indigo-500' : role === 'consumer' ? 'bg-emerald-500' : 'bg-white/20'
                        }`}></span>
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 italic">
                            {role === 'business' ? 'Merchant Link: Active' : role === 'deliverer' ? 'Fleet Node: Sync' : role === 'consumer' ? 'Citizen Link: Verified' : 'Portal Standby'}
                        </span>
                    </div>

                    <nav className="flex items-center gap-3">
                        {role === 'business' && (
                            <Link href="/dashboard" className="px-6 py-2.5 bg-amber-400 text-black rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-amber-400/20">
                                Global Ops
                            </Link>
                        )}
                        {role === 'deliverer' && (
                            <Link href="/deliverer/dashboard" className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-600/20">
                                Fleet Command
                            </Link>
                        )}
                        {!role && (
                            <Link href="/login" className="px-6 py-2.5 bg-white text-black rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl">
                                Uplink Portal
                            </Link>
                        )}
                        <Link href="/hub" className="p-2.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group" title="System Hub">
                           <span className="text-sm group-hover:scale-125 block transition-transform">🛰️</span>
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}
