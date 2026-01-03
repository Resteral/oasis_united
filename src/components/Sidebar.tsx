import Link from 'next/link';
import styles from './Sidebar.module.css';

const navItems = [
    { label: 'Overview', href: '/dashboard', icon: '📊' },
    { label: 'Messages', href: '/dashboard/messages', icon: '💬' },
    { label: 'Products', href: '/dashboard/products', icon: '📦' },
    { label: 'Posts & Events', href: '/dashboard/posts', icon: '📢' },
    { label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
];

export default function Sidebar() {
    return (
        <aside className={styles.sidebar}>
            <Link href="/" className={styles.logo} style={{ textDecoration: 'none' }}>
                OasisUnited
            </Link>
            <nav className={styles.nav}>
                {navItems.map((item) => (
                    <Link key={item.href} href={item.href} className={styles.link}>
                        <span className={styles.icon}>{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </nav>
            <div className={styles.footer}>
                <div className={styles.user}>Business Owner</div>
            </div>
        </aside>
    );
}
