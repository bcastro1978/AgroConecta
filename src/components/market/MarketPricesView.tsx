import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { fetchRealMarketPrices, type SipaProductPrice } from '../../lib/sipaPricesService';
import { 
    TrendingUp, BarChart3, Clock, ExternalLink, ArrowUpRight, ArrowDownRight, 
    Minus, Building2, FileText, Search, X, Layers, Sprout, ShoppingBag, Globe, ShieldCheck, AlertCircle 
} from 'lucide-react';

export const MarketPricesView = () => {
    const { profile } = useAuth();
    const [prices, setPrices] = useState<SipaProductPrice[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState<'todos' | 'mayorista' | 'productor' | 'insumos' | 'internacional'>('todos');
    const [selectedMarket, setSelectedMarket] = useState<string>('Todos');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showDashboardModal, setShowDashboardModal] = useState<boolean>(false);

    const isProducerRole = profile?.role !== 'Proveedor';

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                // Filtrar estrictamente productos de cosecha agrícola para el perfil Productor
                const realData = await fetchRealMarketPrices(selectedType, selectedMarket, searchQuery, isProducerRole);
                setPrices(realData);
            } catch (err) {
                console.error('Error cargando precios reales:', err);
                setPrices([]);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [selectedType, selectedMarket, searchQuery, isProducerRole]);

    // Pestañas dinámicas según perfil
    const availableTabs = [
        { id: 'todos', label: 'Todos', icon: Layers },
        { id: 'mayorista', label: 'Mayorista', icon: ShoppingBag },
        { id: 'productor', label: 'Finca/Sitio', icon: Sprout },
        ...(isProducerRole ? [] : [{ id: 'insumos', label: 'Insumos', icon: Building2 }]),
        { id: 'internacional', label: 'Bolsas', icon: Globe },
    ];

    return (
        <div className="glass-card p-6 relative overflow-hidden group border border-[#1E3F20]/20 shadow-xl bg-white/95 rounded-[2.5rem]">
            {/* Background Accent */}
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#1E3F20]/10 blur-3xl rounded-full"></div>

            <div className="relative z-10 space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#0A0A0A]/5">
                    <div>
                        <div className="flex items-center gap-2">
                            <TrendingUp size={18} className="text-[#1E3F20]" />
                            <h3 className="text-sm font-black text-[#0A0A0A] uppercase tracking-[0.15em]">
                                MARKET INDEX & SIPA MAG
                            </h3>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                            <ShieldCheck size={12} className="text-[#1E3F20]" />
                            {isProducerRole ? 'Precios de Cosechas Agrícolas — MAG Ecuador' : 'Información Real — Ministerio de Agricultura y Ganadería'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowDashboardModal(true)}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1E3F20] text-white text-[10px] font-black uppercase rounded-xl hover:bg-[#1E3F20]/90 transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                            <BarChart3 size={14} className="text-white" /> Tablero MAG
                        </button>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1E3F20]/10 border border-[#1E3F20]/20 rounded-full shadow-sm shrink-0">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-[9px] font-black text-[#1E3F20] uppercase tracking-widest">LIVE MAG</span>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs by Price Type */}
                <div className={`grid gap-1 bg-[#FAF9F7] p-1 rounded-2xl border border-[#0A0A0A]/5 ${isProducerRole ? 'grid-cols-4' : 'grid-cols-5'}`}>
                    {availableTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedType(tab.id as any)}
                            className={`flex items-center justify-center gap-1 py-1.5 px-2 text-[10px] font-black rounded-xl transition-all duration-200 uppercase tracking-tight cursor-pointer ${
                                selectedType === tab.id
                                    ? 'bg-[#1E3F20] text-white shadow-md scale-100'
                                    : 'text-slate-600 hover:text-[#0A0A0A] hover:bg-white/60'
                            }`}
                        >
                            <tab.icon size={11} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Search Bar - Positioned ON TOP of location options */}
                <div className="space-y-2">
                    <div className="relative w-full">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder={isProducerRole ? "Buscar cosecha (ej. Cacao, Arroz, Papa, Maíz)..." : "Buscar producto en base de datos real..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 text-xs bg-[#FAF9F7] border border-[#0A0A0A]/10 rounded-xl focus:outline-none focus:border-[#1E3F20] text-slate-900 font-bold placeholder:text-slate-400"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Market Location Options - Positioned BELOW the search bar */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {['Todos', 'Quito', 'Guayaquil', 'Cuenca', 'Ambato', 'Los Ríos', 'Carchi'].map((mkt) => (
                            <button
                                key={mkt}
                                onClick={() => setSelectedMarket(mkt)}
                                className={`px-3 py-1.5 text-[9px] font-black rounded-lg transition-all duration-200 uppercase tracking-tight whitespace-nowrap cursor-pointer ${
                                    selectedMarket === mkt
                                        ? 'bg-[#1E3F20] text-white shadow-sm border border-[#1E3F20]'
                                        : 'bg-[#FAF9F7] text-slate-600 hover:bg-[#1E3F20]/10 border border-[#0A0A0A]/5'
                                }`}
                            >
                                {mkt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Prices List */}
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-2xl border border-[#0A0A0A]/5"></div>
                        ))
                    ) : prices.length === 0 ? (
                        <div className="py-10 px-6 text-center bg-[#FAF9F7] rounded-3xl border border-dashed border-[#0A0A0A]/10 space-y-3">
                            <AlertCircle size={28} className="text-slate-400 mx-auto" />
                            <div>
                                <p className="text-slate-800 text-xs font-black uppercase tracking-wider">Sin productos agrícolas registrados</p>
                                <p className="text-slate-500 text-[11px] font-medium max-w-sm mx-auto mt-1">
                                    No hay cosechas registradas en la base de datos para este filtro. Puedes abrir el Tablero Oficial MAG en vivo.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDashboardModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3F20] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#1E3F20]/90 transition-all shadow-md"
                            >
                                <BarChart3 size={14} /> Abrir Tablero Oficial MAG SIPA
                            </button>
                        </div>
                    ) : (
                        prices.map((item) => (
                            <div
                                key={item.id}
                                className="flex justify-between items-center p-3 bg-[#FAF9F7]/90 hover:bg-white border border-[#0A0A0A]/10 hover:border-[#1E3F20]/30 rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md group/item"
                            >
                                <div className="min-w-0 pr-2">
                                    <div className="flex items-center gap-1.5">
                                        <p className="font-black text-[#0A0A0A] text-xs uppercase truncate group-hover/item:text-[#1E3F20] transition-colors">
                                            {item.product_name}
                                        </p>
                                        {item.sipa_pdf_url && (
                                            <a
                                                href={item.sipa_pdf_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title="Ver Reporte PDF Oficial SIPA MAG"
                                                className="text-slate-400 hover:text-[#1E3F20] transition-colors shrink-0"
                                            >
                                                <FileText size={12} />
                                            </a>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] uppercase tracking-tight text-slate-500 font-bold flex items-center gap-1">
                                            <Building2 size={10} className="text-slate-400" />
                                            {item.market_name}
                                        </span>
                                        <span className="text-[8px] bg-emerald-100 text-emerald-900 font-black px-1.5 py-0.5 rounded uppercase">
                                            {item.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <div className="flex items-center justify-end gap-1.5">
                                        {item.trend === 'up' && (
                                            <span className="flex items-center text-emerald-600 bg-emerald-50 px-1 rounded text-[10px] font-bold" title="Tendencia al alza">
                                                <ArrowUpRight size={12} />
                                            </span>
                                        )}
                                        {item.trend === 'down' && (
                                            <span className="flex items-center text-rose-600 bg-rose-50 px-1 rounded text-[10px] font-bold" title="Tendencia a la baja">
                                                <ArrowDownRight size={12} />
                                            </span>
                                        )}
                                        {item.trend === 'stable' && (
                                            <span className="flex items-center text-slate-400 bg-slate-100 px-1 rounded text-[10px] font-bold" title="Precio estable">
                                                <Minus size={12} />
                                            </span>
                                        )}
                                        <span className="text-[#1E3F20] font-black text-sm">
                                            ${item.price.toFixed(2)}
                                        </span>
                                    </div>
                                    <p className="text-[9px] text-slate-500 font-bold mt-0.5">
                                        /{item.unit}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Link & Disclaimer */}
                <div className="pt-3 border-t border-[#0A0A0A]/10 space-y-2">
                    <a
                        href="https://sipa.agricultura.gob.ec/index.php/precios-referenciales"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between text-[10px] font-black text-[#1E3F20] hover:text-[#0A0A0A] bg-[#1E3F20]/5 hover:bg-[#1E3F20]/15 p-2.5 rounded-xl border border-[#1E3F20]/20 transition-all uppercase tracking-wider"
                    >
                        <span className="flex items-center gap-1.5">
                            <Clock size={12} /> Portal Oficial: SIPA Ecuador (MAG)
                        </span>
                        <ExternalLink size={12} />
                    </a>
                </div>
            </div>

            {/* Modal de Tablero Interactivo MAG / SIPA */}
            {showDashboardModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between px-6 py-4 bg-[#1E3F20] text-white">
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-white">
                                    <BarChart3 size={16} className="text-white" /> Tablero Oficial de Precios a Productor MAG - SIPA
                                </h4>
                                <p className="text-[10px] font-bold text-slate-200 uppercase">Sistema de Información Pública Agropecuaria del Ecuador</p>
                            </div>
                            <button
                                onClick={() => setShowDashboardModal(false)}
                                className="p-1 rounded-full hover:bg-white/10 text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 w-full bg-slate-50 relative">
                            <iframe
                                src="https://servicios.mag.gob.ec/tableros/P_P/TBL_PP"
                                title="Tablero de Precios a Productor MAG SIPA"
                                className="w-full h-full border-0"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
