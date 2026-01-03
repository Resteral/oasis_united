"use client";
import styles from './Cart.module.css';
import { useState } from 'react';
import { AutomationService } from '@/services/automation';

export default function Cart() {
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState([
        { id: 1, name: "Premium Coffee Blend", price: 18.00, quantity: 1 },
        { id: 3, name: "Ceramic Mug", price: 25.00, quantity: 2 },
    ]);

    // Order State
    const [orderType, setOrderType] = useState<'pickup' | 'shipping'>('pickup');
    const [customerName, setCustomerName] = useState('');
    const [address, setAddress] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = orderType === 'shipping' ? 5.00 : 0;
    const total = subtotal + shippingCost;

    const handleCheckout = async () => {
        if (!customerName) {
            alert("Please enter your name");
            return;
        }
        if (orderType === 'shipping' && !address) {
            alert("Please enter your shipping address");
            return;
        }

        setIsProcessing(true);

        // Simulate Order Processing
        await AutomationService.processOrder({
            id: Math.random().toString(36).substr(2, 6).toUpperCase(),
            customerName,
            items,
            total,
            type: orderType,
            address: orderType === 'shipping' ? address : undefined
        });

        setTimeout(() => {
            setIsProcessing(false);
            alert("Order placed successfully! Check console for automation logs.");
            setItems([]); // Clear cart
            setIsOpen(false);
        }, 1500);
    };

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
                            {items.length === 0 ? (
                                <p className={styles.empty}>Your cart is empty.</p>
                            ) : (
                                items.map((item) => (
                                    <div key={item.id} className={styles.item}>
                                        <div className={styles.itemInfo}>
                                            <p className={styles.itemName}>{item.name}</p>
                                            <p className={styles.itemPrice}>${item.price.toFixed(2)} x {item.quantity}</p>
                                        </div>
                                        <div className={styles.itemTotal}>
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {items.length > 0 && (
                            <div className={styles.footer}>
                                {/* Order Type Toggle */}
                                <div className={styles.toggleGroup}>
                                    <button
                                        className={`${styles.toggleBtn} ${orderType === 'pickup' ? styles.active : ''}`}
                                        onClick={() => setOrderType('pickup')}
                                    >
                                        Pickup
                                    </button>
                                    <button
                                        className={`${styles.toggleBtn} ${orderType === 'shipping' ? styles.active : ''}`}
                                        onClick={() => setOrderType('shipping')}
                                    >
                                        Shipping (+$5)
                                    </button>
                                </div>

                                {/* Customer Details */}
                                <div className={styles.form}>
                                    <input
                                        type="text"
                                        placeholder="Your Name *"
                                        className="input"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        style={{ marginBottom: '0.5rem' }}
                                    />
                                    {orderType === 'shipping' && (
                                        <input
                                            type="text"
                                            placeholder="Shipping Address *"
                                            className="input"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                        />
                                    )}
                                </div>

                                <div className={styles.totalRow}>
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                {orderType === 'shipping' && (
                                    <div className={styles.totalRow} style={{ fontSize: '1rem', color: 'hsl(var(--muted-foreground))' }}>
                                        <span>Shipping</span>
                                        <span>${shippingCost.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>

                                <div className={styles.actions}>
                                    <button
                                        className="btn btn-primary"
                                        style={{ width: '100%' }}
                                        onClick={handleCheckout}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? 'Processing...' : 'Place Order'}
                                    </button>
                                    <button className="btn btn-outline" style={{ width: '100%' }}>Message Business</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
