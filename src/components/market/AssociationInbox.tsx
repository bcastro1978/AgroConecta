import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { Button } from '../ui/button';
import { Users, CheckCircle, XCircle, Clock, Info, ArrowRight, ShieldCheck, UserPlus, Sparkles, TrendingUp, DollarSign } from 'lucide-react';

interface MemberWithAssoc {
    id: string;
    association_id: string;
    status: 'Invited' | 'Accepted' | 'Rejected';
    association: {
        id: string;
        name: string;
        agreed_price_unit: number;
        status: string;
        creator_id: string;
        creator: { full_name: string };
    };
}

interface AssociationWithMembers {
    id: string;
    name: string;
    agreed_price_unit: number;
    status: string;
    members: { producer_id: string; status: string; producer: { full_name: string } }[];
}

export const AssociationInbox = () => {
    const { profile } = useAuth();
    const [invitations, setInvitations] = useState<MemberWithAssoc[]>([]);
    const [myAssociations, setMyAssociations] = useState<AssociationWithMembers[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profile?.id) {
            fetchInvitations();
            fetchMyAssociations();
        }
    }, [profile]);

    const fetchMyAssociations = async () => {
        const { data } = await supabase
            .from('associations')
            .select(`
                *,
                members:association_members(
                    producer_id,
                    status,
                    producer:producer_id(full_name)
                )
            `)
            .eq('creator_id', profile?.id);
        
        if (data) setMyAssociations(data as any[]);
    };

    const fetchInvitations = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('association_members')
                .select(`
                    *,
                    association:association_id(
                        *,
                        creator:creator_id(full_name)
                    )
                `)
                .eq('producer_id', profile?.id)
                .neq('status', 'Rejected');

            if (error) throw error;
            setInvitations(data as any[] || []);
        } catch (err: any) {
            console.error('Error fetching invitations:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (memberId: string, status: 'Accepted' | 'Rejected') => {
        try {
            const { error } = await supabase
                .from('association_members')
                .update({ status })
                .eq('id', memberId);

            if (error) throw error;
            fetchInvitations();
            // Optional: alert toast replacement
        } catch (err: any) {
            alert("Error: " + err.message);
        }
    };

    if (loading) return (
        <div className="space-y-4">
            {[1, 2].map(i => (
                <div key={i} className="h-32 bg-white/5 animate-pulse rounded-3xl border border-[#0A0A0A]/10"></div>
            ))}
        </div>
    );

    const pending = invitations.filter(i => i.status === 'Invited');
    const activeInvitations = invitations.filter(i => i.status === 'Accepted');

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-700">
            
            {/* Invitations Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                        <UserPlus size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-[#0A0A0A] uppercase tracking-tight leading-none">Invitaciones de Red</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Pending Network Requests</p>
                    </div>
                </div>
                
                {pending.length === 0 ? (
                    <div className="py-12 border border-dashed border-[#0A0A0A]/10 rounded-[2.5rem] text-center bg-white/10">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">No hay solicitudes pendientes</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {pending.map(inv => (
                            <div key={inv.id} className="bg-[#FAF9F7]/40 border border-amber-500/20 rounded-[2rem] p-6 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <Sparkles size={48} className="text-amber-500" />
                                </div>
                                <div className="relative z-10 text-center sm:text-left">
                                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2 justify-center sm:justify-start">
                                        <TrendingUp size={12} /> Solicitud de {inv.association.creator.full_name}
                                    </p>
                                    <h4 className="text-xl font-black text-[#0A0A0A] uppercase tracking-tight mb-2 group-hover:text-amber-400 transition-colors">{inv.association.name}</h4>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#0A0A0A]/10 rounded-lg">
                                        <span className="text-[10px] font-black text-slate-500 uppercase">Precio Pactado:</span>
                                        <span className="text-[10px] font-black text-[#1E3F20]">${inv.association.agreed_price_unit.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="flex gap-3 relative z-10 w-full sm:w-auto">
                                    <button 
                                        className="flex-1 sm:flex-none px-6 py-3 bg-white hover:bg-red-500/20 text-[#57534E] hover:text-red-400 border border-[#0A0A0A]/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                                        onClick={() => handleAction(inv.id, 'Rejected')}
                                    >
                                        Declinar
                                    </button>
                                    <button 
                                        className="flex-1 sm:flex-none px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2"
                                        onClick={() => handleAction(inv.id, 'Accepted')}
                                    >
                                        <CheckCircle size={14} /> Unirse
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Managed Associations */}
            {myAssociations.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="p-2.5 bg-[#C5A059]/10 text-[#C5A059] rounded-xl border border-cyan-500/20">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-[#0A0A0A] uppercase tracking-tight leading-none">Asociaciones Lideradas</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Managed Collaborative Units</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        {myAssociations.map(assoc => {
                            const acceptedCount = assoc.members.filter(m => m.status === 'Accepted').length;
                            const totalCount = assoc.members.length;
                            const isReady = acceptedCount === totalCount;

                            return (
                                <div key={assoc.id} className="glass-card p-8 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                        <Users size={80} className="text-cyan-500" />
                                    </div>
                                    
                                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-10">
                                        <div>
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border mb-4 ${isReady ? 'bg-[#1E3F20]/5 text-[#1E3F20] border-[#1E3F20]/20' : 'bg-[#C5A059]/10 text-[#C5A059] border-cyan-500/20'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isReady ? 'bg-[#1E3F20]' : 'bg-cyan-500'}`}></div>
                                                {isReady ? 'Consenso Alcanzado' : 'En Fase de Formación'}
                                            </div>
                                            <h4 className="text-3xl font-black text-[#0A0A0A] uppercase tracking-tighter leading-none">{assoc.name}</h4>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                                <DollarSign size={14} className="text-[#1E3F20]" />
                                                Target: ${assoc.agreed_price_unit.toFixed(2)} / unidad
                                            </p>
                                        </div>
                                        
                                        <div className="w-full lg:w-72 space-y-3">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado de Quórum</span>
                                                <span className="text-xs font-black text-[#0A0A0A]">{acceptedCount} de {totalCount} SOCIOS</span>
                                            </div>
                                            <div className="w-full bg-[#FAF9F7]/50 h-2 rounded-full overflow-hidden border border-[#0A0A0A]/10">
                                                <div 
                                                    className={`h-full transition-all duration-1000 ${isReady ? 'bg-[#1E3F20]' : 'bg-cyan-500'}`} 
                                                    style={{ width: `${(acceptedCount/totalCount)*100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {assoc.members.map((m, i) => (
                                            <div key={i} className={`px-4 py-3 rounded-2xl border transition-all flex items-center gap-3 ${m.status === 'Accepted' ? 'bg-[#1E3F20]/5 border-[#1E3F20]/20 text-[#1E3F20]' : 'bg-[#FAF9F7]/50 border-[#0A0A0A]/10 text-slate-500 opacity-60'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${m.status === 'Accepted' ? 'bg-[#1E3F20]' : 'bg-[#e5e5e5]'}`}></div>
                                                <span className="text-[10px] font-black uppercase truncate">{m.producer.full_name}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {isReady && (
                                        <button className="w-full mt-10 py-5 bg-[#1E3F20] hover:bg-emerald-400 text-slate-950 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-2xl shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-3">
                                            Ejecutar Oferta de Consorcio <ArrowRight size={16} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Other active memberships */}
            {activeInvitations.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="p-2.5 bg-[#1E3F20]/5 text-[#1E3F20] rounded-xl border border-[#1E3F20]/20">
                            <Users size={20} />
                        </div>
                        <h3 className="text-lg font-black text-[#0A0A0A] uppercase tracking-tight leading-none">Membresías de Red</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeInvitations.map(inv => (
                            <div key={inv.id} className="bg-[#FAF9F7]/40 border border-[#0A0A0A]/10 rounded-[2rem] p-5 flex gap-4 items-center group hover:border-[#1E3F20]/20 transition-all">
                                <div className="bg-[#1E3F20]/5 p-3 rounded-2xl text-[#1E3F20] border border-[#1E3F20]/20 group-hover:bg-[#1E3F20] group-hover:text-slate-950 transition-all">
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <h4 className="font-black text-[#0A0A0A] text-sm uppercase tracking-tight">{inv.association.name}</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Socio Activo • Confianza 100%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
