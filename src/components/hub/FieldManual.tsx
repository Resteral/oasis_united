"use client";
import { useState } from 'react';

export default function FieldManual() {
    const [activeTab, setActiveTab] = useState('scouting');

    const sections = {
        scouting: {
            icon: '🕵️‍♂️',
            title: 'Field Scouting',
            steps: [
                'Visit local businesses in your target Oasis Town.',
                'Identify decision-makers and introduce the Oasis Unified platform.',
                'Ask for their current inventory list and unit pricing structure.',
                'Explain how our deliverer network handles their local dispatch.'
            ]
        },
        importing: {
            icon: '📦',
            title: 'Inventory Import',
            steps: [
                'Log in to the Merchant Dashboard for the business.',
                'Navigate to "Manage Products" → "Quick Addition".',
                'Input names, descriptions, and verified unit prices.',
                'Set initial stock levels based on your field report.'
            ]
        },
        dispatch: {
            icon: '🚚',
            title: 'Active Dispatch',
            steps: [
                'Go to "Express Network" in the Command Hub.',
                'Register a new town if the territory is unexplored.',
                'Select "Registered Businesses" as sequenced stops for your route.',
                'Activate the route to go live on the Public Marketplace.'
            ]
        }
    };

    return (
        <section className="bg-white/[0.02] border border-white/5 rounded-[4rem] overflow-hidden">
            <div className="p-12 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 bg-gradient-to-br from-indigo-500/5 to-transparent">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 underline decoration-indigo-500/30">Founder's Protocol</span>
                    </div>
                    <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Scout <br />Manual.</h2>
                    <p className="text-gray-400 font-medium text-lg max-w-sm">The official guide to expanding the Oasis Network through community action.</p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-full border border-white/5 overflow-x-auto no-scrollbar max-w-full">
                    {Object.entries(sections).map(([key, section]) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                                activeTab === key 
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                                : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {section.icon} {section.title}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-12 bg-white/[0.01]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-500" key={activeTab}>
                         {(sections as any)[activeTab].steps.map((step: string, i: number) => (
                             <div key={i} className="flex gap-6 items-start group">
                                 <span className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center font-black italic text-indigo-500 text-sm group-hover:bg-indigo-500 group-hover:text-white transition-all shrink-0">
                                     0{i + 1}
                                 </span>
                                 <p className="text-lg font-bold text-white/80 leading-snug pt-1 group-hover:text-white transition-colors uppercase tracking-tight italic">
                                     {step}
                                 </p>
                             </div>
                         ))}
                    </div>
                    <div className="hidden md:block relative aspect-square bg-indigo-600/5 rounded-[3rem] border border-indigo-500/10 overflow-hidden">
                         <div className="absolute inset-0 flex items-center justify-center text-[200px] opacity-10 select-none grayscale">
                             {(sections as any)[activeTab].icon}
                         </div>
                         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
                         <div className="absolute bottom-12 left-12 right-12 p-8 bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/10">
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2">Pro Tip</p>
                              <p className="text-sm font-bold text-white italic">
                                  {activeTab === 'scouting' ? 'Bring a tablet or ledger to log inventory names and prices on-site for faster digital onboarding.' :
                                   activeTab === 'importing' ? 'Use high-resolution photos for the top 5 products to increase discovery attraction by 250%.' :
                                   'Communicate the exact time of your dispatch loop to businesses to coordinate store pickup.'}
                              </p>
                         </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
