import { createClient } from '@/lib/supabase/server';
import ShopClient from './ShopClient';

export default async function ShopPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { id } = params;

    // Fetch business by slug (or id)
    // We try slug first as it's prettier
    let { data: business } = await supabase
        .from('businesses')
        .select('*')
        .eq('slug', id)
        .single();

    // If not found by slug, try ID (UUID)
    if (!business) {
        const { data: businessById } = await supabase
            .from('businesses')
            .select('*')
            .eq('id', id)
            .single();
        business = businessById;
    }

    if (!business) {
        return <div className="p-8 text-center">Business not found</div>;
    }

    // Fetch products
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', business.id);

    // Fetch posts
    const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false });

    return (
        <ShopClient business={business} products={products || []} posts={posts || []} />
    );
}
