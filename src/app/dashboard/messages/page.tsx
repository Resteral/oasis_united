"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function InboxPage() {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Get Business ID
            const { data: business } = await supabase
                .from('businesses')
                .select('id')
                .eq('owner_id', user.id)
                .single();

            if (business) {
                // 2. Fetch Messages
                const { data: msgs } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('business_id', business.id)
                    .order('created_at', { ascending: false });

                if (msgs) {
                    setMessages(msgs.map(m => ({
                        id: m.id,
                        platform: m.channel,
                        sender: m.customer_contact,
                        content: m.content,
                        timestamp: new Date(m.created_at),
                        read: true // Schema doesn't have read status yet
                    })));
                }
            }
            setLoading(false);
        };

        fetchMessages();
        // Polling every 5s
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSimulate = async (channel: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).single();

        if (business) {
            await supabase.from('messages').insert({
                business_id: business.id,
                customer_contact: channel === 'instagram' ? '@demo_user' : '+15550000',
                channel: channel,
                direction: 'inbound',
                content: "This is a simulated message to test the inbox."
            });
            // Re-fetch will happen on next poll or we could force it
        }
    };

    if (loading) return <div className="p-8">Loading messages...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Unified Inbox</h1>
                    <p className={styles.subtitle}>
                        Manage all your customer conversations in one place.
                    </p>
                </div>
                <div className={styles.simulationControls}>
                    <span className={styles.label}>Simulate Incoming:</span>
                    <button onClick={() => handleSimulate('sms')} className={styles.simBtn}>+ SMS</button>
                    <button onClick={() => handleSimulate('whatsapp')} className={styles.simBtn}>+ WhatsApp</button>
                    <button onClick={() => handleSimulate('instagram')} className={styles.simBtn}>+ Insta</button>
                </div>
            </div>

            <div className={styles.inbox}>
                {messages.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No messages yet.</div>
                ) : messages.map((msg) => (
                    <div key={msg.id} className={`${styles.messageCard}`}>
                        <div className={styles.msgIcon}>
                            {msg.platform === 'sms' && '💬'}
                            {msg.platform === 'whatsapp' && '📱'}
                            {msg.platform === 'instagram' && '📸'}
                        </div>
                        <div className={styles.msgContent}>
                            <div className={styles.msgHeader}>
                                <span className={styles.sender}>{msg.sender}</span>
                                <span className={styles.time}>{msg.timestamp.toLocaleTimeString()}</span>
                            </div>
                            <p className={styles.text}>{msg.content}</p>
                            <div className={styles.platformTag} data-platform={msg.platform}>
                                Via {msg.platform}
                            </div>
                        </div>
                        <div className={styles.actions}>
                            <button className="btn btn-primary btn-sm">Reply</button>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
