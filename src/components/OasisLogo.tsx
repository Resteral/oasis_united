"use client";

export default function OasisLogo({ className = "", size = "md" }: { className?: string, size?: "sm" | "md" | "lg" }) {
    const iconSize = size === "sm" ? "w-8 h-8" : size === "md" ? "w-10 h-10" : "w-14 h-14";
    const textSize = size === "sm" ? "text-lg" : size === "md" ? "text-2xl" : "text-4xl";

    return (
        <div className={`flex items-center gap-4 group ${className}`}>
            <div className={`${iconSize} bg-gradient-to-br from-amber-400 to-amber-600 rounded-[1.2rem] flex items-center justify-center text-2xl group-hover:rotate-12 transition-all shadow-2xl shadow-amber-400/20 relative overflow-hidden group-hover:scale-110`}>
                {/* Stylized House and Pond Iconography */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative z-10 transition-transform group-hover:translate-x-1 duration-700">🏘️</span>
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-indigo-500 rounded-full border-2 border-amber-500 shadow-inner flex items-center justify-center text-[10px] animate-pulse">
                    💧
                </div>
            </div>
            <span className={`${textSize} font-black italic tracking-tighter uppercase group-hover:text-amber-400 transition-colors`}>
                Oasis <span className="text-white/40 group-hover:text-white/60 transition-colors">United.</span>
            </span>
        </div>
    );
}
