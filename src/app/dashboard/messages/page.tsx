"use client";

import { useState } from 'react';
import ConversationList from '@/components/inbox/ConversationList';
import ChatWindow from '@/components/inbox/ChatWindow';

export default function InboxPage() {
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white border rounded-xl shadow-sm m-4">
            <ConversationList
                selectedId={selectedConversationId}
                onSelect={setSelectedConversationId}
            />
            <ChatWindow
                conversationId={selectedConversationId}
            />
        </div>
    );
}
