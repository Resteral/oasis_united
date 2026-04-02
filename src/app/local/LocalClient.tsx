"use client";
import { useState } from 'react';
import Link from 'next/link';

interface Shop {
  id: string;
  name: string;
  category: string;
  location: string;
  x: number; // Percent from left
  y: number; // Percent from top
  products: { name: string; price: number }[];
  icon: string;
}

const EFFINGHAM_SHOPS: Shop[] = [
  {
    id: 'pnb-eats',
    name: "PNB Eats",
    category: "Pizza & Subs",
    location: "Effingham",
    x: 45, y: 35,
    icon: '🍕',
    products: [
      { name: 'Large Pepperoni', price: 18.50 },
      { name: 'Breakfast Sub', price: 12.99 }
    ]
  },
  {
    id: 'boyles',
    name: "Boyle's General Store",
    category: "Grocery",
    location: "Effingham Falls",
    x: 30, y: 55,
    icon: '🍎',
    products: [
      { name: 'Local Honey', price: 9.00 },
      { name: 'Artisan Cheese', price: 7.50 },
      { name: 'Milk (Gal)', price: 4.89 }
    ]
  },
  {
    id: 'wayside',
    name: "Wayside Farm stand",
    category: "Farm & Grocery",
    location: "Effingham",
    x: 52, y: 55,
    icon: '🌽',
    products: [
      { name: 'Fresh Corn (Doz)', price: 7.00 },
      { name: 'Heirloom Tomatoes (lb)', price: 4.50 },
      { name: 'Local Eggs (Doz)', price: 6.00 }
    ]
  },
  {
    id: 'village-store',
    name: "Olde Village Store",
    category: "Groceries & Gift",
    location: "Effingham",
    x: 40, y: 65,
    icon: '🏡',
    products: [
      { name: 'Coffee (lb)', price: 14.99 },
      { name: 'Maple Syrup (Pt)', price: 18.00 },
      { name: 'Penny Candy Mix', price: 2.50 }
    ]
  },
  {
    id: 'moose',
    name: "Muddy Moose Pub",
    category: "Restaurant",
    location: "North Conway",
    x: 20, y: 20,
    icon: '🦌',
    products: [
      { name: 'Moose Burger', price: 16.50 },
      { name: 'Lodge Ribs', price: 24.00 }
    ]
  },
  {
    id: 'artisans',
    name: "Artisans of the Lakes",
    category: "Art & Boutique",
    location: "Wolfeboro",
    x: 15, y: 75,
    icon: '🎨',
    products: [
      { name: 'Hand-blown Vase', price: 85.00 },
      { name: 'Local Landscape (Print)', price: 45.00 }
    ]
  },
  {
    id: 'mtn-farm',
    name: "Mountain View Farm",
    category: "Farm & Fresh",
    location: "Effingham",
    x: 58, y: 30,
    icon: '🚜',
    products: [
      { name: 'Raw Honey (1lb)', price: 12.00 },
      { name: 'Organic Hay (Bale)', price: 8.50 }
    ]
  },
  {
    id: 'woodstone',
    name: "Woodstone Fine Furniture",
    category: "Hardware & Design",
    location: "Effingham Falls",
    x: 35, y: 45,
    icon: '🛋️',
    products: [
      { name: 'Custom Pine Table', price: 850.00 },
      { name: 'Hand-carved Bowl', price: 35.00 }
    ]
  },
  {
    id: 'river-hardware',
    name: "Ossipee River Hardware",
    category: "Hardware",
    location: "Ossipee",
    x: 82, y: 70,
    icon: '🔧',
    products: [
      { name: 'Snow Shovel (HD)', price: 28.99 },
      { name: 'Generator Oil (Qt)', price: 6.50 }
    ]
  },
  {
    id: 'subway',
    name: "Subway",
    category: "Quick Eats",
    location: "Ossipee",
    x: 85, y: 35,
    icon: '🥖',
    products: [
      { name: 'Footlong Sub', price: 11.50 },
      { name: '6" Sub Combo', price: 8.99 },
      { name: 'Cookie (3pk)', price: 2.50 },
      { name: 'Fountain Soda', price: 2.89 }
    ]
  },
  {
    id: 'dunkin',
    name: "Dunkin'",
    category: "Coffee & Donuts",
    location: "Effingham Falls",
    x: 32, y: 75,
    icon: '☕',
    products: [
      { name: 'Iced Coffee (Lg)', price: 3.89 },
      { name: 'Doz. Donuts', price: 14.00 }
    ]
  },
  {
    id: 'ace-hardware',
    name: "Ace Hardware of Ossipee",
    category: "Hardware",
    location: "Ossipee",
    x: 78, y: 55,
    icon: '🏢',
    products: [
      { name: 'Propane Refill', price: 21.00 },
      { name: 'House Paint (Gal)', price: 42.00 }
    ]
  },
  {
    id: 'profile-bank',
    name: "Profile Bank",
    category: "Banking",
    location: "Effingham",
    x: 48, y: 70,
    icon: '🏦',
    products: [
      { name: 'ATM Service', price: 0 },
      { name: 'Local Business Loan', price: 1 }
    ]
  },
  {
    id: 'mvsb',
    name: "Meredith Village Savings Bank",
    category: "Banking",
    location: "Ossipee",
    x: 72, y: 25,
    icon: '🏧',
    products: [
      { name: 'Safe Deposit (Sm)', price: 45.00 },
      { name: 'Notary Service', price: 0 }
    ]
  },
  {
    id: 'ossipee-auto',
    name: "Ossipee Auto & Tire",
    category: "Auto Repair",
    location: "Ossipee",
    x: 88, y: 55,
    icon: '🔧',
    products: [
      { name: 'Oil Change (Synth)', price: 65.00 },
      { name: 'Tire Rotation', price: 25.00 }
    ]
  },
  {
    id: 'oreilly',
    name: "O'Reilly Auto Parts",
    category: "Auto Parts",
    location: "Ossipee",
    x: 90, y: 40,
    icon: '🏎️',
    products: [
      { name: 'Wiper Blades (Pair)', price: 34.00 },
      { name: 'Motor Oil (5qt)', price: 29.99 },
      { name: 'Oil Filter', price: 12.00 },
      { name: 'Antifreeze', price: 15.50 },
      { name: 'Brake Pads', price: 65.00 }
    ]
  },
  {
    id: 'job-lot',
    name: "Ocean State Job Lot",
    category: "Discount Retail",
    location: "Ossipee",
    x: 75, y: 15,
    icon: '🎪',
    products: [
      { name: 'Bulk Pasta (10lb)', price: 9.50 },
      { name: 'Gardening Kit', price: 15.00 }
    ]
  },
  {
    id: 'irving',
    name: "Irving Gas & Station",
    category: "Fuel & Convenience",
    location: "Effingham",
    x: 40, y: 25,
    icon: '⛽',
    products: [
      { name: 'Regular Fuel (Gal)', price: 3.45 },
      { name: 'Coffee & Breakfast', price: 6.50 },
      { name: 'Windshield Fluid', price: 4.89 },
      { name: 'Bagged Ice', price: 2.99 }
    ]
  },
  {
    id: 'garwoods',
    name: "Garwoods Restaurant",
    category: "Dining",
    location: "Wolfeboro",
    x: 10, y: 85,
    icon: '🍔',
    products: [
      { name: 'Lobster Roll', price: 32.00 },
      { name: 'Classic Burger', price: 17.00 }
    ]
  },
  {
    id: 'rites-of-passage',
    name: "Rites of Passage",
    category: "Gift Shop",
    location: "Wolfeboro",
    x: 12, y: 65,
    icon: '🎁',
    products: [
      { name: 'Local Souvenir', price: 12.00 },
      { name: 'Lakeside Candle', price: 24.50 }
    ]
  },
  {
    id: 'hobbs',
    name: "Hobbs Tavern & Brewing",
    category: "Brewery & Dining",
    location: "West Ossipee",
    x: 85, y: 15,
    icon: '🍺',
    products: [
      { name: 'Hobbs Burger', price: 18.00 },
      { name: 'Beer Flight', price: 15.00 }
    ]
  },
  {
    id: 'smokehouse',
    name: "Yankee Smokehouse",
    category: "BBQ Dining",
    location: "West Ossipee",
    x: 88, y: 22,
    icon: '🍖',
    products: [
      { name: 'Pulled Pork Plat', price: 21.00 },
      { name: 'Rack of Ribs', price: 32.00 }
    ]
  },
  {
    id: 'rosies',
    name: "Rosie's Restaurant",
    category: "Breakfast & Lunch",
    location: "Tamworth/Ossipee",
    x: 75, y: 8,
    icon: '🍳',
    products: [
      { name: 'Lumberjack Breakfast', price: 14.50 },
      { name: 'Homemade Pie', price: 6.00 }
    ]
  },
  {
    id: 'aubuchon',
    name: "Aubuchon Hardware",
    category: "Hardware",
    location: "Moultonborough",
    x: 10, y: 35,
    icon: '🏗️',
    products: [
      { name: 'Wood Pellets (Bag)', price: 7.99 },
      { name: 'Drill Bit Set', price: 24.00 }
    ]
  },
  {
    id: 'sheehans',
    name: "Sheehan's Lumber Yard",
    category: "Lumber & Hardware",
    location: "Ossipee",
    x: 80, y: 48,
    icon: '🪵',
    products: [
      { name: '2x4x8 Stud', price: 4.89 },
      { name: 'Plywood (Sheet)', price: 32.00 }
    ]
  },
  {
    id: 'tractor-supply',
    name: "Tractor Supply Co.",
    category: "Farm & Hardware",
    location: "Ossipee",
    x: 88, y: 85,
    icon: '🚜',
    products: [
      { name: 'Dog Food (40lb)', price: 42.00 },
      { name: 'Chicken Feed (50lb)', price: 18.00 }
    ]
  },
  {
    id: 'cvs',
    name: "CVS Pharmacy",
    category: "Pharmacy & Grocery",
    location: "Ossipee",
    x: 72, y: 75,
    icon: '💊',
    products: [
      { name: 'Tylenol (100ct)', price: 12.99 },
      { name: 'Snack Mix', price: 5.50 }
    ]
  },
  {
    id: 'pizza-barn',
    name: "Pizza Barn",
    category: "Quick Eats",
    location: "Ossipee",
    x: 70, y: 45,
    icon: '🍕',
    products: [
      { name: 'Large Cheese', price: 15.00 },
      { name: 'Steak & Cheese', price: 13.50 }
    ]
  },
  {
    id: 'watsons',
    name: "Watson's General Store",
    category: "Grocery",
    location: "Effingham",
    x: 55, y: 15,
    icon: '🍪',
    products: [
      { name: 'Warm Cookies', price: 2.00 },
      { name: 'Coffee (Hot)', price: 2.50 }
    ]
  },
  {
    id: 'marina',
    name: "Ossipee Lake Marina",
    category: "Services & Tech",
    location: "Effingham",
    x: 65, y: 10,
    icon: '⛵',
    products: [
      { name: 'Boat Rental (Hr)', price: 120.00 },
      { name: 'Lake Map', price: 8.00 }
    ]
  },
  {
    id: 'flea-market',
    name: "Effingham Falls Flea Market",
    category: "Community Event",
    location: "Effingham Falls",
    x: 42, y: 75,
    icon: '🎪',
    products: [
      { name: 'Vendor Entry', price: 25.00 },
      { name: 'Antique Find', price: 15.00 }
    ]
  },
  {
    id: 'concerts',
    name: "Lake Summer Concerts",
    category: "Live Event",
    location: "Ossipee Lake",
    x: 62, y: 15,
    icon: '🎸',
    products: [
      { name: 'Lawn Seat', price: 0 },
      { name: 'Vortex Pass', price: 15.00 }
    ]
  },
  {
    id: 'farmers-market',
    name: "Lakes Region Farmers Market",
    category: "Community Event",
    location: "Wolfeboro",
    x: 18, y: 88,
    icon: '🧺',
    products: [
      { name: 'Organic Honey (Qt)', price: 18.00 },
      { name: 'Farm-fresh Sourdough', price: 9.00 }
    ]
  },
  {
    id: 'harley-jacks',
    name: "Harley Jack's Burgers & Brews",
    category: "Dining & Bar",
    location: "Ossipee",
    x: 72, y: 35,
    icon: '🍺',
    products: [
      { name: 'Jack Burger', price: 16.50 },
      { name: 'Local Draft', price: 7.00 }
    ]
  },
  {
    id: 'ossipee-news',
    name: "Ossipee Mountain News",
    category: "Local News",
    location: "West Ossipee",
    x: 92, y: 10,
    icon: '📰',
    products: [
      { name: 'Weekly Print', price: 2.00 },
      { name: 'Business Spotlight', price: 45.00 }
    ]
  },
  {
    id: 'ossipee-house',
    name: "Ossipee House of Pizza",
    category: "Dining & Pizza",
    location: "Ossipee",
    x: 75, y: 32,
    icon: '🍕',
    products: [
      { name: 'House Special Pizza', price: 18.50 },
      { name: 'Steak & Cheese Sub', price: 13.00 }
    ]
  },
  {
    id: 'indian-mound',
    name: "Indian Mound Golf Club",
    category: "Sports & Dining",
    location: "Ossipee",
    x: 78, y: 38,
    icon: '⛳',
    products: [
      { name: '18 Holes w/ Cart', price: 65.00 },
      { name: 'Mound Burger', price: 17.50 }
    ]
  },
  {
    id: 'white-lake',
    name: "White Lake House Pizza",
    category: "Dining & Pizza",
    location: "Tamworth",
    x: 82, y: 12,
    icon: '🍕',
    products: [
      { name: 'House Special', price: 19.50 },
      { name: 'Greek Salad', price: 12.00 }
    ]
  },
  {
    id: 'the-spot',
    name: "The Spot",
    category: "Dining & Bar",
    location: "Effingham",
    x: 58, y: 72,
    icon: '🥩',
    products: [
      { name: 'Oasis Burger', price: 15.00 },
      { name: 'Craft Draft', price: 7.00 }
    ]
  },
  {
    id: 'hannaford',
    name: "Hannaford",
    category: "Superstore",
    location: "Ossipee",
    x: 75, y: 80,
    icon: '🛒',
    products: [
      { name: 'Ground Beef (lb)', price: 6.99 },
      { name: 'Fresh Greens', price: 3.50 },
      { name: 'Milk (Gal)', price: 4.89 },
      { name: 'Eggs (Doz)', price: 5.50 },
      { name: 'Chicken (lb)', price: 4.50 },
      { name: 'Butter (Stk)', price: 6.00 },
      { name: 'Local Apples', price: 5.99 },
      { name: 'Bagged Salad', price: 3.99 },
      { name: 'OJ (52oz)', price: 4.50 }
    ]
  }
];

export default function LocalClient() {
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-white p-8 lg:p-12 overflow-hidden selection:bg-amber-400 selection:text-black">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex justify-between items-end">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 text-amber-400 rounded-full border border-amber-400/20">
              <span className="w-1 h-1 bg-amber-400 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-widest">Neighborhood Discovery</span>
            </div>
            <h1 className="text-6xl font-black italic tracking-tighter leading-none">Local <span className="text-amber-400">Oasis.</span></h1>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest opacity-60">Interactive Map for the Lakes Region & Beyond</p>
          </div>
          <Link href="/marketplace" className="text-xs font-black uppercase tracking-[0.2em] border-b-2 border-white/10 hover:border-amber-400 transition-all pb-1">Back to Feed</Link>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-stretch h-[65vh]">
          {/* Map Diagram */}
          <div className="lg:col-span-3 bg-white/5 rounded-[4rem] border border-white/10 relative overflow-hidden group shadow-2xl">
            {/* Background Map Simulation */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
            <div className="absolute inset-0 pattern-dots"></div>

            {/* Shop Markers */}
            {EFFINGHAM_SHOPS.map((shop) => (
              <button
                key={shop.id}
                onClick={() => setSelectedShop(shop)}
                className={`absolute w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-3xl flex items-center justify-center text-3xl shadow-2xl transition-all duration-700 hover:scale-125 z-10 ${selectedShop?.id === shop.id ? 'bg-amber-400 scale-125 ring-8 ring-amber-400/20' : 'bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20'
                  }`}
                style={{ left: `${shop.x}%`, top: `${shop.y}%` }}
              >
                {shop.icon}
                <div className={`absolute -bottom-8 whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-opacity duration-500 ${selectedShop?.id === shop.id ? 'opacity-100 text-amber-400' : 'opacity-30 group-hover:opacity-100'
                  }`}>
                  {shop.name}
                </div>
              </button>
            ))}

            {/* Connecting Lines (Simulated Roads) */}
            <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none stroke-white" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 20 20 L 45 35 L 65 45 L 75 80" fill="none" strokeWidth="0.2" />
              <path d="M 30 55 L 45 35" fill="none" strokeWidth="0.2" />
            </svg>
          </div>

          {/* Details Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="flex-1 bg-white/5 rounded-[3rem] border border-white/10 p-10 flex flex-col shadow-xl">
              {selectedShop ? (
                <>
                  <div className="space-y-6 flex-1">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest">{selectedShop.category}</span>
                      <h2 className="text-4xl font-black italic tracking-tight">{selectedShop.name}</h2>
                      <p className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                        <span>📍</span> {selectedShop.location}
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Recent Prices</div>
                      <div className="space-y-3">
                        {selectedShop.products.map((p, i) => (
                          <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                            <span className="font-bold text-sm tracking-tight">{p.name}</span>
                            <span className="font-black italic text-amber-400">${p.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Link href={`/shop/${selectedShop.id}`} className="mt-8 w-full py-5 bg-white text-black rounded-3xl font-black text-xs uppercase tracking-widest text-center hover:bg-amber-400 transition-colors shadow-2xl">
                    Visit Online →
                  </Link>

                  <button 
                    onClick={() => alert('Receipt Order Phase: Upload a photo or type your list. Our driver will verify prices at ' + selectedShop.name)}
                    className="mt-4 w-full py-5 bg-white/5 text-white/50 rounded-3xl font-black text-xs uppercase tracking-widest text-center hover:bg-white/10 transition-colors border border-white/10"
                  >
                    🚀 Order via Receipt
                  </button>

                  <button 
                    onClick={() => alert('Launching Oasis Quick-Pay... Generating invoice for ' + selectedShop.name)}
                    className="mt-4 w-full py-5 bg-gradient-to-r from-amber-400 to-amber-500 text-black rounded-3xl font-black text-xs uppercase tracking-widest text-center hover:scale-[1.02] transition-all shadow-2xl shadow-amber-500/20"
                  >
                    💎 Secure Oasis Checkout
                  </button>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <div className="text-6xl grayscale">📍</div>
                  <p className="text-xs font-black uppercase tracking-[0.2em]">Select a shop to <br />explore inventory</p>
                </div>
              )}
            </div>

            {/* Local Updates Feed */}
            <div className="bg-white/5 rounded-[2.5rem] border border-white/10 p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-400 italic">Live Alerts</h3>
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 border-l-2 border-amber-400 rounded-r-xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 italic">Now • PNB Eats</p>
                  <p className="text-[11px] font-medium leading-relaxed italic">Fresh pepperoni coming out in 5 minutes. First come first serve.</p>
                </div>
                <div className="p-4 bg-white/5 border-l-2 border-indigo-400 rounded-r-xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 italic">10m ago • Road Report</p>
                  <p className="text-[11px] font-medium leading-relaxed italic">Route 153 clear. Fresh grading near the falls complete.</p>
                </div>
              </div>
            </div>

            {/* Quick Stats Box */}
            <div className="h-32 bg-amber-400 rounded-[2.5rem] p-8 text-black flex items-center justify-between shadow-2xl shadow-amber-400/20">
              <div>
                <div className="text-3xl font-black tracking-tighter">5 Stores</div>
                <div className="text-[10px] font-black uppercase opacity-60">Verified Nearby</div>
              </div>
              <div className="text-4xl">✨</div>
            </div>
          </div>
        </main>
      </div>

      <footer className="max-w-7xl mx-auto mt-24 mb-12 flex justify-between items-center bg-white/5 p-12 rounded-[4rem] border border-white/10 shadow-3xl">
        <div className="space-y-2">
          <h4 className="text-xl font-black italic tracking-tight">Are you a Local Merchant?</h4>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest opacity-60">Manage your discovery profile, inventory & revenue database.</p>
        </div>
        <Link href="/dashboard/analytics" className="px-10 py-5 bg-amber-400 text-black rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-amber-500/20">
          Open Merchant Portal →
        </Link>
      </footer>

      <style jsx>{`
        .pattern-dots {
          background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 0);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  );
}
