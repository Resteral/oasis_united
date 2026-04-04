"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    // Core Identity
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [category, setCategory] = useState('Retail');
    const [userId, setUserId] = useState<string | null>(null);

    // Store Features
    const [seatingType, setSeatingType] = useState('none');
    const [seatingCapacity, setSeatingCapacity] = useState('');
    const [wifi, setWifi] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setUserId(user.id);
            else router.push('/login');
        });
    }, [router]);

    const handleCreateBusiness = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;
        setLoading(true);

        const storeFeatures = {
            seating: seatingType !== 'none' ? { type: seatingType, capacity: seatingCapacity } : null,
            wifi: wifi,
            last_updated: new Date().toISOString()
        };

        try {
            const { error } = await supabase
                .from('businesses')
                .insert([
                    {
                        owner_id: userId,
                        name,
                        slug: slug.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''),
                        category,
                        description: `Welcome to ${name}!`,
                        store_features: storeFeatures
                    }
                ]);

            if (error) throw error;
            router.push('/dashboard');
        } catch (err: any) {
            alert('Error creating business: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="max-w-xl w-full">
                {/* Progress Indicator */}
                <div className="mb-10 flex items-center justify-between px-2">
                    <div className="flex gap-2">
                        <div className={`h-1.5 w-12 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                        <div className={`h-1.5 w-12 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                        <div className="h-1.5 w-12 rounded-full bg-gray-200"></div>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 capitalize tracking-widest">
                        {step === 1 ? 'Step 01 • Core Identity' : 'Step 02 • Store Features'}
                    </span>
                </div>

                <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-gray-100 transition-all duration-500">
                    {step === 1 ? (
                        <div className="animate-in fade-in slide-in-from-right-12">
                            <div className="mb-10">
                                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Launch Your Store</h1>
                                <p className="mt-2 text-gray-500 font-medium">Tell us about your business to get your automated storefront online.</p>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Business Name</label>
                                    <input
                                        className="w-full p-4 bg-gray-50 border border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900 shadow-inner"
                                        placeholder="e.g. The Espresso Hub"
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            setSlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''));
                                        }}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Shop URL (Slug)</label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm pointer-events-none">oasis.com/shop/</span>
                                        <input
                                            className="w-full p-4 pl-[8.5rem] bg-gray-50 border border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900 shadow-inner"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Category</label>
                                    <select
                                        className="w-full p-4 bg-gray-50 border border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900 shadow-inner appearance-none cursor-pointer"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option>Retail</option>
                                        <option>Restaurant</option>
                                        <option>Cafe</option>
                                        <option>Hardware</option>
                                        <option>Groceries</option>
                                        <option>Beauty</option>
                                        <option>Art</option>
                                        <option>Tech</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-black text-xs tracking-[0.2em] hover:bg-indigo-600 transition-all uppercase shadow-xl shadow-gray-200 flex items-center justify-center gap-3"
                                >
                                    Continue to Features →
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-12">
                            <div className="mb-10">
                                <h1 className="text-4xl font-black text-gray-900 tracking-tight italic uppercase leading-none">In-Store <br />Features.</h1>
                                <p className="mt-2 text-gray-500 font-medium">Customize your guest experience for the marketplace.</p>
                            </div>

                            <form onSubmit={handleCreateBusiness} className="space-y-8">
                                {(category === 'Restaurant' || category === 'Cafe') && (
                                    <div className="space-y-6 bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                        <label className="text-[10px] font-black italic text-indigo-600 uppercase tracking-widest block mb-4">Seating Alignment</label>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            {['indoors', 'outdoors', 'booth', 'bar'].map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setSeatingType(type)}
                                                    className={`p-4 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${
                                                        seatingType === type 
                                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                                                        : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-300'
                                                    }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="space-y-2 mt-6">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Guest Capacity</label>
                                            <input
                                                type="number"
                                                className="w-full p-4 bg-white border border-gray-100 focus:border-indigo-600 rounded-2xl outline-none font-bold text-gray-900"
                                                placeholder="e.g. 45"
                                                value={seatingCapacity}
                                                onChange={(e) => setSeatingCapacity(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-tight">Public WiFi</span>
                                        <span className="text-[9px] text-gray-400 font-medium tracking-tight">Available for guest checkout</span>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        className="w-6 h-6 accent-indigo-600" 
                                        checked={wifi}
                                        onChange={(e) => setWifi(e.target.checked)}
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-5 bg-white text-gray-400 border border-gray-100 rounded-[1.5rem] font-black text-xs tracking-widest hover:text-gray-900 transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[2] py-5 bg-gray-900 text-white rounded-[1.5rem] font-black text-xs tracking-[0.2em] hover:bg-indigo-600 transition-all uppercase shadow-xl shadow-gray-200 disabled:opacity-50"
                                    >
                                        {loading ? 'Transmitting...' : 'Establish Oasis Store'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                <p className="mt-10 text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">&copy; 2026 Oasis United &bull; Scaling Community Logistics</p>
            </div>
        </div>
    );
}
