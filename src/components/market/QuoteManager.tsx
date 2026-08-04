import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import type { Negotiation } from '../../types';
import { 
    Check, X, MessageSquare, Clock, ArrowDownRight, User, Phone, DollarSign, Calendar, 
    Sparkles, Inbox, CheckCircle2, AlertCircle, RefreshCw, Send
} from 'lucide-react';

export const QuoteManager = () => {
    const { user } = useAuth();
    const [negotiations, setNegotiations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // State para Modal de Contraoferta / Respuesta
    const [selectedCounterOffer, setSelectedCounterOffer] = useState<any | null>(null);
    const [counterPrice, setCounterPrice] = useState('');
    const [counterQty, setCounterQty] = useState('');
    const [counterMessage, setCounterMessage] = useState('');
    const [sendingCounter, setSendingCounter] = useState(false);

    // State para Modal de Feedback
    const [actionFeedback, setActionFeedback] = useState<{
        title: string;
        message: string;
        type: 'success' | 'error';
    } | null>(null);

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
                        id, quantity, price_unit, product:product_id(unit, name)
                    ),
                    buyer:buyer_id(full_name, phone_number, provincia, canton)
                `)
                .eq('producer_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNegotiations(data as any[] || []);
        } catch (err: any) {
            console.error('Error fetching quotes:', err.message);
        } finally {
            setLoading(false);
        }
    };

    // ACEPTAR TRATO -> Ejecuta el proceso de compra y descuenta el inventario
    const handleAcceptDeal = async (neg: any) => {
        setLoading(true);
        try {
            // 1. Cambiar estado de negociación a Accepted
            const { error: negErr } = await supabase
                .from('negotiations')
                .update({ 
                    status: 'Accepted',
                    updated_at: new Date().toISOString()
                })
                .eq('id', neg.id);

            if (negErr) throw negErr;

            // 2. Ejecutar Proceso de Compra: Descontar inventario de la publicación
            if (neg.listing) {
                const currentQty = neg.listing.quantity || 0;
                const soldQty = neg.proposed_quantity || 0;
                const remainingQty = Math.max(0, currentQty - soldQty);
                const newStatus = remainingQty <= 0 ? 'Sold' : 'Active';

                const { error: listErr } = await supabase
                    .from('marketplace_listings')
                    .update({
                        quantity: remainingQty,
                        status: newStatus
                    })
                    .eq('id', neg.listing_id);

                if (listErr) {
                    console.error("Error actualizando inventario:", listErr);
                }
            }

            const totalAmount = neg.proposed_quantity * neg.proposed_price;
            setActionFeedback({
                title: '¡Trato Aceptado y Compra Ejecutada!',
                message: `Has cerrado el acuerdo por ${neg.proposed_quantity} ${neg.listing?.product?.unit || 'unidades'} de ${neg.listing?.product?.name || 'producto'} por un monto total de $${totalAmount.toFixed(2)}. El inventario ha sido actualizado.`,
                type: 'success'
            });

            fetchNegotiations();
        } catch (err: any) {
            setActionFeedback({
                title: 'Error al Aceptar Trato',
                message: err.message || 'No se pudo cerrar la transacción.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // RECHAZAR TRATO -> Finaliza el flujo de negociación
    const handleRejectDeal = async (neg: any) => {
        try {
            const { error } = await supabase
                .from('negotiations')
                .update({ 
                    status: 'Rejected',
                    updated_at: new Date().toISOString()
                })
                .eq('id', neg.id);

            if (error) throw error;

            setActionFeedback({
                title: 'Propuesta Rechazada',
                message: 'El flujo de negociación para esta propuesta ha sido finalizado.',
                type: 'error'
            });

            fetchNegotiations();
        } catch (err: any) {
            alert('Error al rechazar propuesta: ' + err.message);
        }
    };

    // ENVIAR CONTRAOFERTA / RESPUESTA -> Mantiene abierto el flujo de negociación
    const handleSendCounterOffer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCounterOffer) return;

        setSendingCounter(true);
        try {
            const newPrice = parseFloat(counterPrice);
            const newQty = parseInt(counterQty);

            const { error } = await supabase
                .from('negotiations')
                .update({
                    proposed_price: newPrice,
                    proposed_quantity: newQty,
                    message: counterMessage || 'Respuesta / Contraoferta del Productor',
                    status: 'Counter_Offered',
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedCounterOffer.id);

            if (error) throw error;

            setActionFeedback({
                title: '¡Contraoferta Enviada!',
                message: `Has enviado tu respuesta de $${newPrice.toFixed(2)} por ${newQty} unidades a ${selectedCounterOffer.buyer?.full_name}. El flujo de negociación sigue abierto hasta que se acepte o rechace el trato.`,
                type: 'success'
            });

            setSelectedCounterOffer(null);
            setCounterPrice('');
            setCounterQty('');
            setCounterMessage('');

            fetchNegotiations();
        } catch (err: any) {
            setActionFeedback({
                title: 'Error enviando respuesta',
                message: err.message || 'No se pudo enviar la contraoferta.',
                type: 'error'
            });
        } finally {
            setSendingCounter(false);
        }
    };

    if (loading) return (
        <div className="p-10 space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-3xl border border-[#0A0A0A]/10"></div>
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
        <div className="glass-card overflow-hidden animate-in fade-in slide-in-from-right-4 duration-700 rounded-[2.5rem] border border-[#0A0A0A]/10 bg-white/95 shadow-xl">
            {/* Header del Gestor de Negociaciones */}
            <div className="px-8 py-6 border-b border-[#0A0A0A]/10 bg-[#FAF9F7]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#1E3F20]/10 text-[#1E3F20] rounded-2xl border border-[#1E3F20]/20">
                        <DollarSign size={22} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-[#0A0A0A] uppercase tracking-tight leading-none">Gestor de Negociaciones B2B</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">B2B Negotiation & Order Execution Terminal</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchNegotiations}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all border border-slate-200 cursor-pointer"
                        title="Actualizar Cotizaciones"
                    >
                        <RefreshCw size={16} />
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#1E3F20]/10 border border-[#1E3F20]/20 rounded-full">
                        <Sparkles size={14} className="text-[#1E3F20]" />
                        <span className="text-xs font-black text-[#1E3F20] uppercase tracking-wider">
                            {negotiations.filter(n => n.status === 'Pending' || n.status === 'CounterOffer').length} Activas
                        </span>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-[#0A0A0A]/10">
                {negotiations.map((neg) => {
                    const isCompleted = neg.status === 'Accepted';
                    const isRejected = neg.status === 'Rejected';
                    const isCounter = neg.status === 'CounterOffer' || neg.status === 'Counter_Offered';
                    const isActive = neg.status === 'Pending' || isCounter;

                    const statusConfig = {
                        Pending: { color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-300', label: 'Requiere Atención' },
                        CounterOffer: { color: 'text-[#1E3F20]', bg: 'bg-emerald-100', border: 'border-emerald-300', label: 'Contraoferta Activa' },
                        Counter_Offered: { color: 'text-[#1E3F20]', bg: 'bg-emerald-100', border: 'border-emerald-300', label: 'Contraoferta Activa' },
                        Accepted: { color: 'text-white', bg: 'bg-emerald-600', border: 'border-emerald-700', label: 'Trato Aceptado / Compra Ejecutada' },
                        Rejected: { color: 'text-white', bg: 'bg-rose-600', border: 'border-rose-700', label: 'Propuesta Rechazada' }
                    };

                    const cfg = statusConfig[neg.status as keyof typeof statusConfig] || statusConfig.Pending;
                    const productName = neg.listing?.product?.name || 'Producto Agrícola';
                    const unitLabel = neg.listing?.product?.unit || 'Unidad';
                    const originalPrice = neg.listing?.price_unit || 1;
                    const proposedPrice = neg.proposed_price;
                    const discountPercent = Math.round((1 - (proposedPrice / originalPrice)) * 100);

                    return (
                        <div key={neg.id} className={`p-8 hover:bg-[#FAF9F7]/80 transition-all duration-300 ${isActive ? 'bg-amber-500/[0.02]' : ''}`}>
                            <div className="flex flex-col lg:flex-row justify-between gap-8">
                                <div className="space-y-6 flex-1">
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <div className={`px-4 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                            {cfg.label}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase">
                                            <Calendar size={14} />
                                            {new Date(neg.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-black text-[#0A0A0A] text-2xl uppercase tracking-tight mb-4 leading-none">
                                            Propuesta: {productName}
                                        </h4>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {/* Buyer Info */}
                                            <div className="bg-[#FAF9F7] p-4 rounded-2xl border border-[#0A0A0A]/10">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                    <User size={12} className="text-[#1E3F20]" /> Contraparte
                                                </p>
                                                <p className="font-black text-[#0A0A0A] text-sm truncate uppercase">{neg.buyer?.full_name || 'Comprador'}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{neg.buyer?.canton}, {neg.buyer?.provincia}</p>
                                            </div>

                                            {/* Volume */}
                                            <div className="bg-[#FAF9F7] p-4 rounded-2xl border border-[#0A0A0A]/10">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Volumen Solicitado</p>
                                                <div className="flex items-baseline gap-1.5">
                                                    <p className="font-black text-[#0A0A0A] text-xl">{neg.proposed_quantity}</p>
                                                    <span className="text-xs font-black text-[#1E3F20] uppercase">{unitLabel}s</span>
                                                </div>
                                            </div>

                                            {/* Price Comparison */}
                                            <div className="bg-[#FAF9F7] p-4 rounded-2xl border border-[#0A0A0A]/10">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Diferencial Precio</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="line-through text-slate-400 font-bold text-xs">${originalPrice.toFixed(2)}</span>
                                                    <div className="flex items-center gap-1 text-[#1E3F20] bg-emerald-100 px-2 py-0.5 rounded-lg font-black text-xs">
                                                        <ArrowDownRight size={12} />
                                                        <span>${proposedPrice.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Total */}
                                            <div className="bg-white p-4 rounded-2xl border border-[#1E3F20]/30 shadow-md">
                                                <p className="text-[10px] font-black text-[#1E3F20] uppercase tracking-widest mb-2">Monto del Trato</p>
                                                <p className="font-black text-[#1E3F20] text-2xl leading-none">
                                                    ${(neg.proposed_quantity * neg.proposed_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {neg.message && (
                                        <div className="flex gap-3 items-start bg-[#FAF9F7] p-4 rounded-2xl border border-[#0A0A0A]/10">
                                            <MessageSquare className="w-5 h-5 text-[#1E3F20] mt-0.5 shrink-0" />
                                            <p className="text-xs text-[#57534E] font-medium leading-relaxed italic">
                                                "{neg.message}"
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* B2B ACTION BUTTONS: High Contrast Emerald Styling */}
                                {isActive && (
                                    <div className="flex flex-col gap-3 min-w-[200px] justify-center lg:border-l lg:pl-8 border-[#0A0A0A]/10">
                                        <button
                                            className="w-full py-3.5 bg-[#1E3F20] hover:bg-[#1E3F20]/90 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-[#1E3F20]"
                                            onClick={() => handleAcceptDeal(neg)}
                                        >
                                            <Check size={16} /> Aceptar Trato
                                        </button>

                                        <button
                                            className="w-full py-3.5 bg-[#C5A059] hover:bg-[#C5A059]/90 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-[#C5A059]"
                                            onClick={() => {
                                                setSelectedCounterOffer(neg);
                                                setCounterPrice(neg.proposed_price.toString());
                                                setCounterQty(neg.proposed_quantity.toString());
                                                setCounterMessage('');
                                            }}
                                        >
                                            <MessageSquare size={16} /> Contraofertar
                                        </button>

                                        <button
                                            className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                                            onClick={() => handleRejectDeal(neg)}
                                        >
                                            <X size={16} /> Rechazar
                                        </button>

                                        <div className="mt-1 flex items-center justify-center gap-1.5 opacity-60">
                                            <Clock size={12} className="text-slate-500" />
                                            <span className="text-[9px] font-black text-slate-500 uppercase">Flujo Activo</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MODAL DE CONTRAOFERTA / RESPUESTA DEL PRODUCTOR */}
            {selectedCounterOffer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
                        <div className="px-6 py-4 bg-[#1E3F20] text-white flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Send className="w-5 h-5 text-white" />
                                <h3 className="text-sm font-black uppercase tracking-wider text-white">Enviar Contraoferta B2B</h3>
                            </div>
                            <button onClick={() => setSelectedCounterOffer(null)} className="text-white/80 hover:text-white cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSendCounterOffer} className="p-6 space-y-4">
                            <div className="bg-emerald-50 border border-emerald-200 text-[#1E3F20] p-3 rounded-2xl text-xs font-bold">
                                Estás respondiendo a <b>{selectedCounterOffer.buyer?.full_name}</b> por <b>{selectedCounterOffer.listing?.product?.name}</b>.
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-slate-700 uppercase">Cantidad Propuesta</label>
                                    <input
                                        type="number" required
                                        min="1"
                                        className="w-full p-3 text-sm font-bold border border-slate-300 rounded-2xl focus:ring-2 focus:ring-[#1E3F20]"
                                        value={counterQty}
                                        onChange={(e) => setCounterQty(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-slate-700 uppercase">Precio por Unidad ($)</label>
                                    <input
                                        type="number" required step="0.01" min="0.01"
                                        className="w-full p-3 text-sm font-bold border border-slate-300 rounded-2xl focus:ring-2 focus:ring-[#1E3F20]"
                                        value={counterPrice}
                                        onChange={(e) => setCounterPrice(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="bg-[#FAF9F7] p-4 rounded-2xl border text-right">
                                <p className="text-xs text-slate-500 font-bold uppercase">Nuevo Monto Propuesto:</p>
                                <p className="text-2xl font-black text-[#1E3F20]">
                                    ${(parseInt(counterQty || '0') * parseFloat(counterPrice || '0')).toFixed(2)}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-black text-slate-700 uppercase">Mensaje de Respuesta</label>
                                <textarea
                                    className="w-full p-3 text-xs border border-slate-300 rounded-2xl focus:ring-2 focus:ring-[#1E3F20]" rows={2}
                                    placeholder="Ej. Puedo dejar en este precio si aseguras retiro directo en finca..."
                                    value={counterMessage}
                                    onChange={(e) => setCounterMessage(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-200">
                                <button type="button" onClick={() => setSelectedCounterOffer(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-black text-xs rounded-2xl uppercase tracking-wider cursor-pointer">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={sendingCounter} className="flex-1 py-3 bg-[#1E3F20] text-white font-black text-xs rounded-2xl uppercase tracking-wider hover:bg-[#1E3F20]/90 shadow-md cursor-pointer">
                                    {sendingCounter ? 'Enviando...' : 'Enviar Respuesta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE RESULTADO / FEEDBACK DE ACCIÓN */}
            {actionFeedback && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200 text-center">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${
                            actionFeedback.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                            {actionFeedback.type === 'success' ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-lg font-black text-[#0A0A0A] uppercase">{actionFeedback.title}</h4>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">{actionFeedback.message}</p>
                        </div>
                        <button
                            onClick={() => setActionFeedback(null)}
                            className="w-full py-3 bg-[#1E3F20] text-white font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-[#1E3F20]/90 transition-all shadow-md cursor-pointer"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
