import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { MarketplaceListing } from '../../types';
import { 
    Search, Filter, ShoppingCart, MessageCircle, AlertCircle, X, CheckCircle2, 
    ShieldCheck, Clock, ArrowRight, UserCheck, Package, DollarSign, Send, CheckCircle, RefreshCw
} from 'lucide-react';

interface BuyerNegotiation {
    id: string;
    listing_id: string;
    buyer_id: string;
    producer_id: string;
    proposed_quantity: number;
    proposed_price: number;
    message: string;
    status: 'Pending' | 'Accepted' | 'Rejected' | 'CounterOffer' | 'Counter_Offered';
    created_at: string;
    updated_at: string;
    listing?: MarketplaceListing;
    producer?: {
        full_name: string;
        provincia: string;
        canton: string;
        phone_number?: string;
    };
}

export const MarketplaceBrowser = () => {
    const [listings, setListings] = useState<MarketplaceListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // State para Cotización B2B
    const [selectedQuoteListing, setSelectedQuoteListing] = useState<MarketplaceListing | null>(null);
    const [proposedQty, setProposedQty] = useState('');
    const [proposedPrice, setProposedPrice] = useState('');
    const [message, setMessage] = useState('');
    const [sendingQuote, setSendingQuote] = useState(false);

    // State para Compra Directa
    const [selectedDirectListing, setSelectedDirectListing] = useState<MarketplaceListing | null>(null);
    const [directQty, setDirectQty] = useState('');
    const [directNotes, setDirectNotes] = useState('');
    const [processingDirect, setProcessingDirect] = useState(false);

    // State para Historial de Transacciones del Comprador
    const [myNegotiations, setMyNegotiations] = useState<BuyerNegotiation[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [transactionFilter, setTransactionFilter] = useState<'todas' | 'compras' | 'cotizaciones'>('todas');
    const [selectedChatNegotiation, setSelectedChatNegotiation] = useState<BuyerNegotiation | null>(null);

    // Modal de Alerta y Resultado de Acción
    const [actionFeedback, setActionFeedback] = useState<{
        title: string;
        message: string;
        type: 'success' | 'error';
    } | null>(null);

    useEffect(() => {
        fetchListings();
        fetchMyTransactions();
    }, []);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('marketplace_listings')
                .select(`
                    *,
                    product:product_id(*),
                    producer:producer_id(full_name, location_ref_lat, location_ref_lng)
                `)
                .eq('status', 'Active')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setListings(data as any || []);
        } catch (err: any) {
            console.error('Error cargando marketplace:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyTransactions = async () => {
        setLoadingTransactions(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('negotiations')
                .select(`
                    *,
                    listing:listing_id (
                        *,
                        product:product_id(*)
                    ),
                    producer:producer_id(full_name, provincia, canton, phone_number)
                `)
                .eq('buyer_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setMyNegotiations(data as any[]);
            }
        } catch (err) {
            console.error('Error cargando historial de transacciones:', err);
        } finally {
            setLoadingTransactions(false);
        }
    };

    // Calcular precio por escala según volumen de compra directa
    const calculateEffectivePrice = (listing: MarketplaceListing, qty: number) => {
        let bestPrice = listing.price_unit;
        if (listing.tier_pricing && listing.tier_pricing.length > 0) {
            for (const tier of listing.tier_pricing) {
                if (qty >= tier.min_qty && tier.price < bestPrice) {
                    bestPrice = tier.price;
                }
            }
        }
        return bestPrice;
    };

    // Enviar Cotización / Propuesta
    const handleSendQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedQuoteListing) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setActionFeedback({
                title: 'Autenticación Requerida',
                message: 'Debes iniciar sesión como comprador para enviar una cotización.',
                type: 'error'
            });
            return;
        }

        const qty = parseInt(proposedQty);
        if (qty < selectedQuoteListing.min_order_quantity) {
            setActionFeedback({
                title: 'Pedido Mínimo No Alcanzado',
                message: `El pedido mínimo requerido para este producto es de ${selectedQuoteListing.min_order_quantity} ${selectedQuoteListing.product?.unit}s.`,
                type: 'error'
            });
            return;
        }

        setSendingQuote(true);
        try {
            const { error } = await supabase
                .from('negotiations')
                .insert([{
                    listing_id: selectedQuoteListing.id,
                    buyer_id: user.id,
                    producer_id: selectedQuoteListing.producer_id,
                    proposed_quantity: qty,
                    proposed_price: parseFloat(proposedPrice),
                    message: message || 'Solicitud de Cotización B2B'
                }]);

            if (error) throw error;

            setActionFeedback({
                title: '¡Cotización Enviada Exitosamente!',
                message: `Tu propuesta para ${selectedQuoteListing.product?.name} fue enviada al productor ${selectedQuoteListing.producer?.full_name}. Podrás revisar el seguimiento en tu Historial de Transacciones.`,
                type: 'success'
            });

            setSelectedQuoteListing(null);
            setProposedQty('');
            setProposedPrice('');
            setMessage('');

            fetchMyTransactions();
        } catch (err: any) {
            setActionFeedback({
                title: 'Error al Procesar Cotización',
                message: err.message || 'Ocurrió un error al enviar la propuesta.',
                type: 'error'
            });
        } finally {
            setSendingQuote(false);
        }
    };

    // Procesar Compra Directa
    const handleConfirmDirectPurchase = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDirectListing) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setActionFeedback({
                title: 'Autenticación Requerida',
                message: 'Debes iniciar sesión como comprador para realizar una compra directa.',
                type: 'error'
            });
            return;
        }

        const qty = parseInt(directQty);
        if (qty < selectedDirectListing.min_order_quantity) {
            setActionFeedback({
                title: 'Pedido Mínimo No Alcanzado',
                message: `El pedido mínimo para compra directa es de ${selectedDirectListing.min_order_quantity} ${selectedDirectListing.product?.unit}s.`,
                type: 'error'
            });
            return;
        }

        if (qty > selectedDirectListing.quantity) {
            setActionFeedback({
                title: 'Cantidad No Disponible',
                message: `Solo existen ${selectedDirectListing.quantity} ${selectedDirectListing.product?.unit}s disponibles en inventario.`,
                type: 'error'
            });
            return;
        }

        const effectiveUnitPrice = calculateEffectivePrice(selectedDirectListing, qty);
        const totalAmount = qty * effectiveUnitPrice;

        setProcessingDirect(true);
        try {
            // 1. Insertar orden de compra directa en negociaciones con status 'Accepted'
            const { error: negError } = await supabase
                .from('negotiations')
                .insert([{
                    listing_id: selectedDirectListing.id,
                    buyer_id: user.id,
                    producer_id: selectedDirectListing.producer_id,
                    proposed_quantity: qty,
                    proposed_price: effectiveUnitPrice,
                    message: `ORDEN DIRECTA CONFIRMADA: ${directNotes || 'Compra directa realizada al precio de lista'}` ,
                    status: 'Accepted'
                }]);

            if (negError) throw negError;

            // 2. Descontar cantidad disponible del inventario de la publicación
            const newQty = selectedDirectListing.quantity - qty;
            const newStatus = newQty <= 0 ? 'Sold' : 'Active';

            const { error: updateErr } = await supabase
                .from('marketplace_listings')
                .update({
                    quantity: newQty,
                    status: newStatus
                })
                .eq('id', selectedDirectListing.id);

            if (updateErr) throw updateErr;

            setActionFeedback({
                title: '¡Compra Directa Realizada con Éxito!',
                message: `Has adquirido ${qty} ${selectedDirectListing.product?.unit}s de ${selectedDirectListing.product?.name} por un monto total de $${totalAmount.toFixed(2)}. La orden directa se ha registrado en tu historial.`,
                type: 'success'
            });

            setSelectedDirectListing(null);
            setDirectQty('');
            setDirectNotes('');

            fetchListings();
            fetchMyTransactions();
        } catch (err: any) {
            setActionFeedback({
                title: 'Error en Compra Directa',
                message: err.message || 'No se pudo completar la transacción directa.',
                type: 'error'
            });
        } finally {
            setProcessingDirect(false);
        }
    };

    const filteredListings = listings.filter(l =>
        l.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.producer?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredTransactions = myNegotiations.filter(t => {
        const isDirect = (t.message || '').includes('ORDEN DIRECTA') || t.status === 'Accepted';
        if (transactionFilter === 'compras') return isDirect;
        if (transactionFilter === 'cotizaciones') return !isDirect;
        return true;
    });

    return (
        <div className="space-y-12">
            {/* Header del Catálogo de Compradores */}
            <div className="glass-card p-8 rounded-[2.5rem] border border-[#0A0A0A]/10 bg-white/95 shadow-xl space-y-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-[#0A0A0A]/10 pb-6">
                    <div>
                        <h2 className="text-3xl font-black text-[#0A0A0A] uppercase tracking-tighter">
                            Catálogo de Ofertas de Producción Nacional
                        </h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                            Navega por las cosechas georreferenciadas activas y realiza compras directas o solicitudes de cotización B2B.
                        </p>
                    </div>

                    <div className="relative w-full md:w-96 shrink-0">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar por producto o productor..."
                            className="w-full pl-10 pr-4 py-2.5 text-xs font-bold bg-[#FAF9F7] border border-[#0A0A0A]/10 rounded-2xl focus:outline-none focus:border-[#1E3F20] text-slate-900"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-slate-100 rounded-3xl h-72 animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredListings.length === 0 ? (
                    <div className="text-center py-16 bg-[#FAF9F7] rounded-3xl border border-dashed border-[#0A0A0A]/10 space-y-2">
                        <AlertCircle size={32} className="text-slate-400 mx-auto" />
                        <p className="text-sm font-black text-slate-700 uppercase">No se encontraron ofertas activas en el mercado</p>
                        <p className="text-xs text-slate-500 font-bold max-w-sm mx-auto">No hay publicaciones activas que coincidan con tu búsqueda en este momento.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredListings.map(listing => (
                            <div key={listing.id} className="bg-white rounded-3xl border border-[#0A0A0A]/10 overflow-hidden hover:border-[#1E3F20]/30 transition-all shadow-md hover:shadow-xl flex flex-col group">
                                <div className="h-44 bg-slate-100 relative overflow-hidden shrink-0">
                                    {listing.product?.image_url ? (
                                        <img src={listing.product.image_url} alt={listing.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex justify-center items-center bg-[#1E3F20]/5 text-[#1E3F20]">
                                            <ShoppingCart className="w-14 h-14 opacity-30" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-black text-[#1E3F20] border border-[#1E3F20]/20 shadow-md">
                                        Disponible: {listing.quantity} {listing.product?.unit}s
                                    </div>
                                </div>

                                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-black text-[#0A0A0A] uppercase tracking-tight leading-snug">
                                            {listing.product?.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 font-bold uppercase">
                                            Productor: <span className="text-[#0A0A0A] font-black">{listing.producer?.full_name}</span>
                                        </p>

                                        {listing.producer?.location_ref_lat && (
                                            <div className="bg-emerald-50 border border-emerald-200 text-[#1E3F20] px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-[10px] w-fit font-black uppercase">
                                                <ShieldCheck className="w-3.5 h-3.5 text-[#1E3F20]" />
                                                <span>Cultivo Validado Satelitalmente</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-[#FAF9F7] p-4 rounded-2xl border border-[#0A0A0A]/10 space-y-2">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[10px] text-slate-500 font-black uppercase">Precio Base</p>
                                                <p className="text-2xl font-black text-[#1E3F20]">
                                                    ${listing.price_unit.toFixed(2)}<span className="text-xs font-bold text-slate-500">/{listing.product?.unit}</span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-slate-500 font-black uppercase">Pedido Mín. (MOQ)</p>
                                                <p className="text-sm font-black text-[#0A0A0A]">{listing.min_order_quantity} {listing.product?.unit}s</p>
                                            </div>
                                        </div>

                                        {listing.tier_pricing && listing.tier_pricing.length > 0 && (
                                            <div className="pt-2 border-t border-[#0A0A0A]/10">
                                                <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Precios por Mayor:</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {listing.tier_pricing.map((tier, idx) => (
                                                        <span key={idx} className="text-[9px] bg-emerald-100 text-emerald-900 font-black px-2 py-0.5 rounded-lg border border-emerald-200 uppercase">
                                                            ≥{tier.min_qty}: ${tier.price.toFixed(2)}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {listing.description && (
                                        <p className="text-xs text-slate-600 font-medium line-clamp-2 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                                            "{listing.description}"
                                        </p>
                                    )}

                                    {/* Action Buttons: High Contrast Premium Styling */}
                                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedDirectListing(listing);
                                                setDirectQty(listing.min_order_quantity.toString());
                                            }}
                                            className="w-full bg-[#1E3F20] hover:bg-[#1E3F20]/90 text-white font-black text-xs py-3 px-3 rounded-2xl uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer border border-[#1E3F20]"
                                        >
                                            <ShoppingCart className="w-4 h-4 text-white" />
                                            <span>Comprar Directo</span>
                                        </button>

                                        {listing.is_negotiable && (
                                            <button
                                                onClick={() => {
                                                    setSelectedQuoteListing(listing);
                                                    setProposedPrice(listing.price_unit.toString());
                                                    setProposedQty(listing.min_order_quantity.toString());
                                                }}
                                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-3 px-3 rounded-2xl uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer border border-slate-900"
                                            >
                                                <MessageCircle className="w-4 h-4 text-white" />
                                                <span>Cotizar</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* SECCIÓN INFERIOR: HISTORIAL DE TRANSACCIONES Y COTIZACIONES */}
            <div className="glass-card p-8 lg:p-10 rounded-[2.5rem] border border-[#0A0A0A]/10 bg-white/95 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#0A0A0A]/10 pb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#1E3F20]" />
                            <h3 className="text-xl font-black text-[#0A0A0A] uppercase tracking-tight">
                                Historial de Transacciones y Cotizaciones Directas
                            </h3>
                        </div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                            Monitorea tus órdenes de compra directa y revisa el hilo de respuestas negociadas con los productores.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchMyTransactions}
                            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all border border-slate-200 cursor-pointer"
                            title="Actualizar Transacciones"
                        >
                            <RefreshCw size={16} className={loadingTransactions ? 'animate-spin' : ''} />
                        </button>
                        
                        <div className="flex items-center gap-1 bg-[#FAF9F7] p-1 rounded-2xl border border-[#0A0A0A]/10">
                            {[
                                { id: 'todas', label: 'Todas' },
                                { id: 'compras', label: 'Compras Directas' },
                                { id: 'cotizaciones', label: 'Cotizaciones' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setTransactionFilter(tab.id as any)}
                                    className={`px-3 py-1.5 text-xs font-black rounded-xl uppercase tracking-wider transition-all cursor-pointer ${
                                        transactionFilter === tab.id
                                            ? 'bg-[#1E3F20] text-white shadow-sm'
                                            : 'text-slate-600 hover:bg-white'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loadingTransactions ? (
                    <div className="py-12 text-center space-y-3">
                        <div className="w-8 h-8 border-4 border-[#1E3F20]/20 border-t-[#1E3F20] rounded-full animate-spin mx-auto"></div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Cargando transacciones...</p>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="py-12 text-center bg-[#FAF9F7] rounded-3xl border border-dashed border-[#0A0A0A]/10 space-y-2">
                        <Package size={28} className="text-slate-400 mx-auto" />
                        <p className="text-xs text-slate-700 font-black uppercase">Sin transacciones registradas</p>
                        <p className="text-[11px] text-slate-500 font-bold max-w-sm mx-auto">Aún no has ejecutado órdenes de compra ni enviado cotizaciones B2B.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTransactions.map(tx => {
                            const isDirect = (tx.message || '').includes('ORDEN DIRECTA') || tx.status === 'Accepted';
                            const totalVal = tx.proposed_quantity * tx.proposed_price;

                            return (
                                <div key={tx.id} className="p-6 bg-[#FAF9F7] hover:bg-white rounded-3xl border border-[#0A0A0A]/10 hover:border-[#1E3F20]/30 transition-all shadow-sm space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full border ${
                                                    isDirect ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-sky-100 text-sky-900 border-sky-300'
                                                }`}>
                                                    {isDirect ? '🛒 Orden Directa' : '💬 Cotización B2B'}
                                                </span>
                                                <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full ${
                                                    tx.status === 'Accepted' ? 'bg-emerald-600 text-white' : tx.status === 'Rejected' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                                                }`}>
                                                    Status: {tx.status === 'Accepted' ? 'Completada / Aceptada' : tx.status === 'Rejected' ? 'Rechazada' : (tx.status === 'CounterOffer' || tx.status === 'Counter_Offered') ? 'Contraoferta Recibida' : 'Pendiente'}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">
                                                    {new Date(tx.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h4 className="text-base font-black text-[#0A0A0A] uppercase tracking-tight mt-1">
                                                {tx.listing?.product?.name || 'Producto Agrícola'}
                                            </h4>
                                            <p className="text-xs text-slate-500 font-bold uppercase">
                                                Productor: <span className="text-[#0A0A0A] font-black">{tx.producer?.full_name}</span> ({tx.producer?.canton}, {tx.producer?.provincia})
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-left sm:text-right">
                                                <p className="text-[10px] text-slate-500 font-black uppercase">Volumen y Valor</p>
                                                <p className="text-lg font-black text-[#1E3F20]">
                                                    ${totalVal.toFixed(2)}
                                                </p>
                                                <p className="text-[10px] text-slate-500 font-bold">
                                                    {tx.proposed_quantity} {tx.listing?.product?.unit}s @ ${tx.proposed_price.toFixed(2)}/u
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => setSelectedChatNegotiation(tx)}
                                                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                                            >
                                                <MessageCircle size={14} className="text-white" />
                                                <span>Ver Hilo de Respuestas</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* MODAL DE COMPRA DIRECTA */}
            {selectedDirectListing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200">
                        <div className="px-6 py-4 bg-[#1E3F20] text-white flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-white" />
                                <h3 className="text-sm font-black uppercase tracking-wider text-white">Orden de Compra Directa</h3>
                            </div>
                            <button onClick={() => setSelectedDirectListing(null)} className="text-white/80 hover:text-white cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleConfirmDirectPurchase} className="p-6 space-y-5">
                            <div className="bg-emerald-50 border border-emerald-200 text-[#1E3F20] p-4 rounded-2xl text-xs space-y-1">
                                <p className="font-black uppercase">Resumen de Publicación</p>
                                <p className="font-bold text-slate-800">Producto: {selectedDirectListing.product?.name}</p>
                                <p className="font-bold text-slate-800">Productor: {selectedDirectListing.producer?.full_name}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-700 uppercase">Cantidad a Adquirir ({selectedDirectListing.product?.unit}s)</label>
                                <input
                                    type="number" required
                                    min={selectedDirectListing.min_order_quantity}
                                    max={selectedDirectListing.quantity}
                                    className="w-full p-3 text-sm font-bold border border-slate-300 rounded-2xl focus:ring-2 focus:ring-[#1E3F20]"
                                    value={directQty}
                                    onChange={(e) => setDirectQty(e.target.value)}
                                />
                                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                                    <span>MOQ: {selectedDirectListing.min_order_quantity} {selectedDirectListing.product?.unit}s</span>
                                    <span>Disponible: {selectedDirectListing.quantity} {selectedDirectListing.product?.unit}s</span>
                                </div>
                            </div>

                            {/* Desglose de Cálculo */}
                            {directQty && parseInt(directQty) >= selectedDirectListing.min_order_quantity && (
                                <div className="bg-[#FAF9F7] p-4 rounded-2xl border border-slate-200 space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-slate-600">
                                        <span>Precio Unitario Aplicado:</span>
                                        <span className="font-black text-[#1E3F20]">
                                            ${calculateEffectivePrice(selectedDirectListing, parseInt(directQty)).toFixed(2)} /{selectedDirectListing.product?.unit}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                                        <span>Monto Total de Orden:</span>
                                        <span className="text-[#1E3F20]">
                                            ${(parseInt(directQty) * calculateEffectivePrice(selectedDirectListing, parseInt(directQty))).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-black text-slate-700 uppercase">Notas para Logística o Entrega (Opcional)</label>
                                <textarea
                                    className="w-full p-3 text-xs border rounded-2xl focus:ring-2 focus:ring-[#1E3F20]" rows={2}
                                    placeholder="Ej. Coordinar despacho inmediato para bodega en Quito..."
                                    value={directNotes}
                                    onChange={(e) => setDirectNotes(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-200">
                                <button type="button" onClick={() => setSelectedDirectListing(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-black text-xs rounded-2xl uppercase tracking-wider cursor-pointer">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={processingDirect} className="flex-1 py-3 bg-[#1E3F20] text-white font-black text-xs rounded-2xl uppercase tracking-wider hover:bg-[#1E3F20]/90 shadow-md cursor-pointer">
                                    {processingDirect ? 'Procesando...' : 'Confirmar Compra Directa'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE COTIZACIÓN B2B */}
            {selectedQuoteListing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200">
                        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-white" />
                                <h3 className="text-sm font-black uppercase tracking-wider text-white">Solicitar Cotización B2B</h3>
                            </div>
                            <button onClick={() => setSelectedQuoteListing(null)} className="text-white/80 hover:text-white cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSendQuote} className="p-6 space-y-4">
                            <div className="bg-sky-50 border border-sky-200 text-sky-900 p-3 rounded-2xl text-xs font-bold">
                                Estás enviando una propuesta a <b>{selectedQuoteListing.producer?.full_name}</b> por <b>{selectedQuoteListing.product?.name}</b>.
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-slate-700 uppercase">Cantidad ({selectedQuoteListing.product?.unit}s)</label>
                                    <input
                                        type="number" required
                                        min={selectedQuoteListing.min_order_quantity}
                                        max={selectedQuoteListing.quantity}
                                        className="w-full p-3 text-sm font-bold border rounded-2xl"
                                        value={proposedQty}
                                        onChange={(e) => setProposedQty(e.target.value)}
                                    />
                                    <p className="text-[10px] text-slate-500 font-bold">Mín: {selectedQuoteListing.min_order_quantity}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-slate-700 uppercase">Precio Propuesto ($)</label>
                                    <input
                                        type="number" required step="0.01" min="0.01"
                                        className="w-full p-3 text-sm font-bold border rounded-2xl"
                                        value={proposedPrice}
                                        onChange={(e) => setProposedPrice(e.target.value)}
                                    />
                                    <p className="text-[10px] text-slate-500 font-bold">Base: ${selectedQuoteListing.price_unit}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl border text-right">
                                <p className="text-xs text-slate-500 font-bold uppercase">Total Estimado:</p>
                                <p className="text-2xl font-black text-slate-900">
                                    ${(parseInt(proposedQty || '0') * parseFloat(proposedPrice || '0')).toFixed(2)}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-black text-slate-700 uppercase">Mensaje al Productor</label>
                                <textarea
                                    className="w-full p-3 text-xs border rounded-2xl" rows={2}
                                    placeholder="Ej. Requiero entrega recurrente mensual..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setSelectedQuoteListing(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-black text-xs rounded-2xl uppercase tracking-wider cursor-pointer">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={sendingQuote} className="flex-1 py-3 bg-slate-900 text-white font-black text-xs rounded-2xl uppercase tracking-wider hover:bg-slate-800 shadow-md cursor-pointer">
                                    {sendingQuote ? 'Enviando...' : 'Enviar Propuesta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL HISTORIAL DE RESPUESTAS CON PRODUCTOR */}
            {selectedChatNegotiation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
                        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-wider text-white">Hilo de Respuestas con Productor</h3>
                                <p className="text-[10px] text-slate-300 font-bold uppercase">{selectedChatNegotiation.listing?.product?.name}</p>
                            </div>
                            <button onClick={() => setSelectedChatNegotiation(null)} className="text-white/80 hover:text-white cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-[#FAF9F7]">
                            <div className="bg-white p-4 rounded-2xl border space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-[#0A0A0A]">{selectedChatNegotiation.producer?.full_name}</span>
                                    <span className="text-[10px] text-slate-400 font-bold">{new Date(selectedChatNegotiation.created_at).toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border italic">
                                    "{selectedChatNegotiation.message}"
                                </p>
                                <div className="flex justify-between items-center text-xs font-bold pt-2 border-t text-slate-700">
                                    <span>Volumen: {selectedChatNegotiation.proposed_quantity} u</span>
                                    <span className="font-black text-[#1E3F20]">Precio: ${selectedChatNegotiation.proposed_price.toFixed(2)}/u</span>
                                </div>
                            </div>

                            <div className={`p-4 rounded-2xl border text-xs font-bold space-y-1 ${
                                selectedChatNegotiation.status === 'Accepted' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : selectedChatNegotiation.status === 'Rejected' ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-amber-50 border-amber-200 text-amber-900'
                            }`}>
                                <p className="font-black uppercase">Estado Actual de la Transacción:</p>
                                <p>{selectedChatNegotiation.status === 'Accepted' ? '✅ La orden ha sido confirmada y aceptada por el productor.' : selectedChatNegotiation.status === 'Rejected' ? '❌ La cotización fue declinada.' : '⏳ Esperando respuesta o contraoferta del productor.'}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-white border-t flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
                            {(selectedChatNegotiation.status === 'Pending' || selectedChatNegotiation.status === 'CounterOffer') ? (
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={async () => {
                                            try {
                                                const { error: nErr } = await supabase.from('negotiations').update({ status: 'Accepted' }).eq('id', selectedChatNegotiation.id);
                                                if (nErr) throw nErr;

                                                if (selectedChatNegotiation.listing) {
                                                    const curQty = selectedChatNegotiation.listing.quantity || 0;
                                                    const solQty = selectedChatNegotiation.proposed_quantity || 0;
                                                    const remQty = Math.max(0, curQty - solQty);
                                                    await supabase.from('marketplace_listings').update({ quantity: remQty, status: remQty <= 0 ? 'Sold' : 'Active' }).eq('id', selectedChatNegotiation.listing_id);
                                                }

                                                setActionFeedback({
                                                    title: '¡Trato Aceptado y Compra Ejecutada!',
                                                    message: 'Has aceptado la propuesta. Se ha generado tu orden directa y actualizado el inventario.',
                                                    type: 'success'
                                                });
                                                setSelectedChatNegotiation(null);
                                                fetchListings();
                                                fetchMyTransactions();
                                            } catch (err: any) {
                                                alert("Error al aceptar trato: " + err.message);
                                            }
                                        }}
                                        className="flex-1 sm:flex-none px-4 py-2.5 bg-[#1E3F20] text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-[#1E3F20]/90 transition-all cursor-pointer shadow-md"
                                    >
                                        ✓ Aceptar Trato y Comprar
                                    </button>

                                    <button
                                        onClick={async () => {
                                            try {
                                                await supabase.from('negotiations').update({ status: 'Rejected' }).eq('id', selectedChatNegotiation.id);
                                                setActionFeedback({
                                                    title: 'Propuesta Rechazada',
                                                    message: 'Has declinado esta propuesta.',
                                                    type: 'error'
                                                });
                                                setSelectedChatNegotiation(null);
                                                fetchMyTransactions();
                                            } catch (err: any) {
                                                alert("Error al rechazar: " + err.message);
                                            }
                                        }}
                                        className="flex-1 sm:flex-none px-4 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-rose-100 transition-all cursor-pointer"
                                    >
                                        ✕ Decliinar
                                    </button>
                                </div>
                            ) : <div></div>}

                            <button onClick={() => setSelectedChatNegotiation(null)} className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white font-black text-xs uppercase rounded-xl cursor-pointer">
                                Cerrar Hilo
                            </button>
                        </div>
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
