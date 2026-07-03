import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import type { Negotiation } from '../../types';
import { Button } from '../ui/button';
import { Check, X, MessageSquare, Clock, ArrowDownRight, User, Phone, DollarSign, Calendar, Sparkles, Inbox } from 'lucide-react';

export const QuoteManager = () => {
    const { user } = useAuth();
    const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchNegotiations();
        }
    }, [user]);

    const fetchNegotiations = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('negotiations')
                .select(`
                    *,
                    listing:marketplace_listings(
                        id, quantity, price_unit, unit:product_id(unit, name)
                    ),
                    buyer:users!buyer_id(full_name, phone_number)
                `)
                .eq('producer_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedData = data?.map(neg => ({
                ...neg,
                listing: {
                    ...neg.listing,
                    product: neg.listing.unit 
                }
            }));

            setNegotiations(formattedData as any || []);
        } catch (err: any) {
            console.error('Error fetching quotes:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: Negotiation['status']) => {
        try {
            const { error } = await supabase
                .from('negotiations')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            setNegotiations(prev =>
                prev.map(n => n.id === id ? { ...n, status: newStatus } : n)
            );
        } catch (err: any) {
            alert('Error updating quote: ' + err.message);
        }
    };

    if (loading) return (
        <div className="p-10 space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-white/5 animate-pulse rounded-3xl border border-[#0A0A0A]/10"></div>
            ))}
        </div>
    );

    if (negotiations.length === 0) {
        return (
            <div className="py-24 border-2 border-dashed border-[#0A0A0A]/10 rounded-[3rem] text-center bg-white/20 animate-in fade-in duration-700">
                <div className="bg-[#FAF9F7] w-24 h-24 rounded-[2rem] border border-[#0A0A0A]/10 flex items-center justify-center mx-auto mb-8 shadow-2xl">
                    <Inbox size={40} className="text-slate-800" />
                </div>
                <h3 className="text-2xl font-black text-[#0A0A0A] mb-2 tracking-tight">Bandeja de Negociación Vacía</h3>
                <p className="text-slate-500 max-w-xs mx-auto font-medium leading-relaxed">
                    Aún no has recibido propuestas personalizadas. Las cotizaciones de compradores B2B aparecerán aquí.
                </p>
            </div>
        );
    }

    return (
        <div className="glass-card overflow-hidden animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="px-8 py-6 border-b border-[#0A0A0A]/10 bg-[#FAF9F7]/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-[#1E3F20]/5 text-[#1E3F20] rounded-xl border border-[#1E3F20]/20">
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-[#0A0A0A] uppercase tracking-tight leading-none">Módulo de Cotizaciones</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">B2B Negotiation Terminal</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-[#C5A059]/10 border border-cyan-500/20 rounded-full">
                    <Sparkles size={12} className="text-[#C5A059]" />
                    <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.2em]">
                        {negotiations.filter(n => n.status === 'Pending').length} Incoming
                    </span>
                </div>
            </div>

            <div className="divide-y divide-white/5">
                {negotiations.map((neg) => {
                    const statusConfig = {
                        Pending: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Requiere Atención' },
                        Counter_Offered: { color: 'text-[#C5A059]', bg: 'bg-[#C5A059]/10', border: 'border-[#C5A059]/20', label: 'Contraoferta Activa' },
                        Accepted: { color: 'text-[#1E3F20]', bg: 'bg-[#1E3F20]/5', border: 'border-[#1E3F20]/20', label: 'Acuerdo Cerrado' },
                        Rejected: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Propuesta Rechazada' }
                    };

                    const cfg = statusConfig[neg.status];
                    const productName = neg.listing?.product?.name || 'Producto';
                    const unitLabel = neg.listing?.product?.unit || 'u';
                    const originalPrice = neg.listing?.price_unit || 1;
                    const proposedPrice = neg.proposed_price;
                    const discountPercent = Math.round((1 - (proposedPrice / originalPrice)) * 100);

                    return (
                        <div key={neg.id} className={`p-8 hover:bg-[#0A0A0A]/5 transition-all duration-300 group ${neg.status === 'Pending' ? 'bg-amber-500/[0.02]' : ''}`}>
                            <div className="flex flex-col lg:flex-row justify-between gap-8">
                                <div className="space-y-6 flex-1">
                                    <div className="flex items-center gap-4">
                                        <div className={`px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-[0.2em] ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                            {cfg.label}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                                            <Calendar size={12} />
                                            {new Date(neg.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-black text-[#0A0A0A] text-2xl uppercase tracking-tighter mb-4 leading-none">
                                            Propuesta: {productName}
                                        </h4>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {/* Buyer Info */}
                                            <div className="bg-[#FAF9F7]/50 p-4 rounded-2xl border border-[#0A0A0A]/10">
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                    <User size={10} className="text-cyan-500" /> Contraparte
                                                </p>
                                                <p className="font-black text-[#0A0A0A] text-sm truncate uppercase">{neg.buyer?.full_name}</p>
                                                <div className="flex items-center gap-1.5 text-[#C5A059] mt-1">
                                                    <Phone size={10} />
                                                    <span className="text-[10px] font-bold">{neg.buyer?.phone_number || 'Verificada'}</span>
                                                </div>
                                            </div>

                                            {/* Volume */}
                                            <div className="bg-[#FAF9F7]/50 p-4 rounded-2xl border border-[#0A0A0A]/10">
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Volumen Solicitado</p>
                                                <div className="flex items-baseline gap-2">
                                                    <p className="font-black text-[#0A0A0A] text-xl">{neg.proposed_quantity}</p>
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase">{unitLabel}</span>
                                                </div>
                                            </div>

                                            {/* Price Comparison */}
                                            <div className="bg-[#FAF9F7]/50 p-4 rounded-2xl border border-[#0A0A0A]/10">
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Diferencial Precio</p>
                                                <div className="flex items-center gap-3">
                                                    <span className="line-through text-slate-700 font-bold text-sm">${originalPrice.toFixed(2)}</span>
                                                    <div className="flex items-center gap-1 text-[#1E3F20] bg-[#1E3F20]/5 px-2 py-0.5 rounded-lg border border-[#1E3F20]/20">
                                                        <ArrowDownRight size={10} />
                                                        <span className="text-[10px] font-black">-{discountPercent}%</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Total */}
                                            <div className="bg-white p-4 rounded-2xl border border-[#1E3F20]/20 shadow-lg shadow-emerald-900/10 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-2 opacity-5">
                                                    <DollarSign size={32} className="text-[#1E3F20]" />
                                                </div>
                                                <p className="text-[9px] font-black text-[#1E3F20] uppercase tracking-widest mb-3 relative z-10">Monto del Trato</p>
                                                <div className="flex items-center gap-1 relative z-10">
                                                    <span className="text-[#1E3F20] font-black text-xl">$</span>
                                                    <p className="font-black text-[#0A0A0A] text-2xl leading-none">{(neg.proposed_quantity * neg.proposed_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {neg.message && (
                                        <div className="flex gap-4 items-start bg-[#FAF9F7]/30 p-5 rounded-[1.5rem] border border-[#0A0A0A]/10 group/msg transition-colors hover:border-[#0A0A0A]/10">
                                            <MessageSquare className="w-5 h-5 text-slate-700 mt-1 shrink-0 group-hover/msg:text-cyan-500 transition-colors" />
                                            <p className="text-sm text-[#57534E] font-medium leading-relaxed italic">
                                                "{neg.message}"
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {neg.status === 'Pending' && (
                                    <div className="flex flex-col gap-3 min-w-[180px] justify-center lg:border-l lg:pl-8 border-[#0A0A0A]/10">
                                        <button
                                            className="w-full py-4 bg-[#1E3F20] hover:bg-[#1E3F20] text-[#FAF9F7] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#0A0A0A]/10 transition-all active:scale-95 flex items-center justify-center gap-2"
                                            onClick={() => handleUpdateStatus(neg.id, 'Accepted')}
                                        >
                                            <Check size={16} /> Aceptar Trato
                                        </button>
                                        <button
                                            className="w-full py-4 bg-[#FAF9F7]/50 hover:bg-red-500/20 text-slate-500 hover:text-red-400 border border-[#0A0A0A]/10 hover:border-red-500/30 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                                            onClick={() => handleUpdateStatus(neg.id, 'Rejected')}
                                        >
                                            <X size={16} /> Rechazar
                                        </button>
                                        <div className="mt-2 flex items-center justify-center gap-1.5 opacity-30">
                                            <Clock size={10} className="text-slate-500" />
                                            <span className="text-[8px] font-black text-slate-500 uppercase">SLA: 24h</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
