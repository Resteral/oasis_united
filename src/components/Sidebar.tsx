"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './Sidebar.module.css';

const navItems = [
    { label: 'Merchant Dashboard', href: '/dashboard/orders', icon: '📋' },
    { label: 'Seating & Layout', href: '/dashboard/seating', icon: '🍽️' },
    { label: 'Security (MFA)', href: '/dashboard/settings/security', icon: '🔒' },
    { label: 'Regional Network', href: '/dashboard/fleet', icon: '🛰️' },
    { label: 'Network Marketing', href: '/dashboard/marketing', icon: '📡' },
    { label: 'Products', href: '/dashboard/products', icon: '📦' },
    { label: 'Team / Staff', href: '/dashboard/staff', icon: '🛡️' },
    { label: 'CRM / Customers', href: '/dashboard/crm', icon: '👥' },
    { label: 'Messages', href: '/dashboard/messages', icon: '💬' },
    { label: 'Posts & Events', href: '/dashboard/posts', icon: '📢' },
    { label: 'Financials', href: '/dashboard', icon: '📊' },
    { label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [dim, setDim] = useState(false);

    useEffect(() => {
        const isDim = localStorage.getItem('oasis-dim') === 'true';
        setDim(isDim);
        if (isDim) document.documentElement.classList.add('dim-mode');
    }, []);

    const toggleDim = () => {
        const next = !dim;
        setDim(next);
        localStorage.setItem('oasis-dim', next.toString());
        if (next) document.documentElement.classList.add('dim-mode');
        else document.documentElement.classList.remove('dim-mode');
    };

    return (
        <aside className={styles.sidebar}>
            <Link href="/" className={styles.logo} style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
                <img src="/logo.png" alt="OasisUnited" style={{ height: '60px', width: 'auto' }} className="hover:scale-105 transition-transform" />
            </Link>

            <div className="mt-8 mb-4 px-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Regional Control</p>
            </div>

            <nav className={styles.nav}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.link} ${isActive ? styles.active : ''}`}
                        >
                            <span className={`${styles.icon} ${isActive ? 'scale-110' : ''}`}>{item.icon}</span>
                            <span className="flex-1">{item.label}</span>
                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>}
                        </Link>
                    );
                })}
            </nav>

            <div className={styles.footer}>
                <div className="flex items-center gap-3 p-2 bg-gray-50/50 rounded-2xl border border-gray-100/10">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-lg">
                        BO
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <div className="text-xs font-black text-white truncate">Oasis Admin</div>
                        <div className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-tighter">Sovereign Node</div>
                    </div>
                </div>
                
                <button 
                    onClick={toggleDim}
                    className="mt-4 w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-white/40 hover:text-white"
                >
                    {dim ? '🌕 Normal Mode' : '🌑 Dim Mode (OLED)'}
                </button>
            </div>
        </aside>
    );
}
