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

            <div className="max-w-7xl mx-auto relative z-10 text-center space-y-12">
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
