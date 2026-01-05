"use client";
import styles from './page.module.css';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Post } from '@/lib/types';

export default function PostsPage() {
    const [activeTab, setActiveTab] = useState<'posts' | 'event'>('posts');
    const [posts, setPosts] = useState<Post[]>([]);
    const [content, setContent] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).single();
                if (business) {
                    const { data: postsData } = await supabase
                        .from('posts')
                        .select('*')
                        .eq('business_id', business.id)
                        .order('created_at', { ascending: false });
                    setPosts(postsData || []);
                }
            }
            setLoading(false);
        }
        loadData();
    }, []);

    const handleCreate = async () => {
        if (!content) return;
        if (!user) return;

        const { data: business } = await supabase.from('businesses').select('id').eq('owner_id', user.id).single();
        if (!business) return;

        const newPost = {
            business_id: business.id,
            type: activeTab,
            content: content,
            event_date: activeTab === 'event' && eventDate ? new Date(`${eventDate}T${eventTime || '00:00'}`).toISOString() : null,
            views: 0
        };

        const { data, error } = await supabase.from('posts').insert(newPost).select().single();

        if (error) {
            alert('Error creating post: ' + error.message);
        } else if (data) {
            setPosts([data, ...posts]);
            setContent('');
            setEventDate('');
            setEventTime('');
            alert('Posted successfully!');
        }
    };

    const handleDelete = async (postId: string) => {
        if (!confirm('Are you sure you want to delete this?')) return;

        const { error } = await supabase.from('posts').delete().eq('id', postId);
        if (!error) {
            setPosts(posts.filter(p => p.id !== postId));
        }
    };

    if (loading) return <div>Loading...</div>;

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
                        style={{ height: '100px', resize: 'none', marginBottom: '1rem', width: '100%' }}
                        placeholder={activeTab === 'posts' ? "What's new with your business?" : "Describe your event..."}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                    />
                    {activeTab === 'event' && (
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            <input
                                type="date"
                                className="input"
                                value={eventDate}
                                onChange={e => setEventDate(e.target.value)}
                            />
                            <input
                                type="time"
                                className="input"
                                value={eventTime}
                                onChange={e => setEventTime(e.target.value)}
                            />
                        </div>
                    )}
                    <div className={styles.formFooter}>
                        <button className="btn btn-outline" disabled>Add Image</button>
                        <button className="btn btn-primary" onClick={handleCreate}>Post Update</button>
                    </div>
                </div>
            </div>

            <div className={styles.feed}>
                <h3>Recent Updates</h3>
                {posts.length === 0 ? <p className="text-gray-500">No posts yet.</p> : posts.map((post) => (
                    <div key={post.id} className={styles.postCard}>
                        <div className={styles.postHeader}>
                            <span className={styles.postType}>{post.type}</span>
                            <span className={styles.date}>{new Date(post.created_at).toLocaleDateString()}</span>
                            <button onClick={() => handleDelete(post.id)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>Delete</button>
                        </div>
                        {post.event_date && (
                            <div style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#e91e63' }}>
                                📅 Event: {new Date(post.event_date).toLocaleString()}
                            </div>
                        )}
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

