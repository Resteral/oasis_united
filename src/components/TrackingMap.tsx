"use client";
import { useEffect, useState } from 'react';

interface Driver {
    id: string;
    status: string;
    is_active: boolean;
    profiles?: {
        full_name: string;
    };
}

interface TrackingMapProps {
    activeDrivers: Driver[];
    focusedOrder?: any;
}

export default function TrackingMap({ activeDrivers, focusedOrder }: TrackingMapProps) {
    const [scanPulse, setScanPulse] = useState(0);

    // Simulated Municipal Lat/Lng bounds (NE-NH Region)
    const minLat = 43.70;
    const maxLat = 43.85;
    const minLng = -71.15;
    const maxLng = -71.00;

    const getX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * 100;
    const getY = (lat: number) => ((maxLat - lat) / (maxLat - minLat)) * 100;

    // Simulated positions for active drivers across the regional loop
    const [positions, setPositions] = useState<any[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setScanPulse(prev => (prev + 0.1) % 100);
            
            // Randomly jiggle positions to simulate live GPS telemetry
            setPositions(activeDrivers.map((d, i) => ({
                id: d.id,
                name: d.profiles?.full_name || `Agent ${i}`,
                lat: minLat + (Math.random() * (maxLat - minLat)),
                lng: minLng + (Math.random() * (maxLng - minLng)),
            })));
        }, 100);
        return () => clearInterval(interval);
    }, [activeDrivers]);

    return (
        <div className="w-full h-full bg-[#0a0a0b] relative overflow-hidden group">
            {/* Radar Sweep Effect */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-indigo-500/30 blur-sm pointer-events-none" style={{ transform: `translateY(${scanPulse}vh)` }}></div>
            
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>

            {/* Grid Telemetry */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)', backgroundSize: '10% 10%' }}></div>
            </div>

            <div className="absolute inset-0 p-20">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                    
                    {/* Active Logistics Paths (Simulation) */}
                    {positions.map((p, i) => (
                        <g key={p.id}>
                            <circle 
                                cx={getX(p.lng)} 
                                cy={getY(p.lat)} 
                                r="0.8" 
                                className={`fill-white stroke-indigo-600 stroke-[0.2] transition-all duration-300 ${focusedOrder?.deliverer_id === p.id ? 'scale-[2.5]' : ''}`} 
                            />
                            {focusedOrder?.deliverer_id === p.id && (
                                <circle 
                                    cx={getX(p.lng)} 
                                    cy={getY(p.lat)} 
                                    r="6" 
                                    className="fill-indigo-500/10 animate-ping opacity-40 shadow-2xl" 
                                />
                            )}
                            <circle 
                                cx={getX(p.lng)} 
                                cy={getY(p.lat)} 
                                r="0.4" 
                                className="fill-indigo-400 animate-pulse" 
                            />
                            
                            <text
                                x={getX(p.lng)}
                                y={getY(p.lat) - 4}
                                textAnchor="middle"
                                className={`text-[1.8px] font-black fill-white/30 uppercase tracking-widest ${focusedOrder?.deliverer_id === p.id ? 'fill-amber-400 scale-[2.5]' : ''}`}
                            >
                                {p.name} {focusedOrder?.deliverer_id === p.id ? '• YOUR DRIVER' : ''}
                            </text>
                        </g>
                    ))}

                    {/* Regional Discovery Static Nodes (Businesses) */}
                    <g className="opacity-20 grayscale">
                        <circle cx="20" cy="30" r="0.5" fill="white" />
                        <circle cx="80" cy="45" r="0.5" fill="white" />
                        <circle cx="50" cy="85" r="0.5" fill="white" />
                        <circle cx="65" cy="15" r="0.5" fill="white" />
                    </g>
                </svg>
            </div>

            {/* Compass / Scale */}
            <div className="absolute bottom-10 left-10 p-4 border border-white/5 rounded-2xl bg-black/40 backdrop-blur-3xl text-[8px] font-black uppercase tracking-widest text-white/30">
                OASIS TRACKER // MUNICIPAL GRID 01.A
            </div>
        </div>
    );
}
