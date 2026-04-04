import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 🕵️ Discovery Mode: Detect Zip Codes (5-digit pattern)
    const isZip = query && /^\d{5}$/.test(query);

    if (!query && !category) {
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

        return NextResponse.json({
            featured: {
                businesses: featuredBusinesses || [],
                products: featuredProducts || []
            }
        });
    }

    const { data: products } = await supabase
        .from('products')
        .select('*, businesses!inner(*)')
        .or(query ? `name.ilike.%${query}%,category.ilike.%${query}%,businesses.location.ilike.%${query}%` : 'category.not.is.null')
        .filter('category', category && category !== 'All' ? 'ilike' : 'not.is.null', `%${category}%`)
        .limit(limit);

    const businessIdsFromProducts = Array.from(new Set((products || []).map(p => p.business_id)));

    const { data: businesses } = await supabase
        .from('businesses')
        .select('*')
        .or(query ? `name.ilike.%${query}%,location.ilike.%${query}%,category.ilike.%${query}%` : 'category.not.is.null')
        .filter('category', category && category !== 'All' ? 'ilike' : 'not.is.null', `%${category}%`)
        .limit(limit);

    return NextResponse.json({
        success: true,
        is_zip_search: isZip,
        results: {
            products: products || [],
            businesses: businesses || []
        }
    });
}
