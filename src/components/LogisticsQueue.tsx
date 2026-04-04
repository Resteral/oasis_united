"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LogisticsQueue() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrders() {
            const { data } = await supabase
                .from('orders')
                .select('*, businesses(name, location)')
                .eq('type', 'shipping')
                .is('deliverer_id', null)
                .order('created_at', { ascending: false });

            if (data) setOrders(data);
            setLoading(false);
        }

        fetchOrders();

        const channel = supabase
            .channel('logistics_queue')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const handleClaim = async (orderId: string) => {
        const delivererId = 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321'; // Mock deliverer (Local Dave)
        
        try {
            const { error } = await supabase.rpc('claim_order', {
                p_order_id: orderId,
                p_deliverer_id: delivererId
            });

            if (error) throw error;
            alert("Route claimed! The package is yours to fulfill.");
        } catch (err: any) {
            alert("Oops: " + err.message);
        }
    };

    if (loading) return <div className="text-[10px] font-black uppercase text-white/20 animate-pulse">Scanning routes...</div>;

    return (
        <div className="space-y-4">
            {orders.length > 0 ? orders.map((order) => (
                <div key={order.id} className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-3 group hover:border-amber-400/20 transition-all">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                        <span>{order.businesses?.name} → {order.address?.split(',')[0]}</span>
                        <span className="text-amber-500">${order.total}</span>
                    </div>
                    <button 
                        onClick={() => handleClaim(order.id)}
                        className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-400 hover:text-black transition-all"
                    >
                        Claim Transit
                    </button>
                </div>
            )) : (
                <div className="py-12 text-center opacity-20">
                    <p className="text-[10px] font-black uppercase tracking-widest">No pending orders in current routes</p>
                </div>
            )}
        </div>
    );
}
