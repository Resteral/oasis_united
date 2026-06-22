"use client";
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function MerchantAssistant() {
    const [loading, setLoading] = useState(true);
    const [business, setBusiness] = useState<any>(null);
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
    const [input, setInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const SUGGESTIONS = [
        "What is my total revenue today?",
        "Do I have any pending orders?",
        "Help me write a new store description",
        "Update product pricing list"
    ];

    useEffect(() => {
        async function loadBusiness() {
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

            if (biz) setBusiness(biz);
            setLoading(false);
        }
        loadBusiness();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (textToSend: string) => {
        if (!textToSend.trim() || chatLoading || !business) return;

        const text = textToSend.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setChatLoading(true);

        try {
            const res = await fetch('/api/ai/copilot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: business.id,
                    message: text,
                    history: messages
                })
            });

            const data = await res.json();
            if (data.reply) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Connection timed out. Please try again.' }]);
            }
        } catch (err) {
            console.error('Copilot Error:', err);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Uplink transmission failure. Verify connection.' }]);
        } finally {
            setChatLoading(false);
        }
    };

    if (loading) return (
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
            <div className="text-gray-400 font-black animate-pulse uppercase tracking-widest text-[10px]">Booting AI Copilot...</div>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 bg-[#0a0a0b] min-h-screen text-white pb-40">
            {/* Header */}
            <div className="mb-12 space-y-4">
                <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"></span>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Command Center Assistant</h2>
                </div>
                <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.85] text-white">AI <br /><span className="text-indigo-500">Copilot.</span></h1>
                <p className="max-w-2xl text-white/40 font-medium italic text-lg leading-relaxed pt-2">Audit shop financials, modify storefront listings, and coordinate pending orders via natural text dialogue.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                {/* Suggestions / Info */}
                <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] space-y-8 flex flex-col justify-between">
                    <div className="space-y-6">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Suggested Queries</span>
                        <div className="space-y-4 pt-2">
                            {SUGGESTIONS.map((s, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSendMessage(s)}
                                    disabled={chatLoading}
                                    className="w-full text-left p-5 bg-white/5 border border-white/5 rounded-2xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/10 hover:border-indigo-500/20 transition-all"
                                >
                                    {s} →
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="pt-8">
                        <Link href="/dashboard" className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-white flex items-center justify-center gap-2">
                            ← Return to Dashboard
                        </Link>
                    </div>
                </div>

                {/* Copilot Chat Window */}
                <div className="lg:col-span-8 bg-black border border-white/5 rounded-[3.5rem] flex flex-col justify-between min-h-[500px]">
                    {/* Header */}
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01] rounded-t-[3.5rem]">
                        <div className="flex items-center gap-4">
                            <span className="text-2xl">💼</span>
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-wider text-white">Oasis Copilot</h4>
                                <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Active Operations Sync</p>
                            </div>
                        </div>
                    </div>

                    {/* Output */}
                    <div className="flex-1 p-8 space-y-6 overflow-y-auto max-h-[350px] scrollbar-thin" ref={scrollRef}>
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-white/20 text-center py-20">
                                <span className="text-5xl">💬</span>
                                <p className="font-bold text-sm leading-relaxed italic text-white/40 max-w-sm">"Hello, Commander. I can fetch your store analytics, update product prices, and check pending order matrices. Ask me anything."</p>
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-1.5`}>
                                    <div 
                                        className={`max-w-[85%] p-5 rounded-[2rem] text-sm font-medium leading-relaxed shadow-md ${
                                            msg.role === 'user'
                                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                                : 'bg-white/5 border border-white/10 text-white rounded-tl-none'
                                        }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))
                        )}

                        {chatLoading && (
                            <div className="flex items-start gap-4">
                                <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] rounded-tl-none text-xs text-white/40 font-bold flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-150"></span>
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-300"></span>
                                    <span>Processing database request...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <footer className="p-8 bg-black/40 border-t border-white/5 rounded-b-[3.5rem]">
                        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Ask about revenue, check pending orders, or update prices..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 bg-white/5 border border-white/10 px-6 py-4 rounded-full text-sm text-white font-medium outline-none focus:border-indigo-400/50 transition-all placeholder:text-white/20"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || chatLoading}
                                className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl shadow-xl hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:grayscale"
                            >
                                🚀
                            </button>
                        </form>
                    </footer>
                </div>
            </div>
        </div>
    );
}
