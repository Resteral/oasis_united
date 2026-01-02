"use client";
import styles from './Cart.module.css';
import { useState } from 'react';

export default function Cart() {
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState([
        { id: 1, name: "Premium Coffee Blend", price: 18.00, quantity: 1 },
        { id: 3, name: "Ceramic Mug", price: 25.00, quantity: 2 },
    ]);

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <>
            <button className={styles.cartBtn} onClick={() => setIsOpen(true)}>
                🛒 <span className={styles.badge}>{items.length}</span>
            </button>

            {isOpen && (
                <div className={styles.overlay}>
                    <div className={styles.sidebar}>
                        <div className={styles.header}>
                            <h2>Your Order</h2>
                            <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>✕</button>
                        </div>

                        <div className={styles.items}>
                            {items.map((item) => (
                                <div key={item.id} className={styles.item}>
                                    <div className={styles.itemInfo}>
                                        <p className={styles.itemName}>{item.name}</p>
                                        <p className={styles.itemPrice}>${item.price.toFixed(2)} x {item.quantity}</p>
                                    </div>
                                    <div className={styles.itemTotal}>
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.footer}>
                            <div className={styles.totalRow}>
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <p className={styles.note}>Choose how to complete your order:</p>
                            <div className={styles.actions}>
                                <button className="btn btn-secondary" style={{ width: '100%' }}>Text Order (SMS)</button>
                            </div>
                            <div className={styles.actions}>
                                <button className="btn btn-outline" style={{ width: '100%' }}>Instagram Message</button>
                            </div>
                            <div className={styles.actions}>
                                <button className="btn btn-primary" style={{ width: '100%' }}>Pay Now</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
