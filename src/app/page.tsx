import { supabase } from '@/lib/supabase';
import HomeClient from './HomeClient';

export default async function Home() {
  // Fetch initial businesses on the server for stable hydration
  const { data: initialBusinesses } = await supabase
    .from('businesses')
    .select('*')
    .limit(4);

  return (
    <HomeClient initialBusinesses={initialBusinesses || []} />
  );
}
