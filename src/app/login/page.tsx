"use client";
import Link from 'next/link';
import styles from './page.module.css';

export default function LoginPage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>OasisUnited</Link>
            </header>

            <main className={styles.main}>
                <h1 className={styles.title}>Welcome Back</h1>
                <p className={styles.subtitle}>Choose your account type to continue.</p>

                <div className={styles.grid}>
                    {/* Consumer Option */}
                    <Link href="/profile" className={styles.card}>
                        <div className={styles.icon}>🛍️</div>
                        <h2>I am a Customer</h2>
                        <p>Track orders, view history, and manage your profile.</p>
                        <span className={styles.linkText}>Login as Customer &rarr;</span>
                    </Link>

                    {/* Business Option */}
                    <Link href="/dashboard" className={`${styles.card} ${styles.business}`}>
                        <div className={styles.icon}>💼</div>
                        <h2>I am a Business</h2>
                        <p>Manage products, orders, and view your store analytics.</p>
                        <span className={styles.linkText}>Login as Business &rarr;</span>
                    </Link>
                </div>
            </main>
        </div>
    );
}
