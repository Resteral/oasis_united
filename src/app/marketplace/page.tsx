import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import MarketplaceClient from './MarketplaceClient';

export const metadata: Metadata = {
    title: 'Marketplace | Oasis United',
    description: 'Discover premium local independent boutiques and unique treasures.',
};

export default async function MarketplacePage() {
    // 1. Fetch Initial Featured Content (Server-side)
    const { data: featuredBusinesses } = await supabase
        .from('businesses')
        .select('*')
        .eq('is_featured', true)
        .limit(5);

    const { data: featuredProducts } = await supabase
        .from('products')
        .select('*, businesses(name, theme)')
        .eq('is_featured', true)
        .limit(10);

    // 2. Fetch Initial Global Shoutouts (Server-side)
    const { data: globalShoutouts } = await supabase
        .from('shoutouts')
        .select('*, businesses(name, location, logo_url)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(4);

    const initialFeatured = {
        businesses: featuredBusinesses || [],
        products: featuredProducts || []
    };

    return (
        <MarketplaceClient 
            initialFeatured={initialFeatured} 
            initialShoutouts={globalShoutouts || []} 
        />
    );
}
