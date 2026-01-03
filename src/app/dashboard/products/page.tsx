"use client";
import { useState } from 'react';
import styles from './page.module.css';

// Mock high-quality coffee/shop images
const AI_PLACEHOLDERS = [
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=100&q=80",
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=100&q=80",
    "https://images.unsplash.com/photo-1447933601403-0c60889eeaf6?auto=format&fit=crop&w=100&q=80",
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=100&q=80"
];

const INITIAL_PRODUCTS = [
    { id: 1, name: "Premium Coffee Blend", price: 18.00, stock: 45, category: "Beverage", image: AI_PLACEHOLDERS[0] },
    { id: 2, name: "Organic Green Tea", price: 12.50, stock: 30, category: "Beverage", image: AI_PLACEHOLDERS[1] },
    { id: 3, name: "Ceramic Mug", price: 25.00, stock: 12, category: "Merchandise", image: AI_PLACEHOLDERS[2] },
];

export default function ProductsPage() {
    const [products, setProducts] = useState(INITIAL_PRODUCTS);
    const [isAdding, setIsAdding] = useState(false);

    // New Product Form State
    const [newName, setNewName] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [newImage, setNewImage] = useState('');

    const handleGenerateAI = () => {
        // Simulate AI generation by picking a random cool image
        const randomImg = AI_PLACEHOLDERS[Math.floor(Math.random() * AI_PLACEHOLDERS.length)];
        setNewImage(randomImg);
    };

    const handleAddProduct = () => {
        if (!newName || !newPrice) return;

        const newProduct = {
            id: Date.now(),
            name: newName,
            price: parseFloat(newPrice),
            stock: 100, // Default mock stock
            category: "New",
            image: newImage || AI_PLACEHOLDERS[0] // Fallback
        };

        setProducts([...products, newProduct]);
        setIsAdding(false);
        setNewName('');
        setNewPrice('');
        setNewImage('');
    };

    return (
        <div>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Products</h1>
                    <p className={styles.subtitle}>Manage your inventory and pricing.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? 'Cancel' : '+ Add Product'}
                </button>
            </div>

            {isAdding && (
                <div className={styles.addProductForm}>
                    <h3>Add New Product</h3>
                    <div className={styles.formRow}>
                        <input
                            className="input"
                            placeholder="Product Name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                        <input
                            className="input"
                            type="number"
                            placeholder="Price"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                        />
                    </div>

                    <div className={styles.imageControl}>
                        <input
                            className="input"
                            placeholder="Image URL (or generate one)"
                            value={newImage}
                            onChange={(e) => setNewImage(e.target.value)}
                        />
                        <button className="btn btn-secondary" onClick={handleGenerateAI}>
                            ✨ Generate AI Image
                        </button>
                    </div>
                    {newImage && <img src={newImage} alt="Preview" className={styles.preview} />}

                    <button className="btn btn-primary" onClick={handleAddProduct} style={{ marginTop: '1rem' }}>
                        Save Product
                    </button>
                </div>
            )}

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td>
                                    <div
                                        className={styles.productThumb}
                                        style={{ backgroundImage: `url(${product.image})` }}
                                    />
                                </td>
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
