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
  const [scrolled, setScrolled] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const flowSteps = [
    {
      title: "1. Onboard a Merchant",
      desc: "Fleet scouts find local business partners and sign them up on the Oasis portal in 2 minutes. They help configure the digital storefront.",
      badge: "Fleet Scout Action",
      icon: "🏪"
    },
    {
      title: "2. Program the Hardware Chip",
      desc: "Admin (Sean) securely programs the dedicated ESP32-S Order Terminal chip with the shop's credentials and API tokens directly over serial.",
      badge: "Admin Operational Step",
      icon: "🔌"
    },
    {
      title: "3. Connect & Alert",
      desc: "The Fleet delivers the pre-programmed chip to the merchant. Plugged into USB, the chip instantly triggers audio chimes when new customer orders are placed!",
      badge: "Plug & Play Live",
      icon: "🔔"
    }
  ];

  return (
    <div className="min-h-screen bg-[#060608] text-white selection:bg-amber-400 selection:text-black font-sans">
      
      {/* Navigation Header */}
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-black/90 backdrop-blur-2xl py-4 border-b border-white/5' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex justify-between items-center">
          <Link href="/" className="group no-underline">
            <OasisLogo size="md" />
          </Link>
          
          <nav className="hidden md:flex items-center gap-10">
            <Link href="/marketplace" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors">Marketplace</Link>
            <Link href="/fleet" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors">Join Fleet</Link>
            <Link href="/register-business" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors">Onboard Shop</Link>
            <Link href="/dashboard" className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all">Merchant Portal</Link>
            <Link href="/login" className="px-8 py-3 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl shadow-indigo-600/20">Secure Login</Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden">
          {/* Neon Radial Glows */}
          <div className="absolute inset-0 z-0">
             <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse"></div>
             <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-amber-400/10 rounded-full blur-[150px] animate-pulse delay-700"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 text-center space-y-16">
            <div className="space-y-6">
                <div className="inline-flex items-center gap-3 px-6 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-ping"></span>
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-300">Neighborhood Commerce Network</span>
                </div>
                <h1 className="text-6xl md:text-[8rem] lg:text-[10rem] font-black italic tracking-tighter uppercase leading-[0.85] text-white">
                  The <span className="text-indigo-500">Oasis.</span>
                </h1>
                <p className="max-w-3xl mx-auto text-lg md:text-2xl font-medium text-white/40 leading-relaxed italic">
                  Bridging local customers, independent storefronts, and automated order-alert hardware terminals.
                </p>
            </div>

            {/* Direct Vector Entry Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-10">
                {/* Vector 1: Direct Customer */}
                <Link href="/marketplace" className="group bg-white/[0.02] border border-white/5 p-12 rounded-[4rem] hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all hover:scale-[1.03] duration-500 flex flex-col justify-between text-left shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 text-[120px] opacity-[0.02] grayscale group-hover:opacity-5 transition-opacity">🛍️</div>
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-indigo-600/10 rounded-3xl border border-indigo-500/20 flex items-center justify-center text-3xl">🛍️</div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter">Shop Local</h3>
                            <p className="text-white/40 font-medium italic text-sm">Sign up as a direct customer to browse independent boutiques, place online orders, or text-to-order with our unified AI chatbot.</p>
                        </div>
                    </div>
                    <div className="mt-12 text-[10px] font-black uppercase tracking-widest text-indigo-400 group-hover:translate-x-2 transition-transform flex items-center gap-2">
                        Browse Marketplace <span>→</span>
                    </div>
                </Link>

                {/* Vector 2: Join the Fleet */}
                <Link href="/fleet" className="group bg-white/[0.02] border border-white/5 p-12 rounded-[4rem] hover:bg-white/[0.04] hover:border-amber-400/30 transition-all hover:scale-[1.03] duration-500 flex flex-col justify-between text-left shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 text-[120px] opacity-[0.02] grayscale group-hover:opacity-5 transition-opacity">🚐</div>
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-amber-400/10 rounded-3xl border border-amber-400/20 flex items-center justify-center text-3xl">🚐</div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter">Join the Fleet</h3>
                            <p className="text-white/40 font-medium italic text-sm">Become a local distributor. Onboard independent businesses onto the network, distribute custom ESP32 order terminal chips, and earn logistics commissions.</p>
                        </div>
                    </div>
                    <div className="mt-12 text-[10px] font-black uppercase tracking-widest text-amber-400 group-hover:translate-x-2 transition-transform flex items-center gap-2">
                        Join Fleet Nexus <span>→</span>
                    </div>
                </Link>
            </div>

            <div className="pt-10">
                 <OasisCompass />
            </div>
          </div>
        </section>

        {/* Tactical Fleet & Chip Onboarding Process */}
        <section className="bg-white/[0.01] border-y border-white/5 py-40 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-10 space-y-20">
            <div className="text-center space-y-4">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Integrated Logistics Cycle</span>
              <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">How it <span className="text-indigo-500">Works.</span></h2>
              <p className="max-w-xl mx-auto text-white/40 text-sm font-medium italic">We bridge web-based checkout channels with physical hardware alerts. Here is the step-by-step merchant deployment process:</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-10">
              {flowSteps.map((step, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`p-10 rounded-[3rem] border transition-all cursor-pointer flex flex-col justify-between h-[360px] relative overflow-hidden ${
                    activeStep === idx 
                      ? 'bg-indigo-600/10 border-indigo-500/30 shadow-[0_32px_128px_rgba(79,70,229,0.15)] scale-[1.02]' 
                      : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 border border-white/10 rounded-full text-indigo-400">{step.badge}</span>
                      <span className="text-3xl">{step.icon}</span>
                    </div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">{step.title}</h3>
                    <p className="text-white/40 text-sm font-medium leading-relaxed italic">{step.desc}</p>
                  </div>
                  
                  {/* Step Indicators */}
                  <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full ${i === idx ? 'bg-indigo-500' : 'bg-white/10'}`}></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Simplified Storefront Customizer Feature Callout */}
        <section className="py-48 max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 space-y-10 text-left">
            <div className="space-y-4">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Ease of Customization</span>
              <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.85] text-white">Merchant <br />Self-Branding.</h2>
              <p className="text-white/40 font-medium text-lg leading-relaxed italic">Once registered, merchants gain full access to the simplified customization console. Design a beautiful, premium store interface instantly without any coding knowledge.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
              <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl space-y-3">
                <span className="text-3xl">🎨</span>
                <h4 className="text-lg font-black uppercase tracking-tight text-white">Branding Colors</h4>
                <p className="text-xs text-white/30 font-medium italic">Apply custom accent hues with one-click color selectors to colorize links, buttons, and navigation elements.</p>
              </div>

              <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl space-y-3">
                <span className="text-3xl">🌌</span>
                <h4 className="text-lg font-black uppercase tracking-tight text-white">Layout Styling</h4>
                <p className="text-xs text-white/30 font-medium italic">Switch between gorgeous aesthetic backgrounds like Cozy Minimalist, Neon Grid, or Dark Void.</p>
              </div>

              <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl space-y-3">
                <span className="text-3xl">💬</span>
                <h4 className="text-lg font-black uppercase tracking-tight text-white">Direct SMS Ordering</h4>
                <p className="text-xs text-white/30 font-medium italic">Register a dedicated Twilio SMS phone number on your dashboard. AI takes care of products, orders, and checkout via text.</p>
              </div>

              <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl space-y-3">
                <span className="text-3xl">🔤</span>
                <h4 className="text-lg font-black uppercase tracking-tight text-white">Curated Typography</h4>
                <p className="text-xs text-white/30 font-medium italic">Choose between clean monospace, elegant serifs, or modern sans fonts (Outfit, Playfair, Geist Mono) in one click.</p>
              </div>
            </div>

            <div className="pt-6">
              <Link href="/register-business" className="inline-block px-12 py-5 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all hover:scale-105 shadow-2xl">Onboard Your Store Now</Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 p-12 rounded-[4rem] shadow-3xl text-left space-y-8 relative overflow-hidden group h-[600px] flex flex-col justify-between">
            <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px]"></div>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 rounded-full border border-indigo-500/30">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.20em] text-indigo-300">Live Hardware Simulator</span>
              </div>
              <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Oasis Order Terminal</h3>
              <p className="text-white/40 text-sm font-medium leading-relaxed italic">
                Sean programs the chip, you plug it in. Real-time REST endpoints trigger instant device polling for items, sales, and fulfillment.
              </p>
            </div>

            <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 font-mono text-xs text-indigo-300 space-y-2 select-none shadow-2xl">
              <p className="text-white/20">// ESP32 REST Uplink Console</p>
              <p className="text-indigo-400">&gt; GET /api/esp32?action=get-orders ...</p>
              <p className="text-emerald-400">&gt; STATUS 200 OK [1 New Order]</p>
              <p className="text-indigo-200">&gt; beep_buzzer(GPIO_23); // Chime Activated</p>
              <p className="text-white/40">&gt; Order #4402 - Sean @ Effingham ($29.99)</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-white/40 border-b border-white/5 pb-2">
                <span>CHIP PROVISION STATUS</span>
                <span className="text-emerald-400 font-black">PROVISIONS AVAILABLE</span>
              </div>
              <Link href="/dashboard/hardware" className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                Audit Hardware Protocol
              </Link>
            </div>
          </div>
        </section>

        {/* Directory/Marketplace Headliners */}
        <section className="py-48 max-w-7xl mx-auto px-6 md:px-10 space-y-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-4 text-left">
              <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">Active <br /><span className="text-indigo-500">Boutiques.</span></h2>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Currently Active Town-Hub Nodes</p>
            </div>
            <Link href="/marketplace" className="text-[11px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors pb-2 border-b border-white/10">Browse Full Catalog →</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {internalBusinesses.slice(0, 4).map((biz) => (
              <Link key={biz.id} href={`/shop/${biz.id}`} className="group relative bg-white/[0.02] rounded-[4rem] p-12 border border-white/5 hover:border-indigo-500/20 transition-all h-[400px] flex flex-col justify-end overflow-hidden shadow-3xl hover:scale-105 duration-500">
                <div className="absolute top-12 left-12 w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-4xl grayscale group-hover:grayscale-0 transition-all font-black italic text-indigo-500 border border-white/10 shadow-2xl">
                  {biz.name[0]}
                </div>
                <div className="space-y-4 relative z-10 text-left">
                  <div className="inline-flex px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[8px] font-black uppercase tracking-widest">Active Node</div>
                  <h3 className="text-3xl font-black italic tracking-tighter group-hover:text-indigo-400 transition-colors truncate">{biz.name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{biz.category} • {biz.location || 'Local'}</p>
                </div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500/5 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-48 bg-[#030304] border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-4 gap-24">
          <div className="space-y-12 md:col-span-2 text-left">
            <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none">The <br /><span className="text-indigo-500">Oasis.</span></h2>
            <p className="max-w-sm text-lg font-medium text-white/30 italic leading-relaxed">Scaling decentralized neighborhood commerce through logistics integration and physical hardware signals.</p>
            <div className="pt-8">
              <Link href="/register-business" className="inline-block px-12 py-5 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">List Your Boutique</Link>
            </div>
          </div>
          
          <div className="space-y-8 text-left">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Operational Links</h4>
            <ul className="space-y-4 text-xs font-black uppercase tracking-widest text-white/40 italic">
              <li><Link href="/marketplace" className="hover:text-white transition-colors">Marketplace Catalog</Link></li>
              <li><Link href="/fleet" className="hover:text-white transition-colors">Join Fleet Hub</Link></li>
              <li><Link href="/register-business" className="hover:text-white transition-colors">Onboard Store</Link></li>
              <li><Link href="/manual" className="hover:text-white transition-colors">Logistics Manual</Link></li>
            </ul>
          </div>

          <div className="space-y-8 text-left">
             <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Communication</h4>
             <p className="text-xs font-black uppercase tracking-widest text-white/40 italic">508.507.0305</p>
             <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mt-4 leading-loose">
               &copy; 2026 Oasis United Network. <br />
               Refined local commerce & hardware nodes.
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
