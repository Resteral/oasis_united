import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Uplink Failed: Unauthorized operational context.' }, { status: 401 });
        }

        const body = await req.json();
        const { name, category, description, townId, slug, imageUrl, theme } = body;

        // Validation for high-fidelity registration
        if (!name || !category || !slug || !townId) {
            return NextResponse.json({ error: 'Protocol Violation: Identity, Classification, and Hub must be established.' }, { status: 400 });
        }

        // 1. Check for existing node to prevent duplication conflicts
        const { data: existingBizs } = await supabase
            .from('businesses')
            .select('id')
            .eq('owner_id', user.id)
            .limit(1);

        if (existingBizs && existingBizs.length > 0) {
            return NextResponse.json({ error: 'Conflict Detected: Identity node already active on this uplink.' }, { status: 409 });
        }

        // 2. Provision the business node with slug collision retries
        let business = null;
        let bizError = null;
        let finalSlug = slug;
        const maxRetries = 3;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            if (attempt > 0) {
                const baseSlug = slug.includes('-') ? slug.substring(0, slug.lastIndexOf('-')) : slug;
                const uniqueSuffix = Math.random().toString(36).substring(2, 6);
                finalSlug = `${baseSlug}-${uniqueSuffix}`;
            }

            const { data, error } = await supabase
                .from('businesses')
                .insert({
                    owner_id: user.id,
                    slug: finalSlug,
                    name,
                    category,
                    description,
                    town_id: townId,
                    image_url: imageUrl || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1000&auto=format&fit=crop',
                    theme: theme || { primaryColor: '#4F46E5', backgroundColor: '#0a0a0b' }
                })
                .select()
                .single();

            if (!error) {
                business = data;
                bizError = null;
                break;
            }

            bizError = error;
            if (error.code !== '23505') {
                break;
            }
            console.warn(`Slug collision detected for '${finalSlug}', retrying with new suffix...`);
        }

        if (bizError) {
            console.error('Error creating business:', bizError);
            if (bizError.code === '23505') {
                return NextResponse.json({ error: 'Identity Conflict: Slug/URL already claimed in the regional matrix.' }, { status: 400 });
            }
            return NextResponse.json({ error: `Registry Error: ${bizError.message}` }, { status: 500 });
        }

        // 3. Update user role to 'business' in the global lattice
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: 'business' })
            .eq('id', user.id);

        if (profileError) {
            console.error('Error updating profile role:', profileError);
            // We proceed as business is created, but log for audit.
        }

        return NextResponse.json({ 
            success: true, 
            business,
            message: 'Uplink Established: Business node provisioned successfully.' 
        });
    } catch (err: any) {
        console.error('Unexpected Protocol Error:', err);
        return NextResponse.json({ error: `System Exception: ${err.message}` }, { status: 500 });
    }
}
