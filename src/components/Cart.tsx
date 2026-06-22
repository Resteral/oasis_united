"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PayPalButtons } from '@paypal/react-paypal-js';
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

            const { data: business } = await supabase.from('businesses').select('owner_id').eq('id', businessId).single();
            if (business?.owner_id) {
                const { data: profile } = await supabase.from('profiles').select('subscription_tier').eq('id', business.owner_id).single();
                if (profile) setVendorTier(profile.subscription_tier || 'free');
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: loyalty } = await supabase.from('loyalty_points').select('points').eq('user_id', user.id).eq('business_id', businessId).single();
                if (loyalty) setUserPoints(Number(loyalty.points));
            }
        }
        fetchData();
    }, [businessId]);

    const handleApplyVoucher = async () => {
        if (!promoCode || !businessId) return;
        setVoucherError('');
        const { data: voucher, error } = await supabase.from('vouchers').select('*').eq('business_id', businessId).eq('code', promoCode.toUpperCase()).eq('is_active', true).single();
        if (error || !voucher) { setVoucherError('Invalid or expired code'); setDiscount(0); return; }
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        if (subtotal < Number(voucher.min_spend)) { setVoucherError(`Min spend $${voucher.min_spend} required`); setDiscount(0); return; }
        setDiscount(voucher.discount_type === 'percentage' ? (subtotal * Number(voucher.discount_value)) / 100 : Number(voucher.discount_value));
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
        if (!customerName || !customerContact) { alert("Please enter name and contact (Email/Phone)"); return; }
        if (orderType === 'shipping' && !address) { alert("Please enter shipping address"); return; }
        if (orderType === 'inhouse' && !tableNumber) { alert("Please select a table"); return; }
        setIsProcessing(true);
        try {
            const res = await fetch('/api/orders/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ businessId, customerName, customerContact, items, total, type: orderType, address: orderType === 'shipping' ? address : undefined, tableNumber: orderType === 'inhouse' ? tableNumber : undefined }), });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Checkout failed');
            await AutomationService.processOrder({ id: data.order.id, customerName, items, total, type: orderType, phone: customerContact.includes('+') ? customerContact : undefined });
            await trackEvent(businessId, 'purchase', { total, items_count: items.length });
            setItems([]); setIsOpen(false); router.push(`/order/${data.order.id}`);
        } catch (err: any) { alert("Checkout failed: " + err.message); } finally { setIsProcessing(false); }
    };

    const handleOrderCapture = async (paypalOrderId: string, dbOrderId: string) => {
        try {
            const response = await fetch('/api/paypal/capture-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paypalOrderId, dbOrderId }), });
            const data = await response.json();
            if (data.status === 'COMPLETED') { await trackEvent(businessId, 'purchase', { total, method: 'paypal' }); setItems([]); setIsOpen(false); router.push(`/order/${dbOrderId}`); }
            else alert("Payment failed or is still pending.");
        } catch (error) { alert("Error finalizing payment."); }
    };

    return (
        <>
            <button className="fixed bottom-10 right-10 z-[200] p-6 bg-indigo-600 text-white rounded-[2.5rem] shadow-3xl hover:scale-110 active:scale-90 transition-all group flex items-center gap-4 border border-indigo-500/20" onClick={() => setIsOpen(true)}>
                <span className="text-2xl group-hover:rotate-12 transition-transform">🛍️</span>
                <span className="text-lg font-black italic tracking-tighter">{items.length}</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-xl flex justify-end animate-in fade-in duration-500">
                    <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>
                    <div className="w-full max-w-2xl bg-[#0a0a0b] h-full shadow-3xl border-l border-white/5 overflow-y-auto relative animate-in slide-in-from-right duration-700">
                        
                        {/* Header Section */}
                        <div className="p-12 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#0a0a0b]/80 backdrop-blur-2xl z-10">
                            <div className="space-y-2">
                                <h2 className="text-5xl font-black italic tracking-tighter uppercase text-white leading-none">Your <span className="text-indigo-500">Order.</span></h2>
                                {userPoints > 0 && (
                                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] italic">✨ {userPoints} Loyalty Creds Active</p>
                                )}
                            </div>
                            <button onClick={() => setIsOpen(false)} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                                <span className="text-xl">✕</span>
                            </button>
                        </div>

                        {/* Items Section */}
                        <div className="p-12 space-y-10">
                            {items.length === 0 ? (
                                <div className="py-20 text-center space-y-8 animate-in zoom-in duration-700">
                                    <span className="text-6xl block opacity-20">🛒</span>
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 italic">Order Matrix Empty</p>
                                    <button className="text-[10px] font-black uppercase tracking-widest text-indigo-400 underline underline-offset-8" onClick={() => setIsOpen(false)}>Acquire Assets →</button>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={item.id} className="group relative flex items-center justify-between p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.05] transition-all">
                                        <div className="space-y-1">
                                            <p className="text-xl font-black italic tracking-tighter text-white uppercase">{item.name}</p>
                                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">${Number(item.price).toFixed(2)} x {item.quantity}</p>
                                        </div>
                                        <div className="text-2xl font-black italic tracking-tighter text-white">
                                            ${(Number(item.price) * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {items.length > 0 && (
                            <div className="p-12 space-y-12">
                                {/* Logistics Switcher */}
                                <div className="space-y-6">
                                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">Logistics Routing</p>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { id: 'inhouse', label: 'In-house', icon: '🍽️' },
                                            { id: 'takeout', label: 'Takeout', icon: '🏃' },
                                            { id: 'shipping', label: 'Delivery', icon: '🚚' }
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => setOrderType(t.id as any)}
                                                className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${orderType === t.id ? 'bg-indigo-600 border-indigo-500 shadow-xl' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'}`}
                                            >
                                                <span className="text-2xl">{t.icon}</span>
                                                <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Identity & Coordinates */}
                                <div className="space-y-4">
                                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 italic">Uplink Identity</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            className="w-full p-6 bg-white/[0.03] border border-white/5 focus:border-indigo-500 focus:bg-white/[0.06] outline-none rounded-3xl font-black text-xs uppercase tracking-widest transition-all placeholder:text-white/10 italic"
                                            placeholder="Full Name Protocol *"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                        />
                                        <input
                                            className="w-full p-6 bg-white/[0.03] border border-white/5 focus:border-indigo-500 focus:bg-white/[0.06] outline-none rounded-3xl font-black text-xs uppercase tracking-widest transition-all placeholder:text-white/10 italic"
                                            placeholder="Contact Stream (Email/Phone) *"
                                            value={customerContact}
                                            onChange={(e) => setCustomerContact(e.target.value)}
                                        />
                                    </div>
                                    {orderType === 'shipping' && (
                                        <input
                                            className="w-full p-6 bg-white/[0.03] border border-white/5 focus:border-indigo-500 focus:bg-white/[0.06] outline-none rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all placeholder:text-white/10 italic animate-in slide-in-from-top-4 duration-500"
                                            placeholder="Geographic Dispatch Coordinates *"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                        />
                                    )}
                                    {orderType === 'inhouse' && (
                                        <div className="pt-8 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                            <SeatingArrangement 
                                                businessId={businessId} 
                                                onUnitSelect={(unit) => setTableNumber(unit.label)} 
                                                selectedLabel={tableNumber} 
                                            />
                                            {tableNumber && (
                                                <div className="p-8 bg-amber-400 rounded-[2.5rem] flex items-center justify-between border-2 border-amber-300 shadow-2xl shadow-amber-400/20 translate-y-2 animate-in slide-in-from-bottom-2 duration-300">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-black/40 italic">Confirmed Seating</span>
                                                        <span className="text-3xl font-black italic tracking-tighter text-black uppercase leading-none">Table {tableNumber}</span>
                                                    </div>
                                                    <div className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center text-2xl border border-black/5">🍽️</div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Vouchers */}
                                <div className="pt-8 border-t border-white/5 space-y-6">
                                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">Voucher Override</p>
                                    <div className="flex gap-4">
                                        <input
                                            className="flex-1 p-5 bg-white/[0.03] border border-white/5 border-dashed focus:border-indigo-500/40 rounded-2xl font-black text-[10px] uppercase tracking-widest outline-none placeholder:text-white/10"
                                            placeholder="Promo Signal"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                        />
                                        <button onClick={handleApplyVoucher} className="px-8 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Identify</button>
                                    </div>
                                    {voucherError && <p className="text-[8px] text-rose-500 font-black uppercase tracking-widest">{voucherError}</p>}
                                    {discount > 0 && <p className="text-[8px] text-emerald-500 font-black uppercase tracking-widest">Discount Synchronized: -${discount.toFixed(2)}</p>}
                                </div>

                                {/* Settlement Matrix */}
                                <div className="p-10 bg-white/[0.03] border border-white/5 rounded-[3rem] space-y-4">
                                    <div className="flex justify-between items-center text-white/40">
                                        <span className="text-[10px] font-black uppercase tracking-widest">Aggregate Assets</span>
                                        <span className="font-black italic tracking-tighter">${subtotal.toFixed(2)}</span>
                                    </div>
                                    {orderType === 'shipping' && (
                                        <div className="flex justify-between items-center text-indigo-400">
                                            <span className="text-[10px] font-black uppercase tracking-widest">Transit Latency Fee</span>
                                            <span className="font-black italic tracking-tighter">${shippingCost.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {discount > 0 && (
                                        <div className="flex justify-between items-center text-emerald-500">
                                            <span className="text-[10px] font-black uppercase tracking-widest">Voucher Remission</span>
                                            <span className="font-black italic tracking-tighter">-${discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pt-6 border-t border-white/5">
                                        <span className="text-xl font-black italic text-white uppercase tracking-tighter italic">Total Settlement</span>
                                        <span className="text-4xl font-black italic text-white tracking-tighter">${total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Final Actions */}
                                <div className="space-y-4">
                                    {customerName && (orderType !== 'shipping' || address) && (orderType !== 'inhouse' || tableNumber) ? (
                                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                            <PayPalButtons
                                                style={{ layout: "vertical", shape: "rect" }}
                                                createOrder={async () => {
                                                    const res = await fetch('/api/orders/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ businessId, customerName, customerContact, items, total, type: orderType, address }), });
                                                    const { order } = await res.json();
                                                    const ppRes = await fetch('/api/paypal/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ total, orderId: order.id }), });
                                                    const ppOrder = await ppRes.json();
                                                    (window as any).currentDbOrderId = order.id;
                                                    return ppOrder.id;
                                                }}
                                                onApprove={async (data: any) => { await handleOrderCapture(data.orderID, (window as any).currentDbOrderId); }}
                                            />
                                        </div>
                                    ) : (
                                        <button
                                            className="w-full py-8 bg-indigo-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] hover:scale-[1.02] shadow-3xl shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50"
                                            onClick={handleCheckout}
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? 'SYNCHRONIZING...' : 'AUTHORIZE SETTLEMENT'}
                                        </button>
                                    )}
                                    <button className="w-full py-6 bg-white/5 border border-white/10 rounded-[2rem] text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all italic" onClick={() => setIsOpen(false)}>Rescan Global Hubs</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
