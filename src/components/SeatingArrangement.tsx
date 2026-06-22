"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import OasisLogo from '@/components/OasisLogo';

interface BoutiqueUnit {
    id: string;
    type: 'table' | 'shelf' | 'decor';
    label: string;
    status: 'available' | 'occupied' | 'reserved' | 'stocking' | 'cleaning';
    x: number;
    y: number;
    rotation: number;
    capacity?: number;
    productId?: string;
    productPrice?: number;
    zone: string;
    assignedStaffId?: string;
    occupiedSince?: string;
    revenue?: number;
}

interface SeatingArrangementProps {
    businessId: string;
    onUnitSelect?: (unit: BoutiqueUnit) => void;
    selectedUnitId?: string;
    selectedLabel?: string;
    merchantMode?: boolean;
}

export default function SeatingArrangement({ businessId, onUnitSelect, selectedUnitId, selectedLabel, merchantMode }: SeatingArrangementProps) {
    const [units, setUnits] = useState<BoutiqueUnit[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [draggedUnitId, setDraggedUnitId] = useState<string | null>(null);
    const [activeReceipt, setActiveReceipt] = useState<any | null>(null);
    const [orderSelector, setOrderSelector] = useState<string | null>(null);
    const [staffSelector, setStaffSelector] = useState<string | null>(null);
    const [pendingOrders, setPendingOrders] = useState<any[]>([]);
    const [configUnitId, setConfigUnitId] = useState<string | null>(null);
    const [activeZone, setActiveZone] = useState('Main Floor');
    const [zones, setZones] = useState(['Main Floor', 'Patio', 'Bar Seating']);
    
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const { data: layoutData } = await supabase
                .from('seating_layouts')
                .select('layout_json')
                .eq('business_id', businessId)
                .single();
            
            if (layoutData?.layout_json && Array.isArray(layoutData.layout_json)) {
                setUnits(layoutData.layout_json);
                const uniqueZones = Array.from(new Set(layoutData.layout_json.map((u: any) => u.zone))).filter(Boolean) as string[];
                if (uniqueZones.length > 0) setZones(uniqueZones);
            } else {
                setUnits([
                    { id: '1', type: 'table', label: 'T1', status: 'available', x: 20, y: 20, rotation: 0, capacity: 4, zone: 'Main Floor' },
                    { id: '2', type: 'table', label: 'T2', status: 'available', x: 50, y: 20, rotation: 0, capacity: 2, zone: 'Main Floor' }
                ]);
            }

            const { data: prodData } = await supabase.from('products').select('*').eq('business_id', businessId);
            if (prodData) setInventory(prodData);

            const { data: staffData } = await supabase.from('staff_profiles').select('*').eq('business_id', businessId);
            setStaff(staffData || [
                { id: 's1', full_name: 'Sarah Chen', role: 'Server' },
                { id: 's2', full_name: 'Marcus Bell', role: 'Server' }
            ]);

            setLoading(false);
        }
        loadData();
    }, [businessId]);

    const saveLayout = async () => {
        const { error } = await supabase
            .from('seating_layouts')
            .upsert({ 
                business_id: businessId, 
                layout_json: units,
                updated_at: new Date().toISOString()
            });
        
        if (!error) setIsEditing(false);
    };

    const updateUnit = (id: string, updates: Partial<BoutiqueUnit>) => {
        setUnits(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    };

    const linkOrderToTable = async (orderId: string) => {
        if (!orderSelector) return;
        const unit = units.find(u => u.id === orderSelector);
        if (!unit) return;

        const { error } = await supabase
            .from('orders')
            .update({ 
                table_id: unit.id,
                table_number: unit.label,
                type: 'inhouse',
                status: 'processing' 
            })
            .eq('id', orderId);

        if (!error) {
            const order = pendingOrders.find(o => o.id === orderId);
            updateUnit(unit.id, { 
                status: 'occupied', 
                occupiedSince: new Date().toISOString(),
                revenue: order?.total || 0
            });
            setOrderSelector(null);
        }
    };

    if (loading) return <div className="animate-pulse text-[10px] font-black uppercase tracking-widest text-white/20 text-center py-20 italic">Generating Structural Lattice...</div>;

    return (
        <div className="space-y-10 select-none">
            {/* Header Control Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center px-10 py-10 bg-white/5 rounded-[3rem] border border-white/5 gap-10">
                <div className="space-y-4">
                    <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 overflow-x-auto max-w-full">
                        {zones.map(z => (
                            <button 
                                key={z}
                                onClick={() => setActiveZone(z)}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeZone === z ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-white/40 hover:text-white'}`}
                            >
                                {z}
                            </button>
                        ))}
                    </div>
                </div>
                
                {merchantMode && (
                    <div className="flex gap-4">
                        {isEditing ? (
                            <button onClick={saveLayout} className="px-10 py-4 bg-emerald-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Persist Layout</button>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="px-10 py-5 bg-indigo-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all">Architect Mode</button>
                        )}
                    </div>
                )}
            </div>

            {/* Tactical Grid */}
            <div 
                ref={containerRef}
                className="relative aspect-[4/3] bg-[#0c0c0e] border border-white/5 rounded-[4rem] p-12 overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]"
            >
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
                
                {units.filter(u => u.zone === activeZone).map((unit) => {
                    const isOccupied = unit.status === 'occupied' || unit.status === 'reserved';
                    const revLevel = (unit.revenue || 0) > 100 ? 'high' : 'normal';

                    return (
                        <div
                            key={unit.id}
                            className="absolute transition-all duration-500 group"
                            style={{
                                left: `${unit.x}%`,
                                top: `${unit.y}%`,
                                transform: `translate(-50%, -50%) rotate(${unit.rotation}deg)`,
                                zIndex: 10
                            }}
                        >
                            <button
                                onClick={() => {
                                    if (merchantMode && unit.status === 'available') {
                                        setOrderSelector(unit.id);
                                        // Mock fetch pending
                                        setPendingOrders([{id: 'o1', total: 45, items: [], created_at: new Date().toISOString()}]);
                                    } else if (unit.status === 'occupied') {
                                        setActiveReceipt({id: 'r1', table_number: unit.label, total: unit.revenue || 0, created_at: unit.occupiedSince, items: []});
                                    }
                                }}
                                className="relative flex flex-col items-center justify-center p-4 hover:scale-105 transition-transform"
                            >
                                {/* Chairs */}
                                {!unit.type || unit.type === 'table' ? (
                                    <div className="absolute inset-0 pointer-events-none">
                                        {[...Array(unit.capacity || 2)].map((_, i) => (
                                            <div 
                                                key={i}
                                                className={`absolute w-3.5 h-3.5 rounded-full border border-white/20 ${isOccupied ? 'bg-rose-500/30' : 'bg-white/5'}`}
                                                style={{
                                                    top: '50%', left: '50%',
                                                    transform: `translate(-50%, -50%) rotate(${(i * 360) / (unit.capacity || 2)}deg) translateY(-48px)`
                                                }}
                                            ></div>
                                        ))}
                                    </div>
                                ) : null}

                                {/* Table Body */}
                                <div className={`w-20 h-20 rounded-[1.5rem] border-2 flex flex-col items-center justify-center transition-all duration-300 ${
                                    isOccupied 
                                        ? (revLevel === 'high' ? 'border-amber-400 bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.3)]' : 'border-rose-500/40 bg-rose-500/5') 
                                        : 'border-white/10 bg-[#111113]'
                                }`}>
                                    <span className="text-xl font-black italic uppercase text-white leading-none">{unit.label}</span>
                                    {isOccupied && (
                                        <div className="flex flex-col items-center gap-0.5 mt-1">
                                            <span className="text-[6px] font-black uppercase tracking-widest text-indigo-400">
                                                {unit.occupiedSince ? `${Math.floor((Date.now() - new Date(unit.occupiedSince).getTime()) / 60000)}m Open` : 'Active'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Performance Badges */}
                                {isOccupied && (
                                    <div className="mt-3 flex gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <div className="px-2 py-0.5 bg-amber-400 text-black rounded-full text-[7px] font-black uppercase">
                                            ${unit.revenue || 0}
                                        </div>
                                        {unit.assignedStaffId && (
                                            <div className="px-2 py-0.5 bg-white/10 text-white/50 rounded-full text-[7px] font-black uppercase">
                                                ID: {unit.assignedStaffId}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Order Selector Terminal */}
            {orderSelector && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[600] flex items-center justify-center p-6 animate-in zoom-in-95 duration-500">
                     <div className="w-full max-w-sm bg-[#0a0a0b] border border-white/10 rounded-[3.5rem] p-12 space-y-10 shadow-3xl">
                        <div className="text-center space-y-2">
                            <h4 className="text-3xl font-black italic tracking-tighter text-white uppercase">Assign Order.</h4>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">Unit: {units.find(u => u.id === orderSelector)?.label}</p>
                        </div>
                        <div className="space-y-3">
                            {pendingOrders.map(o => (
                                <button key={o.id} onClick={() => linkOrderToTable(o.id)} className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl flex justify-between items-center hover:bg-indigo-600 transition-all group">
                                    <div className="text-left">
                                        <p className="text-lg font-black italic text-white uppercase leading-none">Order #{o.id.slice(0,5)}</p>
                                        <p className="text-[9px] font-black text-white/30 uppercase mt-1">${o.total} Settlement</p>
                                    </div>
                                    <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setOrderSelector(null)} className="w-full py-4 text-white/20 text-[10px] font-black uppercase tracking-widest">Abort Selection</button>
                     </div>
                </div>
            )}

            {/* Receipt Modal */}
            {activeReceipt && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[500] flex items-center justify-center p-6 animate-in zoom-in-95 duration-500">
                    <div className="bg-white rounded-[4.5rem] w-full max-w-sm overflow-hidden flex flex-col shadow-3xl">
                         <header className="p-12 bg-black text-white space-y-4">
                            <div className="flex justify-between items-start">
                                <OasisLogo size="sm" />
                                <button onClick={() => setActiveReceipt(null)} className="text-[8px] font-black uppercase text-white/30 hover:text-white transition-colors">Close</button>
                            </div>
                            <h4 className="text-5xl font-black italic tracking-tighter uppercase leading-none mt-6">Receipt.</h4>
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Unit {activeReceipt.table_number} &bull; Total ${activeReceipt.total}</p>
                         </header>
                         <div className="p-12">
                            <button className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl">Settle Bill</button>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
}
