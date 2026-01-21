'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Conversation = {
    id: string;
    customer_name: string;
    platform: string;
    last_message_at: string;
    external_id: string;
};

export default function ConversationList({ onSelect, selectedId }: { onSelect: (id: string) => void, selectedId: string | null }) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadConversations() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).maybeSingle();

            if (business) {
                const { data } = await supabase
                    .from('conversations')
                    .select('*')
                    .eq('business_id', business.id)
                    .order('last_message_at', { ascending: false });

                if (data) setConversations(data);
            }
            setLoading(false);
        }
        loadConversations();

        const channel = supabase
            .channel('public:conversations')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
                loadConversations();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    if (loading) return <div className="w-1/3 border-r h-full p-4 text-gray-400 text-sm">Loading...</div>;

    return (
        <div className="w-1/3 border-r h-full overflow-y-auto bg-gray-50/50">
            <div className="p-4 border-b bg-white sticky top-0 z-10">
                <h2 className="font-bold text-lg">Inbox</h2>
            </div>
            <ul>
                {conversations.map((conv) => (
                    <li
                        key={conv.id}
                        onClick={() => onSelect(conv.id)}
                        className={`p-4 border-b cursor-pointer transition-colors ${selectedId === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-100 border-l-4 border-l-transparent'}`}
                    >
                        <div className="font-semibold text-sm truncate">{conv.customer_name || 'Unknown User'}</div>
                        <div className="flex justify-between items-center mt-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${conv.platform === 'facebook' ? 'bg-blue-100 text-blue-700' : conv.platform === 'instagram' ? 'bg-pink-100 text-pink-700' : 'bg-gray-200 text-gray-700'}`}>
                                {conv.platform}
                            </span>
                            <span className="text-[10px] text-gray-400">
                                {new Date(conv.last_message_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    </li>
                ))}
                {conversations.length === 0 && (
                    <li className="p-8 text-center text-gray-500 text-sm">
                        No conversations yet.
                    </li>
                )}
            </ul>
        </div>
    );
}
