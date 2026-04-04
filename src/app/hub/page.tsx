import Link from 'next/link';
import FieldManual from '@/components/hub/FieldManual';

export const metadata = {
  title: 'Oasis Hub | Command Center',
  description: 'The central hub for all Oasis management and dispatch operations.',
};

export default function HubPage() {
  return (
    <div className="min-h-screen bg-[#0c0c0e] text-white selection:bg-indigo-500 overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-500/10 to-transparent blur-[120px] pointer-events-none"></div>

      <main className="max-w-7xl mx-auto px-8 pt-32 pb-48 relative z-10 space-y-24">
        
        <div className="flex flex-col md:flex-row gap-12 items-start md:items-end group animate-in slide-in-from-top duration-1000">
          <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[2rem] p-4 group-hover:scale-110 transition-transform shadow-3xl">
             <img src="/logo.png" alt="Oasis United" className="w-full h-full object-contain brightness-0 invert opacity-80" />
          </div>
          <div className="space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 underline decoration-indigo-500/30">Oasis Command Hub</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter leading-none uppercase">The <br />Central <br />Hub.</h1>
            <p className="text-gray-400 font-medium text-xl leading-relaxed">Your unified dashboard for commerce, logistics, and network expansion.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <Link href="/dashboard" className="group p-12 bg-white/[0.02] border border-white/5 rounded-[4rem] flex flex-col gap-12 hover:bg-white/[0.04] transition-all hover:scale-105 duration-700 relative overflow-hidden">
            <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-5xl group-hover:scale-110 transition-transform">📊</div>
            <div className="space-y-4">
              <h3 className="text-4xl font-black italic tracking-tighter uppercase whitespace-nowrap">Merchant <br />Dashboard.</h3>
              <p className="text-sm font-bold uppercase tracking-widest text-indigo-400">Inventory & Sales</p>
            </div>
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-indigo-500/5 blur-[80px] rounded-full"></div>
          </Link>

          <Link href="/deliverer/dashboard" className="group p-12 bg-white/[0.02] border border-white/5 rounded-[4rem] flex flex-col gap-12 hover:bg-white/[0.04] transition-all hover:scale-105 duration-700 relative overflow-hidden border-indigo-500/10">
            <div className="w-24 h-24 bg-indigo-500/10 rounded-[2.5rem] flex items-center justify-center text-5xl group-hover:scale-110 transition-transform">🛰️</div>
            <div className="space-y-4">
              <h3 className="text-4xl font-black italic tracking-tighter uppercase whitespace-nowrap">Express <br />Network.</h3>
              <p className="text-sm font-bold uppercase tracking-widest text-indigo-400">Routes & Expansion</p>
            </div>
            <div className="absolute bottom-0 right-0 p-12 opacity-5 pointer-events-none select-none italic font-black text-8xl">NH</div>
          </Link>

          <Link href="/marketplace" className="group p-12 bg-white/[0.02] border border-white/5 rounded-[4rem] flex flex-col gap-12 hover:bg-white/[0.04] transition-all hover:scale-105 duration-700 relative overflow-hidden">
            <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-5xl group-hover:scale-110 transition-transform">🌍</div>
            <div className="space-y-4">
              <h3 className="text-4xl font-black italic tracking-tighter uppercase whitespace-nowrap">Oasis <br />Discovery.</h3>
              <p className="text-sm font-bold uppercase tracking-widest text-indigo-400">Public Marketplace</p>
            </div>
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-indigo-500/5 blur-[80px] rounded-full"></div>
          </Link>

        </div>
        
        <FieldManual />

        <section className="pt-24 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
            <div className="space-y-8">
                 <h2 className="text-3xl font-black italic tracking-tighter uppercase">Network Status <span className="text-green-500">Live.</span></h2>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white/[0.01] p-6 rounded-3xl border border-white/5">
                        <span className="font-bold uppercase tracking-widest text-[10px] opacity-40">Global Transactions</span>
                        <span className="font-black italic text-xl">1.2k today</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/[0.01] p-6 rounded-3xl border border-white/5">
                        <span className="font-bold uppercase tracking-widest text-[10px] opacity-40">Active Towns</span>
                        <span className="font-black italic text-xl">28 verified</span>
                    </div>
                 </div>
            </div>

            <div className="p-12 bg-indigo-600 rounded-[3.5rem] space-y-6 text-center shadow-3xl shadow-indigo-900/40">
                <h3 className="text-4xl font-black italic tracking-tighter leading-none uppercase">Join the <br />Network.</h3>
                <p className="text-indigo-100 font-bold uppercase tracking-widest text-[9px] leading-relaxed">Onboard businesses to become an Oasis Founder today.</p>
                <Link href="/register-business" className="inline-block px-12 py-5 bg-black text-white font-black uppercase tracking-widest text-[11px] rounded-full hover:scale-105 active:scale-95 transition-all">Start Onboarding</Link>
            </div>
        </section>

      </main>
    </div>
  );
}
