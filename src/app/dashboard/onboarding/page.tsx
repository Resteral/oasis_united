"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function OnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [category, setCategory] = useState('Retail');
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setUserId(user.id);
            else router.push('/login');
        });
    }, [router]);

    const handleCreateBusiness = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from('businesses')
                .insert([
                    {
                        owner_id: userId,
                        name,
                        slug: slug.toLowerCase().replace(/ /g, '-'), // Simple slugify
                        category,
                        description: `Welcome to ${name}!`,
                    }
                ]);

            if (error) throw error;

            router.push('/dashboard');
        } catch (err: any) {
            alert('Error creating business: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1>Setup Your Business</h1>
                <p>Tell us a bit about your store to get started.</p>

                <form onSubmit={handleCreateBusiness} className={styles.form}>
                    <div className={styles.field}>
                        <label>Business Name</label>
                        <input
                            className={styles.input}
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setSlug(e.target.value.toLowerCase().replace(/ /g, '-'));
                            }}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Shop URL (Slug)</label>
                        <div className={styles.slugInput}>
                            <span>oasis.com/shop/</span>
                            <input
                                className={styles.input}
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label>Category</label>
                        <select
                            className={styles.select}
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option>Retail</option>
                            <option>Restaurant</option>
                            <option>Cafe</option>
                            <option>Health & Wellness</option>
                            <option>Animal Care</option>
                            <option>Hardware</option>
                            <option>Groceries</option>
                            <option>Services</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Launch Store 🚀'}
                    </button>
                </form>
            </div>
        </div>
    );
}
