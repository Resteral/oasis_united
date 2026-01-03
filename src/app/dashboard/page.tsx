"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function DashboardPage() {
    const router = useRouter();
    const [businessName, setBusinessName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkBusiness() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // Check if user has a business
            const { data: business, error } = await supabase
                .from('businesses')
                .select('name')
                .eq('owner_id', user.id)
                .single();

            if (error || !business) {
                // No business found -> Redirect to Onboarding
                router.push('/dashboard/onboarding');
            } else {
                setBusinessName(business.name);
                setLoading(false);
            }
        }

        checkBusiness();
    }, [router]);

    if (loading) return <div className="p-8">Loading dashboard...</div>;

    return (
        <div>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Overview</h1>
                    <p className={styles.subtitle}>Welcome back, {businessName}. Here's what's happening.</p>
                </div>
                <div className={styles.actions}>
                    <button className="btn btn-outline">Share Shop</button>
                    <button className="btn btn-primary">Create Post</button>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <h3>Total Revenue</h3>
                    <p className={styles.statValue}>$0.00</p>
                    <span className={styles.statTrend}>+0% from last month</span>
                </div>
                <div className={styles.statCard}>
                    <h3>Orders</h3>
                    <p className={styles.statValue}>0</p>
                    <span className={styles.statTrend}>No orders yet</span>
                </div>
                <div className={styles.statCard}>
                    <h3>Store Views</h3>
                    <p className={styles.statValue}>0</p>
                    <span className={styles.statTrend}>Just started</span>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Recent Orders</h2>
                <div className={styles.recentOrders}>
                    <p style={{ color: 'hsl(var(--muted-foreground))', padding: '1rem' }}>
                        No orders found. Share your link to get started!
                    </p>
                </div>
            </div>
        </div>
    );
}
