import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { TrendingUp, BarChart3, Clock, AlertCircle } from 'lucide-react';

interface MarketPriceJoin {
    id: string;
    price: number;
    market_name: string;
    date: string;
    products_catalog: {
        name: string;
        unit: string;
    } | null;
}

export const MarketPricesView = () => {
    const [prices, setPrices] = useState<MarketPriceJoin[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('market_prices')
                .select(`
                    id,
                    price,
                    market_name,
                    date,
                    products_catalog ( name, unit )
                `)
                .order('date', { ascending: false })
                .limit(8);

            if (data) setPrices(data as any[]);
            setLoading(false);
        };
        load();
    }, []);

    return (
        <div className="glass-card p-6 h-full relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#1E3F20]/5 blur-3xl rounded-full"></div>
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black text-[#0A0A0A] uppercase tracking-[0.2em] flex items-center gap-2">
                        <TrendingUp size={16} className="text-[#1E3F20]" />
                        Market Index
                    </h3>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#1E3F20]/5 border border-[#1E3F20]/20 rounded-lg">
                        <div className="w-1.5 h-1.5 bg-[#1E3F20] rounded-full animate-pulse"></div>
                        <span className="text-[9px] font-black text-[#1E3F20] uppercase tracking-widest">Live</span>
                    </div>
                </div>
                
                <div className="space-y-3">
                    {loading ? (
                        [1, 2, 3, 4].map(i => (
                            <div key={i} className="h-14 bg-white/5 animate-pulse rounded-2xl border border-[#0A0A0A]/10"></div>
                        ))
                    ) : prices.length === 0 ? (
                        <div className="py-10 text-center space-y-3 bg-[#FAF9F7]/50 rounded-2xl border border-dashed border-[#0A0A0A]/10">
                            <AlertCircle size={24} className="text-slate-700 mx-auto" />
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">No hay datos hoy</p>
                        </div>
                    ) : (
                        prices.map((item) => (
                            <div key={item.id} className="flex justify-between items-center p-3 bg-white/5 border border-[#0A0A0A]/10 rounded-2xl hover:bg-white/10 hover:border-[#1E3F20]/20 transition-all duration-300 group/item">
                                <div className="min-w-0">
                                    <p className="font-black text-slate-200 text-xs uppercase truncate group-hover/item:text-[#1E3F20] transition-colors">
                                        {item.products_catalog?.name || 'Producto'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] uppercase tracking-tighter text-slate-500 font-bold">
                                            {item.market_name}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-[#1E3F20] font-black text-sm">
                                            ${Number(item.price).toFixed(2)}
                                        </span>
                                        <span className="text-[9px] text-slate-600 font-bold">
                                            /{item.products_catalog?.unit || 'u'}
                                        </span>
                                    </div>
                                    <p className="text-[8px] text-slate-700 font-black uppercase mt-0.5 flex items-center justify-end gap-1">
                                        <Clock size={8} /> {new Date(item.date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                <div className="mt-8 pt-4 border-t border-[#0A0A0A]/10">
                    <div className="flex items-start gap-2 bg-[#FAF9F7]/80 p-3 rounded-xl border border-[#0A0A0A]/10">
                        <BarChart3 size={12} className="text-slate-600 shrink-0 mt-0.5" />
                        <p className="text-[9px] text-slate-500 leading-relaxed font-medium">
                            Precios referenciales de Mercados de Comercialización Popular (MCP). Datos para ajuste de oferta B2B.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
