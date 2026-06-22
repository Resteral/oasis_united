import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { openai } from '@/lib/openai';

// Helper function that handles the AI Customer Ordering Chatbot flow
// This can be invoked by both the Web Chat API and the Twilio SMS Webhook
export async function runCustomerChatbot(
    businessId: string,
    customerContact: string,
    messageText: string,
    history: any[] = []
) {
    // 1. Fetch Business Details and Products
    const { data: business } = await supabase
        .from('businesses')
        .select('name, category, description')
        .eq('id', businessId)
        .single();

    const { data: products } = await supabase
        .from('products')
        .select('id, name, price, stock, category, description')
        .eq('business_id', businessId);

    const businessName = business?.name || 'Oasis Partner';
    const inventoryContext = (products || [])
        .map(p => `- [ID: ${p.id}] ${p.name} - $${p.price} (${p.stock} in stock) - ${p.description || ''}`)
        .join('\n');

    // 2. Build Chat Messages
    const systemPrompt = `You are the AI Order Assistant for "${businessName}". Your goal is to help customers browse products and place orders.
You have access to the business's current inventory listed below.

INVENTORY:
${inventoryContext}

INSTRUCTIONS:
1. Be polite, friendly, and concise. Keep responses under 2-3 sentences.
2. If the user wants to see what you sell or search for something, help them find products from the inventory.
3. If they want to order, ask for their name, contact details (phone/email), and delivery address (if they want shipping/delivery).
4. Clearly state the prices and calculate totals.
5. When they explicitly confirm they want to checkout and place the order, call the 'place_order' tool.
6. Once the order is placed successfully, summarize the order details and tell them their order is confirmed!

Note: Do not make up products not in the inventory. If stock is 0, let them know it is out of stock.`;

    const messages = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-10), // Limit history to last 10 messages
        { role: 'user', content: messageText }
    ];

    // 3. Tool Definitions
    const tools: any[] = [
        {
            type: 'function',
            function: {
                name: 'place_order',
                description: 'Creates a pending order in the database when the customer confirms checkout.',
                parameters: {
                    type: 'object',
                    properties: {
                        customer_name: { type: 'string', description: 'Full name of the customer.' },
                        customer_contact: { type: 'string', description: 'Phone number or email address.' },
                        items: {
                            type: 'array',
                            description: 'List of items being ordered.',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string', description: 'Product ID.' },
                                    name: { type: 'string', description: 'Product Name.' },
                                    quantity: { type: 'integer', description: 'Quantity ordered.' },
                                    price: { type: 'number', description: 'Price per item.' }
                                },
                                required: ['id', 'name', 'quantity', 'price']
                            }
                        },
                        total: { type: 'number', description: 'Grand total sum of the items.' },
                        type: { type: 'string', enum: ['pickup', 'delivery', 'shipping'], description: 'Fulfillment type.' },
                        address: { type: 'string', description: 'Required for shipping/delivery.' }
                    },
                    required: ['customer_name', 'customer_contact', 'items', 'total', 'type']
                }
            }
        }
    ];

    // 4. Chat Completion Request
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages as any,
        tools: tools,
        tool_choice: 'auto'
    });

    const choice = response.choices[0];
    const replyMessage = choice.message;

    // 5. Handle Tool Call
    if (replyMessage.tool_calls && replyMessage.tool_calls.length > 0) {
        const toolCall = replyMessage.tool_calls[0] as any;
        if (toolCall.function?.name === 'place_order') {
            try {
                const args = JSON.parse(toolCall.function.arguments);
                
                // Invoke local order placement endpoint logic
                // Fetch random distance (similar to normal order route)
                const mockDistance = Math.floor(Math.random() * 400) / 10;

                const { data: order, error: orderError } = await supabase
                    .from('orders')
                    .insert({
                        business_id: businessId,
                        customer_name: args.customer_name,
                        customer_contact: args.customer_contact || customerContact,
                        items: args.items,
                        total: args.total,
                        type: args.type,
                        address: args.address || null,
                        status: 'pending',
                        channel: customerContact.startsWith('+') ? 'sms' : 'web',
                        delivery_status: 'pending',
                        distance_miles: mockDistance
                    })
                    .select()
                    .single();

                if (orderError) throw orderError;

                // Decrement Stock
                for (const item of args.items) {
                    try {
                        await supabase.rpc('decrement_stock', {
                            p_product_id: item.id,
                            p_quantity: item.quantity
                        });
                    } catch (e) {
                        console.error('AI Stock Decrement Error:', e);
                    }
                }

                // Send success message
                return {
                    reply: `🎉 Perfect! Your order has been placed successfully. Order ID: #${order.id.slice(0, 5)}. Total: $${args.total.toFixed(2)}. We will begin preparing it shortly!`,
                    orderPlaced: true,
                    order: order
                };
            } catch (err: any) {
                console.error('AI Tool Call Error:', err);
                return {
                    reply: `I encountered an issue placing your order: ${err.message}. Please try again in a moment.`,
                    error: err.message
                };
            }
        }
    }

    return {
        reply: replyMessage.content || "I'm sorry, I didn't quite catch that. How can I help you?",
        orderPlaced: false
    };
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { businessId, customerContact, message, history } = body;

        if (!businessId || !message) {
            return NextResponse.json({ error: 'Missing required chat arguments' }, { status: 400 });
        }

        const result = await runCustomerChatbot(
            businessId,
            customerContact || 'WebUser',
            message,
            history || []
        );

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Chatbot API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
