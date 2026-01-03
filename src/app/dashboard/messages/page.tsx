"use client";
import { useState, useEffect } from 'react';
import { AutomationService, Message } from '@/services/automation';
import styles from './page.module.css';

export default function InboxPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [lastCheck, setLastCheck] = useState<Date>(new Date());

    useEffect(() => {
        // Poll for new messages every 5 seconds
        const fetchMessages = async () => {
            const data = await AutomationService.getMessages();
            setMessages(data);
            setLastCheck(new Date());
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSimulate = (platform: Message['platform']) => {
        AutomationService.simulateIncomingMessage(platform, "Thinking about placing a large order for my office.");
        // Immediate refresh
        AutomationService.getMessages().then(setMessages);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Unified Inbox</h1>
                    <p className={styles.subtitle}>
                        Connected: <span className={styles.status}>Twilio (SMS, WhatsApp)</span>, <span className={styles.status}>Instagram Direct</span>
                    </p>
                </div>
                <div className={styles.simulationControls}>
                    <span className={styles.label}>Test Webhook:</span>
                    <button onClick={() => handleSimulate('sms')} className={styles.simBtn}>+ SMS</button>
                    <button onClick={() => handleSimulate('whatsapp')} className={styles.simBtn}>+ WhatsApp</button>
                    <button onClick={() => handleSimulate('instagram')} className={styles.simBtn}>+ Insta</button>
                </div>
            </div>

            <div className={styles.inbox}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`${styles.messageCard} ${!msg.read ? styles.unread : ''}`}>
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
