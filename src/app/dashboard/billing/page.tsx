"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function BillingPage() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [business, setBusiness] = useState<any>(null);
    const [subTier, setSubTier] = useState<string>('free');
    const [updating, setUpdating] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [checkoutPlan, setCheckoutPlan] = useState<any>(null);

    const PLANS = [
        {
            id: 'free',
            name: 'Oasis Free',
            price: '$0',
            period: 'forever',
            description: 'Essential regional storefront discovery and basic listing features.',
            features: [
                '1 Standard Storefront Node',
                'Up to 10 Active Product SKUs',
                'Basic Discoverability Matrix',
                '10% Commission Fee on Sales',
                'Community Support Channels'
            ],
            actionText: 'Current Plan',
            disabled: true,
            style: 'bg-white/[0.02] border-white/5'
        },
        {
            id: 'pro',
            name: 'Oasis Pro',
            price: '$9.99',
            period: 'month',
            description: 'Advanced analytics, higher capacity, and lower commission fee structure.',
            features: [
                'Unlimited Product SKUs',
                '5% Commission Fee on Sales',
                'Priority Regional Discoverability',
                'Live Seating Layout Grid integration',
                'Interactive CRM and appointment bookings',
                'Email Support & API Access'
            ],
            actionText: 'Upgrade to Pro',
            disabled: false,
            style: 'bg-indigo-600/5 border-indigo-500/20 text-indigo-400'
        },
        {
            id: 'hardware_plan',
            name: 'Oasis Hardware Terminal',
            price: '$29.99',
            period: 'month',
            description: 'Pre-programmed ESP32-S Order Printer shipped to you. Zero configuration required.',
            features: [
                'Everything in Oasis Pro Plan',
                'Pre-programmed ESP32-S Order Printer',
                'USB Browser configuration (Web Serial)',
                'Direct Customer SMS-to-AI Ordering',
                'Instant Web, Audio, and Email order alerts',
                '2% Commission Fee on Sales (Lowest)',
                '24/7 Dedicated Server Uplink Support'
            ],
            actionText: 'Order Terminal & Upgrade',
            disabled: false,
            style: 'bg-amber-400/5 border-amber-400/20 text-amber-400'
        }
    ];

    useEffect(() => {
        async function loadProfile() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.location.href = '/login';
                return;
            }

            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            const { data: businessData } = await supabase
                .from('businesses')
                .select('*')
                .eq('owner_id', user.id)
                .single();

            setProfile(profileData);
            setBusiness(businessData);
            if (profileData?.subscription_tier) {
                setSubTier(profileData.subscription_tier);
            }
            setLoading(false);
        }
        loadProfile();
    }, []);

    const handleUpgrade = async (plan: any) => {
        if (plan.id === subTier) return;
        setCheckoutPlan(plan);
        setShowCheckout(true);
    };

    const confirmCheckout = async () => {
        setUpdating(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Update Profile tier
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ subscription_tier: checkoutPlan.id })
                .eq('id', user.id);

            if (profileError) throw profileError;

            // 2. If it is the hardware plan, seed the shipment and integrations data
            if (checkoutPlan.id === 'hardware_plan' && business) {
                const updatedIntegrations = {
                    ...business.integrations,
                    esp32: {
                        token: `esp32_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
                        enabled: true,
                        configured: false,
                        phone: business.integrations?.twilio?.phone || ""
                    },
                    esp32_shipment: {
                        status: 'Processing',
                        carrier: 'FedEx',
                        tracking_number: 'PENDING_ONBOARDING',
                        shipped_at: null,
                        address: business.location || 'Primary Registered Storefront Address'
                    }
                };

                const { error: businessError } = await supabase
                    .from('businesses')
                    .update({ integrations: updatedIntegrations })
                    .eq('id', business.id);

                if (businessError) throw businessError;
            }

            setSubTier(checkoutPlan.id);
            alert(`🎉 Success! You have successfully upgraded to the ${checkoutPlan.name} plan.`);
            setShowCheckout(false);
        } catch (err: any) {
            console.error('Upgrade Error:', err);
            alert(`Uplink Error: ${err.message}`);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
            <div className="text-gray-400 font-black animate-pulse uppercase tracking-widest text-[10px]">Loading Billing Ledger...</div>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 bg-[#0a0a0b] min-h-screen text-white pb-40">
            {/* Header */}
            <div className="mb-12 space-y-4">
                <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 bg-amber-400 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Municipal Node Subscriptions</h2>
                </div>
                <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.85] text-white">Billing <br /><span className="text-amber-400">Settings.</span></h1>
                <p className="max-w-2xl text-white/40 font-medium italic text-lg leading-relaxed pt-2">Select your node resource tier. Power up your local commerce with dedicated physical hardware terminals.</p>
            </div>

            {/* Current Plan Card */}
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] flex flex-wrap items-center justify-between gap-6 backdrop-blur-3xl">
                <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Active Subscription Account</span>
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                            {PLANS.find(p => p.id === subTier)?.name || 'Oasis Free'}
                        </h2>
                        <span className="px-4 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black text-amber-400 uppercase tracking-widest animate-pulse">● Active</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-white">
                        ← Back to Command Center
                    </Link>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
                {PLANS.map((plan) => {
                    const isCurrent = plan.id === subTier;
                    return (
                        <div key={plan.id} className={`p-10 rounded-[3.5rem] border flex flex-col justify-between transition-all hover:-translate-y-2 duration-500 relative overflow-hidden group ${plan.style} ${isCurrent ? 'ring-2 ring-amber-400/50' : ''}`}>
                            {isCurrent && (
                                <div className="absolute top-0 right-0 bg-amber-400 text-black px-6 py-2 rounded-bl-3xl text-[8px] font-black uppercase tracking-widest">
                                    Current Plan
                                </div>
                            )}
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-black uppercase tracking-tight text-white">{plan.name}</h3>
                                    <p className="text-sm font-medium text-white/40 leading-relaxed italic">{plan.description}</p>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-6xl font-black italic tracking-tighter text-white">{plan.price}</span>
                                    <span className="text-sm font-black text-white/30 uppercase">/ {plan.period}</span>
                                </div>
                                <div className="w-full h-[1px] bg-white/5"></div>
                                <ul className="space-y-4">
                                    {plan.features.map((feat, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-white/70 font-medium">
                                            <span className="text-indigo-400 select-none">✓</span>
                                            <span>{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="pt-10">
                                <button
                                    onClick={() => handleUpgrade(plan)}
                                    disabled={plan.id === subTier || plan.disabled}
                                    className={`w-full py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                        isCurrent 
                                            ? 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                                            : plan.id === 'hardware_plan'
                                                ? 'bg-amber-400 text-black hover:scale-[1.02] shadow-xl shadow-amber-400/10'
                                                : 'bg-white text-black hover:scale-[1.02]'
                                    }`}
                                >
                                    {isCurrent ? 'Current Plan' : plan.actionText}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Simulated Checkout Modal */}
            {showCheckout && checkoutPlan && (
                <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0e0e10] border border-white/10 w-full max-w-xl rounded-[3rem] p-12 space-y-8 animate-in zoom-in duration-300 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-indigo-600"></div>
                        <div className="space-y-2">
                            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Secure Node Payment Protocol</span>
                            <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white">Order Checkout</h2>
                        </div>

                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                            <div className="flex justify-between items-center text-sm font-black uppercase text-white/50">
                                <span>Provisioning Subscription</span>
                                <span>Total Due</span>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-xl font-bold text-white">{checkoutPlan.name} Plan</span>
                                <div className="text-right">
                                    <span className="text-4xl font-black italic text-amber-400">{checkoutPlan.price}</span>
                                    <span className="text-xs font-bold text-white/30"> / month</span>
                                </div>
                            </div>
                            {checkoutPlan.id === 'hardware_plan' && (
                                <p className="text-[10px] text-amber-400/80 font-semibold italic bg-amber-400/5 border border-amber-400/10 p-3 rounded-xl">
                                    📦 Includes pre-programmed ESP32-S USB Hardware Terminal & free domestic shipping.
                                </p>
                            )}
                        </div>

                        {/* Sandbox Payment Simulation Details */}
                        <div className="space-y-4">
                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-2">
                                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Sandbox Simulated Payment</p>
                                <p className="text-xs text-white/40 leading-relaxed">This checkout environment uses simulated sandboxed routing. Proceeding will securely sync your business profile state without actual credit card charges.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => setShowCheckout(false)}
                                className="flex-1 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmCheckout}
                                disabled={updating}
                                className="flex-1 py-5 bg-amber-400 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-amber-400/10"
                            >
                                {updating ? 'Authorizing...' : 'Authorize sandbox payment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
