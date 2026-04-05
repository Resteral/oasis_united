"use client";
import { useEffect, useState } from 'react';

interface Stop {
    id: string;
    name: string;
    category: string;
    lat: number;
    lng: number;
    image_url?: string;
}

interface RouteMapProps {
    stops: Stop[];
    isTopology?: boolean;
}

export default function RouteMap({ stops, isTopology }: RouteMapProps) {
    const [fleetProgress, setFleetProgress] = useState(0);

    // Dynamic Regional Bounds
    const minLat = 43.70;
    const maxLat = 43.85;
    const minLng = -71.15;
    const maxLng = -71.00;

    const getX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * 100;
    const getY = (lat: number) => ((maxLat - lat) / (maxLat - minLat)) * 100;

    useEffect(() => {
        const interval = setInterval(() => {
            setFleetProgress(prev => (prev + 0.2) % 100);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    if (!stops || stops.length === 0) return (
        <div className="h-full flex items-center justify-center bg-black/40 rounded-[3rem] border border-dashed border-white/10 p-20 text-center">
            <div className="space-y-4">
                <span className="text-6xl grayscale opacity-20">📡</span>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">Awaiting Regional Route Initialization...</p>
            </div>
        </div>
    );

    // Filter out stops without coordinates
    const validStops = stops.filter(s => s.lat && s.lng);

    return (
        <div className="relative w-full aspect-square md:aspect-video bg-[#0a0a0b] rounded-[4rem] border border-white/5 overflow-hidden shadow-2xl group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
            
            {/* Simulated Regional Radar Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)', backgroundSize: '10% 10%' }}></div>
            </div>

            <svg className="absolute inset-0 w-full h-full p-20 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* 🛰️ Orbital Route Line */}
                {!isTopology && validStops.length > 1 && (
                    <polyline
                        points={validStops.map(s => `${getX(s.lng)},${getY(s.lat)}`).join(' ')}
                        fill="none"
                        stroke="rgba(79, 70, 229, 0.4)"
                        strokeWidth="0.5"
                        strokeDasharray="2, 2"
                        className="animate-pulse"
                    />
                )}

                {/* 🧬 Active Transit Path */}
                {!isTopology && validStops.length > 1 && (
                    <polyline
                        points={validStops.map(s => `${getX(s.lng)},${getY(s.lat)}`).join(' ')}
                        fill="none"
                        stroke="rgb(129, 140, 248)"
                        strokeWidth="0.8"
                        strokeDasharray="100"
                        strokeDashoffset="100"
                        className="transition-all duration-[3000ms] ease-in-out"
                        style={{ strokeDashoffset: 100 - (fleetProgress * 1) }}
                    />
                )}

                {/* 📍 Retail Discovery Nodes */}
                {validStops.map((stop, i) => (
                    <g key={stop.id} className="cursor-pointer group/node">
                        <circle
                            cx={getX(stop.lng)}
                            cy={getY(stop.lat)}
                            r="1.2"
                            fill="rgb(99, 102, 241)"
                            className="animate-ping opacity-40"
                            style={{ animationDelay: `${i * 300}ms` }}
                        />
                        <circle
                            cx={getX(stop.lng)}
                            cy={getY(stop.lat)}
                            r="0.8"
                            fill="white"
                            className="stroke-indigo-600 stroke-[0.2]"
                        />
                        {/* Interactive Label (SVG context) */}
                        <text
                            x={getX(stop.lng)}
                            y={getY(stop.lat) - 3}
                            textAnchor="middle"
                            className="text-[2px] font-black fill-white/40 uppercase tracking-tighter pointer-events-none group-hover/node:fill-amber-400 transition-colors"
                        >
                            {stop.name}
                        </text>
                    </g>
                ))}
            </svg>

            {/* 🛸 Legend & Metadata */}
            <div className="absolute bottom-10 left-10 space-y-4">
                <div className="flex items-center gap-4 bg-black/60 backdrop-blur-2xl px-6 py-3 rounded-full border border-white/10">
                    <span className={`w-2.5 h-2.5 ${isTopology ? 'bg-amber-400' : 'bg-indigo-500'} rounded-full animate-pulse shadow-lg`}></span>
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{isTopology ? 'MUNICIPAL TOWN TOPOLOGY: FULL SCAN' : 'MUNICIPAL TRANSIT RADAR: ACTIVE'}</span>
                </div>
                <div className="flex -space-x-2">
                    {validStops.slice(0, 5).map((s, i) => (
                        <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#0a0a0b] ${isTopology ? 'bg-amber-900 shadow-amber-500/20' : 'bg-indigo-900'} flex items-center justify-center text-[10px] font-black text-white shadow-xl`}>
                            {s.name[0]}
                        </div>
                    ))}
                    {validStops.length > 5 && (
                        <div className="w-8 h-8 rounded-full border-2 border-[#0a0a0b] bg-zinc-800 flex items-center justify-center text-[10px] font-black text-white/40">
                            +{validStops.length - 5}
                        </div>
                    )}
                </div>
            </div>

            <div className="absolute top-10 right-10 flex flex-col items-end gap-2">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em]">{isTopology ? 'Jurisdiction Grid.' : 'Regional Grid.'}</span>
                <span className={`text-[10px] font-black ${isTopology ? 'text-amber-400' : 'text-amber-400/60'} italic uppercase tracking-widest`}>{validStops.length} {isTopology ? 'Governed Nodes' : 'Registered Stops'}</span>
            </div>
        </div>
    );
}
