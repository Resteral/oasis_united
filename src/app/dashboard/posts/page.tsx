"use client";
import styles from './page.module.css';
import { useState } from 'react';

const MOCK_POSTS = [
    { id: 1, content: "Flash Sale! 50% off all summer items this weekend only.", date: "2 mins ago", type: "Discount", views: 45 },
    { id: 2, content: "Join us for our grand opening event this Saturday!", date: "2 days ago", type: "Event", views: 120 },
];

export default function PostsPage() {
    const [activeTab, setActiveTab] = useState('posts');

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.title}>Posts & Events</h1>
                <p className={styles.subtitle}>Engage with your customers through updates and offers.</p>
            </div>

            <div className={styles.createCard}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'posts' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('posts')}
                    >
                        Create Post
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'event' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('event')}
                    >
                        Create Event
                    </button>
                </div>

                <div className={styles.form}>
                    <textarea
                        className="input"
                        style={{ height: '100px', resize: 'none', marginBottom: '1rem' }}
                        placeholder={activeTab === 'posts' ? "What's new with your business?" : "Describe your event..."}
                    />
                    {activeTab === 'event' && (
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            <input type="date" className="input" />
                            <input type="time" className="input" />
                        </div>
                    )}
                    <div className={styles.formFooter}>
                        <button className="btn btn-outline">Add Image</button>
                        <button className="btn btn-primary">Post Update</button>
                    </div>
                </div>
            </div>

            <div className={styles.feed}>
                <h3>Recent Updates</h3>
                {MOCK_POSTS.map((post) => (
                    <div key={post.id} className={styles.postCard}>
                        <div className={styles.postHeader}>
                            <span className={styles.postType}>{post.type}</span>
                            <span className={styles.date}>{post.date}</span>
                        </div>
                        <p className={styles.content}>{post.content}</p>
                        <div className={styles.stats}>
                            <span>👁 {post.views} views</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
