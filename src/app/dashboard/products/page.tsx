import styles from './page.module.css';

const MOCK_PRODUCTS = [
    { id: 1, name: "Premium Coffee Blend", price: 18.00, stock: 45, category: "Beverage" },
    { id: 2, name: "Organic Green Tea", price: 12.50, stock: 30, category: "Beverage" },
    { id: 3, name: "Ceramic Mug", price: 25.00, stock: 12, category: "Merchandise" },
    { id: 4, name: "Oat Milk Carton", price: 4.50, stock: 100, category: "Add-on" },
];

export default function ProductsPage() {
    return (
        <div>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Products</h1>
                    <p className={styles.subtitle}>Manage your inventory and pricing.</p>
                </div>
                <button className="btn btn-primary">
                    + Add Product
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_PRODUCTS.map((product) => (
                            <tr key={product.id}>
                                <td className={styles.nameCell}>{product.name}</td>
                                <td><span className={styles.badge}>{product.category}</span></td>
                                <td>${product.price.toFixed(2)}</td>
                                <td>
                                    <span className={product.stock < 20 ? styles.lowStock : ''}>
                                        {product.stock} units
                                    </span>
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <button className={styles.actionBtn}>Edit</button>
                                        <button className={styles.actionBtn}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
