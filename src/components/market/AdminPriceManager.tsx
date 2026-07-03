import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';

interface MarketPrice {
    id: string;
    market_name: string;
    product_id: string;
    price: number;
    date: string;
    source_type: 'External_Manual';
    products_catalog?: {
        name: string;
        unit: string;
    };
}

interface ProductCatalogEntry {
    id: string;
    name: string;
    unit: string;
}

export const AdminPriceManager = () => {
    const [prices, setPrices] = useState<MarketPrice[]>([]);
    const [catalog, setCatalog] = useState<ProductCatalogEntry[]>([]);
    const [loading, setLoading] = useState(false);

    // Form state
    const [marketName, setMarketName] = useState('Mayorista Tulcán');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [price, setPrice] = useState('');

    const fetchCatalog = async () => {
        const { data } = await supabase.from('products_catalog').select('id, name, unit').order('name');
        if (data) setCatalog(data as ProductCatalogEntry[]);
    };

    const fetchPrices = async () => {
        const { data } = await supabase
            .from('market_prices')
            .select(`
                *,
                products_catalog ( name, unit )
            `)
            .order('date', { ascending: false })
            .limit(20);

        if (data) setPrices(data as any);
    };

    useEffect(() => {
        fetchCatalog();
        fetchPrices();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductId) {
            alert('Por favor selecciona un producto.');
            return;
        }

        setLoading(true);

        const { error } = await supabase.from('market_prices').insert({
            market_name: marketName,
            product_id: selectedProductId,
            price: parseFloat(price),
            source_type: 'External_Manual',
            date: new Date().toISOString().split('T')[0]
        });

        if (error) alert(error.message);
        else {
            setPrice('');
            fetchPrices();
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-xl shadow p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4 text-green-800 flex items-center gap-2">
                Gestionar Precios de Referencia (MCP)
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end mb-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mercado</label>
                    <select
                        className="w-full border rounded-md p-2 bg-white"
                        value={marketName}
                        onChange={e => setMarketName(e.target.value)}
                    >
                        <option>Mayorista Tulcán</option>
                        <option>Mayorista Ibarra</option>
                        <option>Mercado Mayorista Quito</option>
                        <option>Mercado Central</option>
                    </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Producto (Catálogo)</label>
                    <select
                        className="w-full border rounded-md p-2 bg-white"
                        value={selectedProductId}
                        onChange={e => setSelectedProductId(e.target.value)}
                        required
                    >
                        <option value="">Seleccionar producto...</option>
                        {catalog.map(item => (
                            <option key={item.id} value={item.id}>
                                {item.name} ({item.unit})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
                    <input
                        type="number" step="0.01"
                        className="w-full border rounded-md p-2 bg-white"
                        placeholder="0.00"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        required
                    />
                </div>

                <Button type="submit" disabled={loading} className="whitespace-nowrap">
                    {loading ? 'Guardando...' : 'Registrar Precio'}
                </Button>
            </form>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="text-left p-3 font-semibold text-gray-600">Fecha</th>
                            <th className="text-left p-3 font-semibold text-gray-600">Mercado</th>
                            <th className="text-left p-3 font-semibold text-gray-600">Producto</th>
                            <th className="text-right p-3 font-semibold text-gray-600">Precio Ref.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prices.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-4 text-center text-gray-500 italic">No hay registros recientes.</td>
                            </tr>
                        ) : (
                            prices.map((p) => (
                                <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="p-3 text-gray-500">{new Date(p.date).toLocaleDateString()}</td>
                                    <td className="p-3 font-medium text-gray-700">{p.market_name}</td>
                                    <td className="p-3">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900">{p.products_catalog?.name || 'N/A'}</span>
                                            <span className="text-xs text-gray-400">Unidad: {p.products_catalog?.unit || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-right">
                                        <span className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-full font-bold text-lg">
                                            ${Number(p.price).toFixed(2)}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
