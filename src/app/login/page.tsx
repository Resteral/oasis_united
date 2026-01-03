"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Correct import for App Router
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function LoginPage() {
    const router = useRouter();
    const [isSignUp, setIsSignUp] = useState(false);
    const [role, setRole] = useState<'consumer' | 'business'>('consumer');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                // 1. Sign Up
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (authError) throw authError;

                if (authData.user) {
                    // 2. Create Profile with Role
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert([
                            {
                                id: authData.user.id,
                                role: role,
                                full_name: email.split('@')[0] // Default name
                            }
                        ]);

                    if (profileError) throw profileError;

                    alert("Account created! Please sign in."); // Simplified flow
                    setIsSignUp(false);
                }
            } else {
                // 1. Sign In
                const { error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (authError) throw authError;

                // 2. Check Role to Redirect
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', user.id)
                        .single();

                    if (profile?.role === 'business') {
                        router.push('/dashboard');
                    } else {
                        router.push('/profile');
                    }
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>OasisUnited</Link>
            </header>

            <main className={styles.main}>
                <div className={styles.authCard}>
                    <h1 className={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
                    <p className={styles.subtitle}>
                        {isSignUp ? 'Join as a customer or business owner.' : 'Sign in to your account.'}
                    </p>

                    {error && <div className={styles.error}>{error}</div>}

                    <form onSubmit={handleAuth} className={styles.form}>
                        {isSignUp && (
                            <div className={styles.roleSelector}>
                                <button
                                    type="button"
                                    className={`${styles.roleBtn} ${role === 'consumer' ? styles.active : ''}`}
                                    onClick={() => setRole('consumer')}
                                >
                                    🛍️ Customer
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.roleBtn} ${role === 'business' ? styles.active : ''}`}
                                    onClick={() => setRole('business')}
                                >
                                    💼 Business
                                </button>
                            </div>
                        )}

                        <input
                            type="email"
                            placeholder="Email address"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
                        </button>
                    </form>

                    <p className={styles.switchMode}>
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"} <button className={styles.textBtn} onClick={() => setIsSignUp(!isSignUp)}>
                            {isSignUp ? 'Log In' : 'Sign Up'}
                        </button>
                    </p>
                </div>
            </main>
        </div>
    );
}
