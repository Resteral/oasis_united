"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Order {
    id: string;
    customer_name: string;
    customer_contact: string | null;
    total: number;
    status: string;
    channel: string;
    created_at: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrders() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get business ID first? Or just use the policy.
            // Policy allows owner to view, so simple select works if logged in.
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setOrders(data);
            }
            setLoading(false);
        }
        fetchOrders();
    }, []);

    if (loading) return <div>Loading orders...</div>;

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Orders</h1>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
                        <th style={{ padding: '0.5rem' }}>Date</th>
                        <th style={{ padding: '0.5rem' }}>Customer</th>
                        <th style={{ padding: '0.5rem' }}>Channel</th>
                        <th style={{ padding: '0.5rem' }}>Total</th>
                        <th style={{ padding: '0.5rem' }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '0.5rem' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                            <td style={{ padding: '0.5rem' }}>
                                {order.customer_name || 'Guest'}
                                {order.customer_contact && <div style={{ fontSize: '0.8em', color: '#666' }}>{order.customer_contact}</div>}
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                                <span style={{
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.8em',
                                    backgroundColor: order.channel === 'sms' ? '#e0f2f1' :
                                        order.channel === 'instagram' ? '#fce4ec' : '#f5f5f5',
                                    color: order.channel === 'sms' ? '#00695c' :
                                        order.channel === 'instagram' ? '#880e4f' : '#333'
                                }}>
                                    {order.channel?.toUpperCase() || 'WEB'}
                                </span>
                            </td>
                            <td style={{ padding: '0.5rem' }}>${order.total}</td>
                            <td style={{ padding: '0.5rem' }}>{order.status}</td>
                        </tr>
                    ))}
                    {orders.length === 0 && (
                        <tr>
                            <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No orders found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
