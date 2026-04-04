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
        const { name, category, description, townId, slug, imageUrl, theme } = body;

        if (!name || !category || !slug || !townId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Create the business
        const { data: business, error: bizError } = await supabase
            .from('businesses')
            .insert({
                owner_id: user.id,
                slug,
                name,
                category,
                description,
                town_id: townId,
                image_url: imageUrl,
                theme: theme || { primaryColor: '#4F46E5', backgroundColor: '#0a0a0b' }
            })
            .select()
            .single();

        if (bizError) {
            console.error('Error creating business:', bizError);
            return NextResponse.json({ error: bizError.message }, { status: 500 });
        }

        // 2. Update user role to 'business'
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: 'business' })
            .eq('id', user.id);

        if (profileError) {
            console.error('Error updating profile role:', profileError);
            // We don't fail the whole request because the business was created, 
            // but we might want to log this or notify the user.
        }

        return NextResponse.json({ business });
    } catch (err: any) {
        console.error('Unexpected error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
