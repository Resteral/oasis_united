"use client";
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/types';
import { parseProductCSV, generateCSVTemplate } from '@/lib/import_utils';
import Link from 'next/link';

// High-quality stock photo placeholders for a premium feel
const AI_PLACEHOLDERS = [
    "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1000&auto=format&fit=crop", // Coffee
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000&auto=format&fit=crop", // Food
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1000&auto=format&fit=crop", // Retail
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1000&auto=format&fit=crop"  // Skincare
];

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [ddId, setDdId] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [newName, setNewName] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [newCategory, setNewCategory] = useState('General');
    const [newStock, setNewStock] = useState('100');
    const [newImage, setNewImage] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);
    const [isShippable, setIsShippable] = useState(false);
    const [shippingCost, setShippingCost] = useState('0');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: business } = await supabase
            .from('businesses')
            .select('id')
            .eq('owner_id', user.id)
            .single();

        if (business) {
            setBusinessId(business.id);
            const { data: prods } = await supabase
                .from('products')
                .select('*')
                .eq('business_id', business.id)
                .order('created_at', { ascending: false });

            if (prods) setProducts(prods as Product[]);
        }
        setLoading(false);
    };

    const handleGenerateAI = () => {
        const randomImg = AI_PLACEHOLDERS[Math.floor(Math.random() * AI_PLACEHOLDERS.length)];
        setNewImage(randomImg);
        setSelectedFile(null);
    };

    const handleLocalImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            setNewImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleAddProduct = async () => {
        if (!newName.trim()) {
            alert("⚠️ Protocol Warning: Product Name is required.");
            return;
        }
        if (!newPrice || isNaN(parseFloat(newPrice)) || parseFloat(newPrice) < 0) {
            alert("⚠️ Protocol Warning: Valid Price is required.");
            return;
        }
        if (!businessId) {
            alert("❌ System Error: Business Identity not detected. Please restart dashboard.");
            return;
        }

        setLoading(true);
        let finalImageUrl = newImage;

        // 📤 High-Density Storage Upload
        if (selectedFile) {
            const fileName = `${businessId}-${Date.now()}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('products')
                .upload(fileName, selectedFile);

            if (!uploadError) {
                const { data: { publicUrl } } = supabase.storage
                    .from('products')
                    .getPublicUrl(fileName);
                finalImageUrl = publicUrl;
            }
        }

        const newProductData = {
            business_id: businessId,
            name: newName,
            price: parseFloat(newPrice),
            stock: parseInt(newStock) || 0,
            category: newCategory,
            description: newDescription,
            image_url: finalImageUrl || AI_PLACEHOLDERS[Math.floor(Math.random() * AI_PLACEHOLDERS.length)],
            is_featured: isFeatured,
            is_shippable: isShippable,
            shipping_cost: parseFloat(shippingCost) || 0
        };

        const { data, error } = await supabase
            .from('products')
            .insert([newProductData])
            .select()
            .single();

        if (error) {
            alert("Protocol Error: " + error.message);
        } else if (data) {
            setProducts([data as Product, ...products]);
            setIsAdding(false);
            resetForm();
        }
        setLoading(false);
    };

    const resetForm = () => {
        setNewName('');
        setNewPrice('');
        setNewStock('100');
        setNewCategory('General');
        setNewImage('');
        setNewDescription('');
        setIsFeatured(false);
        setIsShippable(false);
        setShippingCost('0');
        setSelectedFile(null);
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) alert("Error deleting product: " + error.message);
        else setProducts(products.filter(p => p.id !== id));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            const result = parseProductCSV(text);

            if (result.success && result.data && businessId) {
                const toInsert = result.data.map(p => ({
                    ...p,
                    business_id: businessId,
                    image_url: p.image_url || AI_PLACEHOLDERS[Math.floor(Math.random() * AI_PLACEHOLDERS.length)]
                }));

                const { error } = await supabase.from('products').insert(toInsert);
                if (!error) {
                    alert(`Successfully imported ${result.count} products!`);
                    fetchProducts();
                    setIsImporting(false);
                } else {
                    alert('Error saving products: ' + error.message);
                }
            } else {
                alert(result.error);
            }
        };
        reader.readAsText(file);
    };

    const downloadTemplate = () => {
        const csv = generateCSVTemplate();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'oasis_product_template.csv';
        a.click();
    };

    // 📡 DoorDash Catalog Bypass Logic
    const handleDDSync = async () => {
        if (!ddId || !businessId) return;
        setLoading(true);
        try {
            // Simulated DoorDash Menu Ingest (Bypassing Dispatch)
            const mockDDMenu = [
                { name: "DD Artisan Latte", price: 5.50, category: "Beverages", description: "Imported via DoorDash Catalog Node" },
                { name: "DD Breakfast Panini", price: 12.00, category: "Food", description: "Imported via DoorDash Catalog Node" }
            ];

            const toInsert = mockDDMenu.map(p => ({
                ...p,
                business_id: businessId,
                image_url: AI_PLACEHOLDERS[Math.floor(Math.random() * AI_PLACEHOLDERS.length)],
                stock: 99
            }));

            const { error } = await supabase.from('products').insert(toInsert);
            if (error) throw error;

            await supabase
                .from('businesses')
                .update({ external_sync_id: ddId, external_sync_source: 'doordash' })
                .eq('id', businessId);

            alert("🎉 DoorDash Catalog Synchronized! Products are now live for Oasis Fleet Delivery.");
            fetchProducts();
            setIsSyncing(false);
        } catch (err: any) {
            alert("Sync Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="p-12 text-gray-400 font-black animate-pulse uppercase tracking-widest text-center">
            Loading Inventory...
        </div>
    );

    return (
        <div className="space-y-12 max-w-7xl mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase italic">Inventory</h1>
                    <p className="mt-2 text-lg text-gray-500 font-medium italic">Manage your products and regional stock levels.</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/price-compass" className="px-6 py-4 bg-white border border-gray-200 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-3">
                        📉 Market Intel
                    </Link>
                    <button
                        className="px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-xs tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm uppercase flex items-center gap-2"
                        onClick={() => {
                            setIsSyncing(!isSyncing);
                            setIsImporting(false);
                        }}
                    >
                        🚀 Sync External
                    </button>
                    <button
                        className="px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-xs tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm uppercase"
                        onClick={() => {
                            setIsImporting(!isImporting);
                            setIsSyncing(false);
                        }}
                    >
                        {isImporting ? 'Cancel Import' : 'Bulk Import'}
                    </button>
                    <button
                        className={`px-8 py-4 rounded-2xl font-black text-xs tracking-widest transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 uppercase ${isAdding ? 'bg-gray-100 text-gray-400' : 'bg-indigo-600 text-white'}`}
                        onClick={() => {
                            setIsAdding(!isAdding);
                            if (!isAdding) setIsImporting(false);
                        }}
                    >
                        {isAdding ? 'Cancel' : '+ Add Product'}
                    </button>
                </div>
            </div>

            {isImporting && (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-10 rounded-[3rem] text-center space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Bulk Import Products</h3>
                        <button
                            className="bg-gray-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                            onClick={downloadTemplate}
                        >
                            Download Template
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 font-medium max-w-md mx-auto">Upload a CSV file containing your product list. Required columns: Name, Price.</p>
                    <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                    <div
                        className="p-12 border-2 border-white rounded-[2rem] bg-white/50 cursor-pointer hover:bg-white transition-all group"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <span className="text-lg font-black text-gray-400 group-hover:text-indigo-600 uppercase tracking-widest">Click to select Oasis CSV File</span>
                    </div>
                </div>
            )}

            {isSyncing && (
                <div className="bg-[#FF3008]/5 border-2 border-[#FF3008]/20 p-12 rounded-[3.5rem] space-y-8 animate-in zoom-in duration-500">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="space-y-2 text-center md:text-left">
                            <h3 className="text-2xl font-black text-[#FF3008] uppercase italic leading-none">DoorDash Ingest <br />Bypass.</h3>
                            <p className="text-sm font-medium text-slate-500 max-w-sm">Synchronize your existing DoorDash menu directly into Oasis. <b>Dispatch remains 100% internal to Oasis Fleet.</b></p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <input 
                                placeholder="DD Store ID / URL"
                                value={ddId}
                                onChange={(e) => setDdId(e.target.value)}
                                className="px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-sm outline-none focus:ring-4 focus:ring-[#FF3008]/10 min-w-[240px]"
                            />
                            <button 
                                onClick={handleDDSync}
                                className="px-10 py-4 bg-[#FF3008] text-white rounded-2xl font-black text-xs tracking-widest uppercase shadow-xl shadow-[#FF3008]/20 hover:scale-[1.02] transition-all"
                            >
                                Initiate Sync
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isAdding && (
                <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 relative z-10">
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
                        <span className="text-2xl">📦</span>
                        <h2 className="text-2xl font-black text-gray-900 uppercase">New Product Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Product Name</label>
                            <input
                                placeholder="e.g. Artisanal Espresso"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full p-5 border border-slate-200 rounded-[1.5rem] bg-white text-slate-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-black text-sm shadow-sm"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Category</label>
                            <select
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="w-full p-5 border border-slate-200 rounded-[1.5rem] bg-white text-slate-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-black text-sm shadow-sm appearance-none cursor-pointer"
                            >
                                <option>General</option>
                                <option>Retail</option>
                                <option>Food</option>
                                <option>Artisan</option>
                                <option>Electronics</option>
                                <option>Outdoor</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Price ($)</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                className="w-full p-5 border border-slate-200 rounded-[1.5rem] bg-white text-slate-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-black text-sm shadow-sm"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Initial Stock</label>
                            <input
                                type="number"
                                value={newStock}
                                onChange={(e) => setNewStock(e.target.value)}
                                className="w-full p-5 border border-slate-200 rounded-[1.5rem] bg-white text-slate-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-black text-sm shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2 space-y-3">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Universal Description</label>
                            <textarea
                                placeholder="Tell customers about the artisan details of this product..."
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                className="w-full p-5 border border-slate-200 rounded-[1.5rem] bg-white text-slate-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-bold text-sm shadow-sm h-32 resize-none"
                            />
                        </div>
                        
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                                <div className="space-y-0.5">
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-900 italic">Verified Drop</span>
                                    <span className="block text-[9px] font-medium text-slate-400">Promote to Oasis Discovery</span>
                                </div>
                                <button 
                                    onClick={() => setIsFeatured(!isFeatured)}
                                    className={`w-12 h-7 rounded-full transition-all relative ${isFeatured ? 'bg-indigo-600 shadow-[0_0_12px_rgba(79,70,229,0.4)]' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${isFeatured ? 'left-6' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-6 bg-emerald-50/50 rounded-[1.5rem] border border-emerald-100/50">
                                <div className="space-y-0.5">
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-900 italic">Universal Shipping</span>
                                    <span className="block text-[9px] font-medium text-emerald-600/70">Enable Global Discovery</span>
                                </div>
                                <button 
                                    onClick={() => setIsShippable(!isShippable)}
                                    className={`w-12 h-7 rounded-full transition-all relative ${isShippable ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${isShippable ? 'left-6' : 'left-1'}`}></div>
                                </button>
                            </div>

                            {isShippable && (
                                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                                    <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest pl-1">Global Shipping Cost ($)</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        step="0.01"
                                        value={shippingCost}
                                        onChange={(e) => setShippingCost(e.target.value)}
                                        className="w-full p-4 border border-emerald-200 rounded-[1.5rem] bg-white text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-black text-sm shadow-sm"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Image</label>
                        <div className="flex flex-col md:flex-row gap-4">
                            <input
                                placeholder="Image URL (paste or generate)"
                                value={newImage}
                                onChange={(e) => setNewImage(e.target.value)}
                                className="flex-1 p-4 border border-gray-100 rounded-2xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-mono text-xs overflow-hidden text-ellipsis"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={imageInputRef}
                                    onChange={handleLocalImageSelect}
                                />
                                <button
                                    onClick={() => imageInputRef.current?.click()}
                                    className="px-6 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-black text-[10px] tracking-widest shadow-sm hover:bg-gray-50 transition-all uppercase"
                                >
                                    📁 Browse
                                </button>
                                <button
                                    onClick={handleGenerateAI}
                                    className="px-6 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] tracking-widest shadow-lg hover:bg-indigo-600 transition-all uppercase"
                                >
                                    ✨ AI Image
                                </button>
                            </div>
                        </div>
                        {newImage && (
                            <div className="mt-4 relative w-48 h-48 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl">
                                <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => setNewImage('')}
                                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleAddProduct}
                            className="px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm tracking-widest shadow-xl hover:bg-indigo-700 transform transition-all hover:-translate-y-1 uppercase"
                        >
                            Publish Product
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.length === 0 && !isAdding && (
                    <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                        <span className="text-6xl block mb-6">🏜️</span>
                        <h3 className="text-2xl font-black text-gray-900 uppercase italic">No products yet</h3>
                        <p className="text-gray-400 mt-2 font-medium">Start your catalog by adding your first product or importing a CSV.</p>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="mt-8 px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-[10px] tracking-widest shadow-lg uppercase"
                        >
                            Add First Product
                        </button>
                    </div>
                )}
                {products.map((product) => (
                    <div key={product.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
                        <div className="relative h-64 overflow-hidden">
                            <img
                                src={product.image_url || AI_PLACEHOLDERS[0]}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute top-6 left-6">
                                <span className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full text-[9px] font-black tracking-[0.1em] text-gray-900 border border-white/20 shadow-sm uppercase">
                                    {product.category || 'GENERAL'}
                                </span>
                            </div>
                            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 flex flex-col gap-2">
                                <button className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-gray-900 hover:bg-indigo-600 hover:text-white transition-all transform hover:rotate-12 active:scale-90">
                                    ✏️
                                </button>
                                <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all transform hover:-rotate-12 active:scale-90"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                        <div className="p-8 space-y-5">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-black text-gray-900 truncate pr-4 leading-tight italic uppercase tracking-tight">{product.name}</h3>
                                <div className="text-2xl font-black text-indigo-600 tracking-tighter">${Number(product.price).toFixed(2)}</div>
                            </div>
                            {product.description && (
                                <p className="text-xs text-gray-500 line-clamp-2 font-medium">{product.description}</p>
                            )}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full ${product.stock > 10 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 animate-pulse'}`}></div>
                                    <span className={`text-[10px] font-black tracking-[0.05em] uppercase ${product.stock > 10 ? 'text-gray-400' : 'text-rose-500'}`}>
                                        {product.stock} IN STOCK
                                    </span>
                                </div>
                                <button className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                                    Analytics →
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
