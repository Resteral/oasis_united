import HubClient from './HubClient';

export const metadata = {
  title: 'Oasis Hub | Command Center',
  description: 'The central hub for all Oasis management and dispatch operations.',
};

export default function HubPage() {
  return <HubClient />;
}
