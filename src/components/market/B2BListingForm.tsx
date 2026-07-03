import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import type { ProductCatalog, TierPricing } from '../../types';
import { Button } from '../ui/button';
import { Plus, Trash2, HelpCircle, Package, DollarSign, Scale, Info, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

export const B2BListingForm = ({ onListingCreated }: { onListingCreated: () => void }) => {
    const { user, profile } = useAuth();
    const [products, setProducts] = useState<ProductCatalog[]>([]);

    // Form State
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

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const { data, error } = await supabase.from('products_catalog').select('*').order('name');
        if (!error && data) setProducts(data);
    };

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || profile?.verification_status !== 'Verified') {
            setError('Debes estar verificado para publicar ofertas.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { error: insertError } = await supabase
                .from('marketplace_listings')
                .insert([{
                    producer_id: user.id,
                    product_id: productId,
                    quantity: parseInt(quantity),
                    price_unit: parseFloat(priceUnit),
                    description,
                    min_order_quantity: parseInt(minOrder),
                    is_negotiable: isNegotiable,
                    tier_pricing: tierPricing
                }]);

            if (insertError) throw insertError;

            // Reset form
            setProductId('');
            setQuantity('');
            setPriceUnit('');
            setDescription('');
            setMinOrder('1');
            setIsNegotiable(false);
            setTierPricing([]);

            onListingCreated();
        } catch (err: any) {
            setError(err.message || 'Error al publicar la oferta');
        } finally {
            setLoading(false);
        }
    };

    if (profile?.verification_status !== 'Verified') {
        return (
            <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] text-center space-y-4 animate-in fade-in duration-500">
                <div className="bg-red-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-red-500 border border-red-500/20">
                    <ShieldAlert size={32} />
                </div>
                <div>
                    <h4 className="text-[#0A0A0A] font-black text-lg uppercase tracking-tight">Acceso Restringido</h4>
                    <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto">Tu cuenta requiere verificación administrativa para operar en el Mercado B2B.</p>
                </div>
            </div>
        );
    }

    const selectedProduct = products.find(p => p.id === productId);
    const unitLabel = selectedProduct ? selectedProduct.unit : 'unidades';

    return (
        <form onSubmit={handleSubmit} className="glass-card p-8 lg:p-10 space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
            
            {/* Form Header */}
            <div className="relative">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-[#1E3F20]/5 text-[#1E3F20] rounded-2xl border border-[#1E3F20]/20">
                        <Package size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-[#0A0A0A] tracking-tight uppercase leading-none">
                            {profile?.role === 'Proveedor' ? 'Publicar Insumo/Servicio' : 'Nueva Oferta Mayorista'}
                        </h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-1.5">Trade Execution Terminal</p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                    <Sparkles size={60} className="text-[#1E3F20]" />
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-3">
                    <ShieldAlert size={18} />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Selection */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Catálogo de Productos</label>
                    <div className="relative group">
                        <select
                            required
                            className="w-full bg-[#FAF9F7]/50 border border-[#0A0A0A]/10 rounded-2xl px-6 py-4 text-[#0A0A0A] font-bold outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                        >
                            <option value="" className="bg-white">Seleccionar Item...</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id} className="bg-white">{p.name} ({p.unit})</option>
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
                            className="w-full bg-[#FAF9F7]/50 border border-[#0A0A0A]/10 rounded-2xl px-6 py-4 text-[#0A0A0A] font-bold outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-700"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="Ej. 1000"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                            <Scale size={18} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Pricing Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#FAF9F7]/40 p-8 rounded-[2.5rem] border border-[#0A0A0A]/10">
                <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Precio Base por {unitLabel}</label>
                        <HelpCircle size={14} className="text-slate-700 cursor-help hover:text-[#1E3F20] transition-colors" />
                    </div>
                    <div className="relative">
                        <input
                            type="number" required min="0.01" step="0.01"
                            className="w-full bg-white/90 border border-[#0A0A0A]/10 rounded-2xl px-12 py-4 text-[#1E3F20] font-black text-xl outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-700"
                            value={priceUnit}
                            onChange={(e) => setPriceUnit(e.target.value)}
                            placeholder="0.00"
                        />
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1E3F20]/50 font-black text-xl">
                            $
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pedido Mínimo (MOQ)</label>
                        <Info size={14} className="text-slate-700 cursor-help hover:text-cyan-500 transition-colors" />
                    </div>
                    <div className="relative">
                        <input
                            type="number" required min="1"
                            className="w-full bg-white/90 border border-[#0A0A0A]/10 rounded-2xl px-6 py-4 text-[#0A0A0A] font-black text-xl outline-none focus:border-cyan-500/50 transition-all"
                            value={minOrder}
                            onChange={(e) => setMinOrder(e.target.value)}
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 font-bold text-xs uppercase">
                            Min Qty
                        </div>
                    </div>
                </div>
            </div>

            {/* Tier Pricing Section */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <DollarSign size={18} className="text-[#1E3F20]" />
                        <h4 className="text-[10px] font-black text-[#0A0A0A] uppercase tracking-[0.2em]">Escalas de Precios por Volumen</h4>
                    </div>
                    <button 
                        type="button" 
                        onClick={handleAddTier}
                        className="bg-[#1E3F20]/5 hover:bg-[#1E3F20]/10 text-[#1E3F20] border border-[#1E3F20]/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                    >
                        + Agregar Escala
                    </button>
                </div>

                {tierPricing.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                        {tierPricing.map((tier, index) => (
                            <div key={index} className="flex gap-4 items-center bg-[#FAF9F7]/50 p-4 rounded-2xl border border-[#0A0A0A]/10 animate-in slide-in-from-left-4 duration-300">
                                <div className="flex-1 space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Desde ({unitLabel})</label>
                                    <input
                                        type="number" min="1" required
                                        className="w-full bg-white border border-[#0A0A0A]/10 rounded-xl px-4 py-2 text-[#0A0A0A] font-bold text-sm outline-none focus:border-[#1E3F20]/20"
                                        value={tier.min_qty || ''}
                                        onChange={(e) => handleUpdateTier(index, 'min_qty', e.target.value)}
                                        placeholder="Ej. 100"
                                    />
                                </div>
                                <div className="flex-1 space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Precio Especial ($)</label>
                                    <input
                                        type="number" min="0.01" step="0.01" required
                                        className="w-full bg-white border border-[#0A0A0A]/10 rounded-xl px-4 py-2 text-[#1E3F20] font-bold text-sm outline-none focus:border-[#1E3F20]/20"
                                        value={tier.price || ''}
                                        onChange={(e) => handleUpdateTier(index, 'price', e.target.value)}
                                        placeholder="Ej. 13.50"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTier(index)}
                                    className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-[#0A0A0A] rounded-xl transition-all mt-5"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-8 text-center bg-[#FAF9F7]/20 border border-dashed border-[#0A0A0A]/10 rounded-3xl">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Sin descuentos por volumen configurados</p>
                    </div>
                )}
            </div>

            {/* Description */}
            <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Especificaciones Logísticas / Comentarios</label>
                <textarea
                    className="w-full bg-[#FAF9F7]/50 border border-[#0A0A0A]/10 rounded-2xl px-6 py-4 text-[#57534E] font-medium outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-700 resize-none"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={profile?.role === 'Proveedor' 
                        ? "Detalla tiempos de entrega, certificaciones de insumos o soporte técnico..." 
                        : "Detalla condiciones de retiro en finca, grado de madurez o certificaciones..."}
                />
            </div>

            {/* Negotiation Toggle */}
            <div 
                className={`p-6 rounded-[2rem] border transition-all cursor-pointer flex items-center gap-4 ${isNegotiable ? 'bg-[#C5A059]/10 border-[#C5A059]/20 shadow-[0_0_30px_rgba(6,182,212,0.1)]' : 'bg-[#FAF9F7]/50 border-[#0A0A0A]/10'}`}
                onClick={() => setIsNegotiable(!isNegotiable)}
            >
                <div className={`w-12 h-6 rounded-full relative transition-colors ${isNegotiable ? 'bg-cyan-500' : 'bg-[#FAF9F7]'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isNegotiable ? 'left-7' : 'left-1'}`}></div>
                </div>
                <div>
                    <h5 className={`text-sm font-black uppercase tracking-tight ${isNegotiable ? 'text-[#C5A059]' : 'text-[#57534E]'}`}>Habilitar Negociación Abierta</h5>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Permite a los compradores proponer contra-ofertas personalizadas</p>
                </div>
            </div>

            {/* Submit */}
            <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-[#1E3F20] hover:bg-emerald-400 disabled:bg-[#FAF9F7] disabled:text-slate-600 text-slate-950 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] transition-all shadow-2xl shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-4"
            >
                {loading ? (
                    <><div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div> PROCESANDO...</>
                ) : (
                    <><CheckCircle2 size={20} /> {profile?.role === 'Proveedor' ? 'PUBLICAR OFERTA INSUMO' : 'PUBLICAR OFERTA B2B'}</>
                )}
            </button>
        </form>
    );
};
