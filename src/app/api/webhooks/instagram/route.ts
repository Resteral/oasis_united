import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === process.env.INSTAGRAM_VERIFY_TOKEN) {
        return new NextResponse(challenge, { status: 200 });
    }
    return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request: NextRequest) {
    // Webhooks need Service Role to bypass RLS (no user session)
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const body = await request.json();

    console.log('Received Instagram Webhook:', JSON.stringify(body, null, 2));

    try {
        if (body.object === 'instagram') {
            for (const entry of body.entry) {
                // The 'id' here is usually the Page ID / Business Account ID
                const pageId = entry.id;
                const messaging = entry.messaging;

                for (const event of messaging) {
                    const senderId = event.sender.id;
                    const message = event.message;

                    if (message && message.text) {
                        // 1. Find the business connected to this Instagram Page ID
                        const { data: business } = await supabase
                            .from('businesses')
                            .select('id, name, category, integrations')
                            .contains('integrations', { instagram: { id: pageId } })
                            .single();

                        if (business) {
                            // 2. Insert Message into Database
                            await supabase.from('messages').insert({
                                business_id: business.id,
                                customer_contact: senderId,
                                channel: 'instagram',
                                direction: 'inbound',
                                content: message.text,
                                is_read: false
                            });

                            // 3. AI / Context-Aware Logic
                            // In a real app, we would send this context to OpenAI/LLM
                            let replyText = "";
                            const lowerMsg = message.text.toLowerCase();
                            const category = (business.category || 'retail').toLowerCase();

                            // Simple heuristic "AI" for demonstration
                            if (category.includes('restaurant') || category.includes('food') || category.includes('cafe')) {
                                if (lowerMsg.includes('order') || lowerMsg.includes('menu')) {
                                    replyText = `Yum! 🍔 We'd love to feed you. What are you craving today? You can see our menu at the link in bio!`;
                                } else if (lowerMsg.includes('hour') || lowerMsg.includes('open')) {
                                    replyText = "We are open from 9 AM to 9 PM! Come by for a bite! 🥐";
                                } else {
                                    replyText = `Hi there! Welcome to ${business.name}. How can we make your day delicious? 🥗`;
                                }
                            } else if (category.includes('gym') || category.includes('fitness')) {
                                if (lowerMsg.includes('join') || lowerMsg.includes('price')) {
                                    replyText = "Ready to crush your goals? 💪 Memberships start at $29/mo. Want a free pass?";
                                } else {
                                    replyText = `Hey! Let's get moving! 🏋️‍♂️ How can we help you with your fitness journey at ${business.name}?`;
                                }
                            } else {
                                // Default Retail / General
                                if (lowerMsg.includes('price') || lowerMsg.includes('cost')) {
                                    replyText = "Our prices are very competitive! Check our website for the latest deals. 🛍️";
                                } else {
                                    replyText = `Hello! Thanks for messaging ${business.name}. We're here to help you find exactly what you need. ✨`;
                                }
                            }

                            // 4. (Optional) Auto-Reply Simulation
                            // Since we don't have the Meta Graph API key to actually send,
                            // we will simulate the "Sent" message being stored in our DB so it appears in the inbox.
                            if (replyText) {
                                await supabase.from('messages').insert({
                                    business_id: business.id,
                                    customer_contact: senderId,
                                    channel: 'instagram',
                                    direction: 'outbound',
                                    content: replyText,
                                    created_at: new Date(Date.now() + 1000).toISOString() // Slight delay
                                });
                                console.log(`[Mock AI Reply] To ${senderId}: ${replyText}`);
                            }
                        } else {
                            console.warn(`No business found for Instagram ID: ${pageId}`);
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error processing webhook:', error);
    }

    return new NextResponse('EVENT_RECEIVED', { status: 200 });
}
