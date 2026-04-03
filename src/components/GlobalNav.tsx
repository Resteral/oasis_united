"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function GlobalNav() {
    const pathname = usePathname();

    const navItems = [
        { label: 'Explore', path: '/marketplace', icon: '🌎' },
        { label: 'Chat', path: '/messages', icon: '💬' },
        { label: 'Oasis Hub', path: '/hub', icon: '⚡' }, // Added Hub Link
        { label: 'Orders', path: '/my-oasis', icon: '🛍️' },
        { label: 'Network', path: '/deliverer/dashboard', icon: '🛰️' },
    ];

    if (pathname?.startsWith('/admin')) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-4rem)] max-w-lg">
            <nav className="bg-black/90 backdrop-blur-3xl rounded-[2.5rem] p-3 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] border border-white/10 flex justify-between items-center overflow-hidden">
                
                {/* Brand / Logo Button */}
                <Link href="/" className="px-5 py-3 hover:scale-110 transition-transform">
                    <img src="/logo.png" alt="Oasis" className="w-10 h-10 object-contain invert" />
                </Link>

                <div className="flex-1 flex justify-around">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex flex-col items-center gap-1.5 py-3 px-3 rounded-2xl transition-all duration-500 relative group ${isActive
                                    ? 'text-indigo-400'
                                    : 'text-gray-500 hover:text-white'
                                    }`}
                            >
                                <span className={`text-xl transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    {item.icon}
                                </span>
                                <span className={`text-[8px] font-black uppercase tracking-widest transition-all ${isActive ? 'opacity-100' : 'opacity-0 scale-50 group-hover:opacity-40 group-hover:scale-100'
                                    }`}>
                                    {item.label}
                                </span>

                                {isActive && (
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.5)]"></div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
