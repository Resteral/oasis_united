"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function CustomizePage() {
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [business, setBusiness] = useState<any>(null);

    // Form inputs
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [phone, setPhone] = useState('');

    // Theme inputs
    const [primaryColor, setPrimaryColor] = useState('#4F46E5');
    const [bgTheme, setBgTheme] = useState('dark'); // dark, light, cozy, neon
    const [fontFamily, setFontFamily] = useState('sans'); // sans, serif, mono

    useEffect(() => {
        async function loadSettings() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.location.href = '/login';
                return;
            }

            const { data: biz } = await supabase
                .from('businesses')
                .select('*')
                .eq('owner_id', user.id)
                .single();

            if (biz) {
                setBusiness(biz);
                setName(biz.name || '');
                setDescription(biz.description || '');
                setImageUrl(biz.image_url || '');
                setPhone(biz.integrations?.twilio?.phone || '');
                
                const theme = biz.theme || {};
                setPrimaryColor(theme.primaryColor || '#4F46E5');
                setBgTheme(theme.bgTheme || 'dark');
                setFontFamily(theme.fontFamily || 'sans');
            }
            setLoading(false);
        }
        loadSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !business) return;

            // Prepare integrations update with Twilio phone
            const updatedIntegrations = {
                ...business.integrations,
                twilio: {
                    ...business.integrations?.twilio,
                    phone: phone
                }
            };

            // If hardware plan is active, update hardware info too
            if (business.integrations?.esp32) {
                updatedIntegrations.esp32 = {
                    ...business.integrations.esp32,
                    phone: phone
                };
            }

            // Prepare theme updates
            const updatedTheme = {
                primaryColor,
                bgTheme,
                fontFamily
            };

            const { error } = await supabase
                .from('businesses')
                .update({
                    name,
                    description,
                    image_url: imageUrl,
                    integrations: updatedIntegrations,
                    theme: updatedTheme,
                    updated_at: new Date()
                })
                .eq('id', business.id);

            if (error) throw error;
            alert('🎉 Success! Visual settings and integrations updated on the regional registry.');
        } catch (err: any) {
            console.error('Save Error:', err);
            alert(`Uplink Error: ${err.message}`);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
            <div className="text-gray-400 font-black animate-pulse uppercase tracking-widest text-[10px]">Synchronizing Aesthetic Config...</div>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 bg-[#0a0a0b] min-h-screen text-white pb-40">
            {/* Header */}
            <div className="mb-12 space-y-4">
                <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"></span>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Visual Alignment Console</h2>
                </div>
                <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.85] text-white">Customize <br /><span className="text-indigo-500">Store.</span></h1>
                <p className="max-w-2xl text-white/40 font-medium italic text-lg leading-relaxed pt-2">Calibrate the branding, typography, color palette, and communication channels for your storefront node.</p>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Form Controls */}
                <div className="lg:col-span-7 bg-white/[0.02] border border-white/5 p-12 rounded-[4rem] space-y-8 backdrop-blur-3xl">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Boutique Identity</h3>
                    
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Storefront Name</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-black italic text-lg tracking-tight placeholder:text-white/5 focus:border-indigo-400/50 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Store Description</label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full bg-white/5 border border-white/10 p-5 rounded-[2rem] text-sm font-medium tracking-tight placeholder:text-white/5 focus:border-indigo-400/50 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Banner Image URL</label>
                            <input 
                                type="text" 
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-mono text-xs text-white/60 tracking-tight placeholder:text-white/5 focus:border-indigo-400/50 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Twilio SMS Phone Number (For Direct AI Ordering)</label>
                            <input 
                                type="text" 
                                placeholder="+15551234567"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-mono text-sm tracking-tight placeholder:text-white/5 focus:border-indigo-400/50 transition-all outline-none"
                            />
                            <p className="text-[9px] font-bold text-white/30 uppercase tracking-tight px-1">This number must match the Twilio phone number configured for your account. It will be advertised on your store and flashed to the ESP32 terminal.</p>
                        </div>
                    </div>
                </div>

                {/* Aesthetic Styling Panel */}
                <div className="lg:col-span-5 bg-white/[0.02] border border-white/5 p-12 rounded-[4rem] space-y-8 backdrop-blur-3xl">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Visual Signal</h3>

                    <div className="space-y-6">
                        {/* Primary Color Picker */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Brand Color Accent</label>
                            <div className="flex items-center gap-6 bg-black/40 p-5 rounded-2xl border border-white/5">
                                <input 
                                    type="color" 
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className="w-12 h-12 bg-transparent cursor-pointer rounded-xl overflow-hidden scale-125"
                                />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black italic uppercase text-white tracking-widest leading-none">Primary Theme Glow</p>
                                    <p className="text-[8px] font-bold text-white/30 tracking-tight uppercase">HEX Code: {primaryColor}</p>
                                </div>
                            </div>
                        </div>

                        {/* Background Theme Selector */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Aesthetic Preset</label>
                            <div className="relative">
                                <select 
                                    value={bgTheme}
                                    onChange={(e) => setBgTheme(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-black italic text-sm tracking-widest outline-none focus:border-indigo-400/50 appearance-none transition-all cursor-pointer uppercase"
                                >
                                    <option value="dark" className="bg-[#0a0a0b]">🌌 Dark Void (Default)</option>
                                    <option value="cozy" className="bg-[#0a0a0b]">🪵 Cozy Minimalist</option>
                                    <option value="neon" className="bg-[#0a0a0b]">⚡ Neon Grid</option>
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none">▼</div>
                            </div>
                        </div>

                        {/* Font Selector */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Typography Preset</label>
                            <div className="relative">
                                <select 
                                    value={fontFamily}
                                    onChange={(e) => setFontFamily(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl font-black italic text-sm tracking-widest outline-none focus:border-indigo-400/50 appearance-none transition-all cursor-pointer uppercase"
                                >
                                    <option value="sans" className="bg-[#0a0a0b]">Outfit Sans</option>
                                    <option value="serif" className="bg-[#0a0a0b]">Playfair Serif</option>
                                    <option value="mono" className="bg-[#0a0a0b]">Geist Mono</option>
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none">▼</div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={updating}
                            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-95 shadow-xl shadow-indigo-600/10"
                        >
                            {updating ? 'Saving Calibration...' : 'Transmit Calibration'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
