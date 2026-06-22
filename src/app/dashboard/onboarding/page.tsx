"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingRedirect() {
    const router = useRouter();
    
    useEffect(() => {
        router.replace('/register-business');
    }, [router]);

    return (
        <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
            <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 animate-pulse italic">Rerouting to Provisioning Terminal...</div>
        </div>
    );
}
