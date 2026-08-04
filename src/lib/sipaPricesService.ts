import { supabase } from './supabase';

export interface SipaProductPrice {
    id: string;
    product_name: string;
    type: 'mayorista' | 'productor' | 'insumos' | 'internacional';
    category: string;
    market_name: string;
    price: number;
    unit: string;
    previous_price?: number;
    trend: 'up' | 'down' | 'stable';
    date: string;
    location?: string;
    sipa_pdf_url?: string;
}

export const isProducerCategory = (cat: string = '') => {
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

/**
 * Servicio de Precios AgroConecta - Conexión estricta a datos reales de Supabase y MAG SIPA.
 */
export const fetchRealMarketPrices = async (
    typeFilter: 'todos' | 'mayorista' | 'productor' | 'insumos' | 'internacional' = 'todos',
    marketFilter: string = 'Todos',
    searchQuery: string = '',
    onlyProducerHarvestProducts: boolean = true
): Promise<SipaProductPrice[]> => {
    try {
        let query = supabase
            .from('market_prices')
            .select(`
                id,
                price,
                market_name,
                date,
                products_catalog ( id, name, unit, category )
            `)
            .order('date', { ascending: false });

        if (marketFilter !== 'Todos') {
            query = query.ilike('market_name', `%${marketFilter}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error al consultar precios reales en Supabase:', error);
            return [];
        }

        if (!data || data.length === 0) {
            return [];
        }

        let mapped: SipaProductPrice[] = data.map((item: any) => ({
            id: item.id,
            product_name: item.products_catalog?.name || 'Producto Agrícola',
            type: (item.market_name || '').toLowerCase().includes('finca') ? 'productor' : 'mayorista',
            category: item.products_catalog?.category || 'General',
            market_name: item.market_name || 'Mercado Nacional',
            price: Number(item.price),
            unit: item.products_catalog?.unit || 'Unidad',
            date: item.date || new Date().toISOString().split('T')[0],
            trend: 'stable'
        }));

        // Filtrar estrictamente productos de cosecha agrícola para el perfil Productor
        if (onlyProducerHarvestProducts) {
            mapped = mapped.filter(item => isProducerCategory(item.category));
        }

        if (typeFilter !== 'todos') {
            mapped = mapped.filter(p => p.type === typeFilter);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            mapped = mapped.filter(p => 
                p.product_name.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q) ||
                p.market_name.toLowerCase().includes(q)
            );
        }

        return mapped;
    } catch (err) {
        console.error('Error procesando consulta de precios reales:', err);
        return [];
    }
};
