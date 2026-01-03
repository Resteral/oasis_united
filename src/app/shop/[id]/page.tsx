import styles from './page.module.css';
import Cart from '@/components/Cart';

//{ params }: { params: { id: string } }
export default function ShopPage() {
    // In a real app, fetch business data using params.id
    const businessName = "Oasis Coffee Co.";

    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.businessName}>{businessName}</h1>
                    <p className={styles.tagline}>Premium blends for your daily ritual.</p>
                    <div className={styles.heroActions}>
                        <button className="btn btn-primary">Start Order</button>
                        <button className="btn glass">Contact Us</button>
                    </div>
                </div>
            </div>

            <div className="container">
                {/* Info & Map */}
                <div className={styles.infoSection}>
                    <div className={styles.mapPlaceholder}>
                        <span>📍 Google Map Placeholder</span>
                    </div>
                    <div className={styles.details}>
                        <h3>Visit Us</h3>
                        <p>123 Palms Blvd, Miami, FL</p>
                        <p>Open Daily: 7AM - 8PM</p>
                        <div className={styles.contactMethods}>
                            <button className="btn btn-outline">Call Now</button>
                            <button className="btn btn-outline">Message</button>
                        </div>
                    </div>
                </div>

                {/* Products */}
                <h2 className={styles.sectionTitle}>Our Menu</h2>
                <div className={styles.productGrid}>
                    {[
                        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1447933601403-0c60889eeaf6?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80",
                        "https://images.unsplash.com/photo-1507133750069-4195764b73a5?auto=format&fit=crop&w=400&q=80"
                    ].map((imgUrl, i) => (
                        <div key={i} className={styles.productCard}>
                            <div className={styles.productImage} style={{ backgroundImage: `url(${imgUrl})` }}></div>
                            <div className={styles.productInfo}>
                                <div className={styles.productHeader}>
                                    <h4>Specialty Item {i + 1}</h4>
                                    <span className={styles.price}>${(5.50 + i).toFixed(2)}</span>
                                </div>
                                <p className={styles.description}>A delicious premium item freshly prepared for you.</p>
                                <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }}>Add to Cart</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Cart />
        </div>
    );
}
