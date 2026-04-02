import { Metadata } from 'next';
import LocalClient from './LocalClient';

export const metadata: Metadata = {
    title: 'Local Discovery | Oasis United',
    description: 'Explore the closest shops, hardware stores, and restaurants in the Effingham area with real-time pricing.',
};

export default function LocalPage() {
    return <LocalClient />;
}
