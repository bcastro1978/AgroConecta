import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import type { ProductCatalog, TierPricing } from '../../types';
import { 
    Plus, Trash2, HelpCircle, Package, DollarSign, Scale, Info, CheckCircle2, 
    ShieldAlert, Sparkles, Edit3, Lock, RefreshCw, XCircle, Tag, Clock,
    Satellite, AlertTriangle
} from 'lucide-react';

interface PublishedListing {
    id: string;
    producer_id: string;
    product_id: string;
    quantity: number;
    price_unit: number;
    status: string;
    description?: string;
    min_order_quantity: number;
    is_negotiable: boolean;
    tier_pricing: TierPricing[];
    created_at: string;
    product?: ProductCatalog;
    negotiations?: Array<{ id: string; status: string }>;
}

export const B2BListingForm = ({ onListingCreated }: { onListingCreated: () => void }) => {
    const { user, profile } = useAuth();
    const [products, setProducts] = useState<ProductCatalog[]>([]);
    const [publishedListings, setPublishedListings] = useState<PublishedListing[]>([]);
    const [loadingListings, setLoadingListings] = useState(false);

    // Form State
    const [editingListingId, setEditingListingId] = useState<string | null>(null);
    const [productId, setProductId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [priceUnit, setPriceUnit] = useState('');
    const [description, setDescription] = useState('');
    const [minOrder, setMinOrder] = useState('1');
    const [isNegotiable, setIsNegotiable] = useState(false);
    const [tierPricing, setTierPricing] = useState<TierPricing[]>([]);

    // UI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [userParcels, setUserParcels] = useState<Array<{ id: string; active_crop: string }>>([]);

    const isProveedorRole = profile?.role === 'Proveedor';

    useEffect(() => {
        fetchProducts();
        if (user) {
            fetchPublishedListings();
            fetchUserParcels();
        }
    }, [user]);

    const fetchProducts = async () => {
        const { data, error } = await supabase.from('products_catalog').select('*').order('name');
        if (!error && data) setProducts(data);
    };

    const fetchUserParcels = async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('parcels')
            .select('id, active_crop')
            .eq('producer_id', user.id);
        if (!error && data) {
            setUserParcels(data.filter(p => p.active_crop));
        }
    };

    const fetchPublishedListings = async () => {
        if (!user) return;
        setLoadingListings(true);
        try {
            const { data, error } = await supabase
                .from('marketplace_listings')
                .select(`
                    *,
                    product:products_catalog ( id, name, unit, category ),
                    negotiations ( id, status )
                `)
                .eq('producer_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setPublishedListings(data as any[]);
            }
        } catch (err) {
            console.error('Error cargando ofertas publicadas:', err);
        } finally {
            setLoadingListings(false);
        }
    };

    const isProducerCategory = (cat: string = '') => {
        const lower = cat.toLowerCase();
        return lower.includes('agroexportación') || 
               lower.includes('cereales') || 
               lower.includes('tubérculos') || 
               lower.includes('frutas') || 
               lower.includes('hortalizas') || 
               lower.includes('pecuario') ||
               lower.includes('productor') ||
               lower.includes('granos') ||
               lower.includes('raíces') ||
               lower.includes('plátano') ||
               lower.includes('legumbres');
    };

    // Filtrar catálogo estrictamente según el perfil/rol del usuario
    const filteredProducts = products.filter(p => {
        const cat = p.category || '';
        if (isProveedorRole) {
            return !isProducerCategory(cat);
        } else {
            return isProducerCategory(cat);
        }
    });

    const handleAddTier = () => {
        setTierPricing([...tierPricing, { min_qty: 0, price: 0 }]);
    };

    const handleUpdateTier = (index: number, field: keyof TierPricing, value: string) => {
        const newTiers = [...tierPricing];
        newTiers[index][field] = parseFloat(value) || 0;
        setTierPricing(newTiers);
    };

    const handleRemoveTier = (index: number) => {
        setTierPricing(tierPricing.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        setEditingListingId(null);
        setProductId('');
        setQuantity('');
        setPriceUnit('');
        setDescription('');
        setMinOrder('1');
        setIsNegotiable(false);
        setTierPricing([]);
        setError('');
    };

    const handleSelectListingToEdit = (listing: PublishedListing) => {
        // Verificar si la oferta ya tiene una propuesta aceptada
        const hasAcceptedOffer = listing.negotiations?.some(n => n.status === 'Accepted');
        if (hasAcceptedOffer) {
            setError('Esta oferta no se puede editar porque ya cuenta con una negociación aceptada.');
            return;
        }

        setEditingListingId(listing.id);
        setProductId(listing.product_id);
        setQuantity(listing.quantity.toString());
        setPriceUnit(listing.price_unit.toString());
        setDescription(listing.description || '');
        setMinOrder((listing.min_order_quantity || 1).toString());
        setIsNegotiable(!!listing.is_negotiable);
        setTierPricing(listing.tier_pricing || []);
        setError('');
        setSuccessMessage(`Modificando oferta: ${listing.product?.name || 'Producto'}`);

        // Desplazar suavemente al formulario
        window.scrollTo({ top: 100, behavior: 'smooth' });
    };

    const handleDeleteListing = async (listingId: string) => {
        if (!confirm('¿Estás seguro de eliminar esta oferta de tu catálogo activo?')) return;
        try {
            const { error: delErr } = await supabase
                .from('marketplace_listings')
                .delete()
                .eq('id', listingId);

            if (delErr) throw delErr;

            setSuccessMessage('Oferta eliminada correctamente.');
            fetchPublishedListings();
            if (editingListingId === listingId) resetForm();
        } catch (err: any) {
            setError(err.message || 'No se pudo eliminar la oferta.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError('Debes iniciar sesión para publicar ofertas.');
            return;
        }

        if (!isProveedorRole && selectedProduct && !isCropMapped) {
            setError(`⚠️ Validación Satelital: El producto '${selectedProduct.name}' no forma parte de tus parcelas mapeadas satelitalmente. Debes registrar primero la parcela con este cultivo en la pestaña MAPA CDSE.`);
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const payload = {
                producer_id: user.id,
                product_id: productId,
                quantity: parseInt(quantity),
                price_unit: parseFloat(priceUnit),
                description,
                min_order_quantity: parseInt(minOrder),
                is_negotiable: isNegotiable,
                tier_pricing: tierPricing,
                status: 'Active'
            };

            if (editingListingId) {
                // MODO EDICIÓN
                const { error: updateError } = await supabase
                    .from('marketplace_listings')
                    .update(payload)
                    .eq('id', editingListingId);

                if (updateError) throw updateError;
                setSuccessMessage('¡Oferta actualizada exitosamente en la base de datos!');
            } else {
                // MODO CREACIÓN
                const { error: insertError } = await supabase
                    .from('marketplace_listings')
                    .insert([payload]);

                if (insertError) throw insertError;
                setSuccessMessage('¡Nueva oferta guardada exitosamente en la base de datos!');
            }

            resetForm();
            fetchPublishedListings();
            onListingCreated();
        } catch (err: any) {
            setError(err.message || 'Error al procesar la oferta en la base de datos.');
        } finally {
            setLoading(false);
        }
    };

    const selectedProduct = products.find(p => p.id === productId);
    const unitLabel = selectedProduct ? selectedProduct.unit : 'unidades';

    const mappedCropNames = Array.from(new Set(userParcels.map(p => p.active_crop).filter(Boolean)));

    const isCropMapped = isProveedorRole || !selectedProduct || userParcels.some(p => {
        const pCrop = (p.active_crop || '').toLowerCase().trim();
        const prod = (selectedProduct.name || '').toLowerCase().trim();
        return prod.includes(pCrop) || pCrop.includes(prod);
    });

    return (
        <div className="space-y-12">
            {/* Formulario de Creación / Edición */}
            <form onSubmit={handleSubmit} className="glass-card p-8 lg:p-10 space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 rounded-[2.5rem] border border-[#1E3F20]/20 bg-white/95 shadow-xl">
                
                {/* Form Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#0A0A0A]/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 bg-[#1E3F20] text-white rounded-2xl shadow-md">
                            {editingListingId ? <Edit3 size={24} /> : <Package size={24} />}
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-[#0A0A0A] tracking-tight uppercase leading-none">
                                {editingListingId 
                                    ? 'Editar Oferta Publicada' 
                                    : (isProveedorRole ? 'Publicar Insumo / Servicio' : 'Nueva Oferta Mayorista')}
                            </h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-1.5">
                                {editingListingId ? `ID Registro: ${editingListingId.substring(0, 8)}...` : 'Trade Execution Terminal'}
                            </p>
                        </div>
                    </div>

                    {editingListingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-800 text-xs font-black rounded-xl hover:bg-slate-300 transition-all uppercase tracking-wider shrink-0"
                        >
                            <XCircle size={16} /> Cancelar Edición
                        </button>
                    )}
                </div>

                {/* Banner de Verificación de Parcelas Satelitales para Productor */}
                {!isProveedorRole && (
                    <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-emerald-950 font-black">
                            <Satellite size={18} className="text-[#1E3F20] shrink-0" />
                            <span>Cultivos Mapeados Satelitalmente en tus Parcelas:</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {mappedCropNames.length > 0 ? (
                                mappedCropNames.map(cropName => (
                                    <span key={cropName} className="px-2.5 py-1 bg-emerald-200/80 text-emerald-950 font-black rounded-lg text-[10px] uppercase border border-emerald-300">
                                        ✓ {cropName}
                                    </span>
                                ))
                            ) : (
                                <span className="text-amber-800 font-bold italic text-[11px]">
                                    Aún no tienes parcelas mapeadas satelitalmente (Pestaña MAPA CDSE)
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-3">
                        <ShieldAlert size={18} />
                        {error}
                    </div>
                )}

                {/* Alerta si el producto seleccionado no está mapeado en parcelas */}
                {!isProveedorRole && selectedProduct && !isCropMapped && (
                    <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 p-4 rounded-2xl text-xs font-bold flex items-start gap-3 animate-in fade-in duration-300">
                        <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-black text-amber-950 uppercase tracking-tight">Validación Satelital Requerida</p>
                            <p className="text-[11px] font-medium text-amber-900 mt-1 leading-relaxed">
                                El producto <strong className="font-black">{selectedProduct.name}</strong> no forma parte de ninguna de tus parcelas mapeadas satelitalmente. Para poder publicar esta oferta B2B, primero debes registrar la finca con este cultivo en la pestaña <strong>MAPA CDSE</strong>.
                            </p>
                        </div>
                    </div>
                )}

                {successMessage && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 p-4 rounded-2xl text-xs font-bold flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-emerald-600" />
                        {successMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Product Selection */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                Catálogo de Productos ({isProveedorRole ? 'Perfil Proveedor' : 'Perfil Productor'})
                            </label>
                            <span className="text-[9px] font-black text-[#1E3F20] bg-[#1E3F20]/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                {isProveedorRole ? 'Insumos y Maquinaria' : 'Cosechas Agrícolas'}
                            </span>
                        </div>

                        <div className="relative group">
                            <select
                                required
                                className="w-full bg-[#FAF9F7] border border-[#0A0A0A]/10 rounded-2xl px-6 py-4 text-[#0A0A0A] font-bold outline-none focus:border-[#1E3F20] transition-all appearance-none cursor-pointer"
                                value={productId}
                                onChange={(e) => setProductId(e.target.value)}
                            >
                                <option value="" className="bg-white">Seleccionar Item del Catálogo...</option>
                                {Object.entries(
                                    filteredProducts.reduce((acc, p) => {
                                        const cat = p.category || 'Otros';
                                        if (!acc[cat]) acc[cat] = [];
                                        acc[cat].push(p);
                                        return acc;
                                    }, {} as Record<string, typeof products>)
                                ).map(([category, items]) => (
                                    <optgroup key={category} label={category} className="bg-slate-100 font-bold text-xs text-[#1E3F20] uppercase">
                                        {items.map(p => (
                                            <option key={p.id} value={p.id} className="bg-white text-[#0A0A0A] font-medium py-1">
                                                {p.name} — ({p.unit})
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-[#1E3F20] transition-colors">
                                <Plus size={18} />
                            </div>
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            Capacidad de Despacho <span className="text-[#1E3F20]">({unitLabel})</span>
                        </label>
                        <div className="relative">
                            <input
                                type="number" required min="1"
                                className="w-full bg-[#FAF9F7] border border-[#0A0A0A]/10 rounded-2xl px-6 py-4 text-[#0A0A0A] font-bold outline-none focus:border-[#1E3F20] transition-all placeholder:text-slate-400"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="Ej. 1000"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <Scale size={18} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#FAF9F7] p-6 lg:p-8 rounded-[2rem] border border-[#0A0A0A]/5">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Precio Base por {unitLabel}</label>
                            <HelpCircle size={14} className="text-slate-400 cursor-help hover:text-[#1E3F20] transition-colors" />
                        </div>
                        <div className="relative">
                            <input
                                type="number" required min="0.01" step="0.01"
                                className="w-full bg-white border border-[#0A0A0A]/10 rounded-2xl px-12 py-4 text-[#1E3F20] font-black text-xl outline-none focus:border-[#1E3F20] transition-all placeholder:text-slate-400"
                                value={priceUnit}
                                onChange={(e) => setPriceUnit(e.target.value)}
                                placeholder="0.00"
                            />
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1E3F20] font-black text-xl">
                                $
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pedido Mínimo (MOQ)</label>
                            <Info size={14} className="text-slate-400 cursor-help hover:text-[#1E3F20] transition-colors" />
                        </div>
                        <div className="relative">
                            <input
                                type="number" required min="1"
                                className="w-full bg-white border border-[#0A0A0A]/10 rounded-2xl px-6 py-4 text-[#0A0A0A] font-black text-xl outline-none focus:border-[#1E3F20] transition-all"
                                value={minOrder}
                                onChange={(e) => setMinOrder(e.target.value)}
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs uppercase">
                                Min Qty
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tier Pricing Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <DollarSign size={16} className="text-[#1E3F20]" />
                            <h4 className="text-[10px] font-black text-[#0A0A0A] uppercase tracking-[0.2em]">Escalas de Precios por Volumen</h4>
                        </div>
                        <button 
                            type="button" 
                            onClick={handleAddTier}
                            className="bg-[#1E3F20] text-white hover:bg-[#1E3F20]/90 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                        >
                            + Agregar Escala
                        </button>
                    </div>

                    {tierPricing.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {tierPricing.map((tier, index) => (
                                <div key={index} className="flex gap-4 items-center bg-[#FAF9F7] p-4 rounded-2xl border border-[#0A0A0A]/5 animate-in slide-in-from-left-4 duration-300">
                                    <div className="flex-1 space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Desde ({unitLabel})</label>
                                        <input
                                            type="number" min="1" required
                                            className="w-full bg-white border border-[#0A0A0A]/10 rounded-xl px-4 py-2 text-[#0A0A0A] font-bold text-sm outline-none focus:border-[#1E3F20]"
                                            value={tier.min_qty || ''}
                                            onChange={(e) => handleUpdateTier(index, 'min_qty', e.target.value)}
                                            placeholder="Ej. 100"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Precio Especial ($)</label>
                                        <input
                                            type="number" min="0.01" step="0.01" required
                                            className="w-full bg-white border border-[#0A0A0A]/10 rounded-xl px-4 py-2 text-[#1E3F20] font-bold text-sm outline-none focus:border-[#1E3F20]"
                                            value={tier.price || ''}
                                            onChange={(e) => handleUpdateTier(index, 'price', e.target.value)}
                                            placeholder="Ej. 13.50"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTier(index)}
                                        className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all mt-5"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-6 text-center bg-[#FAF9F7] border border-dashed border-[#0A0A0A]/10 rounded-2xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sin descuentos por volumen configurados</p>
                        </div>
                    )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Especificaciones Logísticas / Comentarios</label>
                    <textarea
                        className="w-full bg-[#FAF9F7] border border-[#0A0A0A]/10 rounded-2xl px-6 py-4 text-[#0A0A0A] font-medium outline-none focus:border-[#1E3F20] transition-all placeholder:text-slate-400 resize-none"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={isProveedorRole 
                            ? "Detalla tiempos de entrega, certificaciones de insumos o soporte técnico..." 
                            : "Detalla condiciones de retiro en finca, grado de madurez o certificaciones..."}
                    />
                </div>

                {/* Negotiation Toggle */}
                <div 
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${isNegotiable ? 'bg-amber-500/10 border-amber-500/30' : 'bg-[#FAF9F7] border-[#0A0A0A]/10'}`}
                    onClick={() => setIsNegotiable(!isNegotiable)}
                >
                    <div className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${isNegotiable ? 'bg-[#1E3F20]' : 'bg-slate-300'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isNegotiable ? 'left-7' : 'left-1'}`}></div>
                    </div>
                    <div>
                        <h5 className="text-xs font-black uppercase tracking-tight text-[#0A0A0A]">Habilitar Negociación Abierta</h5>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Permite a los compradores proponer contra-ofertas personalizadas</p>
                    </div>
                </div>

                {/* Main Submit Button - High Contrast Green with Crisp White Text */}
                <button 
                    type="submit" 
                    disabled={loading || (!isProveedorRole && selectedProduct && !isCropMapped)}
                    className="w-full py-5 bg-[#1E3F20] hover:bg-[#1E3F20]/90 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.25em] transition-all shadow-xl shadow-[#1E3F20]/20 active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> GUARDANDO EN BASE DE DATOS...</>
                    ) : (!isProveedorRole && selectedProduct && !isCropMapped) ? (
                        <><AlertTriangle size={20} className="text-amber-500" /> CULTIVO NO MAPEADO EN PARCELAS (VALIDACIÓN REQUERIDA)</>
                    ) : (
                        <><CheckCircle2 size={20} className="text-white" /> {editingListingId ? 'GUARDAR CAMBIOS EN OFERTA' : (isProveedorRole ? 'PUBLICAR OFERTA INSUMO' : 'PUBLICAR OFERTA B2B')}</>
                    )}
                </button>
            </form>

            {/* Listado de Productos Publicados (Detalle en la parte inferior) */}
            <div className="glass-card p-8 lg:p-10 space-y-6 rounded-[2.5rem] border border-[#0A0A0A]/10 bg-white/95 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#0A0A0A]/10">
                    <div>
                        <h4 className="text-xl font-black text-[#0A0A0A] uppercase tracking-tight flex items-center gap-2">
                            <Tag size={20} className="text-[#1E3F20]" />
                            Detalle de Productos Publicados
                        </h4>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                            Listado en tiempo real almacenado en Supabase
                        </p>
                    </div>
                    <button
                        onClick={fetchPublishedListings}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#FAF9F7] hover:bg-slate-200 border border-[#0A0A0A]/10 rounded-xl text-[10px] font-black uppercase text-slate-700 transition-all self-start sm:self-auto"
                    >
                        <RefreshCw size={12} className={loadingListings ? 'animate-spin' : ''} /> Actualizar Tabla
                    </button>
                </div>

                {loadingListings ? (
                    <div className="py-12 text-center space-y-3">
                        <div className="w-8 h-8 border-4 border-[#1E3F20]/20 border-t-[#1E3F20] rounded-full animate-spin mx-auto"></div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Cargando publicaciones...</p>
                    </div>
                ) : publishedListings.length === 0 ? (
                    <div className="py-12 text-center space-y-3 bg-[#FAF9F7] rounded-3xl border border-dashed border-[#0A0A0A]/10">
                        <Package size={32} className="text-slate-400 mx-auto" />
                        <p className="text-xs text-slate-500 font-black uppercase tracking-wider">Aún no has registrado productos u ofertas en el sistema</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {publishedListings.map((item) => {
                            const hasAcceptedOffer = item.negotiations?.some(n => n.status === 'Accepted');
                            const isBeingEdited = editingListingId === item.id;

                            return (
                                <div 
                                    key={item.id}
                                    className={`p-6 rounded-3xl border transition-all duration-300 ${
                                        isBeingEdited 
                                            ? 'bg-emerald-50/60 border-[#1E3F20] shadow-md ring-2 ring-[#1E3F20]/20' 
                                            : 'bg-[#FAF9F7]/80 hover:bg-white border-[#0A0A0A]/10 hover:border-[#1E3F20]/30 shadow-sm'
                                    }`}
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div className="space-y-1.5 flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h5 className="font-black text-[#0A0A0A] text-base uppercase">
                                                    {item.product?.name || 'Producto Agrícola'}
                                                </h5>
                                                <span className="text-[9px] font-black bg-[#1E3F20]/10 text-[#1E3F20] px-2 py-0.5 rounded-full uppercase">
                                                    {item.product?.category || 'General'}
                                                </span>
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                                                    item.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-bold text-slate-600">
                                                <div>
                                                    <span className="text-[9px] text-slate-400 uppercase tracking-tight block font-semibold">Capacidad / Cantidad</span>
                                                    <span className="text-[#0A0A0A] font-black">{item.quantity} {item.product?.unit || 'u'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] text-slate-400 uppercase tracking-tight block font-semibold">Precio Base</span>
                                                    <span className="text-[#1E3F20] font-black">${Number(item.price_unit).toFixed(2)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] text-slate-400 uppercase tracking-tight block font-semibold">Pedido Mínimo (MOQ)</span>
                                                    <span className="text-[#0A0A0A] font-black">{item.min_order_quantity} {item.product?.unit || 'u'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] text-slate-400 uppercase tracking-tight block font-semibold">Negociación</span>
                                                    <span className="text-[#0A0A0A] font-black">{item.is_negotiable ? 'Habilitada' : 'Fija'}</span>
                                                </div>
                                            </div>

                                            {item.description && (
                                                <p className="text-xs text-slate-500 font-medium italic pt-1 line-clamp-2">
                                                    "{item.description}"
                                                </p>
                                            )}

                                            <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400 font-bold">
                                                <Clock size={12} /> Publicado el {new Date(item.created_at).toLocaleDateString()}
                                                {item.tier_pricing && item.tier_pricing.length > 0 && (
                                                    <span className="text-[#1E3F20] font-black ml-2">• {item.tier_pricing.length} escala(s) de descuento</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action buttons with strict editing rule */}
                                        <div className="flex items-center gap-2 pt-2 lg:pt-0 shrink-0">
                                            {hasAcceptedOffer ? (
                                                <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-700 rounded-xl text-xs font-black uppercase">
                                                    <Lock size={14} className="text-amber-600" />
                                                    <span>Oferta Aceptada (No editable)</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleSelectListingToEdit(item)}
                                                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm ${
                                                            isBeingEdited
                                                                ? 'bg-slate-900 text-white'
                                                                : 'bg-[#1E3F20] text-white hover:bg-[#1E3F20]/90 active:scale-95'
                                                        }`}
                                                    >
                                                        <Edit3 size={14} />
                                                        {isBeingEdited ? 'Editando' : 'Editar'}
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteListing(item.id)}
                                                        className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white rounded-xl transition-all"
                                                        title="Eliminar Oferta"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
