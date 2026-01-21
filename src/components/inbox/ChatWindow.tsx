'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

type Message = {
    id: string;
    content: string;
    direction: 'inbound' | 'outbound';
    created_at: string;
    channel: string;
};

export default function ChatWindow({ conversationId }: { conversationId: string | null }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!conversationId) return;

        let mounted = true;

        async function loadMessages() {
            setLoading(true);
            const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (mounted && data) {
                setMessages(data as any);
                setLoading(false);
                setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }
        }

        loadMessages();

        const channel = supabase
            .channel(`ctx:${conversationId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
                if (mounted) {
                    setMessages((prev) => [...prev, payload.new as any]);
                    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                }
            })
            .subscribe();

        return () => {
            mounted = false;
            supabase.removeChannel(channel);
        };
    }, [conversationId]);

    const handleSend = async () => {
        if (!newMessage.trim() || !conversationId) return;

        const text = newMessage;
        setNewMessage(''); // Optimistic clear

        // Get user business for insert
        const { data: { user } } = await supabase.auth.getUser();
        const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user?.id).single();

        if (business) {
            // Verify conversation exists to get platform
            const { data: conversation } = await supabase.from('conversations').select('platform, external_id').eq('id', conversationId).single();

            if (conversation) {
                const { error } = await supabase.from('messages').insert({
                    conversation_id: conversationId,
                    business_id: business.id,
                    channel: conversation.platform,
                    customer_contact: conversation.external_id,
                    direction: 'outbound',
                    content: text,
                });

                if (error) {
                    console.error('Error sending:', error);
                    // TODO: Show error toast
                }
            }
        }
    };

    if (!conversationId) return (
        <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
            <div className="text-center">
                <p className="mb-2">Select a conversation to start chatting</p>
            </div>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col h-full bg-white">
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/30">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-3 rounded-lg shadow-sm text-sm ${msg.direction === 'outbound'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white border text-gray-800 rounded-bl-none'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
            <div className="p-4 border-t bg-white flex gap-2 items-center">
                <input
                    className="flex-1 border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a reply..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                    onClick={handleSend}
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
