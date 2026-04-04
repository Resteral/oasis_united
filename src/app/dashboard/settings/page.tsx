"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { PayPalButtons } from '@paypal/react-paypal-js';
import SeatingMap from '@/components/merchant/SeatingMap';
import TeamManager from '@/components/merchant/TeamManager';

export default function SettingsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'profile' | 'floorplan' | 'team'>('profile');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [category, setCategory] = useState('');
    
    // Store Features Management (Requested)
    const [seatingType, setSeatingType] = useState('Indoors');
    const [seatingCapacity, setSeatingCapacity] = useState(24);
    const [hasWifi, setHasWifi] = useState(false);

    // Social & Integrations
    const [twilioPhone, setTwilioPhone] = useState('');
    const [instagramHandle, setInstagramHandle] = useState('');
    const [instagramId, setInstagramId] = useState('');
    const [instagramAccessToken, setInstagramAccessToken] = useState('');
    const [facebookId, setFacebookId] = useState('');
    const [facebookAccessToken, setFacebookAccessToken] = useState('');
    
    const [twilioConnected, setTwilioConnected] = useState(false);
    const [instagramConnected, setInstagramConnected] = useState(false);
    const [facebookConnected, setFacebookConnected] = useState(false);

    // Theme & UX
    const [primaryColor, setPrimaryColor] = useState('#4F46E5');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');

    // Logistics
    const [deliveryRadius, setDeliveryRadius] = useState(5);
    const [selfDelivery, setSelfDelivery] = useState(false);
    const [deliveryProviders, setDeliveryProviders] = useState<string[]>([]);
    
    const [subscriptionTier, setSubscriptionTier] = useState('free');

    useEffect(() => {
        async function fetchSettings() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUserId(user.id);

            // Fetch Profile
            const { data: profile } = await supabase.from('profiles').select('subscription_tier').eq('id', user.id).single();
            if (profile) setSubscriptionTier(profile.subscription_tier || 'free');

            const { data: business } = await supabase.from('businesses').select('*').eq('owner_id', user.id).single();

            if (business) {
                setBusinessId(business.id);
                setName(business.name);
                setLocation(business.location || '');
                setCategory(business.category || '');

                const feats = business.store_features || {};
                if (feats.seating) {
                    setSeatingType(feats.seating.type || 'Indoors');
                    setSeatingCapacity(feats.seating.capacity || 24);
                }
                setHasWifi(!!feats.wifi);

                const integr = business.integrations || {};
                setTwilioPhone(integr.twilio?.phone || '');
                setInstagramHandle(integr.instagram?.handle || '');
                setInstagramId(integr.instagram?.id || '');
                setInstagramAccessToken(integr.instagram?.access_token || '');
                setFacebookId(integr.facebook?.id || '');
                setFacebookAccessToken(integr.facebook?.access_token || '');

                const { data: activeIntegrations } = await supabase.from('integrations').select('platform, is_active').eq('business_id', business.id);
                if (activeIntegrations) {
                    setTwilioConnected(activeIntegrations.some(i => (i.platform === 'twilio' || i.platform === 'sms') && i.is_active));
                    setInstagramConnected(activeIntegrations.some(i => i.platform === 'instagram' && i.is_active));
                    setFacebookConnected(activeIntegrations.some(i => i.platform === 'facebook' && i.is_active));
                }

                const theme = business.theme || {};
                if (theme.primaryColor) setPrimaryColor(theme.primaryColor);
                if (theme.backgroundColor) setBackgroundColor(theme.backgroundColor);

                const delivery = business.delivery_settings || {};
                if (delivery.radius) setDeliveryRadius(delivery.radius);
                if (delivery.selfDelivery !== undefined) setSelfDelivery(delivery.selfDelivery);
                if (delivery.providers) setDeliveryProviders(delivery.providers);
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
            store_features: {
                seating: { type: seatingType, capacity: seatingCapacity },
                wifi: hasWifi
            },
            integrations: {
                twilio: { phone: twilioPhone, connected: !!twilioPhone },
                instagram: { handle: instagramHandle, id: instagramId, access_token: instagramAccessToken, connected: !!instagramHandle || !!instagramId },
                facebook: { id: facebookId, access_token: facebookAccessToken, connected: !!facebookId }
            },
            theme: { primaryColor, backgroundColor },
            delivery_settings: { radius: deliveryRadius, selfDelivery, providers: deliveryProviders },
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from('businesses').update(updates).eq('id', businessId);
        if (error) alert('Error updating settings: ' + error.message);
        else alert('Settings saved successfully!');
        setSaving(false);
    };

    if (loading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-[0.3em]">Syncing Command Node...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase italic">Management Control</h1>
                <p className="mt-2 text-lg text-gray-500 font-medium">Configure your store characteristics, logistics, and digital footprint.</p>
            </div>
            <div className="flex justify-center mb-16">
                <nav className="flex gap-2 p-1.5 bg-white/10 backdrop-blur-3xl rounded-full border border-white/5">
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`px-10 py-4 rounded-full font-black uppercase tracking-widest text-[10px] transition-all ${
                            activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-xl' : 'text-white/40 hover:text-white/60'
                        }`}
                    >
                        ⚙️ Store Profile
                    </button>
                    {(category === 'Restaurant' || category === 'Cafe') && (
                        <button 
                            onClick={() => setActiveTab('floorplan')}
                            className={`px-10 py-4 rounded-full font-black uppercase tracking-widest text-[10px] transition-all ${
                                activeTab === 'floorplan' ? 'bg-emerald-500 text-white shadow-xl' : 'text-white/40 hover:text-white/60'
                            }`}
                        >
                            🪑 Interactive Seating
                        </button>
                    )}
                    <button 
                        onClick={() => setActiveTab('team')}
                        className={`px-10 py-4 rounded-full font-black uppercase tracking-widest text-[10px] transition-all ${
                            activeTab === 'team' ? 'bg-indigo-400 text-white shadow-xl' : 'text-white/40 hover:text-white/60'
                        }`}
                    >
                        👥 Team Command
                    </button>
                </nav>
            </div>

            {activeTab === 'floorplan' ? (
                <div className="bg-black/90 p-12 md:p-20 rounded-[5rem] border border-white/10 shadow-3xl">
                    <SeatingMap businessId={businessId || ''} />
                </div>
            ) : activeTab === 'team' ? (
                <div className="bg-[#fbfcff] p-12 md:p-20 rounded-[5rem] border border-gray-100 shadow-3xl">
                    <TeamManager businessId={businessId || ''} />
                </div>
            ) : (
                <form onSubmit={handleSave} className="space-y-12">
                    {/* General Settings */}
                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 space-y-8 shadow-sm">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
                            <span className="text-2xl">🏬</span>
                            <h2 className="text-2xl font-black italic uppercase tracking-tight text-gray-900">Core Profile</h2>
                        </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Name</label>
                            <input value={name} onChange={e => setName(e.target.value)} className="w-full p-5 border border-gray-100 rounded-2xl bg-gray-50 font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</label>
                            <input value={location} onChange={e => setLocation(e.target.value)} className="w-full p-5 border border-gray-100 rounded-2xl bg-gray-50 font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                        </div>
                    </div>
                </div>

                {/* In-Store Features (Requested Management Control) */}
                {(category === 'Restaurant' || category === 'Cafe') && (
                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 space-y-8 shadow-sm">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
                            <span className="text-2xl">🍽️</span>
                            <h2 className="text-2xl font-black italic uppercase tracking-tight text-gray-900">Seating & Guest Arrangement</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Preferred Seating Type</label>
                                <select value={seatingType} onChange={e => setSeatingType(e.target.value)} className="w-full p-5 border border-gray-100 rounded-2xl bg-gray-50 font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none">
                                    <option>Indoors</option>
                                    <option>Outdoors</option>
                                    <option>Booth</option>
                                    <option>Bar</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Max Guest Capacity</label>
                                <input type="number" value={seatingCapacity} onChange={e => setSeatingCapacity(Number(e.target.value))} className="w-full p-5 border border-gray-100 rounded-2xl bg-gray-50 font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Amenity Management */}
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 space-y-8 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
                        <span className="text-2xl">📶</span>
                        <h2 className="text-2xl font-black italic uppercase tracking-tight text-gray-900">Amenities</h2>
                    </div>
                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="space-y-1">
                            <h4 className="font-black uppercase tracking-tight text-gray-900">Public WiFi Network</h4>
                            <p className="text-xs text-gray-400 font-bold uppercase">Let customers know they can work or browse on-site.</p>
                        </div>
                        <button type="button" onClick={() => setHasWifi(!hasWifi)} className={`w-16 h-8 rounded-full transition-all relative ${hasWifi ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${hasWifi ? 'left-9 shadow-lg shadow-black/20' : 'left-1'}`} />
                        </button>
                    </div>
                </div>

                {/* Logistics */}
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 space-y-8 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
                        <span className="text-2xl">🚚</span>
                        <h2 className="text-2xl font-black italic uppercase tracking-tight text-gray-900">Logistics Control</h2>
                    </div>
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery Radius (Miles): {deliveryRadius}m</label>
                        <input type="range" min="1" max="50" value={deliveryRadius} onChange={e => setDeliveryRadius(Number(e.target.value))} className="w-full accent-indigo-600" />
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-12">
                    <button type="submit" disabled={saving} className="px-16 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-lg tracking-widest hover:bg-indigo-700 shadow-2xl hover:scale-105 active:scale-95 transition-all">
                        {saving ? 'UPDATING PROTOCOL...' : 'SAVE ALL CHANGES'}
                    </button>
                </div>
            </form>
            )}
        </div>
    );
}
