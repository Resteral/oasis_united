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
    const [smsConsent, setSmsConsent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                // 1. Sign Up with Metadata
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            role: role,
                            full_name: email.split('@')[0],
                            sms_consent: smsConsent,
                        }
                    }
                });

                if (authError) throw authError;

                // 2. Handle Profile Creation (Only if session exists immediately - e.g. Auto Confirm)
                if (authData.session) {
                    await ensureProfile(authData.user!);
                    alert("Account created! You are logged in.");
                    router.push(role === 'business' ? '/dashboard' : '/profile');
                } else if (authData.user) {
                    // Email confirmation required
                    alert("Account created! Please check your email to confirm your account before signing in.");
                    setIsSignUp(false); // Switch to login view
                }
            } else {
                // 1. Sign In
                const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (authError) throw authError;

                if (authData.user) {
                    // 2. Ensure Profile Exists (Lazy creation for email-confirmed users)
                    const profile = await ensureProfile(authData.user);

                    // 3. Redirect based on Role
                    if (profile?.role === 'business') {
                        router.push('/dashboard');
                    } else {
                        router.push('/profile');
                    }
                }
            }
        } catch (err: any) {
            console.error("Auth Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper to ensure profile exists in public table
    const ensureProfile = async (user: any) => {
        // Check if profile exists
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profile) return profile;

        // If not, create it using metadata
        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: user.id,
                    role: user.user_metadata?.role || 'consumer',
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                    sms_consent: user.user_metadata?.sms_consent || false,
                }
            ])
            .select()
            .single();

        if (insertError) {
            // If insert fails (rarity), just return structure or throw
            // It might fail if RLS issues persist, but now we have a session.
            throw new Error("Failed to create profile: " + insertError.message);
        }
        return newProfile;
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

                        {isSignUp && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', margin: '1rem 0', fontSize: '0.85rem', color: '#555' }}>
                                <input
                                    type="checkbox"
                                    checked={smsConsent}
                                    onChange={(e) => setSmsConsent(e.target.checked)}
                                    style={{ marginTop: '0.2rem', marginRight: '0.5rem' }}
                                />
                                <span>
                                    I agree to receive order updates and promotional messages from <strong>OasisUnited</strong> and its merchants at the number provided. Reply STOP to unsubscribe. Msg & Data rates may apply.
                                </span>
                            </div>
                        )}

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
