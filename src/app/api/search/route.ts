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

    let productQuery = supabase
        .from('products')
        .select('*, businesses(id, name, theme, location, logo_url)')
        .limit(limit);

    if (query) {
        if (isZip) {
            // Signal detected as a ZIP location
            productQuery = productQuery.ilike('businesses.location', `%${query}%`);
        } else {
            productQuery = productQuery.ilike('name', `%${query}%`);
        }
    }

    if (category && category !== 'All') {
        productQuery = productQuery.ilike('category', `%${category}%`);
    }

    const { data: products } = await productQuery;

    let businessQuery = supabase
        .from('businesses')
        .select('*')
        .limit(limit);

    if (query) {
        if (isZip) {
            // Priority filtering by Territory Zip Code
            businessQuery = businessQuery.ilike('location', `%${query}%`);
        } else {
            businessQuery = businessQuery.ilike('name', `%${query}%`);
        }
    }

    if (category && category !== 'All') {
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
