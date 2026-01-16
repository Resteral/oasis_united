'use client';

import { useState } from 'react';

type Integration = {
    id: string;
    platform: 'instagram' | 'facebook' | 'whatsapp' | 'sms';
    name: string;
    connected: boolean;
    icon: string;
};

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState<Integration[]>([
        { id: '1', platform: 'instagram', name: 'Instagram', connected: false, icon: '📸' },
        { id: '2', platform: 'facebook', name: 'Facebook', connected: false, icon: '📘' },
        { id: '3', platform: 'whatsapp', name: 'WhatsApp', connected: false, icon: '💬' },
        { id: '4', platform: 'sms', name: 'SMS (Twilio)', connected: true, icon: '📱' },
    ]);

    const toggleConnection = (id: string) => {
        // In a real app, this would trigger an OAuth flow or API key modal
        setIntegrations(integrations.map(int =>
            int.id === id ? { ...int, connected: !int.connected } : int
        ));
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Integrations</h1>
            <p className="text-gray-500 mb-8">Connect your favorite platforms to receive orders and appointments directly.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {integrations.map((integration) => (
                    <div key={integration.id} className="bg-white border border-gray-200 rounded-xl p-6 flex items-start justify-between shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                                {integration.icon}
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                                <p className="text-sm text-gray-500">
                                    {integration.connected ? 'Connected and active' : 'Not connected'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => toggleConnection(integration.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${integration.connected
                                    ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                                }`}
                        >
                            {integration.connected ? 'Disconnect' : 'Connect'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
