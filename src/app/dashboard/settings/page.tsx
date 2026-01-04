"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [businessId, setBusinessId] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [twilioPhone, setTwilioPhone] = useState('');
    const [instagramHandle, setInstagramHandle] = useState('');
    const [twilioConnected, setTwilioConnected] = useState(false);
    const [instagramConnected, setInstagramConnected] = useState(false);

    useEffect(() => {
        async function fetchSettings() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data: business } = await supabase
                .from('businesses')
                .select('*')
                .eq('owner_id', user.id)
                .single();

            if (business) {
                setBusinessId(business.id);
                setName(business.name);
                setLocation(business.location || '');

                // Parse integrations
                const integr = business.integrations || {};
                if (integr.twilio) {
                    setTwilioPhone(integr.twilio.phone || '');
                    setTwilioConnected(integr.twilio.connected);
                }
                if (integr.instagram) {
                    setInstagramHandle(integr.instagram.handle || '');
                    setInstagramConnected(integr.instagram.connected);
                }
            }
            setLoading(false);
        }
        fetchSettings();
    }, [router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const updates = {
            name,
            location,
            integrations: {
                twilio: { phone: twilioPhone, connected: !!twilioPhone },
                instagram: { handle: instagramHandle, connected: !!instagramHandle }
            },
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
            .from('businesses')
            .update(updates)
            .eq('id', businessId);

        if (error) {
            alert('Error updating settings: ' + error.message);
        } else {
            // Update local state to reflect "Connected" status immediately
            setTwilioConnected(!!twilioPhone);
            setInstagramConnected(!!instagramHandle);
            alert('Settings saved successfully!');
        }
        setSaving(false);
    };

    if (loading) return <div>Loading settings...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem', border: '1px solid #eee', borderRadius: '8px' }}>
            <h1 style={{ marginBottom: '2rem' }}>Business Settings</h1>

            <form onSubmit={handleSave}>
                {/* General Settings */}
                <div style={{ marginBottom: '2rem' }}>
                    <h2>General Information</h2>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Business Name</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="input"
                            style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Location / Address</label>
                        <input
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            className="input"
                            placeholder="e.g. 123 Main St, New York, NY"
                            style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>
                </div>

                <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #eee' }} />

                {/* Integrations */}
                <div style={{ marginBottom: '2rem' }}>
                    <h2>Channels & Integrations</h2>
                    <p style={{ color: '#666', marginBottom: '1.5rem' }}>Connect your external channels to receive orders and messages directly in your dashboard.</p>

                    {/* Twilio Section */}
                    <div style={{ padding: '1.5rem', border: '1px solid #e0f2f1', borderRadius: '8px', marginBottom: '1rem', backgroundColor: '#fcfdfd' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, color: '#00695c' }}>💬 SMS (Twilio)</h3>
                            <span style={{
                                padding: '4px 8px', borderRadius: '12px', fontSize: '0.8em',
                                backgroundColor: twilioConnected ? '#c8e6c9' : '#eceff1',
                                color: twilioConnected ? '#2e7d32' : '#78909c'
                            }}>
                                {twilioConnected ? 'CONNECTED' : 'NOT CONNECTED'}
                            </span>
                        </div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9em' }}>Twilio Phone Number</label>
                        <input
                            value={twilioPhone}
                            onChange={e => {
                                setTwilioConnected(false);
                                setTwilioPhone(e.target.value);
                            }} // Reset connected status on edit until saved
                            placeholder="+1 (555) 123-4567"
                            style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                        <p style={{ fontSize: '0.8em', color: '#999', marginTop: '0.5rem' }}>Enter the phone number purchased in your Twilio account.</p>
                    </div>

                    {/* Instagram Section */}
                    <div style={{ padding: '1.5rem', border: '1px solid #fce4ec', borderRadius: '8px', marginBottom: '1rem', backgroundColor: '#fdfbfb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0, color: '#880e4f' }}>📸 Instagram</h3>
                            <span style={{
                                padding: '4px 8px', borderRadius: '12px', fontSize: '0.8em',
                                backgroundColor: instagramConnected ? '#c8e6c9' : '#eceff1',
                                color: instagramConnected ? '#2e7d32' : '#78909c'
                            }}>
                                {instagramConnected ? 'CONNECTED' : 'NOT CONNECTED'}
                            </span>
                        </div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9em' }}>Instagram Handle</label>
                        <input
                            value={instagramHandle}
                            onChange={e => {
                                setInstagramConnected(false);
                                setInstagramHandle(e.target.value);
                            }}
                            placeholder="@yourbusiness"
                            style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                        <p style={{ fontSize: '0.8em', color: '#999', marginTop: '0.5rem' }}>We'll use this to match direct messages from Instagram.</p>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="submit"
                        disabled={saving}
                        style={{
                            padding: '1rem 2rem',
                            backgroundColor: '#222',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            opacity: saving ? 0.7 : 1
                        }}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
