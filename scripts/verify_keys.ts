import 'dotenv/config';

const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (key) {
    const parts = key.split('.');
    if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        console.log("Supabase Project Ref from JWT:", payload.ref);
    } else {
        console.log("Invalid key format");
    }
} else {
    console.log("No key found");
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (url) {
    const refFromUrl = url.replace('https://', '').split('.')[0];
    console.log("Supabase Project Ref from URL:", refFromUrl);
}
