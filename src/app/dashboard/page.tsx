import styles from './page.module.css';

export default function DashboardPage() {
    return (
        <div>
            <h1 className={styles.title}>Dashboard Overview</h1>
            <p className={styles.subtitle}>Welcome back, here's what's happening with your business.</p>

            <div className={styles.grid}>
                {/* Analytics Cards */}
                <div className={`${styles.card} glass`}>
                    <h3>Total Revenue</h3>
                    <p className={styles.value}>$12,340</p>
                    <p className={styles.trend}>+12.5% from last month</p>
                </div>
                <div className={`${styles.card} glass`}>
                    <h3>Active Orders</h3>
                    <p className={styles.value}>24</p>
                    <p className={styles.trend}>8 pending pickup</p>
                </div>
                <div className={`${styles.card} glass`}>
                    <h3>Connections</h3>
                    <p className={styles.value}>1,203</p>
                    <p className={styles.trend}>+56 new this week</p>
                </div>
                <div className={`${styles.card} glass`}>
                    <h3>Product Views</h3>
                    <p className={styles.value}>45.2k</p>
                    <p className={styles.trend}>+2.1% from last week</p>
                </div>
            </div>

            <div className={styles.section}>
                <h2>Recent Orders</h2>
                <div className={styles.list}>
                    {/* Mock Order Items */}
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={styles.listItem}>
                            <div>
                                <p className={styles.orderId}>Order #203{i}</p>
                                <p className={styles.customer}>Customer {i}</p>
                            </div>
                            <span className={styles.status}>Pending</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
