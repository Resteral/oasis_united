"use client";
import Link from 'next/link';
import styles from './page.module.css';

const MOCK_ORDERS = [
    { id: '#OU-1023', date: 'Oct 24, 2025', store: 'Oasis Coffee Co.', total: 23.50, status: 'Delivered' },
    { id: '#OU-0988', date: 'Oct 15, 2025', store: 'Urban Plants', total: 45.00, status: 'Picked Up' },
];

export default function ProfilePage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link href="/" className={styles.logo}>OasisUnited</Link>
                    <nav className={styles.nav}>
                        <Link href="/" className={styles.navLink}>Home</Link>
                        <div className={styles.avatar}>JS</div>
                    </nav>
                </div>
            </header>

            <main className="container wrapper">
                <div className={styles.sidebar}>
                    <div className={styles.profileCard}>
                        <div className={styles.largeAvatar}>JS</div>
                        <h2>John Smith</h2>
                        <p className={styles.email}>john.smith@example.com</p>
                        <button className="btn btn-outline" style={{ marginTop: '1rem', width: '100%' }}>Edit Profile</button>
                    </div>
                </div>

                <div className={styles.content}>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>My Orders</h2>
                        <div className={styles.orderList}>
                            {MOCK_ORDERS.map((order) => (
                                <div key={order.id} className={styles.orderCard}>
                                    <div className={styles.orderHeader}>
                                        <span className={styles.storeName}>{order.store}</span>
                                        <span className={styles.orderId}>{order.id}</span>
                                    </div>
                                    <div className={styles.orderDetails}>
                                        <span>{order.date}</span>
                                        <span className={styles.status} data-status={order.status}>{order.status}</span>
                                    </div>
                                    <div className={styles.orderFooter}>
                                        <span className={styles.total}>${order.total.toFixed(2)}</span>
                                        <button className={styles.reorderBtn}>Reorder</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Saved Places</h2>
                        <div className={styles.savedGrid}>
                            <div className={styles.savedCard}>
                                <div className={styles.savedImage}></div>
                                <h4>Oasis Coffee Co.</h4>
                                <p>Premium blends & more</p>
                                <Link href="/shop/demo" className={styles.visitLink}>Visit Store</Link>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
