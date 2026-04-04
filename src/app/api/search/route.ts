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

    // 1. Search Products
    let productQuery = supabase
        .from('products')
        .select('*, businesses!inner(*)')
        .limit(limit);

    if (query) {
        if (isZip) {
            productQuery = productQuery.ilike('businesses.location', `%${query}%`);
        } else {
            productQuery = productQuery.ilike('name', `%${query}%`);
        }
    }
    if (category && category !== 'All') {
        productQuery = productQuery.ilike('category', `%${category}%`);
    }

    const { data: products } = await productQuery;

    // 2. Extract Business IDs from matching products
    const businessIdsFromProducts = Array.from(new Set((products || []).map(p => p.business_id)));

    // 3. Search Businesses (Direct name match OR sells matching product)
    let businessQuery = supabase
        .from('businesses')
        .select('*')
        .limit(limit);

    if (query) {
        if (isZip) {
            businessQuery = businessQuery.ilike('location', `%${query}%`);
        } else {
            // Priority: Businesses with matching name OR Businesses with matching products
            if (businessIdsFromProducts.length > 0) {
                businessQuery = businessQuery.or(`name.ilike.%${query}%,id.in.(${businessIdsFromProducts.join(',')})`);
            } else {
                businessQuery = businessQuery.ilike('name', `%${query}%`);
            }
        }
    } else if (category && category !== 'All') {
        businessQuery = businessQuery.ilike('category', `%${category}%`);
    }

    const { data: businesses } = await businessQuery;

    return NextResponse.json({
        success: true,
        is_zip_search: isZip,
        results: {
            products: products || [],
            businesses: businesses || []
        }
    });
}
