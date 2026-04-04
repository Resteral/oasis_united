"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Citizen {
    id: string;
    full_name: string;
    account_number: string;
    role: string;
    avatar_url?: string;
}

export default function TeamManager({ businessId }: { businessId: string }) {
    const [accountNumber, setAccountNumber] = useState<string>('');
    const [team, setTeam] = useState<Citizen[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [foundCitizen, setFoundCitizen] = useState<Citizen | null>(null);
    const [loading, setLoading] = useState(false);
    const [myAccount, setMyAccount] = useState<string>('');

    useEffect(() => {
        async function loadTeam() {
            if (!businessId) return;
            const { data } = await supabase.from('businesses').select('team_members').eq('id', businessId).single();
            if (data?.team_members) {
                 // The team_members is a list of IDs. We need to fetch profiles.
                 const { data: profiles } = await supabase.from('profiles').select('*').in('id', data.team_members);
                 if (profiles) setTeam(profiles);
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('account_number').eq('id', user.id).single();
                if (profile) setMyAccount(profile.account_number);
            }
        }
        loadTeam();
    }, [businessId]);

    const handleSearch = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('profiles').select('*').eq('account_number', searchQuery).single();
        if (data) setFoundCitizen(data);
        else {
            alert('Citizen not found in discovery records.');
            setFoundCitizen(null);
        }
        setLoading(false);
    };

    const addMember = async (citizen: Citizen) => {
        const newTeamIds = [...team.map(m => m.id), citizen.id];
        const { error } = await supabase.from('businesses').update({
            team_members: newTeamIds
        }).eq('id', businessId);

        if (!error) {
            setTeam([...team, citizen]);
            setFoundCitizen(null);
            setSearchQuery('');
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <header className="flex justify-between items-end">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-400/10 border border-indigo-400/20 rounded-full">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Merchant Account: {myAccount || 'OU-RECOVERING...'}</span>
                    </div>
                    <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-[0.8]">Team <br /><span className="text-indigo-400">Command.</span></h2>
                    <p className="text-gray-500 font-medium italic">Enlist citizens into your localized network using their Oasis ID.</p>
                </div>
            </header>

            {/* Recruitment Terminal */}
            <div className="bg-white p-10 rounded-[4rem] border border-gray-100 space-y-8 shadow-2xl relative overflow-hidden group">
                 <div className="flex gap-4">
                    <input 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value.toUpperCase())}
                        placeholder="ENTER OASIS ID (e.g. OU-X5A912)"
                        className="flex-1 p-6 bg-gray-50 border border-gray-100 rounded-3xl font-black text-xl tracking-widest placeholder:text-gray-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                    />
                    <button 
                        onClick={handleSearch}
                        disabled={loading}
                        className="px-12 py-6 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all"
                    >
                        {loading ? 'SCANNIG...' : 'ENLIST'}
                    </button>
                 </div>

                 {foundCitizen && (
                    <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-3xl flex justify-between items-center animate-in zoom-in-95 duration-500">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm italic font-black">
                                {foundCitizen.full_name[0]}
                            </div>
                            <div>
                                <h4 className="text-xl font-black italic uppercase tracking-tight">{foundCitizen.full_name}</h4>
                                <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">{foundCitizen.role} • {foundCitizen.account_number}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => addMember(foundCitizen)}
                            className="px-8 py-4 bg-white border border-indigo-200 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        >
                            Confirm Enlistment
                        </button>
                    </div>
                 )}
            </div>

            {/* Active Network */}
            <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-400 px-6">Active Merchant Network</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {team.map((member) => (
                        <div key={member.id} className="p-8 bg-white border border-gray-100 rounded-[3rem] flex justify-between items-center group hover:border-indigo-500/20 transition-all shadow-sm">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl font-black italic text-gray-400 group-hover:text-indigo-500 transition-colors">
                                    {member.avatar_url ? <img src={member.avatar_url} className="w-full h-full object-cover rounded-2xl" /> : member.full_name[0]}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-black italic uppercase tracking-tight">{member.full_name}</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-300 group-hover:text-indigo-400 transition-colors uppercase">{member.account_number}</span>
                                </div>
                            </div>
                            <div className="px-5 py-2 bg-gray-50 rounded-full border border-gray-100 text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">
                                {member.role}
                            </div>
                        </div>
                    ))}
                    {team.length === 0 && (
                        <div className="col-span-full py-20 bg-gray-50/50 border border-dashed border-gray-200 rounded-[4rem] text-center space-y-4">
                            <span className="text-6xl opacity-10 grayscale">👥</span>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Lone Merchant Protocol Active. No team detected.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
