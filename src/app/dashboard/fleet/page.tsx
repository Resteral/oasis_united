"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import RouteMap from '@/components/RouteMap';

export default function FleetOperationsPage() {
    const [delivererProfile, setDelivererProfile] = useState<any | null>(null);
    const [routes, setRoutes] = useState<any[]>([]);
    const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
    const [towns, setTowns] = useState<any[]>([]);
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [waitPoints, setWaitPoints] = useState<any[]>([]);
    const [custodianships, setCustodianships] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [showTownModal, setShowTownModal] = useState(false);
    const [showRouteModal, setShowRouteModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [isTopologyMode, setIsTopologyMode] = useState(true);
    
    // New Import State
    const [importTargetBiz, setImportTargetBiz] = useState<string>('');
    const [importData, setImportData] = useState('');
    const [importUrl, setImportUrl] = useState('');

    const [newTown, setNewTown] = useState({ name: '', state: 'NH' });
    const [newRoute, setNewRoute] = useState({ name: '', stops: [] as {id: string, is_marketing: boolean}[] });

    useEffect(() => {
        async function fetchInitialData() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('deliverer_profiles').select('*').eq('id', user.id).single();
                if (!profile) {
                    const { data: newProfile } = await supabase.from('deliverer_profiles').insert([{ id: user.id }]).select().single();
                    setDelivererProfile(newProfile || { id: user.id });
                } else setDelivererProfile(profile);

                const [rResp, tResp, bResp, wResp, cResp] = await Promise.all([
                    supabase.from('delivery_routes').select('*').eq('deliverer_id', user.id),
                    supabase.from('towns').select('*').order('name'),
                    supabase.from('businesses').select('*').order('name'),
                    supabase.from('wait_points').select('*').order('name'),
                    supabase.from('town_custodians').select('*, towns(*)').eq('deliverer_id', user.id)
                ]);

                setRoutes(rResp.data || []);
                setTowns(tResp.data || []);
                setBusinesses(bResp.data || []);
                setWaitPoints(wResp.data || []);
                setCustodianships(cResp.data || []);
                if (rResp.data && rResp.data.length > 0) {
                    setSelectedRouteId(rResp.data[0].id);
                    setIsTopologyMode(false);
                }
            }
            setLoading(false);
        }
        fetchInitialData();
    }, []);

    const handleClaimCustodianship = async (townId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase.from('town_custodians').insert([{ deliverer_id: user?.id, town_id: townId, auth_level: 'sovereign' }]).select('*, towns(name)').single();
        if (data) {
            setCustodianships([...custodianships, data]);
            alert('🏛️ Municipal Custodianship Established.');
        } else alert(error?.message);
    };

    const handleCreateTown = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: town, error } = await supabase.from('towns').insert([{ ...newTown, added_by: user?.id }]).select().single();
        if (town) {
            setShowTownModal(false);
            setNewTown({ name: '', state: 'NH' });
            handleClaimCustodianship(town.id);
        } else alert(error?.message);
    };

    const handleCreateRoute = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: route } = await supabase.from('delivery_routes').insert([{ name: newRoute.name, deliverer_id: user?.id }]).select().single();
        if (route) {
            const stopsToInsert = newRoute.stops.map((stop, index) => ({
                route_id: route.id,
                business_id: stop.id,
                order_index: index,
                is_marketing_partner: stop.is_marketing
            }));
            await supabase.from('route_stops').insert(stopsToInsert);
            setRoutes([...routes, route]);
            setShowRouteModal(false);
            setSelectedRouteId(route.id);
            setIsTopologyMode(false);
            alert('🛰️ Route Synchronized.');
        }
    };

    const getMapStops = () => {
        if (isTopologyMode) {
            // Show all businesses in the towns the driver governs
            const governedTownIds = custodianships.map(c => c.town_id);
            return businesses.filter(b => governedTownIds.includes(b.town_id)).map(b => ({
                id: b.id, name: b.name, category: b.category, lat: b.geo_point?.lat || 43.78, lng: b.geo_point?.lng || -71.10
            }));
        } else {
            // Logic for route stops... normally you'd query route_stops
            // Simplified for demonstration: find businesses that match the routes
            return businesses.slice(0, 3).map(b => ({
                id: b.id, name: b.name, category: b.category, lat: b.geo_point?.lat || 43.78, lng: b.geo_point?.lng || -71.05
            }));
        }
    };

    if (loading) return <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center animate-pulse text-white/40 font-black uppercase text-[10px]">Syncing Terminal...</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white p-10 md:p-20 space-y-20 selection:bg-amber-400">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase text-indigo-400 italic">Regional Operations Hub</div>
                    <h1 className="text-7xl font-black italic tracking-tighter uppercase leading-[0.8]">Network <br /><span className="text-amber-400">Control.</span></h1>
                </div>
                <div className="flex flex-wrap gap-4">
                    <button onClick={() => setIsTopologyMode(!isTopologyMode)} className={`px-8 py-5 border rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all ${isTopologyMode ? 'bg-amber-400 border-amber-400 text-black' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
                        {isTopologyMode ? '📍 Exit Topology' : '🗺️ Town Scan'}
                    </button>
                    <button onClick={() => setShowImportModal(true)} className="px-8 py-5 bg-white/5 border border-white/10 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10">📋 Signal Importer</button>
                    <button onClick={() => setShowTownModal(true)} className="px-8 py-5 bg-white/5 border border-white/10 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10">🏘️ Seed Node</button>
                    <button onClick={() => setShowRouteModal(true)} className="px-8 py-5 bg-indigo-600 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-500/20">🛰️ Create Loop</button>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                <section className="lg:col-span-8 space-y-12">
                     <div className="relative group">
                        <RouteMap stops={getMapStops()} isTopology={isTopologyMode} />
                        {isTopologyMode && (
                            <div className="absolute top-10 left-10 z-10 bg-black/80 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 space-y-4 max-w-xs animate-in slide-in-from-left-4 duration-500">
                                <h3 className="text-xl font-black italic uppercase text-amber-400">Jurisdiction Map.</h3>
                                <p className="text-[9px] font-medium uppercase text-white/40 italic leading-relaxed">Visualizing all merchant nodes within your governed municipal territories.</p>
                            </div>
                        )}
                     </div>
                    
                    <div className="space-y-8">
                         <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 px-2 italic">Jurisdiction Control</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {custodianships.map(c => (
                                <div key={c.id} className="bg-indigo-600/5 border border-indigo-500/20 p-8 rounded-[2.5rem] space-y-4 hover:bg-indigo-600/10 transition-all">
                                    <h4 className="text-2xl font-black italic uppercase tracking-tighter">{c.towns?.name}</h4>
                                    <div className="flex gap-2">
                                        <button className="flex-1 py-3 bg-white/5 rounded-xl text-[8px] font-black uppercase italic hover:bg-white/10">Catalog Audit</button>
                                        <button className="flex-1 py-3 bg-white/5 rounded-xl text-[8px] font-black uppercase italic hover:bg-white/10">Node Insights</button>
                                    </div>
                                </div>
                            ))}
                            <div className="bg-white/[0.01] border border-dashed border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4 group hover:border-amber-400/20 transition-all">
                                <p className="text-[9px] font-black uppercase text-white/20 italic group-hover:text-amber-400 transition-colors">Apply for Guardianship</p>
                                <select className="bg-transparent text-xs font-black uppercase text-indigo-400 outline-none appearance-none cursor-pointer" onChange={(e) => handleClaimCustodianship(e.target.value)}>
                                    <option className="bg-black">Select Node...</option>
                                    {towns.map(t => <option key={t.id} value={t.id} className="bg-black">{t.name}</option>)}
                                </select>
                            </div>
                         </div>
                    </div>
                </section>

                <section className="lg:col-span-4 space-y-12">
                    <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 space-y-8">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 italic">Regional Staging</h3>
                        <select className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-xs font-black uppercase text-white outline-none appearance-none">
                            <option className="bg-black">Select Wait Node...</option>
                            {waitPoints.map(wp => <option key={wp.id} value={wp.id} className="bg-black">{wp.name}</option>)}
                        </select>
                        <p className="text-[9px] font-medium uppercase text-white/20 italic leading-relaxed">Staging points ensure your marketing beacons remain active in the regional discovery ticker.</p>
                    </div>

                    <div className="bg-indigo-600/5 p-10 rounded-[3rem] border border-indigo-500/10 space-y-6 group hover:bg-indigo-600/10 transition-all">
                        <h3 className="text-xl font-black italic uppercase tracking-tighter">Marketing Fleet Node.</h3>
                        <p className="text-[9px] font-black uppercase opacity-60 leading-relaxed italic group-hover:opacity-100 transition-opacity">Designated marketing nodes receive priority placement in the discovery compass and regional tickers.</p>
                    </div>
                </section>
            </main>

            {/* MODALS */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-3xl bg-black/80">
                    <div className="bg-[#111114] border border-white/10 p-12 rounded-[4rem] w-full max-w-2xl space-y-10 shadow-4xl animate-in zoom-in duration-300">
                        <header className="text-center space-y-2">
                            <h2 className="text-4xl font-black italic tracking-tighter uppercase text-indigo-400 leading-none">Signal <span className="text-white">Importer.</span></h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Multi-Modal Reconnaissance Protocol</p>
                        </header>
                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <button className="flex-1 py-4 bg-white/5 border border-indigo-500/30 rounded-2xl text-[9px] font-black uppercase text-indigo-400 italic">🌐 URL Protcol</button>
                                <button className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase text-white/30 italic">📸 Image Capture</button>
                            </div>
                            <select className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl font-black italic text-xl text-white outline-none appearance-none" value={importTargetBiz} onChange={(e) => setImportTargetBiz(e.target.value)}>
                                <option value="" disabled className="bg-black">Target Merchant...</option>
                                {businesses.map(b => <option key={b.id} value={b.id} className="bg-black">{b.name}</option>)}
                            </select>
                            <input placeholder="Merchant Site URL..." className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl font-black italic text-sm text-white/80 outline-none" value={importUrl} onChange={(e) => setImportUrl(e.target.value)} />
                            <textarea placeholder="Signals: Item - Price - Category" className="w-full bg-white/5 border border-white/10 p-8 rounded-[2rem] font-medium text-xs tracking-widest min-h-[160px] outline-none text-white/60" value={importData} onChange={(e) => setImportData(e.target.value)} />
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setShowImportModal(false)} className="flex-1 py-5 bg-white/5 rounded-2xl font-black text-[10px] uppercase text-white/30 tracking-widest">Abort</button>
                            <button onClick={async () => {
                                const items = importData.split('\n').filter(l => l.includes('-')).map(line => {
                                    const [n, p, c] = line.split('-').map(s => s.trim());
                                    return { business_id: importTargetBiz, name: n, price: Number(p) || 0, category: c || 'Imported' };
                                });
                                await supabase.from('products').insert(items);
                                setShowImportModal(false);
                                setImportData('');
                                alert('Catalog signals synchronized.');
                            }} className="flex-[2] py-5 bg-indigo-600 rounded-2xl font-black text-[10px] uppercase text-white tracking-widest shadow-xl">Finalize Signals</button>
                        </div>
                    </div>
                </div>
            )}

            {showRouteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-3xl bg-black/80">
                    <div className="bg-[#111114] border border-white/10 p-12 rounded-[4rem] w-full max-w-2xl space-y-10 shadow-4xl animate-in zoom-in duration-300">
                        <header className="space-y-2">
                             <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">Draft <span className="text-indigo-400">Trade Loop.</span></h2>
                             <p className="text-[10px] font-black uppercase text-white/20 tracking-widest italic">Synchronize Logistics & Marketing Beacons</p>
                        </header>
                        <div className="space-y-8">
                            <input placeholder="Loop Identifier (e.g. Morning Express)" className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl font-black italic text-xl text-white outline-none" onChange={(e) => setNewRoute({...newRoute, name: e.target.value})} />
                            <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {businesses.map(biz => {
                                    const stop = newRoute.stops.find(s => s.id === biz.id);
                                    return (
                                        <div key={biz.id} className={`p-6 rounded-[2.5rem] border transition-all flex justify-between items-center ${stop ? 'bg-indigo-600/10 border-indigo-500/30' : 'bg-white/5 border-white/5'}`}>
                                            <button onClick={() => {
                                                if (stop) setNewRoute({...newRoute, stops: newRoute.stops.filter(s => s.id !== biz.id)});
                                                else setNewRoute({...newRoute, stops: [...newRoute.stops, {id: biz.id, is_marketing: false}]});
                                            }} className="flex-1 text-left font-black italic uppercase text-sm tracking-tighter text-white/80">{biz.name}</button>
                                            
                                            {stop && (
                                                <button onClick={() => {
                                                    setNewRoute({...newRoute, stops: newRoute.stops.map(s => s.id === biz.id ? {...s, is_marketing: !s.is_marketing} : s)});
                                                }} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${stop.is_marketing ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20' : 'bg-white/10 text-white/40 border border-white/10'}`}>
                                                    {stop.is_marketing ? 'Partner Active 📡' : 'Add to Fleet Marketing'}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setShowRouteModal(false)} className="flex-1 py-5 bg-white/5 rounded-2xl font-black text-[10px] uppercase text-white/30 tracking-widest italic">Abort</button>
                            <button onClick={handleCreateRoute} className="flex-[2] py-5 bg-indigo-600 rounded-2xl font-black text-[10px] uppercase text-white tracking-widest shadow-xl">Synchronize Trade Loop</button>
                        </div>
                    </div>
                </div>
            )}

            {showTownModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-3xl bg-black/80">
                    <div className="bg-[#111114] border border-white/10 p-12 rounded-[4rem] w-full max-w-lg space-y-10 shadow-4xl animate-in zoom-in duration-300">
                        <header className="space-y-1">
                            <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white">Seed <span className="text-amber-400">Node.</span></h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">Provision New Municipal Infrastructure</p>
                        </header>
                        <div className="space-y-6">
                            <input value={newTown.name} onChange={(e) => setNewTown({...newTown, name: e.target.value})} placeholder="Node (Town) Name" className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl font-black italic text-xl text-white outline-none" />
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setShowTownModal(false)} className="flex-1 py-5 bg-white/5 rounded-2xl font-black text-[10px] uppercase text-white/30 tracking-widest italic">Abort</button>
                            <button onClick={handleCreateTown} className="flex-[2] py-5 bg-amber-400 text-black rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-amber-400/20">Provision Hub</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
