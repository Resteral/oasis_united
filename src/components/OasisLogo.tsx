"use client";

export default function OasisLogo({ className = "", size = "md" }: { className?: string, size?: "sm" | "md" | "lg" }) {
    const imgSize = size === "sm" ? "h-8" : size === "md" ? "h-12" : "h-20";

    return (
        <div className={`flex items-center group ${className}`}>
            <img 
                src="/logo.png" 
                alt="United Oasis" 
                className={`${imgSize} w-auto object-contain rounded-2xl group-hover:scale-105 transition-transform duration-300`} 
            />
        </div>
    );
}
