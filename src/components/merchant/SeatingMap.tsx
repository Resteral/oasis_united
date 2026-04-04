"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Table {
    id: string;
    label: string;
    capacity: number;
    occupants: number;
    status: 'vacant' | 'occupied' | 'ordered';
    activeOrder?: string;
    x: number;
    y: number;
}

export default function SeatingMap({ businessId }: { businessId: string }) {
    const [tables, setTables] = useState<Table[]>([]);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!businessId) return;

        async function fetchTables() {
            try {
                const { data, error } = await supabase.from('businesses').select('store_features').eq('id', businessId).single();
                if (error) throw error;

                if (data?.store_features?.tables) {
                    setTables(data.store_features.tables);
                } else {
                    // Seed some default tables if none exist
                    const defaultTables: Table[] = [
                        { id: 'T1', label: 'T1', capacity: 4, occupants: 0, status: 'vacant', x: 20, y: 20 },
                        { id: 'T2', label: 'T2', capacity: 2, occupants: 0, status: 'vacant', x: 50, y: 20 },
                        { id: 'T3', label: 'T3', capacity: 6, occupants: 0, status: 'vacant', x: 80, y: 20 },
                    ];
                    setTables(defaultTables);
                    // Proactively save default setup
                    await saveTables(defaultTables);
                }
            } catch (err) {
                console.error("Floor Plan Node Error:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchTables();
    }, [businessId]);

    const saveTables = async (newTables: Table[]) => {
        await supabase.from('businesses').update({
            store_features: {
                tables: newTables
            }
        }).eq('id', businessId);
    };

    const handleTableClick = (table: Table) => {
        setSelectedTable(table);
    };

    const toggleOccupancy = (tableId: string) => {
        const updated = tables.map(t => {
            if (t.id === tableId) {
                const newStatus = t.status === 'vacant' ? 'occupied' : 'vacant';
                return { ...t, status: newStatus as any, occupants: newStatus === 'vacant' ? 0 : t.capacity };
            }
            return t;
        });
        setTables(updated);
        saveTables(updated);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <header className="flex justify-between items-end">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-400/10 border border-emerald-400/20 rounded-full">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Sitdown Protocol Active</span>
                    </div>
                    <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-[0.8]">Floor Plan <br /><span className="text-emerald-400">Commander.</span></h2>
                    <p className="text-gray-500 font-medium italic">Visualize your sanctuary, assign guests, and link order streams in real-time.</p>
                </div>
                <div className="flex gap-4">
                     <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all opacity-40">+ Register Table</button>
                </div>
            </header>

            {/* The Interactive Plane */}
            <div className="relative aspect-[21/9] bg-black/40 border border-white/5 rounded-[4rem] overflow-hidden group shadow-3xl">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 pointer-events-none"></div>
                
                {/* Grid UI */}
                <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 pointer-events-none opacity-[0.03]">
                    {Array.from({ length: 72 }).map((_, i) => <div key={i} className="border border-white/20"></div>)}
                </div>

                {tables.map((table) => (
                    <div 
                        key={table.id}
                        onClick={() => handleTableClick(table)}
                        style={{ left: `${table.x}%`, top: `${table.y}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-700 hover:scale-110 active:scale-95 group/table ${
                            table.status === 'occupied' ? 'rotate-12' : ''
                        }`}
                    >
                        <div className={`relative w-24 h-24 rounded-3xl flex flex-col items-center justify-center border-2 shadow-2xl transition-all duration-700 ${
                            table.status === 'vacant' ? 'bg-white/5 border-white/10' : 
                            table.status === 'occupied' ? 'bg-emerald-500/20 border-emerald-400 animate-pulse' : 
                            'bg-amber-400/20 border-amber-400'
                        }`}>
                            {/* Visual Indicator of Capacity */}
                            <div className="absolute -top-3 flex gap-1">
                                {Array.from({ length: table.capacity }).map((_, i) => (
                                    <div key={i} className={`w-2 h-2 rounded-full border border-white/10 ${i < table.occupants ? 'bg-emerald-400' : 'bg-white/10'}`}></div>
                                ))}
                            </div>
                            <span className="text-2xl font-black italic tracking-tighter opacity-80">{table.label}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-40 mt-1">{table.capacity}p</span>
                        </div>
                        {/* Interactive HUD Overlay on Hover */}
                        <div className="absolute top-0 left-full ml-4 opacity-0 group-hover/table:opacity-100 transition-opacity bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl w-40 z-50 pointer-events-none group-active/table:scale-110">
                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-1">{table.status}</p>
                            <p className="text-xs font-bold leading-none text-white/50 italic mb-3">"{table.label}" Node</p>
                            <div className="h-[1px] bg-white/5 mb-3"></div>
                            <button className="w-full py-2 bg-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest text-white/60">Quick Order</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Details Sidebar Concept */}
            {selectedTable && (
                <div className="p-12 bg-white/[0.02] border border-white/5 rounded-[4.5rem] flex flex-col md:flex-row justify-between items-center gap-12 transition-all duration-1000 animate-in fade-in zoom-in-95">
                    <div className="space-y-6 text-center md:text-left">
                        <div className="space-y-1">
                             <h4 className="text-4xl font-black italic tracking-tighter uppercase text-white/95">Mastering Table {selectedTable.label}</h4>
                             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Current Occupancy Protocol</p>
                        </div>
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                             <div className="px-6 py-3 bg-black/40 border border-white/5 rounded-2xl space-y-1">
                                <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">Global Capacity</span>
                                <p className="text-xl font-black italic leading-none">{selectedTable.capacity} 👥</p>
                             </div>
                             <div className="px-6 py-3 bg-black/40 border border-white/5 rounded-2xl space-y-1">
                                <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">Active Status</span>
                                <p className="text-xl font-black italic leading-none uppercase text-emerald-400">{selectedTable.status}</p>
                             </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-6">
                        <button 
                            onClick={() => toggleOccupancy(selectedTable.id)}
                            className={`px-12 py-6 rounded-[2rem] font-black uppercase text-[11px] tracking-widest transition-all shadow-2xl ${
                                selectedTable.status === 'vacant' ? 'bg-emerald-400 text-black hover:scale-105' : 'bg-red-500 text-white hover:bg-red-600'
                            }`}
                        >
                            {selectedTable.status === 'vacant' ? '🚀 Initiate Table' : '🚨 Release Table'}
                        </button>
                        <button className="px-12 py-6 bg-white/5 border border-white/10 rounded-[2rem] font-black uppercase text-[11px] tracking-widest text-white/40 hover:bg-white/10 transition-colors">
                            🧾 Sync Order Protocol
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
