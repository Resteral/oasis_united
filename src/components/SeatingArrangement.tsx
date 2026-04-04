import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface Table {
    id: string;
    number: string;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved';
    x: number;
    y: number;
    rotation: number;
}

interface SeatingArrangementProps {
    businessId: string;
    onTableSelect?: (tableNumber: string) => void;
    selectedTable?: string;
    merchantMode?: boolean;
}

export default function SeatingArrangement({ businessId, onTableSelect, selectedTable, merchantMode }: SeatingArrangementProps) {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [draggedTableId, setDraggedTableId] = useState<string | null>(null);
    const [activeReceipt, setActiveReceipt] = useState<any | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function loadSeating() {
            // In a real app, we'd fetch this from a 'seating_layouts' table
            // For now, we use a enhanced mock that can be saved/updated
             const mockTables: Table[] = [
                { id: '1', number: '01', capacity: 2, status: 'available', x: 20, y: 20, rotation: 0 },
                { id: '2', number: '02', capacity: 2, status: 'occupied', x: 50, y: 20, rotation: 0 },
                { id: '3', number: '03', capacity: 4, status: 'available', x: 80, y: 20, rotation: 0 },
                { id: '4', number: '04', capacity: 4, status: 'available', x: 20, y: 50, rotation: 45 },
                { id: '5', number: '05', capacity: 6, status: 'reserved', x: 50, y: 50, rotation: 0 },
                { id: '6', number: '06', capacity: 4, status: 'available', x: 80, y: 50, rotation: -15 },
                { id: '7', number: '07', capacity: 2, status: 'available', x: 20, y: 80, rotation: 0 },
                { id: '8', number: '08', capacity: 2, status: 'available', x: 50, y: 80, rotation: 90 },
                { id: '9', number: '09', capacity: 8, status: 'available', x: 80, y: 80, rotation: 0 },
            ];
            setTables(mockTables);
            setLoading(false);
        }
        loadSeating();
    }, [businessId]);

    const handleTableAction = async (table: Table) => {
        if (isEditing) return;

        if (merchantMode) {
            if (table.status === 'occupied' || table.status === 'reserved') {
                // Fetch the receipt for this table
                const { data: order } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('business_id', businessId)
                    .eq('table_number', table.number)
                    .neq('status', 'completed')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();
                
                if (order) {
                    setActiveReceipt(order);
                } else {
                    // Fallback if no order found but marked busy
                    setActiveReceipt({
                        customer_name: 'Guest ' + table.number,
                        items: [],
                        total: 0,
                        created_at: new Date().toISOString(),
                        status: 'in-house'
                    });
                }
            } else {
                // Toggle status if not viewing receipt
                const newStatus = table.status === 'available' ? 'occupied' : 'available';
                setTables(prev => prev.map(t => t.id === table.id ? { ...t, status: newStatus as any } : t));
            }
        } else {
            // Consumer Mode
            if (onTableSelect && (table.status === 'available')) {
                onTableSelect(table.number);
            }
        }
    };

    const handleRotate = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setTables(prev => prev.map(t => t.id === id ? { ...t, rotation: (t.rotation + 45) % 360 } : t));
    };

    const handleAddTable = () => {
        const newId = (tables.length + 1).toString();
        const newTable: Table = {
            id: newId,
            number: newId.padStart(2, '0'),
            capacity: 2,
            status: 'available',
            x: 50,
            y: 50,
            rotation: 0
        };
        setTables([...tables, newTable]);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggedTableId || !containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setTables(prev => prev.map(t => t.id === draggedTableId ? { ...t, x, y } : t));
    };

    if (loading) return <div className="animate-pulse text-[10px] font-black uppercase tracking-widest text-white/20 text-center py-10">Mapping Floor Plan...</div>;

    return (
        <div className="space-y-6 select-none">
            <div className="flex justify-between items-center px-4">
                <div className="flex flex-col gap-1">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                        {merchantMode ? (isEditing ? 'Architect Mode: Editing Layout' : 'Live Seating Management') : 'Select Your Table'}
                    </h3>
                    <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">
                        {isEditing ? 'Drag to position • Click 🔄 to rotate' : 'Click busy table to view Receipt'}
                    </p>
                </div>
                
                {merchantMode && (
                    <div className="flex gap-3">
                        {isEditing ? (
                            <>
                                <button onClick={handleAddTable} className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500/30 transition-all">+ Add Table</button>
                                <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">Save Layout</button>
                            </>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-white/5 border border-white/10 text-white/60 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Edit Map</button>
                        )}
                    </div>
                )}
            </div>

            <div 
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseUp={() => setDraggedTableId(null)}
                onMouseLeave={() => setDraggedTableId(null)}
                className="relative aspect-square bg-black/40 border border-white/5 rounded-[3rem] p-8 overflow-hidden backdrop-blur-md"
            >
                {/* Floor Texture/Grid */}
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                {/* Entry Indicator */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-2 bg-white/10 rounded-full border border-white/10 backdrop-blur-xl z-20">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60 italic">Store Entrance</span>
                </div>

                {/* Tables Grid */}
                <div className="relative w-full h-full">
                    {tables.map((table) => {
                        const isSelected = selectedTable === table.number;
                        const isOccupied = table.status === 'occupied' || table.status === 'reserved';

                        return (
                            <div
                                key={table.id}
                                onMouseDown={() => isEditing && setDraggedTableId(table.id)}
                                className={`absolute transition-all duration-300 group ${
                                    isEditing ? 'cursor-move' : ''
                                }`}
                                style={{
                                    left: `${table.x}%`,
                                    top: `${table.y}%`,
                                    transform: `translate(-50%, -50%) rotate(${table.rotation}deg) ${isSelected ? 'scale(1.1)' : ''}`,
                                    zIndex: draggedTableId === table.id ? 100 : 10
                                }}
                            >
                                <button
                                    disabled={!merchantMode && isOccupied}
                                    onClick={() => handleTableAction(table)}
                                    className="relative flex flex-col items-center justify-center"
                                >
                                    {/* Table Shape */}
                                    <div className={`w-16 h-16 rounded-[1.5rem] border-2 flex items-center justify-center shadow-3xl transition-all duration-500 overflow-hidden ${
                                        isSelected 
                                            ? 'bg-amber-400 border-amber-300 text-black shadow-amber-400/40' 
                                            : isOccupied 
                                                ? 'bg-red-500/20 border-red-500/40 text-red-500' 
                                                : 'bg-white/10 border-white/20 text-white/80 hover:border-indigo-500/50'
                                    }`}>
                                        <div className="flex flex-col items-center gap-0.5">
                                            <span className="text-xl font-black italic tracking-tighter">{table.number}</span>
                                            {isOccupied && !isEditing && merchantMode && (
                                                <span className="text-[8px] font-black uppercase tracking-tighter text-red-500/60 animate-pulse">Live</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Table Label / Capacity */}
                                    <div className={`mt-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                                        isSelected ? 'bg-amber-400 text-black' : isOccupied ? 'bg-red-500/10 text-red-500' : 'bg-white/10 text-white/60'
                                    }`}>
                                        {table.capacity} Pax
                                    </div>

                                    {/* Edit Controls */}
                                    {isEditing && (
                                        <div 
                                            onClick={(e) => handleRotate(table.id, e)}
                                            className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs border-2 border-black/40 hover:scale-110 active:rotate-180 transition-all cursor-pointer shadow-xl z-20"
                                        >
                                            🔄
                                        </div>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Counter / Kitchen Indicator */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 px-12 py-4 bg-indigo-600 rounded-full border border-white/20 shadow-3xl z-20">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Bar & Operations</span>
                </div>
            </div>

            {/* Receipt Modal Overlay */}
            {activeReceipt && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white text-black w-full max-w-sm rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden shadow-2xl">
                        {/* Receipt Header */}
                        <div className="text-center space-y-2">
                            <h4 className="text-4xl font-black italic tracking-tighter uppercase">Receipt.</h4>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Table {activeReceipt.table_number || '??'} &bull; {new Date(activeReceipt.created_at).toLocaleTimeString()}</p>
                        </div>

                        <div className="border-t border-b border-dashed border-gray-200 py-6 space-y-4">
                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-tight">
                                <span>Customer</span>
                                <span>{activeReceipt.customer_name || 'Anonymous'}</span>
                            </div>
                            <div className="space-y-3">
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
                            <button 
                                onClick={() => setActiveReceipt(null)}
                                className="w-full py-4 bg-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                            > Close</button>
                            <button className="w-full py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Process Pay</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
