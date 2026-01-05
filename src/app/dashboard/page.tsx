"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function DashboardOverview() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        activeProducts: 0,
        unreadMessages: 0
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);

    useEffect(() => {
        async function loadDashboardData() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: business } = await supabase.from('businesses').select('id, name').eq('owner_id', user.id).single();

            if (business) {
                // 1. Fetch Stats (Simulated aggregation for demo, in prod use Counts or specialized views)
                const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('business_id', business.id);
                const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('business_id', business.id);

                // For revenue, we fetch recent orders and sum them (simplified)
                const { data: orders } = await supabase.from('orders').select('total, created_at, status, customer_name').eq('business_id', business.id).order('created_at', { ascending: false }).limit(5);

                // Mock Revenue Calculation (randomized base + actual sums if we had them)
                const mockRevenue = 12500 + (orderCount || 0) * 25;

                setStats({
                    totalOrders: orderCount || 0,
                    totalRevenue: mockRevenue,
                    activeProducts: productCount || 0,
                    unreadMessages: 3 // Mock for now
                });

                setRecentOrders(orders || []);
            }
            setLoading(false);
        }
        loadDashboardData();
    }, []);

    if (loading) return <div className="p-8">Loading dashboard...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Dashboard Overview</h1>
                <p className={styles.subtitle}>Welcome back! Here's what's happening today.</p>
            </div>

            {/* Stat Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Total Revenue</span>
                    <span className={styles.statValue}>${stats.totalRevenue.toLocaleString()}</span>
                    <span className={styles.statTrend} style={{ color: '#4caf50' }}>+12% vs last month</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Total Orders</span>
                    <span className={styles.statValue}>{stats.totalOrders}</span>
                    <span className={styles.statTrend} style={{ color: '#4caf50' }}>+5% vs last month</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Active Products</span>
                    <span className={styles.statValue}>{stats.activeProducts}</span>
                    <span className={styles.statTrend} >Inventory Status</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Unread Messages</span>
                    <span className={styles.statValue}>{stats.unreadMessages}</span>
                    <span className={styles.statTrend} style={{ color: '#ff9800' }}>Action Required</span>
                </div>
            </div>

            {/* Charts & Recent Orders Area */}
            <div className={styles.contentGrid}>
                <div className={styles.chartSection}>
                    <h3>Revenue Analytics</h3>
                    <div className={styles.chartPlaceholder}>
                        {/* Placeholder for a Chart.js or Recharts component */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '1rem', padding: '1rem 0' }}>
                            {[40, 60, 45, 70, 55, 80, 65].map((h, i) => (
                                <div key={i} style={{
                                    flex: 1,
                                    backgroundColor: i === 6 ? '#000' : '#eee',
                                    height: `${h}%`,
                                    borderRadius: '4px'
                                }}></div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#888' }}>
                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                        </div>
                    </div>
                </div>

                <div className={styles.recentOrdersSection}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0 }}>Recent Orders</h3>
                        <a href="/dashboard/orders" style={{ fontSize: '0.9rem', color: '#0066cc', textDecoration: 'none' }}>View All</a>
                    </div>

                    <div className={styles.orderList}>
                        {recentOrders.length === 0 ? <p className="text-gray-500">No recent orders.</p> : recentOrders.map((order, i) => (
                            <div key={i} className={styles.orderItem}>
                                <div className={styles.orderInfo}>
                                    <strong>{order.customer_name || 'Guest'}</strong>
                                    <span className={styles.orderMeta}>2 items • {new Date(order.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className={styles.orderTotal}>
                                    ${order.total}
                                    <span className={`${styles.statusBadge} ${styles[order.status] || styles.pending}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
