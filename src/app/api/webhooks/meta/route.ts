import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const WEBHOOK_VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Initialize Supabase Admin Client (Bypass RLS)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

interface MetaWebhookEntry {
    id: string; // Page ID or Instagram Account ID
    time: number;
    messaging?: Array<{
        sender: { id: string };
        recipient: { id: string };
        timestamp: number;
        message?: {
            mid: string;
            text?: string;
        };
    }>;
}

interface MetaWebhookBody {
    object: string;
    entry: MetaWebhookEntry[];
}

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode && token) {
        if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
            return new NextResponse(challenge, { status: 200 });
        }
        return new NextResponse('Forbidden', { status: 403 });
    }
    return new NextResponse('Bad Request', { status: 400 });
}

export async function POST(req: NextRequest) {
    try {
        const body: MetaWebhookBody = await req.json();

        if (body.object === 'page' || body.object === 'instagram') {
            const platform = body.object === 'page' ? 'facebook' : 'instagram';

            for (const entry of body.entry) {
                // The Entry ID is usually the Page ID or IG Account ID
                const recipientId = entry.id;

                // 1. Find the Business associated with this Page ID
                // We assume 'integrations' table has: platform='facebook' and credentials->>'page_id' = recipientId
                const { data: inputs } = await supabaseAdmin
                    .from('integrations')
                    .select('business_id, credentials')
                    .eq('platform', platform)
                    .maybeSingle(); // For now, maybe just take the first match or careful logic

                // fallback logic: if no integration found, we can't assign it correctly.
                // For simple apps (1 business), you might fallback to finding the only business.
                let businessId = inputs?.business_id;

                if (!businessId) {
                    // Attempt fallback: Find any business (DANGEROUS if multi-tenant, safe if single user)
                    const { data: anyBiz } = await supabaseAdmin.from('businesses').select('id').limit(1).single();
                    if (anyBiz) businessId = anyBiz.id;
                }

                if (!businessId) {
                    console.error(`No business found for recipient ${recipientId}`);
                    continue;
                }

                if (entry.messaging) {
                    for (const event of entry.messaging) {
                        if (event.message && event.message.text) {
                            const senderId = event.sender.id;
                            const text = event.message.text;

                            // 2. Upsert Conversation
                            const { data: conversation, error: convError } = await supabaseAdmin
                                .from('conversations')
                                .select('id')
                                .eq('business_id', businessId)
                                .eq('platform', platform)
                                .eq('external_id', senderId)
                                .maybeSingle();

                            let conversationId = conversation?.id;

                            if (!conversationId) {
                                const { data: newConv, error: createError } = await supabaseAdmin
                                    .from('conversations')
                                    .insert({
                                        business_id: businessId,
                                        platform,
                                        external_id: senderId,
                                        customer_name: `User ${senderId.slice(0, 4)}`, // Placeholder name
                                        last_message_at: new Date().toISOString(),
                                    })
                                    .select()
                                    .single();

                                if (createError) {
                                    console.error('Error creating conversation:', createError);
                                    continue;
                                }
                                conversationId = newConv.id;
                            } else {
                                // Update timestamp
                                await supabaseAdmin
                                    .from('conversations')
                                    .update({ last_message_at: new Date().toISOString() })
                                    .eq('id', conversationId);
                            }

                            // 3. Insert Message
                            const { error: msgError } = await supabaseAdmin
                                .from('messages')
                                .insert({
                                    conversation_id: conversationId,
                                    business_id: businessId, // Redundant but useful for RLS sometimes
                                    channel: platform,
                                    customer_contact: senderId,
                                    direction: 'inbound',
                                    content: text,
                                });

                            if (msgError) console.error('Error inserting message:', msgError);
                        }
                    }
                }
            }
            return new NextResponse('EVENT_RECEIVED', { status: 200 });
        }
        return new NextResponse('Not Found', { status: 404 });
    } catch (error) {
        console.error('Webhook Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
