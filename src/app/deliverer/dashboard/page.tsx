import { Metadata } from 'next';
import DelivererDashboardClient from './DelivererDashboardClient';

export const metadata: Metadata = {
    title: 'Deliverer Dashboard | Oasis United',
    description: 'Manage your towns, routes, and community delivery operations.',
};

export default function DelivererDashboardPage() {
    return (
        <DelivererDashboardClient />
    );
}
