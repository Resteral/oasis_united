"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PayPalButtons } from '@paypal/react-paypal-js';
import styles from './Cart.module.css';
import { AutomationService } from '@/services/automation';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/services/analytics';
import SeatingArrangement from './SeatingArrangement';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

interface CartProps {
    businessId: string;
    items: CartItem[];
    setItems: (items: CartItem[]) => void;
}

export default function Cart({ businessId, items, setItems }: CartProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    // Order State
    const [orderType, setOrderType] = useState<'takeout' | 'shipping' | 'inhouse'>('takeout');
    const [customerName, setCustomerName] = useState('');
    const [customerContact, setCustomerContact] = useState('');
    const [address, setAddress] = useState('');
    const [tableNumber, setTableNumber] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [vendorTier, setVendorTier] = useState('free');
    const [userPoints, setUserPoints] = useState(0);

    // Voucher State
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [voucherError, setVoucherError] = useState('');

    useEffect(() => {
        async function fetchData() {
            if (!businessId) return;

            // 1. Get Vendor Tier
            const { data: business } = await supabase
                .from('businesses')
                .select('owner_id')
                .eq('id', businessId)
                .single();

            if (business?.owner_id) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('subscription_tier')
                    .eq('id', business.owner_id)
                    .single();

                if (profile) setVendorTier(profile.subscription_tier || 'free');
            }

            // 2. Get Loyalty Points
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: loyalty } = await supabase
                    .from('loyalty_points')
                    .select('points')
                    .eq('user_id', user.id)
                    .eq('business_id', businessId)
                    .single();
                if (loyalty) setUserPoints(Number(loyalty.points));
            }
        }
        fetchData();
    }, [businessId]);

    const handleApplyVoucher = async () => {
        if (!promoCode || !businessId) return;
        setVoucherError('');

        const { data: voucher, error } = await supabase
            .from('vouchers')
            .select('*')
            .eq('business_id', businessId)
            .eq('code', promoCode.toUpperCase())
            .eq('is_active', true)
            .single();

        if (error || !voucher) {
            setVoucherError('Invalid or expired code');
            setDiscount(0);
            return;
        }

        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        if (subtotal < Number(voucher.min_spend)) {
            setVoucherError(`Minimum spend of $${voucher.min_spend} required`);
            setDiscount(0);
            return;
        }

        if (voucher.discount_type === 'percentage') {
            setDiscount((subtotal * Number(voucher.discount_value)) / 100);
        } else {
            setDiscount(Number(voucher.discount_value));
        }
    };

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    let shippingCost = 0;
    if (orderType === 'shipping') {
        if (vendorTier === 'silver' || vendorTier === 'free') shippingCost = 10.00;
        else if (vendorTier === 'gold') shippingCost = 5.00;
        else if (vendorTier === 'platinum') shippingCost = 0.00;
        else shippingCost = 10.00;
    }
    
    const total = Math.max(0, subtotal + shippingCost - discount);

    const handleCheckout = async () => {
        if (!customerName || !customerContact) {
            alert("Please enter your name and contact info (Email/Phone)");
            return;
        }
        if (orderType === 'shipping' && !address) {
            alert("Please enter your shipping address");
            return;
        }
        if (orderType === 'inhouse' && !tableNumber) {
            alert("Please enter your table number for in-house service");
            return;
        }

        setIsProcessing(true);

        try {
            // 1. Create the Order via API (handles stock and loyalty)
            const res = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId,
                    customerName,
                    customerContact,
                    items,
                    total,
                    type: orderType,
                    address: orderType === 'shipping' ? address : undefined,
                    tableNumber: orderType === 'inhouse' ? tableNumber : undefined
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Checkout failed');

            // 2. Automation Notify
            await AutomationService.processOrder({
                id: data.order.id,
                customerName,
                items,
                total,
                type: orderType,
                phone: customerContact.includes('+') ? customerContact : undefined
            });

            // 3. Track Analytics
            await trackEvent(businessId, 'purchase', { total, items_count: items.length });

            alert("Order placed successfully! We'll notify you as soon as it's ready.");
            setItems([]);
            setIsOpen(false);
            setCustomerName('');
            setCustomerContact('');
            setAddress('');
            setTableNumber('');
        } catch (err: any) {
            console.error("Checkout failed:", err);
            alert("Checkout failed: " + err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOrderCapture = async (paypalOrderId: string, dbOrderId: string) => {
        try {
            const response = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paypalOrderId, dbOrderId }),
            });
            const data = await response.json();
            if (data.status === 'COMPLETED') {
                // Track Analytics
                await trackEvent(businessId, 'purchase', { total, method: 'paypal' });

                setItems([]);
                setIsOpen(false);
                router.push(`/order/${dbOrderId}`);
            } else {
                alert("Payment failed or is still pending.");
            }
        } catch (error) {
            console.error('Capture Error:', error);
            alert("Error finalizing payment.");
        }
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
                            <div>
                                <h2>Your Order</h2>
                                {userPoints > 0 && (
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">
                                        ✨ {userPoints} Loyalty Points Available
                                    </p>
                                )}
                            </div>
                            <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>✕</button>
                        </div>

                        <div className={styles.items}>
                            {items.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <p className={styles.empty}>Your cart is empty.</p>
                                    <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setIsOpen(false)}>Continue Shopping</button>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={item.id} className={styles.item}>
                                        <div className={styles.itemInfo}>
                                            <p className={styles.itemName}>{item.name}</p>
                                            <p className={styles.itemPrice}>${Number(item.price).toFixed(2)} x {item.quantity}</p>
                                        </div>
                                        <div className={styles.itemTotal}>
                                            ${(Number(item.price) * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {items.length > 0 && (
                            <div className={styles.footer}>
                                <div className={styles.toggleGroup}>
                                    <button
                                        className={`${styles.toggleBtn} ${orderType === 'inhouse' ? styles.active : ''}`}
                                        onClick={() => setOrderType('inhouse')}
                                    >
                                        In-house
                                    </button>
                                    <button
                                        className={`${styles.toggleBtn} ${orderType === 'takeout' ? styles.active : ''}`}
                                        onClick={() => setOrderType('takeout')}
                                    >
                                        Takeout
                                    </button>
                                    <button
                                        className={`${styles.toggleBtn} ${orderType === 'shipping' ? styles.active : ''}`}
                                        onClick={() => setOrderType('shipping')}
                                    >
                                        Delivery {vendorTier === 'platinum' ? '(FREE)' : (vendorTier === 'gold' ? '(+$5)' : '(+$10)')}
                                    </button>
                                </div>

                                <div className={styles.form}>
                                    <input
                                        type="text"
                                        placeholder="Full Name *"
                                        className="input"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        style={{ marginBottom: '0.5rem' }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Email or Phone *"
                                        className="input"
                                        value={customerContact}
                                        onChange={(e) => setCustomerContact(e.target.value)}
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
                                    {orderType === 'inhouse' && (
                                        <div className="mt-4 border-t border-white/5 pt-8 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                            <SeatingArrangement 
                                                businessId={businessId} 
                                                onUnitSelect={(unit) => setTableNumber(unit.label)} 
                                                selectedLabel={tableNumber} 
                                            />
                                            {tableNumber && (
                                                <div className="p-8 bg-amber-400 rounded-[2.5rem] flex items-center justify-between border-2 border-amber-300 shadow-2xl shadow-amber-400/20 translate-y-2 animate-in slide-in-from-bottom-2 duration-300">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-black/40 italic">Confirmed Seating</span>
                                                        <span className="text-3xl font-black italic tracking-tighter text-black uppercase">Table {tableNumber}</span>
                                                    </div>
                                                    <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center text-2xl border border-black/5">🍽️</div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 border-t border-gray-100 pt-4">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Promo Code"
                                            className="input flex-1 uppercase"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value)}
                                        />
                                        <button
                                            onClick={handleApplyVoucher}
                                            className="btn btn-outline"
                                            style={{ padding: '0.5rem 1rem' }}
                                        >
                                            Apply
                                        </button>
                                    </div>
                                    {voucherError && <p className="text-[10px] text-rose-500 font-bold mt-1 uppercase tracking-tighter">{voucherError}</p>}
                                    {discount > 0 && <p className="text-[10px] text-emerald-600 font-bold mt-1 uppercase tracking-tighter">Discount Applied: -${discount.toFixed(2)}</p>}
                                </div>

                                <div className={styles.totalRow}>
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className={styles.totalRow} style={{ color: '#10B981' }}>
                                        <span>Discount</span>
                                        <span>-${discount.toFixed(2)}</span>
                                    </div>
                                )}
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
                                    {customerName && (orderType !== 'shipping' || address) && (orderType !== 'inhouse' || tableNumber) ? (
                                        <div style={{ marginTop: '1rem' }}>
                                            <PayPalButtons
                                                style={{ layout: "vertical" }}
                                                createOrder={async () => {
                                                    const res = await fetch('/api/orders/create', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            businessId,
                                                            customerName,
                                                            customerContact,
                                                            items,
                                                            total,
                                                            type: orderType,
                                                            address
                                                        }),
                                                    });
                                                    const { order } = await res.json();
                                                    const ppRes = await fetch('/api/paypal/create-order', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ total, orderId: order.id }),
                                                    });
                                                    const ppOrder = await ppRes.json();
                                                    (window as any).currentDbOrderId = order.id;
                                                    return ppOrder.id;
                                                }}
                                                onApprove={async (data: any) => {
                                                    await handleOrderCapture(data.orderID, (window as any).currentDbOrderId);
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <button
                                            className="btn btn-primary"
                                            style={{ width: '100%', marginBottom: '0.5rem' }}
                                            onClick={handleCheckout}
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? 'Processing...' : 'Place Order'}
                                        </button>
                                    )}
                                    <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setIsOpen(false)}>Keep Shopping</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
