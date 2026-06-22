import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');
        const action = searchParams.get('action') || 'get-orders';

        if (!token) {
            return NextResponse.json({ error: 'Device authentication token required' }, { status: 401 });
        }

        // 1. Authenticate Business via ESP32 Token
        // Search integrations JSONB field for matching token
        const { data: business, error: bizError } = await supabase
            .from('businesses')
            .select('id, name')
            .eq('integrations->esp32->>token', token)
            .single();

        if (bizError || !business) {
            return NextResponse.json({ error: 'Invalid device token' }, { status: 403 });
        }

        // 2. Process Actions
        if (action === 'get-orders') {
            // Fetch pending orders for this business
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('id, customer_name, total, items, status, created_at')
                .eq('business_id', business.id)
                .eq('status', 'pending')
                .order('created_at', { ascending: true });

            if (ordersError) throw ordersError;

            // Simplify structure for lightweight ESP32 consumption
            const simplifiedOrders = (orders || []).map(order => ({
                id: order.id.slice(0, 8), // Short UUID
                full_id: order.id,
                customer_name: order.customer_name || 'Anonymous Guest',
                total: Number(order.total),
                status: order.status,
                created_at: order.created_at,
                items: (order.items && Array.isArray(order.items)) ? order.items.map((i: any) => ({
                    name: i.name,
                    quantity: Number(i.quantity),
                    price: Number(i.price)
                })) : []
            }));

            return NextResponse.json(simplifiedOrders);
        }

        if (action === 'get-products') {
            // Fetch products for lightweight display on device LCD
            const { data: products, error: productsError } = await supabase
                .from('products')
                .select('id, name, price, stock, category')
                .eq('business_id', business.id);

            if (productsError) throw productsError;

            return NextResponse.json(products);
        }

        return NextResponse.json({ error: 'Unsupported action request' }, { status: 400 });

    } catch (error: any) {
        console.error('ESP32 GET API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');
        const body = await req.json();
        const { action, orderId, status, items, total, customerName } = body;

        if (!token) {
            return NextResponse.json({ error: 'Device authentication token required' }, { status: 401 });
        }

        // 1. Authenticate Business via ESP32 Token
        const { data: business, error: bizError } = await supabase
            .from('businesses')
            .select('id, name')
            .eq('integrations->esp32->>token', token)
            .single();

        if (bizError || !business) {
            return NextResponse.json({ error: 'Invalid device token' }, { status: 403 });
        }

        // 2. Process Actions
        if (action === 'update-order-status') {
            if (!orderId || !status) {
                return NextResponse.json({ error: 'Missing status update variables' }, { status: 400 });
            }

            const { data: updatedOrder, error: updateError } = await supabase
                .from('orders')
                .update({ status: status })
                .eq('id', orderId)
                .eq('business_id', business.id)
                .select()
                .single();

            if (updateError) throw updateError;

            return NextResponse.json({ success: true, order: updatedOrder });
        }

        if (action === 'create-offline-order') {
            if (!items || !total) {
                return NextResponse.json({ error: 'Missing offline order detail inputs' }, { status: 400 });
            }

            const { data: newOrder, error: orderError } = await supabase
                .from('orders')
                .insert({
                    business_id: business.id,
                    customer_name: customerName || 'Physical Counter Sale',
                    items: items,
                    total: total,
                    status: 'completed', // Counter sales are immediately complete
                    channel: 'offline',
                    delivery_status: 'delivered'
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // Decrement Stock
            for (const item of items) {
                try {
                    await supabase.rpc('decrement_stock', {
                        p_product_id: item.id,
                        p_quantity: item.quantity
                    });
                } catch (e) {
                    console.error('Stock decrement failed for offline sale', e);
                }
            }

            return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
        }

        return NextResponse.json({ error: 'Unsupported action request' }, { status: 400 });

    } catch (error: any) {
        console.error('ESP32 POST API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
