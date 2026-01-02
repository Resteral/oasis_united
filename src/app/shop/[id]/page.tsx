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
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className={styles.productCard}>
                            <div className={styles.productImage}></div>
                            <div className={styles.productInfo}>
                                <div className={styles.productHeader}>
                                    <h4>Specialty Item {i}</h4>
                                    <span className={styles.price}>$5.50</span>
                                </div>
                                <p className={styles.description}>A delicious mock item description.</p>
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
