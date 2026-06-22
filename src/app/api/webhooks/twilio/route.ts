import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { runCustomerChatbot } from '@/app/api/ai/chatbot/route';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const from = formData.get('From') as string;
        const body = formData.get('Body') as string;
        const to = formData.get('To') as string;

        if (!from || !body) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        console.log(`Received SMS from ${from} to ${to}: ${body}`);

        // 1. Identify Business via integrations Twilio Phone
        let { data: business } = await supabase
            .from('businesses')
            .select('id, name')
            .contains('integrations', { twilio: { phone: to } })
            .single();

        if (!business) {
            // Fallback to first business in dev/sandbox if no matching phone number found
            console.log(`No business matching SMS receiver number ${to}, using default fallback.`);
            const { data: defaultBiz } = await supabase.from('businesses').select('id, name').limit(1).single();
            business = defaultBiz;
        }

        if (business) {
            // 2. Fetch last 5 messages from this customer to feed as context history
            const { data: historyMessages } = await supabase
                .from('messages')
                .select('content, direction')
                .eq('business_id', business.id)
                .eq('customer_contact', from)
                .order('created_at', { ascending: false })
                .limit(5);

            // Format history messages for OpenAI: { role: 'user' | 'assistant', content: '...' }
            // Note: Since they are queried in descending order (newest first), we reverse them.
            const history = (historyMessages || [])
                .reverse()
                .map((msg: any) => ({
                    role: msg.direction === 'inbound' ? 'user' : 'assistant',
                    content: msg.content
                }));

            // 3. Log Inbound SMS in messages table
            await supabase.from('messages').insert({
                business_id: business.id,
                customer_contact: from,
                channel: 'sms',
                direction: 'inbound',
                content: body
            });

            // 4. Run AI Customer Chatbot Engine
            const chatbotResult = await runCustomerChatbot(
                business.id,
                from,
                body,
                history
            );

            const reply = chatbotResult.reply;

            // 5. Log Outbound SMS reply in messages table
            await supabase.from('messages').insert({
                business_id: business.id,
                customer_contact: from,
                channel: 'sms',
                direction: 'outbound',
                content: reply
            });

            // 6. Return TwiML XML response for Twilio to send to user
            return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>${reply}</Message>
</Response>`, { headers: { 'Content-Type': 'text/xml' } });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Twilio Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
