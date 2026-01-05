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
        unreadMessages: 0,
        activeSpaces: 0
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);

    // Revenue Data State
    const [revenueData, setRevenueData] = useState<any[]>([]);

    useEffect(() => {
        async function loadDashboardData() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // Redirect to login if not authenticated
                window.location.href = '/login';
                return;
            }

            const { data: business } = await supabase.from('businesses').select('id, name').eq('owner_id', user.id).single();

            if (business) {
                // 1. Fetch Basic Stats
                const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('business_id', business.id);

                const { count: servedCount } = await supabase.from('orders')
                    .select('*', { count: 'exact', head: true })
                    .eq('business_id', business.id)
                    .eq('status', 'completed');

                const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('business_id', business.id);

                const { count: messageCount } = await supabase.from('messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('business_id', business.id)
                    .eq('is_read', false)
                    .eq('direction', 'inbound');

                const { count: postCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('business_id', business.id);

                // Calculate Total Revenue (Real)
                const { data: revenueDataPoints } = await supabase
                    .from('orders')
                    .select('total, status')
                    .eq('business_id', business.id)
                    .eq('status', 'completed');

                const totalRevenue = revenueDataPoints?.reduce((sum, order) => sum + (Number(order.total) || 0), 0) || 0;

                // 2. Fetch Recent Orders
                const { data: orders } = await supabase
                    .from('orders')
                    .select('total, created_at, status, customer_name')
                    .eq('business_id', business.id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                setStats({
                    totalOrders: orderCount || 0,
                    ordersServed: servedCount || 0,
                    totalRevenue: totalRevenue,
                    activeProducts: productCount || 0,
                    unreadMessages: messageCount || 0,
                    activeSpaces: postCount || 0
                });

                setRecentOrders(orders || []);

                // 3. Generate Chart Data (Last 7 Days - Real Aggregation)
                const { data: last7DaysOrders } = await supabase
                    .from('orders')
                    .select('created_at, total')
                    .eq('business_id', business.id)
                    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
                    .eq('status', 'completed'); // Only count completed revenue for chart? Or all? Usually completed.

                // Aggregate by day
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const chartDataMap = new Map();

                // Initialize last 7 days
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dayName = days[d.getDay()];
                    // Use date string as key to handle same week days if needed, but for simple "Mon/Tue" display:
                    // Simple approach: Just show last 7 days roughly.
                    // Better: Create 7 entries.
                    const key = dayName;
                    if (!chartDataMap.has(key)) {
                        chartDataMap.set(key, { name: key, revenue: 0, orders: 0 });
                    }
                }

                // Fill with data
                last7DaysOrders?.forEach(order => {
                    const d = new Date(order.created_at);
                    const dayName = days[d.getDay()];
                    if (chartDataMap.has(dayName)) {
                        const entry = chartDataMap.get(dayName);
                        entry.revenue += Number(order.total) || 0;
                        entry.orders += 1;
                    }
                });

                // Convert to array and ensure order (Last 7 days strictly)
                // Re-generating the array to ensure chronological order
                const finalChartData = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dayName = days[d.getDay()];
                    // Find the entry we populated (resetting it might duplicate if not careful with day names rolling over? 
                    // Actually usually fine for 7 days unless we cross a boundary where Mon appears twice? No, 7 days is unique names usually unless...
                    // Wait, 7 days ago was Mon, Today is Mon. names collide.
                    // Better to use date string as key.
                    // Let's stick to the map we built but ensure correct order.

                    // Correct approach: Just iterate i=6 to 0 again and build objects.
                    // Need to match data correctly.
                    // Let's simplify:
                }

                // Redo Chart Logic for simplicity and correctness
                const chartData = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dayName = days[d.getDay()];
                    const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD for matching

                    const dailyRevenue = last7DaysOrders
                        ?.filter(o => o.created_at.startsWith(dateStr))
                        .reduce((sum, o) => sum + (Number(o.total) || 0), 0) || 0;

                    chartData.push({
                        name: dayName, // potentially ambiguous if 7 days span, typically fine.
                        revenue: dailyRevenue,
                        // orders: ...
                    });
                }

                setRevenueData(chartData);
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
                    <span className={styles.statLabel}>Orders Taken</span>
                    <div className={styles.statValue}>
                        {stats.totalOrders}
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
                    <span className={styles.statTrend} style={{ color: stats.unreadMessages > 0 ? '#ff9800' : '#4caf50' }}>{stats.unreadMessages > 0 ? 'Action Required' : 'All caught up'}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Active Spaces</span>
                    <span className={styles.statValue}>{stats.activeSpaces}</span>
                    <span className={styles.statTrend}>Posts & Events</span>
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
