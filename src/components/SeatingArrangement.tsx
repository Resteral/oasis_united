import { useState, useEffect } from 'react';

interface Table {
    id: string;
    number: string;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved';
    x: number;
    y: number;
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

    useEffect(() => {
        // Mocking a seating layout generation based on businessId
        const mockTables: Table[] = [
            { id: '1', number: '01', capacity: 2, status: 'available', x: 20, y: 20 },
            { id: '2', number: '02', capacity: 2, status: 'occupied', x: 50, y: 20 },
            { id: '3', number: '03', capacity: 4, status: 'available', x: 80, y: 20 },
            { id: '4', number: '04', capacity: 4, status: 'available', x: 20, y: 50 },
            { id: '5', number: '05', capacity: 6, status: 'reserved', x: 50, y: 50 },
            { id: '6', number: '06', capacity: 4, status: 'available', x: 80, y: 50 },
            { id: '7', number: '07', capacity: 2, status: 'available', x: 20, y: 80 },
            { id: '8', number: '08', capacity: 2, status: 'available', x: 50, y: 80 },
            { id: '9', number: '09', capacity: 8, status: 'available', x: 80, y: 80 },
        ];
        setTables(mockTables);
        setLoading(false);
    }, [businessId]);

    const handleTableAction = (table: Table) => {
        if (merchantMode) {
            // In Merchant Mode, we toggle status
            const newStatus = table.status === 'available' ? 'occupied' : 'available';
            setTables(prev => prev.map(t => t.id === table.id ? { ...t, status: newStatus as any } : t));
        } else {
            // In Consumer Mode, we select
            if (onTableSelect) onTableSelect(table.number);
        }
    };

    if (loading) return <div className="animate-pulse text-[10px] font-black uppercase tracking-widest text-white/20 text-center py-10">Mapping Floor Plan...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{merchantMode ? 'Live Seating Management' : 'Select Your Table'}</h3>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-[8px] font-bold uppercase text-white/30">Free</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-[8px] font-bold uppercase text-white/30">Busy</span>
                    </div>
                </div>
            </div>

            <div className="relative aspect-square bg-black/40 border border-white/5 rounded-[2.5rem] p-8 overflow-hidden">
                {/* Floor Texture/Grid */}
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                {/* Entry Indicator */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-1 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Entrance</span>
                </div>

                {/* Tables Grid */}
                <div className="relative w-full h-full">
                    {tables.map((table) => {
                        const isSelected = selectedTable === table.number;
                        const isOccupied = table.status === 'occupied' || table.status === 'reserved';

                        return (
                            <button
                                key={table.id}
                                disabled={!merchantMode && isOccupied}
                                onClick={() => handleTableAction(table)}
                                className={`absolute transition-all duration-500 group ${
                                    isSelected ? 'scale-110 z-20' : 'hover:scale-110 z-10'
                                }`}
                                style={{
                                    left: `${table.x}%`,
                                    top: `${table.y}%`,
                                    transform: `translate(-50%, -50%) ${isSelected ? 'scale(1.1)' : ''}`
                                }}
                            >
                                <div className={`relative flex flex-col items-center justify-center transition-all duration-500 ${
                                    !merchantMode && isOccupied ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer'
                                }`}>
                                    {/* Table Shape */}
                                    <div className={`w-16 h-16 rounded-[1.5rem] border-2 flex items-center justify-center shadow-2xl transition-all duration-500 ${
                                        isSelected 
                                            ? 'bg-amber-400 border-amber-300 text-black shadow-amber-400/40' 
                                            : isOccupied 
                                                ? 'bg-red-500/20 border-red-500/30 text-red-400' 
                                                : 'bg-white/10 border-white/20 text-white/60 hover:border-amber-400/50'
                                    }`}>
                                        <span className="text-xl font-black italic tracking-tighter">{table.number}</span>
                                    </div>

                                    {/* Table Label / Capacity */}
                                    <div className={`mt-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                                        isSelected ? 'bg-amber-400 text-black' : isOccupied ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-white/40'
                                    }`}>
                                        {table.capacity} Seats
                                    </div>

                                    {/* Hover Glow */}
                                    {!isOccupied && !isSelected && (
                                        <div className="absolute inset-0 bg-amber-400 blur-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Counter / Kitchen Indicator */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 px-10 py-3 bg-indigo-600 rounded-full border border-white/20 shadow-3xl">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Bar & Kitchen</span>
                </div>
            </div>

            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-2">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 italic leading-relaxed">
                    Tap any available table to secure your seating for this session. Your order will be dispatched directly to your location.
                </p>
            </div>
        </div>
    );
}
