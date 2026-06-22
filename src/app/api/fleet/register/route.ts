import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { full_name, email, phone, type, details } = body;

        if (!full_name || !email || !phone || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('fleet_registrations')
            .insert({
                user_id: user.id,
                full_name,
                email,
                phone,
                type,
                details: details || {},
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating fleet registration:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ registration: data });
    } catch (err: any) {
        console.error('Unexpected error in fleet registration:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
