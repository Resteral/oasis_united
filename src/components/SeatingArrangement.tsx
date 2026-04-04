import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface BoutiqueUnit {
    id: string;
    type: 'table' | 'shelf';
    label: string;
    status: 'available' | 'occupied' | 'reserved' | 'stocking';
    x: number;
    y: number;
    rotation: number;
    capacity?: number; // For tables
    productId?: string; // For shelves
    productPrice?: number;
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
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [draggedUnitId, setDraggedUnitId] = useState<string | null>(null);
    const [activeReceipt, setActiveReceipt] = useState<any | null>(null);
    const [productSelector, setProductSelector] = useState<string | null>(null);
    const [configUnitId, setConfigUnitId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const deleteUnit = (id: string) => {
        setUnits(prev => prev.filter(u => u.id !== id));
        setConfigUnitId(null);
    };

    const updateUnit = (id: string, updates: Partial<BoutiqueUnit>) => {
        setUnits(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    };

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const { data: layoutData } = await supabase
                .from('seating_layouts')
                .select('layout_json')
                .eq('business_id', businessId)
                .single();
            
            if (layoutData?.layout_json) {
                setUnits(layoutData.layout_json);
            } else {
                setUnits([
                    { id: '1', type: 'table', label: 'T1', status: 'available', x: 20, y: 20, rotation: 0, capacity: 2 },
                    { id: '2', type: 'shelf', label: 'S1', status: 'available', x: 80, y: 20, rotation: 0, productId: 'mock-1' }
                ]);
            }

            const { data: prodData } = await supabase
                .from('products')
                .select('*')
                .eq('business_id', businessId);
            if (prodData) setInventory(prodData);
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
        else alert("Protocol Failure: Unable to persist structural changes.");
    };

    const handleUnitAction = async (unit: BoutiqueUnit) => {
        if (isEditing) {
            setConfigUnitId(unit.id);
            return;
        }

        if (merchantMode) {
            if (unit.type === 'table') {
                if (unit.status === 'occupied' || unit.status === 'reserved') {
                    const { data: order } = await supabase
                        .from('orders')
                        .select('*')
                        .eq('business_id', businessId)
                        .eq('table_number', unit.label)
                        .neq('status', 'completed')
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single();
                    if (order) setActiveReceipt(order);
                } else {
                    const next = unit.status === 'available' ? 'occupied' : 'available';
                    setUnits(prev => prev.map(u => u.id === unit.id ? { ...u, status: next as any } : u));
                }
            }
        } else if (onUnitSelect) {
            onUnitSelect(unit);
        }
    };

    const handleRotate = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setUnits(prev => prev.map(u => u.id === id ? { ...u, rotation: (u.rotation + 45) % 360 } : u));
    };

    const addUnit = (type: 'table' | 'shelf') => {
        const newId = Date.now().toString();
        const newUnit: BoutiqueUnit = {
            id: newId,
            type,
            label: type === 'table' ? `T${units.length + 1}` : `S${units.length + 1}`,
            status: 'available',
            x: 50,
            y: 50,
            rotation: 0,
            capacity: type === 'table' ? 2 : undefined
        };
        setUnits([...units, newUnit]);
    };

    const assignProduct = (productId: string) => {
        const product = inventory.find(p => p.id === productId);
        setUnits(prev => prev.map(u => u.id === productSelector ? { 
            ...u, 
            productId, 
            label: product?.name || u.label,
            productPrice: product?.price
        } : u));
        setProductSelector(null);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggedUnitId || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setUnits(prev => prev.map(u => u.id === draggedUnitId ? { ...u, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } : u));
    };

    if (loading) return <div className="animate-pulse text-[10px] font-black uppercase tracking-widest text-white/20 text-center py-20">Syncing Structural Grid...</div>;

    return (
        <div className="space-y-8 select-none">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 py-8 bg-white/5 rounded-[2rem] border border-white/5 gap-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isEditing ? 'bg-amber-400 animate-pulse outline outline-4 outline-amber-400/20' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}></span>
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/60">
                            {merchantMode ? (isEditing ? 'Architect Mode: Structural Adjustment' : 'Tactical Display: Operations') : 'Walkthrough Display'}
                        </h3>
                    </div>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">
                        {isEditing ? 'Architect stores with Units (Tables) & Shelves (Products)' : 'Click unit to interact or review inventory details'}
                    </p>
                </div>
                
                {merchantMode && (
                    <div className="flex gap-4">
                        {isEditing ? (
                            <>
                                <button onClick={() => addUnit('table')} className="px-6 py-4 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">+ Add Table</button>
                                <button onClick={() => addUnit('shelf')} className="px-6 py-4 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">+ Add Shelf</button>
                                <button onClick={saveLayout} className="px-10 py-4 bg-amber-400 text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-amber-400/20 hover:scale-105 active:scale-95 transition-all">Save Architecture</button>
                            </>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="px-10 py-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all">Enter Architect Mode</button>
                        )}
                    </div>
                )}
            </div>

            <div 
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseUp={() => setDraggedUnitId(null)}
                onMouseLeave={() => setDraggedUnitId(null)}
                className="relative aspect-square bg-black/40 border border-white/5 rounded-[3rem] p-8 overflow-hidden backdrop-blur-md"
            >
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-2 bg-white/10 rounded-full border border-white/10 backdrop-blur-xl z-20">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60 italic">Store Entrance</span>
                </div>

                <div className="relative w-full h-full">
                    {units.map((unit) => {
                        const isSelected = selectedUnitId === unit.id || selectedLabel === unit.label;
                        const isOccupied = unit.status === 'occupied' || unit.status === 'reserved';
                        const isShelf = unit.type === 'shelf';

                        return (
                            <div
                                key={unit.id}
                                onMouseDown={() => isEditing && setDraggedUnitId(unit.id)}
                                className={`absolute transition-all duration-300 group ${isEditing ? 'cursor-move' : ''}`}
                                style={{
                                    left: `${unit.x}%`,
                                    top: `${unit.y}%`,
                                    transform: `translate(-50%, -50%) rotate(${unit.rotation}deg) ${isSelected || (draggedUnitId === unit.id) ? 'scale(1.1)' : ''}`,
                                    zIndex: (draggedUnitId === unit.id || configUnitId === unit.id) ? 100 : 10
                                }}
                            >
                                {/* Precise Chair Visualization */}
                                {!isShelf && (
                                    <div className="absolute inset-0 pointer-events-none">
                                        {[...Array(unit.capacity || 2)].map((_, i) => {
                                            const angle = (i * 360) / (unit.capacity || 2);
                                            return (
                                                <div 
                                                    key={i}
                                                    className="absolute w-3.5 h-3.5 bg-white/10 rounded-full border border-white/20 transition-all duration-700"
                                                    style={{
                                                        top: '50%',
                                                        left: '50%',
                                                        transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-44px)`
                                                    }}
                                                ></div>
                                            );
                                        })}
                                    </div>
                                )}
                                <button
                                    disabled={!merchantMode && isOccupied && !isShelf}
                                    onClick={() => handleUnitAction(unit)}
                                    className="relative flex flex-col items-center justify-center p-2"
                                >
                                    <div className={`rounded-[1.2rem] border-2 flex items-center justify-center shadow-3xl transition-all duration-500 overflow-hidden ${
                                        isShelf 
                                            ? 'w-24 h-12 bg-white/5 border-white/20 hover:border-amber-400/50' 
                                            : 'w-16 h-16 bg-white/10 border-white/20 hover:border-indigo-500/50'
                                    } ${isSelected ? 'border-amber-400 bg-amber-400/25 shadow-[0_0_20px_rgba(251,191,36,0.3)]' : ''} ${isOccupied ? 'bg-red-500/20 border-red-500/40 text-red-500' : 'text-white/80'}`}>
                                        <div className="flex flex-col items-center gap-0.5 px-2 text-center">
                                            <span className={`${isShelf ? 'text-[8px]' : 'text-xl'} font-black italic tracking-tighter uppercase line-clamp-2`}>{unit.label}</span>
                                            {isShelf && !isEditing && (
                                                <span className="text-[6px] font-black text-amber-400/60 uppercase">Unit Stock</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className={`mt-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                                        isShelf ? 'bg-amber-400/10 text-amber-400' : 'bg-white/10 text-white/60'
                                    }`}>
                                        {isShelf ? (unit.productPrice ? `$${unit.productPrice}` : 'Unassigned') : `${unit.capacity || 2} Pax`}
                                    </div>

                                    {isEditing && (
                                        <div 
                                            onClick={(e) => handleRotate(unit.id, e)}
                                            className="absolute -top-1 -right-1 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] border-2 border-black/40 hover:scale-110 active:rotate-180 transition-all cursor-pointer shadow-xl z-20"
                                        >
                                            🔄
                                        </div>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 px-12 py-4 bg-indigo-600 rounded-full border border-white/20 shadow-3xl z-20">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Bar & Operations</span>
                </div>
            </div>

            {/* Receipt Modal */}
            {activeReceipt && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white text-black w-full max-w-sm rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden shadow-2xl">
                        <div className="text-center space-y-2">
                            <h4 className="text-4xl font-black italic tracking-tighter uppercase">Receipt.</h4>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Unit {activeReceipt.table_number || '??'} &bull; {new Date(activeReceipt.created_at).toLocaleTimeString()}</p>
                        </div>
                        <div className="border-t border-b border-dashed border-gray-200 py-6 space-y-4">
                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-tight">
                                <span>Customer</span>
                                <span>{activeReceipt.customer_name || 'Anonymous'}</span>
                            </div>
                            <div className="space-y-2">
                                {activeReceipt.items && Array.isArray(activeReceipt.items) ? activeReceipt.items.map((item: any, i: number) => (
                                    <div key={i} className="flex justify-between text-sm font-bold text-gray-600">
                                        <span>{item.quantity}x {item.name}</span>
                                        <span>${Number(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                )) : (
                                    <p className="text-[10px] text-gray-400 italic font-medium">No items in cart yet.</p>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-black uppercase tracking-widest text-gray-400">Total</span>
                            <span className="text-3xl font-black italic tracking-tighter">${Number(activeReceipt.total).toFixed(2)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <button onClick={() => setActiveReceipt(null)} className="w-full py-4 bg-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all">Close</button>
                            <button className="w-full py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Process Pay</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Selector */}
            {productSelector && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                    <div className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-10 space-y-8 shadow-3xl animate-in zoom-in-95 duration-300">
                        <div className="space-y-2 text-center">
                            <h4 className="text-3xl font-black italic tracking-tighter uppercase text-white">Assign Shelf.</h4>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Link product SKU to virtual shelf axis.</p>
                        </div>
                        <div className="max-h-80 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {inventory.length > 0 ? inventory.map((product) => (
                                <button 
                                    key={product.id}
                                    onClick={() => assignProduct(product.id)}
                                    className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center hover:bg-white/10 hover:border-amber-400/30 transition-all group"
                                >
                                    <div className="flex flex-col items-start gap-1">
                                        <span className="text-xs font-black uppercase text-white/80 group-hover:text-amber-400 transition-colors">{product.name}</span>
                                        <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{product.category}</span>
                                    </div>
                                    <span className="text-lg font-black text-white/60 italic">${product.price}</span>
                                </button>
                            )) : (
                                <p className="text-[10px] text-white/20 italic text-center py-12">No inventory nodes found.</p>
                            )}
                        </div>
                        <button 
                            onClick={() => setProductSelector(null)}
                            className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10 hover:text-white"
                        > Cancel Structural Linking </button>
                    </div>
                </div>
            )}

            {/* Node Configuration Modal (Chairs / Labels / Deletion) */}
            {configUnitId && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[150] flex items-center justify-center p-6 animate-in zoom-in-95 duration-500">
                    <div className="bg-[#0a0a0b] border border-white/10 w-full max-w-[420px] rounded-[3.5rem] p-12 space-y-12 shadow-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                            <span className="text-[200px] font-black italic select-none leading-none">⚙️</span>
                        </div>

                        <div className="text-center space-y-3 relative z-10">
                            <h4 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">Configure Node.</h4>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none bg-indigo-500/10 px-4 py-2 rounded-full inline-block">Architectural Tuning: {units.find(u => u.id === configUnitId)?.label}</p>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-3">Unit Identifier (Alphanumeric Handle)</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-2xl text-white font-black italic tracking-tight focus:border-indigo-500 outline-none transition-all placeholder:text-white/10"
                                    placeholder="e.g. Table 01"
                                    value={units.find(u => u.id === configUnitId)?.label || ''}
                                    onChange={(e) => updateUnit(configUnitId, { label: e.target.value })}
                                />
                            </div>

                            {units.find(u => u.id === configUnitId)?.type === 'table' ? (
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-3 font-mono">Structural Capacity (Chairs)</label>
                                    <div className="flex items-center gap-6 bg-white/5 rounded-[2rem] p-3 border border-white/10">
                                        <button onClick={() => updateUnit(configUnitId, { capacity: Math.max(1, (units.find(u => u.id === configUnitId)?.capacity || 2) - 1) })} className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl hover:bg-indigo-600 transition-all font-black text-white shadow-lg">-</button>
                                        <div className="flex-1 text-center py-2">
                                            <span className="text-5xl font-black italic tracking-tighter text-white inline-block leading-none">{units.find(u => u.id === configUnitId)?.capacity || 2}</span>
                                            <span className="block text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1">Pax Capacity</span>
                                        </div>
                                        <button onClick={() => updateUnit(configUnitId, { capacity: (units.find(u => u.id === configUnitId)?.capacity || 2) + 1 })} className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl hover:bg-indigo-600 transition-all font-black text-white shadow-lg">+</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-3">Inventory Binding</label>
                                    <button 
                                        onClick={() => { setProductSelector(configUnitId); setConfigUnitId(null); }}
                                        className="w-full py-7 bg-white/5 border border-white/10 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:border-indigo-500 transition-all shadow-xl group"
                                    >
                                        <span className="group-hover:scale-105 inline-block transition-transform">Assign Product SKU</span>
                                    </button>
                                </div>
                            )}

                            <div className="pt-10 border-t border-white/5 flex flex-col gap-4">
                                <button onClick={() => setConfigUnitId(null)} className="w-full py-6 bg-white text-black rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-white/10">Confirm Node Tuning</button>
                                <button onClick={() => deleteUnit(configUnitId)} className="w-full py-4 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:text-rose-400 transition-all italic tracking-tighter text-center">Decommission Structural Unit</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
