import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { MarketplaceListing } from '../../types';
import { Button } from '../ui/button';
import { Search, Filter, ShoppingCart, MessageCircle, AlertCircle, X, CheckCircle, ShieldCheck } from 'lucide-react';

export const MarketplaceBrowser = () => {
    const [listings, setListings] = useState<MarketplaceListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Negotiation Modal State
    const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
    const [proposedQty, setProposedQty] = useState('');
    const [proposedPrice, setProposedPrice] = useState('');
    const [message, setMessage] = useState('');
    const [sendingQuote, setSendingQuote] = useState(false);

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('marketplace_listings')
                .select(`
                    *,
                    product:product_id(*),
                    producer:producer_id(full_name, location_ref_lat, location_ref_lng, parcel_boundaries)
                `)
                .eq('status', 'Active')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setListings(data as any || []);
        } catch (err: any) {
            console.error('Error fetching marketplace:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedListing) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("Debes iniciar sesión para cotizar.");
            return;
        }

        const qty = parseInt(proposedQty);
        if (qty < selectedListing.min_order_quantity) {
            alert(`El pedido mínimo es de ${selectedListing.min_order_quantity} ${selectedListing.product?.unit}`);
            return;
        }

        setSendingQuote(true);
        try {
            const { error } = await supabase
                .from('negotiations')
                .insert([{
                    listing_id: selectedListing.id,
                    buyer_id: user.id,
                    producer_id: selectedListing.producer_id,
                    proposed_quantity: qty,
                    proposed_price: parseFloat(proposedPrice),
                    message: message
                }]);

            if (error) throw error;

            alert("Cotización enviada exitosamente al productor.");
            setSelectedListing(null);
            setProposedQty('');
            setProposedPrice('');
            setMessage('');
        } catch (err: any) {
            alert('Error al enviar cotización: ' + err.message);
        } finally {
            setSendingQuote(false);
        }
    };

    // Removed unused calculateTierPrice

    const filteredListings = listings.filter(l =>
        l.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.producer?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por producto o productor..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="w-full md:w-auto">
                    <Filter className="w-4 h-4 mr-2" /> Filtros
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-xl h-64 animate-pulse shadow-sm"></div>
                    ))}
                </div>
            ) : filteredListings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm text-gray-500">
                    No se encontraron ofertas activas en el mercado.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredListings.map(listing => (
                        <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-48 bg-gray-100 relative">
                                {listing.product?.image_url ? (
                                    <img src={listing.product.image_url} alt={listing.product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex justify-center items-center bg-green-50 text-green-200">
                                        <ShoppingCart className="w-16 h-16" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded text-xs font-bold text-green-700 shadow">
                                    Disponible: {listing.quantity} {listing.product?.unit}s
                                </div>
                            </div>

                            <div className="p-5 space-y-4">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xl font-bold text-gray-900">{listing.product?.name}</h3>
                                    </div>
                                    <p className="text-sm text-gray-500">Productor: {listing.producer?.full_name}</p>
                                    
                                    {listing.producer?.parcel_boundaries && Array.isArray(listing.producer.parcel_boundaries) && listing.producer.parcel_boundaries.length >= 3 && (
                                        <div className="mt-2 bg-green-50 border border-green-200 text-green-700 px-2 py-1.5 rounded flex items-center gap-1.5 text-xs w-fit shadow-sm">
                                            <ShieldCheck className="w-4 h-4 text-green-600" />
                                            <span className="font-bold">Cultivo Validado Satelitalmente</span>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Precio Base</p>
                                            <p className="text-2xl font-bold text-green-700">
                                                ${listing.price_unit.toFixed(2)}<span className="text-sm font-normal text-gray-500">/{listing.product?.unit}</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 font-medium">Pedido Mínimo (MOQ)</p>
                                            <p className="font-semibold text-gray-900">{listing.min_order_quantity} {listing.product?.unit}s</p>
                                        </div>
                                    </div>

                                    {listing.tier_pricing && listing.tier_pricing.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                            <p className="text-xs font-medium text-gray-600 mb-1">Precios por Mayor:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {listing.tier_pricing.map((tier, idx) => (
                                                    <span key={idx} className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                                        ≥{tier.min_qty}: <b>${tier.price.toFixed(2)}</b>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {listing.description && (
                                    <p className="text-sm text-gray-600 line-clamp-2">{listing.description}</p>
                                )}

                                <div className="pt-2 flex gap-2">
                                    {listing.is_negotiable ? (
                                        <Button
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                            onClick={() => {
                                                setSelectedListing(listing);
                                                setProposedPrice(listing.price_unit.toString());
                                                setProposedQty(listing.min_order_quantity.toString());
                                            }}
                                        >
                                            <MessageCircle className="w-4 h-4 mr-2" /> Cotizar
                                        </Button>
                                    ) : (
                                        <Button className="w-full">
                                            <ShoppingCart className="w-4 h-4 mr-2" /> Comprar Directo
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Negotiation Modal */}
            {selectedListing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-bold">Solicitar Cotización B2B</h3>
                            <button onClick={() => setSelectedListing(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSendQuote} className="p-6 space-y-4">
                            <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm flex gap-2 items-start">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p>Estás enviando una propuesta a <b>{selectedListing.producer?.full_name}</b> por <b>{selectedListing.product?.name}</b>.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Cantidad ({selectedListing.product?.unit}s)</label>
                                    <input
                                        type="number" required
                                        min={selectedListing.min_order_quantity}
                                        max={selectedListing.quantity}
                                        className="w-full p-2 border rounded-md"
                                        value={proposedQty}
                                        onChange={(e) => setProposedQty(e.target.value)}
                                    />
                                    <p className="text-xs text-gray-500">Min: {selectedListing.min_order_quantity} | Max: {selectedListing.quantity}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Precio Propuesto ($)</label>
                                    <input
                                        type="number" required step="0.01" min="0.01"
                                        className="w-full p-2 border rounded-md"
                                        value={proposedPrice}
                                        onChange={(e) => setProposedPrice(e.target.value)}
                                    />
                                    <p className="text-xs text-gray-500">Base: ${selectedListing.price_unit}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded border text-right">
                                <p className="text-sm text-gray-600">Total Estimado:</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ${(parseInt(proposedQty || '0') * parseFloat(proposedPrice || '0')).toFixed(2)}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Mensaje al Productor (Opcional)</label>
                                <textarea
                                    className="w-full p-2 border rounded-md" rows={2}
                                    placeholder="Ej. Requiero entrega recurrente mensual..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setSelectedListing(null)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" className="flex-1" disabled={sendingQuote}>
                                    {sendingQuote ? 'Enviando...' : 'Enviar Propuesta'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
