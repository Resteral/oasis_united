"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardOverview() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalOrders: 0,
        ordersServed: 0,
        totalRevenue: 0,
        activeProducts: 0,
        unreadMessages: 0
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);

    // Revenue Data State
    const [revenueData, setRevenueData] = useState<any[]>([]);

    useEffect(() => {
        async function loadDashboardData() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: business } = await supabase.from('businesses').select('id, name').eq('owner_id', user.id).single();

            if (business) {
                // 1. Fetch Stats
                const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('business_id', business.id);
                const { count: servedCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('business_id', business.id).eq('status', 'completed');
                const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('business_id', business.id);

                // Fetch recent orders
                const { data: orders } = await supabase
                    .from('orders')
                    .select('total, created_at, status, customer_name')
                    .eq('business_id', business.id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                // Mock Revenue Calculation (randomized base + actual sums if we had them)
                const mockRevenue = 12500 + (orderCount || 0) * 25;

                setStats({
                    totalOrders: orderCount || 0,
                    ordersServed: servedCount || 0,
                    totalRevenue: mockRevenue,
                    activeProducts: productCount || 0,
                    unreadMessages: 3 // Mock for now
                });

                setRecentOrders(orders || []);

                // Generate Mock Chart Data (Last 7 Days)
                const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                const mockChartData = days.map(day => ({
                    name: day,
                    revenue: Math.floor(Math.random() * (2000 - 800) + 800), // Random daily between 800 and 2000
                    orders: Math.floor(Math.random() * (15 - 2) + 2),
                }));
                setRevenueData(mockChartData);
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
                    <span className={styles.statLabel}>Orders Activity</span>
                    <div className={styles.statValue} style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span>{stats.totalOrders}</span>
                        <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>Taken</span>
                        <span style={{ color: '#ccc' }}>/</span>
                        <span>{stats.ordersServed}</span>
                        <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>Served</span>
                    </div>
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
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#222" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#222" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value: number | undefined) => [`$${value}`, 'Revenue']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#222"
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
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
