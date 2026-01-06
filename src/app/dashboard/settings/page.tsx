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

    // Theme State
    const [primaryColor, setPrimaryColor] = useState('#000000');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');

    // Delivery State
    const [deliveryRadius, setDeliveryRadius] = useState(5);
    const [selfDelivery, setSelfDelivery] = useState(false);
    const [deliveryProviders, setDeliveryProviders] = useState<string[]>([]);
    const [instagramId, setInstagramId] = useState('');
    const [instagramAccessToken, setInstagramAccessToken] = useState('');

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
                    setInstagramId(integr.instagram.id || '');
                    setInstagramAccessToken(integr.instagram.access_token || '');
                    setInstagramConnected(integr.instagram.connected);
                }

                // Parse Theme
                const theme = business.theme || {};
                if (theme.primaryColor) setPrimaryColor(theme.primaryColor);
                if (theme.backgroundColor) setBackgroundColor(theme.backgroundColor);

                // Parse Delivery
                const delivery = business.delivery_settings || {};
                if (delivery.radius) setDeliveryRadius(delivery.radius);
                if (delivery.selfDelivery !== undefined) setSelfDelivery(delivery.selfDelivery);
                if (delivery.providers) setDeliveryProviders(delivery.providers);
                if (delivery.instagram_id) setInstagramId(delivery.instagram_id);
            }
            setLoading(false);
        }
        fetchSettings();
    }, [router]);

    const handleProviderChange = (provider: string) => {
        if (deliveryProviders.includes(provider)) {
            setDeliveryProviders(deliveryProviders.filter(p => p !== provider));
        } else {
            setDeliveryProviders([...deliveryProviders, provider]);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const updates = {
            name,
            location,
            integrations: {
                twilio: { phone: twilioPhone, connected: !!twilioPhone },
                instagram: {
                    handle: instagramHandle,
                    id: instagramId,
                    access_token: instagramAccessToken,
                    connected: !!instagramHandle || !!instagramId
                }
            },
            theme: {
                primaryColor,
                backgroundColor
            },
            delivery_settings: {
                radius: deliveryRadius,
                selfDelivery,
                providers: deliveryProviders,
                instagram_id: instagramId
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

                    {/* Theme Customization */}
                    <h3>Website Customization</h3>
                    <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Primary Color</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="color"
                                    value={primaryColor}
                                    onChange={e => setPrimaryColor(e.target.value)}
                                    style={{ width: '50px', height: '50px', padding: 0, border: 'none', cursor: 'pointer' }}
                                />
                                <span style={{ fontFamily: 'monospace' }}>{primaryColor}</span>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Background Color</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="color"
                                    value={backgroundColor}
                                    onChange={e => setBackgroundColor(e.target.value)}
                                    style={{ width: '50px', height: '50px', padding: 0, border: 'none', cursor: 'pointer' }}
                                />
                                <span style={{ fontFamily: 'monospace' }}>{backgroundColor}</span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Settings */}
                    <div style={{
                        marginTop: '2rem',
                        padding: '1.5rem',
                        border: '1px solid #e3f2fd',
                        borderRadius: '12px',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #f0f4f8', paddingBottom: '1rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>🚚</span>
                            <h3 style={{ margin: 0, color: '#1a237e' }}>Delivery Settings</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>Delivery Radius (Miles)</label>
                                <input
                                    type="number"
                                    value={deliveryRadius}
                                    onChange={e => setDeliveryRadius(Number(e.target.value))}
                                    style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>Instagram Page ID</label>
                                <input
                                    value={instagramId}
                                    onChange={e => setInstagramId(e.target.value)}
                                    placeholder="e.g. 1784140..."
                                    style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '6px' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '500', color: '#333' }}>Delivery Providers</label>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <label style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.8rem 1.2rem', borderRadius: '8px',
                                    border: selfDelivery ? '2px solid #222' : '1px solid #eee',
                                    backgroundColor: selfDelivery ? '#f5f5f5' : '#fff',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={selfDelivery}
                                        onChange={e => setSelfDelivery(e.target.checked)}
                                        style={{ accentColor: '#222' }}
                                    />
                                    <span style={{ fontWeight: 500 }}>In-House Delivery</span>
                                </label>
                                <label style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.8rem 1.2rem', borderRadius: '8px',
                                    border: deliveryProviders.includes('doordash') ? '2px solid #ff3008' : '1px solid #eee',
                                    backgroundColor: deliveryProviders.includes('doordash') ? '#fff5f5' : '#fff',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={deliveryProviders.includes('doordash')}
                                        onChange={() => handleProviderChange('doordash')}
                                        style={{ accentColor: '#ff3008' }}
                                    />
                                    <span style={{ fontWeight: 500, color: '#ff3008' }}>DoorDash</span>
                                </label>
                                <label style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.8rem 1.2rem', borderRadius: '8px',
                                    border: deliveryProviders.includes('ubereats') ? '2px solid #06c167' : '1px solid #eee',
                                    backgroundColor: deliveryProviders.includes('ubereats') ? '#f0fff5' : '#fff',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={deliveryProviders.includes('ubereats')}
                                        onChange={() => handleProviderChange('ubereats')}
                                        style={{ accentColor: '#06c167' }}
                                    />
                                    <span style={{ fontWeight: 500, color: '#06c167' }}>UberEats</span>
                                </label>
                            </div>
                        </div>
                    </div>

                </div>

                <hr style={{ margin: '3rem 0', border: 'none', borderTop: '1px solid #eee' }} />

                {/* Integrations */}
                <div style={{ marginBottom: '2rem' }}>
                    <h2>Channels & Integrations</h2>
                    <p style={{ color: '#666', marginBottom: '1.5rem' }}>Connect your external channels to receive orders and messages directly in your dashboard.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {/* Twilio Section */}
                        <div style={{
                            padding: '1.5rem',
                            border: '1px solid #eee',
                            borderRadius: '12px',
                            backgroundColor: '#fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute', top: 0, left: 0, width: '6px', height: '100%',
                                background: '#f22f46'
                            }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingLeft: '1rem' }}>
                                <h3 style={{ margin: 0, color: '#f22f46', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    💬 SMS (Twilio)
                                </h3>
                                <span style={{
                                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.75em', fontWeight: 'bold',
                                    backgroundColor: twilioConnected ? '#e8f5e9' : '#eceff1',
                                    color: twilioConnected ? '#2e7d32' : '#78909c'
                                }}>
                                    {twilioConnected ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                            </div>
                            <div style={{ paddingLeft: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9em', color: '#555' }}>Twilio Phone Number</label>
                                <input
                                    value={twilioPhone}
                                    onChange={e => {
                                        setTwilioConnected(false);
                                        setTwilioPhone(e.target.value);
                                    }}
                                    placeholder="+1 (555) 123-4567"
                                    style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'monospace' }}
                                />
                                <p style={{ fontSize: '0.85em', color: '#888', marginTop: '0.5rem' }}>Provide your purchased Twilio number for SMS automation.</p>
                            </div>
                        </div>

                        {/* Instagram Section */}
                        <div style={{
                            padding: '1.5rem',
                            border: '1px solid #eee',
                            borderRadius: '12px',
                            backgroundColor: '#fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute', top: 0, left: 0, width: '6px', height: '100%',
                                background: 'linear-gradient(to bottom, #833ab4, #fd1d1d, #fcb045)'
                            }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingLeft: '1rem' }}>
                                <h3 style={{ margin: 0, background: '-webkit-linear-gradient(45deg, #405de6, #5851db, #833ab4, #c13584, #e1306c, #fd1d1d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    📸 Instagram
                                </h3>
                                <span style={{
                                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.75em', fontWeight: 'bold',
                                    backgroundColor: instagramConnected ? '#e8f5e9' : '#eceff1',
                                    color: instagramConnected ? '#2e7d32' : '#78909c'
                                }}>
                                    {instagramConnected ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                            </div>
                            <div style={{ paddingLeft: '1rem' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9em', color: '#555' }}>Instagram Page ID</label>
                                    <input
                                        value={instagramId}
                                        onChange={e => setInstagramId(e.target.value)}
                                        placeholder="e.g. 1784140..."
                                        style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'monospace' }}
                                    />
                                    <p style={{ fontSize: '0.85em', color: '#888', marginTop: '0.25rem' }}>Required to receive DMs (Page ID, not handle).</p>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9em', color: '#555' }}>Instagram Page Access Token</label>
                                    <input
                                        type="password"
                                        value={instagramAccessToken}
                                        onChange={e => setInstagramAccessToken(e.target.value)}
                                        placeholder="EAA..."
                                        style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '6px', fontFamily: 'monospace' }}
                                    />
                                    <p style={{ fontSize: '0.85em', color: '#888', marginTop: '0.25rem' }}>Required for sending AI replies (Page Settings &gt; Advanced Access).</p>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9em', color: '#555' }}>Instagram Handle</label>
                                    <input
                                        value={instagramHandle}
                                        onChange={e => {
                                            setInstagramConnected(false);
                                            setInstagramHandle(e.target.value);
                                        }}
                                        placeholder="@yourbusiness"
                                        style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '6px' }}
                                    />
                                </div>
                            </div>
                        </div>
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
