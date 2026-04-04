"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AddProductModalProps {
    businessId: string;
    onSuccess: () => void;
}

export default function AddProductModal({ businessId, onSuccess }: AddProductModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        price: '',
        category: 'Grocery',
        description: '',
        image_url: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('products')
                .insert([{
                    business_id: businessId,
                    name: form.name,
                    price: parseFloat(form.price),
                    category: form.category,
                    description: form.description,
                    image_url: form.image_url || null
                }]);

            if (error) throw error;
            
            setForm({ name: '', price: '', category: 'Grocery', description: '', image_url: '' });
            setIsOpen(false);
            onSuccess();
            alert("Product added to your regional node!");
        } catch (err: any) {
            alert("Oops: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20"
            >
                ➕ Add New Product
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#111114] border border-white/10 w-full max-w-lg rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 grayscale pointer-events-none">
                    <span className="text-9xl font-black italic">📦</span>
                </div>
                
                <div className="space-y-2 relative z-10">
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Expand Your Discovery.</h2>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30 italic">Initialize a new regional node in your boutique registry</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[8px] font-black uppercase tracking-widest text-white/20">Name</label>
                            <input 
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-all"
                                value={form.name}
                                onChange={e => setForm({...form, name: e.target.value})}
                                placeholder="e.g. Local Honey"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[8px] font-black uppercase tracking-widest text-white/20">Price ($)</label>
                            <input 
                                required
                                type="number"
                                step="0.01"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-all"
                                value={form.price}
                                onChange={e => setForm({...form, price: e.target.value})}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase tracking-widest text-white/20">Category</label>
                        <select 
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-all appearance-none"
                            value={form.category}
                            onChange={e => setForm({...form, category: e.target.value})}
                        >
                            <option value="Grocery">Grocery</option>
                            <option value="Restaurant">Restaurant</option>
                            <option value="Hardware">Hardware</option>
                            <option value="Service">Service</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase tracking-widest text-white/20">Description</label>
                        <textarea 
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-all h-24 resize-none"
                            value={form.description}
                            onChange={e => setForm({...form, description: e.target.value})}
                            placeholder="Tell the community about this discovery..."
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button 
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Initializing...' : 'Confirm Node'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
