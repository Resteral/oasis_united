import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { openai } from '@/lib/openai';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { businessId, message, history } = body;

        if (!businessId || !message) {
            return NextResponse.json({ error: 'Missing required chat arguments' }, { status: 400 });
        }

        // 1. Fetch Business details for context
        const { data: business } = await supabase
            .from('businesses')
            .select('name, category, description')
            .eq('id', businessId)
            .single();

        const businessName = business?.name || 'Oasis Partner';

        // 2. Fetch active products list for price updates
        const { data: products } = await supabase
            .from('products')
            .select('id, name, price, stock')
            .eq('business_id', businessId);

        const productList = (products || [])
            .map(p => `- [ID: ${p.id}] ${p.name}: $${p.price} (Stock: ${p.stock})`)
            .join('\n');

        const systemPrompt = `You are the Oasis AI Merchant Copilot for "${businessName}". Your job is to help the business owner manage their storefront node.
You can query orders, review financial metrics, update product prices, and edit store details.

PRODUCTS CURRENTLY LISTED:
${productList}

INSTRUCTIONS:
1. Provide helpful, precise, and professional updates.
2. If they ask about sales, revenue, or orders, call the appropriate tool.
3. If they ask to update a product price or store details, search the product list above, extract the ID, and call the correct tool.
4. Keep replies friendly, concise, and focused on helping them manage their store.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...(history || []).slice(-10),
            { role: 'user', content: message }
        ];

        // 3. Define Tools
        const tools: any[] = [
            {
                type: 'function',
                function: {
                    name: 'get_revenue_stats',
                    description: 'Retrieves revenue statistics, completed order count, and average order value.',
                    parameters: { type: 'object', properties: {} }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'get_pending_orders',
                    description: 'Retrieves currently active pending orders for review.',
                    parameters: { type: 'object', properties: {} }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'update_product_price',
                    description: 'Updates the price of a specific product ID.',
                    parameters: {
                        type: 'object',
                        properties: {
                            product_id: { type: 'string', description: 'The UUID of the product.' },
                            new_price: { type: 'number', description: 'The new decimal price.' }
                        },
                        required: ['product_id', 'new_price']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'update_store_description',
                    description: 'Modifies the store description text in the registry.',
                    parameters: {
                        type: 'object',
                        properties: {
                            description: { type: 'string', description: 'The new description copy.' }
                        },
                        required: ['description']
                    }
                }
            }
        ];

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages as any,
            tools: tools,
            tool_choice: 'auto'
        });

        const choice = response.choices[0];
        const replyMessage = choice.message;

        if (replyMessage.tool_calls && replyMessage.tool_calls.length > 0) {
            const toolCall = replyMessage.tool_calls[0] as any;
            const name = toolCall.function?.name;
            const args = JSON.parse(toolCall.function?.arguments || '{}');

            if (name === 'get_revenue_stats') {
                const { data: orders } = await supabase
                    .from('orders')
                    .select('total')
                    .eq('business_id', businessId)
                    .eq('status', 'completed');

                const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
                const count = orders?.length || 0;
                const avg = count > 0 ? (totalRevenue / count) : 0;

                const aiResponse = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: `Summarize the financial status: Total completed orders: ${count}, Total revenue: $${totalRevenue.toFixed(2)}, Average order value: $${avg.toFixed(2)}.` },
                        { role: 'user', content: message }
                    ]
                });

                return NextResponse.json({ reply: aiResponse.choices[0].message.content });
            }

            if (name === 'get_pending_orders') {
                const { data: pending } = await supabase
                    .from('orders')
                    .select('id, customer_name, total, created_at')
                    .eq('business_id', businessId)
                    .eq('status', 'pending');

                const summary = (pending || [])
                    .map(o => `- Order #${o.id.slice(0, 5)} from ${o.customer_name} for $${o.total}`)
                    .join('\n') || 'No active pending orders currently.';

                const aiResponse = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: `Summarize the pending orders checklist for the owner:\n${summary}` },
                        { role: 'user', content: message }
                    ]
                });

                return NextResponse.json({ reply: aiResponse.choices[0].message.content });
            }

            if (name === 'update_product_price') {
                const { error } = await supabase
                    .from('products')
                    .update({ price: args.new_price })
                    .eq('id', args.product_id)
                    .eq('business_id', businessId);

                if (error) throw error;
                return NextResponse.json({ reply: `✅ Price updated successfully! Product ID: #${args.product_id.slice(0, 5)} has been updated to $${args.new_price.toFixed(2)}.` });
            }

            if (name === 'update_store_description') {
                const { error } = await supabase
                    .from('businesses')
                    .update({ description: args.description })
                    .eq('id', businessId);

                if (error) throw error;
                return NextResponse.json({ reply: `✅ Store directive description updated successfully to: "${args.description}"` });
            }
        }

        return NextResponse.json({ reply: replyMessage.content || "Copilot offline. Please verify inputs." });

    } catch (error: any) {
        console.error('Merchant Copilot API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
