"use client";
import { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Cell
} from 'recharts';

// Simulated Merchant Data for the region
const REVENUE_DATA = [
  { day: 'Mon', revenue: 420 },
  { day: 'Tue', revenue: 580 },
  { day: 'Wed', revenue: 390 },
  { day: 'Thu', revenue: 720 },
  { day: 'Fri', revenue: 1100 },
  { day: 'Sat', revenue: 1450 },
  { day: 'Sun', revenue: 980 },
];

const INVENTORY = [
  { id: 1, name: 'Fresh Pizza Dough', stock: 45, unit: 'units', price: 8.50, status: 'In Stock' },
  { id: 2, name: 'Premium Pepperoni', stock: 12, unit: 'kg', price: 14.00, status: 'Low Stock' },
  { id: 3, name: 'Sourdough Starters', stock: 5, unit: 'units', price: 9.00, status: 'Critical' },
  { id: 4, name: 'Artisan Coffee Beans', stock: 85, unit: 'bags', price: 18.00, status: 'In Stock' },
  { id: 5, name: 'Organic Honey (Qt)', stock: 24, unit: 'jars', price: 12.00, status: 'In Stock' },
];

export default function MerchantAnalytics() {
  const [activeTab, setActiveTab] = useState<'revenue' | 'inventory'>('revenue');

  const totalRevenue = useMemo(() => REVENUE_DATA.reduce((acc, curr) => acc + curr.revenue, 0), []);
  const lowStockCount = useMemo(() => INVENTORY.filter(i => i.status !== 'In Stock').length, []);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-8 lg:p-12 selection:bg-amber-400 selection:text-black">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 text-amber-400 rounded-full border border-amber-400/20">
              <span className="w-1 h-1 bg-amber-400 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-widest">Merchant Mission Control</span>
            </div>
            <h1 className="text-6xl font-black italic tracking-tighter leading-none">Store <span className="text-amber-400">Database.</span></h1>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-widest opacity-60">Real-time Revenue & Inventory Intelligence</p>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('revenue')}
              className={`px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'revenue' ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
            >
              📈 Revenue Analytics
            </button>
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
            >
              📦 Inventory Management
            </button>
          </div>
        </header>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-2">
            <div className="text-[10px] font-black uppercase tracking-widest text-amber-400">Weekly Revenue</div>
            <div className="text-5xl font-black italic tracking-tighter">${totalRevenue.toLocaleString()}</div>
            <div className="text-[10px] font-bold text-green-400 uppercase tracking-widest">+12.5% from last week</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-2">
            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Inventory Status</div>
            <div className="text-5xl font-black italic tracking-tighter">{lowStockCount} Items</div>
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Requiring immediate attention</div>
          </div>
          <div className="bg-amber-400 rounded-[3rem] p-10 space-y-2 text-black shadow-2xl shadow-amber-400/20">
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Active Orders</div>
            <div className="text-5xl font-black italic tracking-tighter">24 Live</div>
            <div className="text-[10px] font-bold uppercase tracking-widest">Ready for local dispatch</div>
          </div>
        </div>

        {activeTab === 'revenue' ? (
          <div className="bg-white/5 border border-white/10 rounded-[4rem] p-12 h-[500px] shadow-2xl">
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-2xl font-black italic tracking-tight">Revenue Trends</h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-white/10 border border-white/10 rounded-full text-[9px] font-black uppercase">Daily</span>
                <span className="px-3 py-1 text-white/40 rounded-full text-[9px] font-black uppercase hover:text-white cursor-pointer">Weekly</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="80%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900}} 
                  dy={20}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900}} 
                />
                <Tooltip 
                  contentStyle={{backgroundColor: '#1a1a1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#fbbf24" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-[4rem] p-12 shadow-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Product Name</th>
                  <th className="pb-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Current Stock</th>
                  <th className="pb-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Unit Price</th>
                  <th className="pb-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Status</th>
                  <th className="pb-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {INVENTORY.map((item) => (
                  <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-8 font-black italic tracking-tight">{item.name}</td>
                    <td className="py-8 font-bold text-gray-400">{item.stock} {item.unit}</td>
                    <td className="py-8 font-black text-amber-400">${item.price.toFixed(2)}</td>
                    <td className="py-8">
                      <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        item.status === 'In Stock' ? 'bg-green-400/10 text-green-400' : 
                        item.status === 'Low Stock' ? 'bg-amber-400/10 text-amber-400' : 'bg-red-400/10 text-red-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-8">
                      <button className="text-[9px] font-black uppercase tracking-widest text-white/20 group-hover:text-amber-400 transition-colors">Adjust Stock →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
