"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { supabase } from '@/lib/supabase';
import { GooglePlace } from '@/lib/types';
import OasisCompass from '@/components/OasisCompass';
import OasisLogo from '@/components/OasisLogo';

interface HomeClientProps {
  initialBusinesses: any[];
}

export default function HomeClient({ initialBusinesses }: HomeClientProps) {
  const [internalBusinesses, setInternalBusinesses] = useState<any[]>(initialBusinesses);
  const [externalPlaces, setExternalPlaces] = useState<GooglePlace[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white selection:bg-amber-400 selection:text-black">
      {/* Dynamic Navigation Bar */}
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-black/80 backdrop-blur-2xl py-4 border-b border-white/5' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-10 flex justify-between items-center">
          <Link href="/" className="group no-underline">
            <OasisLogo size="md" />
          </Link>
          
          <nav className="hidden md:flex items-center gap-10">
            <Link href="/marketplace" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors">Marketplace</Link>
            <Link href="/sell" className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400 group flex items-center gap-2">
               Sell <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link href="/hub" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors">Discovery Hub</Link>
            <Link href="/dashboard" className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all">Merchant Portal</Link>
            <Link href="/login" className="px-8 py-3 bg-amber-400 text-black rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl shadow-amber-400/20">Secure Login</Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Cinematic Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 z-0">
             <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-[120px] animate-pulse"></div>
             <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse delay-700"></div>
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-10 text-center space-y-12">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-400/10 border border-amber-400/20 rounded-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400">Neighborhood Commerce Protocol 1.0</span>
            </div>

            <h1 className="text-7xl md:text-[10rem] font-black italic tracking-tighter uppercase leading-[0.85] animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
              Your Town. <br />
              <span className="text-amber-400">Unified.</span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-2xl font-medium text-white/50 leading-relaxed italic animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
              The premier independent discovery engine for localized boutiques, logistics, and neighborhood infrastructure.
            </p>

            <div className="max-w-4xl mx-auto pt-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700">
                <OasisCompass />
              <div className="mt-20 flex flex-wrap justify-center gap-8 relative z-20">
                <Link href="/marketplace" className="px-12 py-6 bg-white text-black rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all shadow-2xl hover:scale-105 active:scale-95 duration-300">
                  Enter The Oasis →
                </Link>
                <Link href="/deliverer/dashboard" className="px-12 py-6 bg-white/5 border border-white/10 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                  Join Driver Fleet 🚐
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Intelligence & Logistics Banner */}
        <section className="bg-white/5 border-y border-white/5 py-32 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
            {[
              { icon: '🗺️', title: 'Route Integrity', desc: 'Real-time logistical tracking for deliverers and local citizens.' },
              { icon: '💎', title: 'Verified Partners', desc: 'Every shop is manually onboarded and verified by our regional scouts.' },
              { icon: '🛰️', title: 'Discovery Hub', desc: 'Active routes and live town availability updated by the minute.' }
            ].map(item => (
              <div key={item.title} className="space-y-6 group">
                <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-2xl border border-white/5 group-hover:border-amber-400/20">{item.icon}</div>
                <h3 className="text-2xl font-black italic tracking-tight uppercase group-hover:text-amber-400 transition-colors">{item.title}</h3>
                <p className="text-white/40 font-medium leading-relaxed italic">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Dynamic Discovery Section */}
        <section className="py-48 max-w-7xl mx-auto px-10 space-y-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-4">
              <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">Oasis <br /><span className="text-amber-400">Headliners.</span></h2>
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Premium Sourced Boutiques & Merchants</p>
            </div>
            <Link href="/marketplace" className="text-[11px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors pb-2 border-b border-white/10">Browse Full Catalog →</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {internalBusinesses.map((biz) => (
              <Link key={biz.id} href={`/shop/${biz.id}`} className="group relative bg-[#111113] rounded-[4rem] p-12 border border-white/5 hover:border-amber-400/20 transition-all h-[420px] flex flex-col justify-end overflow-hidden shadow-3xl hover:scale-105 duration-500">
                <div className="absolute top-12 left-12 w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-4xl grayscale group-hover:grayscale-0 transition-all font-black italic text-amber-400 border border-white/10 shadow-2xl">
                  {biz.name[0]}
                </div>
                <div className="space-y-4 relative z-10">
                  <div className="inline-flex px-3 py-1 bg-amber-400 text-black rounded-full text-[8px] font-black uppercase tracking-widest">Partner</div>
                  <h3 className="text-3xl font-black italic tracking-tighter group-hover:text-amber-400 transition-colors truncate">{biz.name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{biz.category} • {biz.location || 'Local'}</p>
                </div>
                {/* Visual Glow */}
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-amber-400/5 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-48 bg-[#050505] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 md:grid-cols-4 gap-24">
          <div className="space-y-12 md:col-span-2">
            <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none">The <br /><span className="text-amber-400">Oasis.</span></h2>
            <p className="max-w-sm text-lg font-medium text-white/30 italic leading-relaxed">Scaling decentralized commerce through neighborhood intelligence and logistical unity.</p>
            <div className="pt-8">
              <Link href="/register-business" className="inline-block px-12 py-5 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all">List Your Boutique</Link>
            </div>
          </div>
          
          <div className="space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400">Operational</h4>
            <ul className="space-y-4 text-xs font-black uppercase tracking-widest text-white/40 italic">
              <li><Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
              <li><Link href="/hub" className="hover:text-white transition-colors">Discovery Hub</Link></li>
              <li><Link href="/deliverer/dashboard" className="hover:text-white transition-colors">Driver Node</Link></li>
              <li><Link href="/manual" className="hover:text-white transition-colors">Field Manual</Link></li>
            </ul>
          </div>

          <div className="space-y-8">
             <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400">Communication</h4>
             <p className="text-xs font-black uppercase tracking-widest text-white/40 italic">508.507.0305</p>
             <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mt-4 leading-loose">
               &copy; 2026 Oasis United Network. <br />
               Refined independent commerce.
             </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
      `}</style>
    </div>
  );
}
