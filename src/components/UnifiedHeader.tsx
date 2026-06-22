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
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        async function getRole() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setIsAuthenticated(true);
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                setRole(profile?.role || 'consumer');
            } else {
                setIsAuthenticated(false);
                setRole(null);
            }
        }
        getRole();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
            if (session?.user) {
                getRole();
            } else {
                setRole(null);
            }
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    return (
        <header className={`fixed top-0 left-0 right-0 z-[150] transition-all duration-500 ${
            scrolled ? 'bg-black/90 backdrop-blur-2xl py-3 border-b border-white/5' : 'bg-transparent py-6'
        }`}>
            <div className="max-w-7xl mx-auto px-6 md:px-10 flex justify-between items-center">
                <Link href="/" className="hover:scale-105 transition-transform flex items-center gap-2">
                    <OasisLogo size="sm" />
                </Link>

                {/* Center / Desktop Navigation Links (Only visible on md+ viewports) */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/marketplace" className={`text-[10px] font-black uppercase tracking-[0.2em] hover:text-indigo-400 transition-colors ${pathname === '/marketplace' ? 'text-indigo-400' : 'text-white/60'}`}>
                        Marketplace
                    </Link>
                    <Link href="/hub" className={`text-[10px] font-black uppercase tracking-[0.2em] hover:text-indigo-400 transition-colors ${pathname === '/hub' ? 'text-indigo-400' : 'text-white/60'}`}>
                        System Hub
                    </Link>
                    
                    {role === 'business' && (
                        <>
                            <Link href="/dashboard" className={`text-[10px] font-black uppercase tracking-[0.2em] hover:text-amber-400 transition-colors ${pathname === '/dashboard' ? 'text-amber-400' : 'text-white/60'}`}>
                                Merchant Ops
                            </Link>
                            <Link href="/dashboard/hardware" className={`text-[10px] font-black uppercase tracking-[0.2em] hover:text-amber-400 transition-colors ${pathname === '/dashboard/hardware' ? 'text-amber-400' : 'text-white/60'}`}>
                                ESP32 Link
                            </Link>
                        </>
                    )}

                    {role === 'deliverer' && (
                        <Link href="/deliverer/dashboard" className={`text-[10px] font-black uppercase tracking-[0.2em] hover:text-indigo-400 transition-colors ${pathname === '/deliverer/dashboard' ? 'text-indigo-400' : 'text-white/60'}`}>
                            Driver Fleet
                        </Link>
                    )}
                </nav>

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

                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <button onClick={handleLogout} className="px-6 py-2.5 bg-white/5 border border-white/10 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all hover:border-white/20">
                                Disconnect
                            </button>
                        ) : (
                            <Link href="/login" className="px-6 py-2.5 bg-white text-black rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl">
                                Uplink Portal
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
