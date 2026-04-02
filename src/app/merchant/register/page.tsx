"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function MerchantRegisterPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        location: '',
        description: '',
        email: ''
    });

    const nextStep = () => setStep(step + 1);

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] text-white p-8 lg:p-24 flex items-center justify-center selection:bg-indigo-500 selection:text-white">
            <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-12">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Expansion Protocol</span>
                        </div>
                        <h1 className="text-7xl font-black italic tracking-tighter leading-none">Expand Your <span className="text-indigo-500">Reach.</span></h1>
                        <p className="text-lg font-medium text-gray-400 leading-relaxed italic">The premium digital standard for local boutiques, restaurants, and hardware makers. Launch your Oasis in minutes.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <div className="text-3xl font-black italic text-indigo-500 mb-1">0%</div>
                            <div className="text-[10px] font-black uppercase opacity-40">Processing Fee</div>
                        </div>
                        <div>
                            <div className="text-3xl font-black italic text-indigo-500 mb-1">2.4k+</div>
                            <div className="text-[10px] font-black uppercase opacity-40">Local Explorers</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 rounded-[4rem] border border-white/10 p-12 lg:p-16 shadow-2xl relative overflow-hidden backdrop-blur-3xl group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 grayscale pointer-events-none group-hover:grayscale-0 transition-all duration-700">
                        <span className="text-9xl italic font-black">🚀</span>
                    </div>

                    <div className="relative z-10 space-y-10">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black uppercase tracking-tight italic">Storefront Setup</h2>
                            <span className="text-[10px] font-black opacity-30 tracking-widest">STEP {step}/3</span>
                        </div>

                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 px-1">Business Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Effingham Fine Goods" 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold focus:border-indigo-500 focus:bg-white/10 outline-none transition-all"
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 px-1">Primary Category</label>
                                    <select 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold focus:border-indigo-500 focus:bg-white/10 outline-none transition-all appearance-none"
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    >
                                        <option className="bg-slate-900">Retail / Boutique</option>
                                        <option className="bg-slate-900">Restaurant / Eats</option>
                                        <option className="bg-slate-900">Hardware / Maker</option>
                                        <option className="bg-slate-900">Grocery / Fresh</option>
                                    </select>
                                </div>
                                <button onClick={nextStep} className="w-full py-5 bg-indigo-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-400 transition-colors shadow-2xl shadow-indigo-500/20">Next Phase →</button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 px-1">Location / Town</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Effingham Falls, NH" 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold focus:border-indigo-500 focus:bg-white/10 outline-none transition-all"
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 px-1">Describe Your Boutique</label>
                                    <textarea 
                                        rows={3}
                                        placeholder="What makes your shop an Oasis?" 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 font-bold focus:border-indigo-500 focus:bg-white/10 outline-none transition-all"
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>
                                <button onClick={nextStep} className="w-full py-5 bg-indigo-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-400 transition-colors shadow-2xl shadow-indigo-500/20">Finalize Identity</button>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-indigo-500/10 p-8 rounded-[2rem] border border-indigo-500/20 text-center">
                                    <div className="text-4xl mb-4">💎</div>
                                    <h3 className="font-bold text-xl mb-2 italic">Ready for Launch</h3>
                                    <p className="text-xs text-gray-400 font-medium leading-relaxed uppercase tracking-widest px-4">Your request is being processed. An Oasis United guide will contact you shortly to activate your digital storefront.</p>
                                </div>
                                <Link href="/marketplace" className="w-full py-5 bg-white text-black rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-all inline-block text-center shadow-2xl">Return to Oasis</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <footer className="fixed bottom-12 left-12 text-[10px] font-black text-white/20 uppercase tracking-[0.4em] rotate-180 [writing-mode:vertical-lr]">
                expand your market &bull; {new Date().getFullYear()}
            </footer>
        </div>
    );
}
