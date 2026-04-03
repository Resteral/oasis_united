"use client";
import { Suspense } from 'react';
import GlobalSearch from '@/components/GlobalSearch';

export default function MarketplaceHero() {
    return (
        <div className="relative pt-32 pb-48 px-8 overflow-hidden oasis-gradient">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
            </div>
            <div className="absolute top-[20%] right-[-10%] w-[50%] h-[60%] bg-[hsl(var(--primary))/0.1] blur-[150px] rounded-full"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[50%] bg-[hsl(var(--secondary))/0.05] blur-[120px] rounded-full"></div>

            <div className="max-w-7xl mx-auto relative z-10 text-center space-y-16">
                
                {/* Brand Logo Display */}
                <div className="flex justify-center animate-in fade-in zoom-in duration-1000">
                    <div className="relative group p-8 bg-white/5 backdrop-blur-3xl rounded-[4rem] border border-white/10 shadow-3xl hover:scale-105 transition-all duration-700">
                         <img src="/logo.png" alt="Oasis United" className="w-48 h-48 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]" />
                         <div className="absolute -inset-4 bg-indigo-500/10 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-[hsl(var(--primary))/0.1] border border-[hsl(var(--primary))/0.2] rounded-full">
                        <span className="w-1.5 h-1.5 bg-[hsl(var(--primary))] rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[hsl(var(--primary))]">The Global Oasis</span>
                    </div>
                    <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter leading-none">
                        Discover <span className="text-[hsl(var(--primary))]">Everything.</span>
                    </h1>
                    <p className="max-w-xl mx-auto text-[hsl(var(--muted-foreground))] font-medium text-lg leading-relaxed">
                        Boutiques, treasures, and experiences from the world's most premium independent ecosystem.
                    </p>
                </div>

                <Suspense fallback={<div className="h-16 w-full max-w-2xl mx-auto bg-white/5 animate-pulse rounded-full"></div>}>
                    <div className="max-w-xl mx-auto glass p-1 rounded-[3rem] shadow-2xl shadow-primary/10">
                        <GlobalSearch />
                    </div>
                </Suspense>

                <div className="flex justify-center gap-8 pt-8 opacity-40">
                    {['Boutiques', 'Artisans', 'Designers', 'Gourmet'].map((tag) => (
                        <span key={tag} className="text-[10px] font-black uppercase tracking-widest">{tag}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
