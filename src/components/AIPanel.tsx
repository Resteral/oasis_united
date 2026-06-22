"use client";
import { useState, useEffect, useRef } from 'react';

interface AIPanelProps {
    businessId: string;
    businessName: string;
    primaryColor: string;
    onOrderPlaced?: () => void;
}

export default function AIPanel({ businessId, businessName, primaryColor, onOrderPlaced }: AIPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const res = await fetch('/api/ai/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId,
                    customerContact: 'WebUser',
                    message: userMsg,
                    history: messages
                })
            });

            const data = await res.json();
            if (data.reply) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
                if (data.orderPlaced) {
                    if (onOrderPlaced) onOrderPlaced();
                }
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Uplink connection lost. Please try again.' }]);
            }
        } catch (err) {
            console.error('Chat Error:', err);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Connection timed out. Please verify server status.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Action Trigger */}
            <button 
                onClick={() => setIsOpen(true)}
                style={{ boxShadow: `0 10px 40px -10px ${primaryColor}44` }}
                className="fixed bottom-28 right-8 z-[200] w-16 h-16 bg-white text-black rounded-full flex items-center justify-center text-2xl hover:scale-105 active:scale-95 transition-all animate-bounce"
            >
                🤖
            </button>

            {/* Sliding Panel */}
            {isOpen && (
                <div className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-300">
                    <div className="w-full max-w-lg bg-[#0e0e10] border-l border-white/10 h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-500">
                        {/* Header */}
                        <header className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                            <div className="flex items-center gap-4">
                                <div 
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black italic text-black shadow-sm"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {businessName[0]}
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-white leading-tight">{businessName} Copilot</h3>
                                    <div className="flex items-center gap-1.5 pt-0.5">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                        <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest">AI Order Assistant Online</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </header>

                        {/* History Monitor */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin" ref={scrollRef}>
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-white/30 text-center px-8">
                                    <span className="text-5xl bg-white/5 p-6 rounded-full">🤖</span>
                                    <p className="font-bold text-sm leading-relaxed italic text-white/40">
                                        "Hi! I am the AI order assistant. Tell me what you'd like to order, or ask me questions about our products!"
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg, i) => (
                                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-1.5`}>
                                        <div 
                                            style={msg.role === 'user' ? { backgroundColor: primaryColor, color: '#000' } : {}}
                                            className={`max-w-[85%] p-5 rounded-[2rem] text-sm font-medium leading-relaxed shadow-md ${
                                                msg.role === 'user'
                                                    ? 'font-black rounded-tr-none'
                                                    : 'bg-white/5 border border-white/10 text-white rounded-tl-none'
                                            }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                ))
                            )}

                            {loading && (
                                <div className="flex items-start gap-4">
                                    <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] rounded-tl-none text-xs text-white/40 font-bold flex items-center gap-3">
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-150"></span>
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-300"></span>
                                        <span>AI ordering logic active...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Footer */}
                        <footer className="p-8 bg-black/40 border-t border-white/5">
                            <form onSubmit={handleSendMessage} className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Order coffee, muffins, check stock..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="flex-1 bg-white/5 border border-white/10 px-6 py-4 rounded-full text-sm text-white font-medium outline-none focus:border-indigo-400/50 transition-all placeholder:text-white/20"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || loading}
                                    style={{ backgroundColor: primaryColor }}
                                    className="w-14 h-14 text-black rounded-full flex items-center justify-center text-xl shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                                >
                                    🚀
                                </button>
                            </form>
                        </footer>
                    </div>
                </div>
            )}
        </>
    );
}
