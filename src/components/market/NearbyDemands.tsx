import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { Button } from '../ui/button';
import { MapPin, Users, ArrowRight, Target, X, Sparkles, Package, DollarSign, Navigation, Info } from 'lucide-react';
import { AssociationManager } from './AssociationManager';
import type { ProductCatalog } from '../../types';

interface DemandWithProduct {
    id: string;
    product_id: string;
    quantity_required: number;
    target_price_unit: number;
    location_lat: number;
    location_lng: number;
    description?: string;
    product?: ProductCatalog;
    distance?: number;
}

// Helper para distancia
const calculateDistance = (p1: {lat: number, lng: number}, p2: {lat: number, lng: number}) => {
    const R = 6371; // km
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLon = (p2.lng - p1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

const formatDistance = (km: number) => {
    if (km < 1) return `${(km * 1000).toFixed(0)}m`;
    return `${km.toFixed(1)}km`;
};

export const NearbyDemands = () => {
    const { profile } = useAuth();
    const [demands, setDemands] = useState<DemandWithProduct[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [activeAssociationDemand, setActiveAssociationDemand] = useState<DemandWithProduct | null>(null);

    useEffect(() => {
        if (profile?.location_ref_lat) {
            fetchDemands();
        }
    }, [profile]);

    const fetchDemands = async () => {
        setLoading(true);
        try {
            const { data: myProductsData } = await supabase
                .from('marketplace_listings')
                .select('product_id')
                .eq('producer_id', profile?.id);
            
            const myProductIds = Array.from(new Set((myProductsData || []).map(p => p.product_id)));

            let query = supabase
                .from('buyer_demands')
                .select('*, product:product_id(*)')
                .eq('status', 'Active');
            
            if (myProductIds.length > 0) {
                query = query.in('product_id', myProductIds);
            }

            const { data, error } = await query;

            if (error) throw error;

            if (data && profile?.location_ref_lat) {
                const producerLoc = { lat: profile.location_ref_lat, lng: profile.location_ref_lng! };
                const processed = (data as any[]).map(d => ({
                    ...d,
                    distance: calculateDistance(producerLoc, { lat: d.location_lat, lng: d.location_lng })
                }))
                .sort((a, b) => a.distance! - b.distance!);

                setDemands(processed);
            }
        } catch (err: any) {
            console.error('Error fetching demands:', err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="space-y-4">
            {[1, 2].map(i => (
                <div key={i} className="h-48 bg-white/5 animate-pulse rounded-[2rem] border border-[#0A0A0A]/10"></div>
            ))}
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20">
                        <Target size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-[#0A0A0A] uppercase tracking-tight leading-none">Oportunidades de Venta</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Smart Demand Matching</p>
                    </div>
                </div>
            </div>

            {demands.length === 0 ? (
                <div className="py-20 border-2 border-dashed border-[#0A0A0A]/10 rounded-[3rem] text-center bg-white/20">
                    <div className="bg-[#FAF9F7] w-20 h-20 rounded-2xl border border-[#0A0A0A]/10 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                        <Package size={32} className="text-slate-800" />
                    </div>
                    <h3 className="text-xl font-black text-[#0A0A0A] mb-2 tracking-tight">Sin Demandas Masivas</h3>
                    <p className="text-slate-500 max-w-xs mx-auto font-medium text-sm">
                        No hay requerimientos masivos para tus productos registrados por el momento.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {demands.map(demand => (
                        <div key={demand.id} className="glass-card group overflow-hidden transition-all duration-500 hover:border-[#1E3F20]/20">
                            <div className="p-8">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-[#1E3F20]/5 text-[#1E3F20] text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border border-[#1E3F20]/20">
                                                {demand.product?.category}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                                <Navigation size={12} className="text-cyan-500" /> 
                                                <span>A {formatDistance(demand.distance!)} de tu ubicación</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-3xl font-black text-[#0A0A0A] uppercase tracking-tighter leading-none mb-3 group-hover:text-[#1E3F20] transition-colors">
                                                {demand.product?.name}
                                            </h4>
                                            <p className="text-sm text-[#57534E] font-medium leading-relaxed max-w-xl">
                                                {demand.description || 'Este comprador está buscando un lote consolidado de este producto.'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-[#FAF9F7]/50 p-6 rounded-3xl border border-[#0A0A0A]/10 flex flex-col items-center justify-center min-w-[160px] relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-2 opacity-5">
                                            <Package size={48} className="text-[#0A0A0A]" />
                                        </div>
                                        <p className="text-4xl font-black text-[#0A0A0A] leading-none mb-1">{demand.quantity_required.toLocaleString()}</p>
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{demand.product?.unit}S Requeridos</p>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-[#0A0A0A]/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                                                <DollarSign size={10} /> Precio Objetivo
                                            </p>
                                            <p className="font-black text-[#0A0A0A] text-xl">${demand.target_price_unit.toFixed(2)} <span className="text-xs text-slate-500 font-bold">/ {demand.product?.unit}</span></p>
                                        </div>
                                        <div className="w-px h-10 bg-white/5"></div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#C5A059]/10 border border-cyan-500/20 rounded-xl">
                                            <Sparkles size={12} className="text-[#C5A059]" />
                                            <span className="text-[9px] font-black text-[#C5A059] uppercase tracking-widest">Match de Alta Prioridad</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-4 w-full sm:w-auto">
                                        <button 
                                            onClick={() => setActiveAssociationDemand(demand)}
                                            className="flex-1 sm:flex-none px-6 py-3.5 bg-cyan-600/10 hover:bg-cyan-600/20 text-[#C5A059] border border-cyan-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <Users size={16} /> Crear Asociación
                                        </button>
                                        <button 
                                            className="flex-1 sm:flex-none px-8 py-3.5 bg-[#1E3F20] hover:bg-emerald-400 text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            Ofertar Lote <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Association Manager Modal - Premium UI */}
            {activeAssociationDemand && (
                <AssociationManager 
                    demandId={activeAssociationDemand.id}
                    productName={activeAssociationDemand.product?.name || ''}
                    onClose={() => setActiveAssociationDemand(null)}
                />
            )}
        </div>
    );
};
