"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function GlobalNav() {
    const pathname = usePathname();
    const [role, setRole] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
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

        return () => subscription.unsubscribe();
    }, []);

    // The Cinematic Dock
    return (
        <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-3 py-3 bg-[#0c0c0e]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)] flex items-center gap-1.5 group/nav">
            <Link 
                href="/marketplace" 
                className={`flex items-center gap-3 px-6 py-3.5 rounded-3xl transition-all duration-500 hover:bg-white/5 active:scale-90 ${
                    pathname === '/marketplace' ? 'bg-white/10 text-white shadow-xl shadow-white/5' : 'text-white/40'
                }`}
            >
                <span className="text-xl">🧭</span>
                <span className={`text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${pathname === '/marketplace' ? 'w-auto opacity-100' : 'w-0 opacity-0 overflow-hidden group-hover/nav:w-auto group-hover/nav:opacity-100'}`}>Market</span>
            </Link>

            <Link 
                href="/hub" 
                className={`flex items-center gap-3 px-6 py-3.5 rounded-3xl transition-all duration-500 hover:bg-white/5 active:scale-90 ${
                    pathname === '/hub' ? 'bg-white/10 text-white shadow-xl shadow-white/5' : 'text-white/40'
                }`}
            >
                <span className="text-xl">🛰️</span>
                <span className={`text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${pathname === '/hub' ? 'w-auto opacity-100' : 'w-0 opacity-0 overflow-hidden group-hover/nav:w-auto group-hover/nav:opacity-100'}`}>Hub</span>
            </Link>

            {/* Role-Specific Portal */}
            {role === 'business' && (
                <Link 
                    href="/dashboard" 
                    className={`flex items-center gap-3 px-6 py-3.5 rounded-3xl transition-all duration-500 border border-transparent hover:bg-amber-400/5 active:scale-90 ${
                        pathname.startsWith('/dashboard') ? 'bg-amber-400/10 text-amber-400 border-amber-400/20 shadow-xl shadow-amber-400/10' : 'text-white/40'
                    }`}
                >
                    <span className="text-xl">🏪</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${pathname.startsWith('/dashboard') ? 'w-auto opacity-100' : 'w-0 opacity-0 overflow-hidden group-hover/nav:w-auto group-hover/nav:opacity-100'}`}>Merchant</span>
                </Link>
            )}

            {role === 'deliverer' && (
                <Link 
                    href="/deliverer/dashboard" 
                    className={`flex items-center gap-3 px-6 py-3.5 rounded-3xl transition-all duration-500 border border-transparent hover:bg-indigo-600/5 active:scale-90 ${
                        pathname.startsWith('/deliverer') ? 'bg-indigo-600/10 text-indigo-400 border-indigo-600/20 shadow-xl shadow-indigo-600/10' : 'text-white/40'
                    }`}
                >
                    <span className="text-xl">🚐</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${pathname.startsWith('/deliverer') ? 'w-auto opacity-100' : 'w-0 opacity-0 overflow-hidden group-hover/nav:w-auto group-hover/nav:opacity-100'}`}>Fleet</span>
                </Link>
            )}

            {!isAuthenticated && (
                <Link 
                    href="/login" 
                    className={`flex items-center gap-3 px-6 py-3.5 rounded-3xl transition-all duration-500 hover:bg-white/5 active:scale-90 ${
                        pathname === '/login' ? 'bg-white text-black' : 'text-white/40'
                    }`}
                >
                    <span className="text-xl">🔑</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${pathname === '/login' ? 'w-auto opacity-100' : 'w-0 opacity-0 overflow-hidden group-hover/nav:nav:w-auto group-hover/nav:opacity-100'}`}>Login</span>
                </Link>
            )}
        </nav>
    );
}
