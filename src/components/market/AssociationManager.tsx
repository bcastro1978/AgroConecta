import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { calculateDistance, formatDistance } from '../../lib/geoUtils';
import { Button } from '../ui/button';
import { Users, UserPlus, Check, X, Info, Search, MapPin, Sparkles, DollarSign, Target, ShieldCheck } from 'lucide-react';
import type { UserProfile } from '../../types';

interface AssociationManagerProps {
    demandId: string;
    productName: string;
    onClose: () => void;
}

export const AssociationManager = ({ demandId, productName, onClose }: AssociationManagerProps) => {
    const { profile } = useAuth();
    const [nearbyProducers, setNearbyProducers] = useState<UserProfile[]>([]);
    const [associationName, setAssociationName] = useState('');
    const [agreedPrice, setAgreedPrice] = useState('');
    const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
    const [loadingProducers, setLoadingProducers] = useState(false);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (profile?.location_ref_lat) {
            fetchNearbyProducers();
        }
    }, [profile]);

    const fetchNearbyProducers = async () => {
        setLoadingProducers(true);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'Productor')
                .neq('id', profile?.id);

            if (error) throw error;

            if (data && profile?.location_ref_lat) {
                const myLoc = { lat: profile.location_ref_lat, lng: profile.location_ref_lng! };
                const processed = (data as UserProfile[])
                    .map(u => ({
                        ...u,
                        distance: u.location_ref_lat ? calculateDistance(myLoc, { lat: u.location_ref_lat, lng: u.location_ref_lng! }) : 999
                    }))
                    .filter(u => (u as any).distance < 50) 
                    .sort((a, b) => (a as any).distance - (b as any).distance);

                setNearbyProducers(processed);
            }
        } catch (err: any) {
            console.error('Error fetching producers:', err.message);
        } finally {
            setLoadingProducers(false);
        }
    };

    const handleCreateAssociation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedPartners.length === 0) {
            alert("Debes invitar al menos a un socio.");
            return;
        }

        setCreating(true);
        try {
            const { data: assoc, error: assocErr } = await supabase
                .from('associations')
                .insert([{
                    name: associationName,
                    creator_id: profile?.id,
                    agreed_price_unit: parseFloat(agreedPrice),
                    status: 'Forming'
                }])
                .select()
                .single();

            if (assocErr) throw assocErr;

            const members = [
                { association_id: assoc.id, producer_id: profile?.id, status: 'Accepted' },
                ...selectedPartners.map(pid => ({ association_id: assoc.id, producer_id: pid, status: 'Invited' }))
            ];

            const { error: memberErr } = await supabase.from('association_members').insert(members);
            if (memberErr) throw memberErr;

            onClose();
        } catch (err: any) {
            alert("Error al crear asociación: " + err.message);
        } finally {
            setCreating(false);
        }
    };

    const togglePartner = (id: string) => {
        if (selectedPartners.includes(id)) {
            setSelectedPartners(selectedPartners.filter(p => p !== id));
        } else {
            setSelectedPartners([...selectedPartners, id]);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#FAF9F7]/80 backdrop-blur-xl flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
            <div className="bg-white border border-[#0A0A0A]/10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] relative">
                
                {/* Header Area */}
                <div className="px-10 py-8 border-b border-[#0A0A0A]/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Users size={80} className="text-cyan-500" />
                    </div>
                    <div className="flex justify-between items-center relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-[#C5A059]/10 text-[#C5A059] rounded-3xl border border-cyan-500/20 shadow-2xl">
                                <UserPlus size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-[#0A0A0A] uppercase tracking-tight leading-none">Módulo de Asociatividad</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                                    <Sparkles size={12} className="text-cyan-500" /> Formar consorcio para: {productName}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="bg-[#FAF9F7]/50 hover:bg-white/10 p-2 rounded-2xl border border-[#0A0A0A]/10 text-[#57534E] transition-all active:scale-95"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleCreateAssociation} className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
                    
                    {/* Association Identity */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre del Consorcio</label>
                            <div className="relative">
                                <input
                                    type="text" required
                                    placeholder="Ej. Alianza Agrícola Norte"
                                    className="w-full bg-[#FAF9F7]/50 border border-[#0A0A0A]/10 rounded-2xl px-6 py-4 text-[#0A0A0A] font-bold outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-800"
                                    value={associationName}
                                    onChange={(e) => setAssociationName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Precio Objetivo Acordado</label>
                            <div className="relative">
                                <input
                                    type="number" required step="0.01"
                                    placeholder="0.00"
                                    className="w-full bg-[#FAF9F7]/50 border border-[#0A0A0A]/10 rounded-2xl px-12 py-4 text-[#1E3F20] font-black text-xl outline-none focus:border-emerald-500/50 transition-all"
                                    value={agreedPrice}
                                    onChange={(e) => setAgreedPrice(e.target.value)}
                                />
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1E3F20]/50 font-black text-xl">$</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#C5A059]/10 p-6 rounded-[2rem] border border-cyan-500/10 flex gap-4 items-start group">
                        <div className="p-2 bg-[#C5A059]/10 text-cyan-500 rounded-xl mt-1 shrink-0 group-hover:scale-110 transition-transform">
                            <Info size={16} />
                        </div>
                        <div>
                            <h5 className="text-xs font-black text-cyan-500 uppercase tracking-tight mb-1">Nota de Gobernanza</h5>
                            <p className="text-xs text-[#57534E] font-medium leading-relaxed">
                                Los socios invitados deberán aceptar formalmente esta propuesta de precio y volumen para consolidar la oferta. Asegúrate de tener consenso previo.
                            </p>
                        </div>
                    </div>

                    {/* Member Selection */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Target size={14} className="text-cyan-500" /> Socios Estratégicos Cercanos (Radio 50km)
                            </label>
                            <div className="flex items-center gap-2 px-3 py-1 bg-[#FAF9F7] rounded-lg border border-[#0A0A0A]/10">
                                <span className="text-[9px] font-black text-[#0A0A0A]">{selectedPartners.length}</span>
                                <span className="text-[9px] font-black text-slate-600 uppercase">Selected</span>
                            </div>
                        </div>
                        
                        <div className="bg-[#FAF9F7]/30 border border-[#0A0A0A]/10 rounded-[2.5rem] overflow-hidden">
                            <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-white/5">
                                {loadingProducers ? (
                                    <div className="p-16 text-center">
                                        <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Escaneando red regional...</p>
                                    </div>
                                ) : nearbyProducers.length === 0 ? (
                                    <div className="p-16 text-center">
                                        <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">No se detectaron productores compatibles en el radio actual.</p>
                                    </div>
                                ) : (
                                    nearbyProducers.map(p => (
                                        <div 
                                            key={p.id} 
                                            className={`p-5 flex items-center justify-between cursor-pointer transition-all duration-300 hover:bg-[#0A0A0A]/5 ${selectedPartners.includes(p.id) ? 'bg-[#C5A059]/10' : ''}`}
                                            onClick={() => togglePartner(p.id)}
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all border ${selectedPartners.includes(p.id) ? 'bg-cyan-500 text-slate-950 border-cyan-500 shadow-lg shadow-cyan-500/20' : 'bg-white text-slate-500 border-[#0A0A0A]/10'}`}>
                                                    {p.full_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className={`font-black uppercase text-sm tracking-tight transition-colors ${selectedPartners.includes(p.id) ? 'text-[#0A0A0A]' : 'text-[#57534E]'}`}>{p.full_name}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[10px] text-slate-600 font-bold uppercase">{p.parroquia}</span>
                                                        <span className="w-1 h-1 rounded-full bg-[#FAF9F7]"></span>
                                                        <span className="text-[10px] text-cyan-500/50 font-black uppercase tracking-widest">{formatDistance((p as any).distance)} dist.</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${selectedPartners.includes(p.id) ? 'bg-cyan-500 border-cyan-500 text-slate-950' : 'border-[#0A0A0A]/10 group-hover:border-[#0A0A0A]/20'}`}>
                                                {selectedPartners.includes(p.id) ? <Check size={16} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-[#FAF9F7]"></div>}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex gap-5">
                        <button 
                            type="button" 
                            className="flex-1 py-4 bg-[#FAF9F7]/50 hover:bg-white text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl border border-[#0A0A0A]/10 transition-all"
                            onClick={onClose}
                        >
                            Cancelar Operación
                        </button>
                        <button 
                            type="submit" 
                            disabled={creating || selectedPartners.length === 0}
                            className="flex-[2] py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-[#FAF9F7] disabled:text-slate-600 text-[#0A0A0A] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-cyan-900/20 active:scale-95 flex items-center justify-center gap-3"
                        >
                            {creating ? (
                                <><div className="w-4 h-4 border-2 border-[#0A0A0A]/20 border-t-white rounded-full animate-spin"></div> PROCESANDO...</>
                            ) : (
                                <><ShieldCheck size={18} /> Formalizar Alianza Estratégica</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
