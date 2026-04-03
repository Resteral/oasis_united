"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TownRegistrationForm({ onComplete }: { onComplete: () => void }) {
    const [name, setName] = useState('');
    const [state, setState] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Auth required");

            const { error: insertError } = await supabase
                .from('towns')
                .insert([{ 
                    name, 
                    state, 
                    added_by: user.id 
                }]);

            if (insertError) throw insertError;
            
            onComplete();
            setName('');
            setState('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white/[0.02] border border-white/5 p-12 rounded-[3.5rem] shadow-3xl">
            <div className="space-y-4">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-400/10 border border-indigo-400/20 rounded-full">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Expansion Protocol</span>
                </div>
                <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Open Your <br />Town.</h2>
                <p className="text-gray-400 text-sm font-medium max-w-sm">Register a new regional hub to start onboarding independent local businesses.</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 ml-4">Settlement Name</label>
                    <input 
                        type="text" 
                        required
                        placeholder="e.g. Effingham"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-white/20 font-bold"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 ml-4">State/Region Code</label>
                    <input 
                        type="text" 
                        required
                        maxLength={2}
                        placeholder="e.g. NH"
                        value={state}
                        onChange={(e) => setState(e.target.value.toUpperCase())}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-white/20 font-bold uppercase"
                    />
                </div>

                {error && <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest bg-red-400/10 p-4 rounded-xl border border-red-400/20">{error}</p>}

                <button 
                    disabled={loading}
                    className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-900/20 disabled:opacity-50"
                >
                    {loading ? 'Transmitting...' : 'Establish Settlement'}
                </button>
            </div>
        </form>
    );
}
