import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import { ClipboardList, Plus, AlertCircle, MapPin } from 'lucide-react';
import type { ProductCatalog } from '../../types';

export const DemandForm = ({ onDemandCreated }: { onDemandCreated?: () => void }) => {
    const [products, setProducts] = useState<ProductCatalog[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        product_id: '',
        quantity: '',
        target_price: '',
        description: ''
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        const { data } = await supabase.from('products_catalog').select('*');
        if (data) setProducts(data as ProductCatalog[]);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No hay sesión activa");

            // Obtener ubicación del perfil para la demanda
            const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();

            const { error } = await supabase.from('buyer_demands').insert([{
                buyer_id: user.id,
                product_id: formData.product_id,
                quantity_required: parseInt(formData.quantity),
                target_price_unit: parseFloat(formData.target_price),
                description: formData.description,
                location_lat: profile?.location_ref_lat || 0,
                location_lng: profile?.location_ref_lng || 0,
                status: 'Active'
            }]);

            if (error) throw error;

            setFormData({ product_id: '', quantity: '', target_price: '', description: '' });
            if (onDemandCreated) onDemandCreated();
            alert("Demanda publicada exitosamente. El sistema buscará asociaciones automáticamente.");
        } catch (err: any) {
            alert("Error al publicar: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-blue-100 overflow-hidden">
            <div className="bg-blue-600 px-6 py-4 flex items-center gap-3">
                <ClipboardList className="text-[#0A0A0A] w-6 h-6" />
                <h3 className="text-[#0A0A0A] font-bold text-lg">Publicar Nuevo Requerimiento Masivo (Demanda)</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg flex gap-3 items-start border border-blue-100">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                    <p className="text-xs text-blue-800">
                        Si el volumen solicitado supera a un solo productor, AgroConecta generará automáticamente 
                        una <b>Asociación de Productores Cercanos</b> para cubrir tu demanda.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">¿Qué producto necesitas?</label>
                        <select
                            required
                            className="w-full p-2 border rounded-md"
                            value={formData.product_id}
                            onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                            disabled={loading}
                        >
                            <option value="">Selecciona un producto...</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Cantidad Total Requerida</label>
                        <div className="relative">
                            <input
                                type="number" required min="1"
                                className="w-full p-2 border rounded-md"
                                value={formData.quantity}
                                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                {products.find(p => p.id === formData.product_id)?.unit || ''}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Precio de Referencia ($ por unidad)</label>
                        <input
                            type="number" required step="0.01" min="0.01"
                            className="w-full p-2 border rounded-md"
                            placeholder="Ej. 15.50"
                            value={formData.target_price}
                            onChange={(e) => setFormData({...formData, target_price: e.target.value})}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Punto de Entrega</label>
                        <div className="flex gap-2 items-center p-2 bg-gray-50 border rounded-md text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            Usar mi ubicación registrada
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Detalles Adicionales</label>
                    <textarea
                        className="w-full p-2 border rounded-md" rows={2}
                        placeholder="Requerimientos de calidad, tiempos de entrega, etc."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                </div>

                <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 h-12" disabled={submitting}>
                    {submitting ? 'Publicando...' : (
                        <span className="flex items-center gap-2">
                            <Plus className="w-5 h-5" /> Publicar Demanda Masiva
                        </span>
                    )}
                </Button>
            </form>
        </div>
    );
};
