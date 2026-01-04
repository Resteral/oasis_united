import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
// import { openai } from '@/lib/openai'; // To be implemented

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const from = formData.get('From') as string;
        const body = formData.get('Body') as string;

        if (!from || !body) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        console.log(`Received SMS from ${from}: ${body}`);

        // 1. Identify Business (In a real app, mapping Phone -> Business)
        // For prototype, we'll pick the first business found or a specific one.
        const { data: business } = await supabase
            .from('businesses')
            .select('id, name')
            .limit(1)
            .single();

        if (business) {
            // 2. Log Message
            await supabase.from('messages').insert({
                business_id: business.id,
                customer_contact: from,
                channel: 'sms',
                direction: 'inbound',
                content: body
            });

            // 3. Simple Auto-Reply (Placeholder for AI)
            const reply = `Thanks for texting ${business.name}! We received: "${body}". (This is an automated reply)`;

            // In a real app, we would send this reply back via Twilio API
            // await twilioClient.messages.create({ to: from, from: ..., body: reply });

            // For webhook response (Twilio expects TwiML usually, but we can just return 200 OK)
            return new NextResponse(`
                <Response>
                    <Message>${reply}</Message>
                </Response>
            `, { headers: { 'Content-Type': 'text/xml' } });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Twilio Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
