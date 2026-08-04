import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
    BarChart3, Globe, MapPin, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, 
    Layers, ShieldCheck, Scale, Award, Info, RefreshCw, ExternalLink, Activity
} from 'lucide-react';

interface PriceRecord {
    id: string;
    price: number;
    market_name: string;
    date: string;
    product: {
        id: string;
        name: string;
        category: string;
        unit: string;
    };
}

export const NationalMarketAnalytics = () => {
    const [records, setRecords] = useState<PriceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCrop, setSelectedCrop] = useState<string>('cacao');
    const [showTableauModal, setShowTableauModal] = useState<boolean>(false);

    useEffect(() => {
        fetchNationalPrices();
    }, []);

    const fetchNationalPrices = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('market_prices')
                .select(`
                    id,
                    price,
                    market_name,
                    date,
                    product:products_catalog ( id, name, category, unit )
                `)
                .order('price', { ascending: false });

            if (!error && data) {
                setRecords(data as any[]);
            }
        } catch (err) {
            console.error('Error al obtener análisis nacional de precios:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filtrar registros por cultivo seleccionado
    const filteredRecords = records.filter(r => 
        r.product?.name.toLowerCase().includes(selectedCrop.toLowerCase())
    );

    // Registros en finca / productor
    const producerRecords = filteredRecords.filter(r => 
        r.market_name.toLowerCase().includes('finca') || r.market_name.toLowerCase().includes('productor')
    );

    // Registros mayoristas
    const wholesaleRecords = filteredRecords.filter(r => 
        r.market_name.toLowerCase().includes('mayorista')
    );

    // Métricas Estadísticas Nacionales
    const pricesList = (producerRecords.length > 0 ? producerRecords : filteredRecords).map(r => Number(r.price));
    const avgPrice = pricesList.length > 0 ? (pricesList.reduce((a, b) => a + b, 0) / pricesList.length) : 0;
    const maxPriceRecord = (producerRecords.length > 0 ? producerRecords : filteredRecords)[0];
    const minPriceRecord = (producerRecords.length > 0 ? producerRecords : filteredRecords)[pricesList.length - 1];

    const wholesaleAvg = wholesaleRecords.length > 0
        ? wholesaleRecords.reduce((a, b) => a + Number(b.price), 0) / wholesaleRecords.length
        : 0;

    const marginDiff = wholesaleAvg > 0 && avgPrice > 0 ? (wholesaleAvg - avgPrice) : 0;
    const marginPercent = avgPrice > 0 ? ((marginDiff / avgPrice) * 100) : 0;

    const availableCrops = [
        { id: 'cacao', label: 'Cacao Fino / CCN-51', icon: '🍫' },
        { id: 'arroz', label: 'Arroz Paddy', icon: '🌾' },
        { id: 'papa', label: 'Papa Chola', icon: '🥔' },
        { id: 'maíz', label: 'Maíz Duro Amarillo', icon: '🌽' },
        { id: 'plátano', label: 'Plátano Barraganete', icon: '🍌' },
        { id: 'café', label: 'Café de Finca', icon: '☕' },
        { id: 'leche', label: 'Leche Cruda', icon: '🥛' }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header del Dashboard Analítico Nacional */}
            <div className="glass-card p-8 lg:p-10 rounded-[2.5rem] border border-[#1E3F20]/20 bg-white/95 shadow-xl relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="p-2 bg-[#1E3F20]/10 text-[#1E3F20] rounded-xl border border-[#1E3F20]/20">
                                <Globe size={20} />
                            </span>
                            <span className="text-xs font-black text-[#1E3F20] uppercase tracking-[0.2em]">
                                Monitoreo Nacional MAG Ecuador
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-[#0A0A0A] tracking-tight uppercase leading-tight">
                            Análisis Agroproductivo de Mercado por Provincia
                        </h2>
                        <p className="text-xs text-slate-500 font-bold max-w-2xl leading-relaxed">
                            Estructura de precios a productor (Pie de Finca) y mercados mayoristas sincronizada directamente desde el Sistema de Información Pública Agropecuaria (MAG SIPA - Tablero TBL_PP).
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            onClick={fetchNationalPrices}
                            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all border border-slate-200"
                            title="Refrescar Datos"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={() => setShowTableauModal(true)}
                            className="flex items-center gap-2 px-5 py-3.5 bg-[#1E3F20] hover:bg-[#1E3F20]/90 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg active:scale-95 cursor-pointer"
                        >
                            <BarChart3 size={16} className="text-white" /> Visualizar Tablero MAG (Tableau)
                        </button>
                    </div>
                </div>
            </div>

            {/* Selector de Cultivo Nacional */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {availableCrops.map(crop => (
                    <button
                        key={crop.id}
                        onClick={() => setSelectedCrop(crop.id)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                            selectedCrop === crop.id
                                ? 'bg-[#1E3F20] text-white shadow-lg scale-100 ring-2 ring-[#1E3F20]/30'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm'
                        }`}
                    >
                        <span>{crop.icon}</span>
                        <span>{crop.label}</span>
                    </button>
                ))}
            </div>

            {/* Tarjetas KPI de Resumen Nacional */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* KPI 1: Promedio Nacional */}
                <div className="glass-card p-6 rounded-3xl border border-slate-200 bg-white/90 shadow-md space-y-2">
                    <div className="flex justify-between items-center text-slate-500">
                        <span className="text-[10px] font-black uppercase tracking-wider">Precio Promedio Finca</span>
                        <Scale size={18} className="text-[#1E3F20]" />
                    </div>
                    <div className="text-3xl font-black text-[#1E3F20]">
                        ${avgPrice > 0 ? avgPrice.toFixed(2) : '0.00'}
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">
                        Unidad: {filteredRecords[0]?.product?.unit || 'Quintal'}
                    </p>
                </div>

                {/* KPI 2: Máximo Provincial */}
                <div className="glass-card p-6 rounded-3xl border border-emerald-200 bg-emerald-50/50 shadow-md space-y-2">
                    <div className="flex justify-between items-center text-emerald-800">
                        <span className="text-[10px] font-black uppercase tracking-wider">Máxima Cotización Finca</span>
                        <TrendingUp size={18} className="text-emerald-600" />
                    </div>
                    <div className="text-3xl font-black text-emerald-900">
                        ${maxPriceRecord ? Number(maxPriceRecord.price).toFixed(2) : '0.00'}
                    </div>
                    <p className="text-[10px] text-emerald-700 font-black uppercase truncate">
                        {maxPriceRecord ? maxPriceRecord.market_name : 'N/A'}
                    </p>
                </div>

                {/* KPI 3: Mínimo Provincial */}
                <div className="glass-card p-6 rounded-3xl border border-amber-200 bg-amber-50/50 shadow-md space-y-2">
                    <div className="flex justify-between items-center text-amber-800">
                        <span className="text-[10px] font-black uppercase tracking-wider">Mínima Cotización Finca</span>
                        <TrendingDown size={18} className="text-amber-600" />
                    </div>
                    <div className="text-3xl font-black text-amber-900">
                        ${minPriceRecord ? Number(minPriceRecord.price).toFixed(2) : '0.00'}
                    </div>
                    <p className="text-[10px] text-amber-700 font-black uppercase truncate">
                        {minPriceRecord ? minPriceRecord.market_name : 'N/A'}
                    </p>
                </div>

                {/* KPI 4: Margen Intermediación */}
                <div className="glass-card p-6 rounded-3xl border border-sky-200 bg-sky-50/50 shadow-md space-y-2">
                    <div className="flex justify-between items-center text-sky-800">
                        <span className="text-[10px] font-black uppercase tracking-wider">Margen Mayorista vs Finca</span>
                        <Activity size={18} className="text-sky-600" />
                    </div>
                    <div className="text-3xl font-black text-sky-900">
                        +{marginPercent > 0 ? marginPercent.toFixed(1) : '0'}%
                    </div>
                    <p className="text-[10px] text-sky-700 font-bold uppercase">
                        Brecha: +${marginDiff.toFixed(2)} / unidad
                    </p>
                </div>
            </div>

            {/* Matriz Comparativa Provincial y Desglose de Datos */}
            <div className="glass-card p-8 lg:p-10 rounded-[2.5rem] border border-[#0A0A0A]/10 bg-white/95 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#0A0A0A]/10">
                    <div>
                        <h3 className="text-xl font-black text-[#0A0A0A] uppercase tracking-tight flex items-center gap-2">
                            <MapPin size={20} className="text-[#1E3F20]" />
                            Desglose de Cotizaciones por Provincia / Punto de Finca
                        </h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                            Datos del Ministerio de Agricultura y Ganadería (MAG SIPA)
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-black text-[#1E3F20] bg-[#1E3F20]/10 px-3 py-1.5 rounded-xl uppercase">
                        <ShieldCheck size={14} /> {filteredRecords.length} Provincias / Puntos Registrados
                    </div>
                </div>

                {loading ? (
                    <div className="py-12 text-center space-y-3">
                        <div className="w-8 h-8 border-4 border-[#1E3F20]/20 border-t-[#1E3F20] rounded-full animate-spin mx-auto"></div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Cargando desglose nacional...</p>
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="py-12 text-center bg-[#FAF9F7] rounded-3xl border border-dashed border-[#0A0A0A]/10">
                        <p className="text-xs text-slate-500 font-black uppercase tracking-wider">No se encontraron registros para este cultivo en la base de datos nacional</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredRecords.map((item, idx) => {
                            const isProducer = item.market_name.toLowerCase().includes('finca') || item.market_name.toLowerCase().includes('productor');
                            const priceVal = Number(item.price);
                            const percentOfMax = maxPriceRecord ? (priceVal / Number(maxPriceRecord.price)) * 100 : 100;

                            return (
                                <div key={item.id} className="p-5 rounded-2xl bg-[#FAF9F7] hover:bg-white border border-[#0A0A0A]/10 hover:border-[#1E3F20]/30 transition-all shadow-sm space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs font-black text-slate-400">#{idx + 1}</span>
                                                <h4 className="font-black text-[#0A0A0A] text-sm uppercase">
                                                    {item.market_name}
                                                </h4>
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${
                                                    isProducer ? 'bg-emerald-100 text-emerald-900' : 'bg-sky-100 text-sky-900'
                                                }`}>
                                                    {isProducer ? 'Pie de Finca' : 'Mercado Mayorista'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">
                                                Cultivo: {item.product?.name} ({item.product?.unit})
                                            </p>
                                        </div>

                                        <div className="text-left sm:text-right shrink-0">
                                            <div className="text-xl font-black text-[#1E3F20]">
                                                ${priceVal.toFixed(2)}
                                            </div>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase">
                                                Registrado: {new Date(item.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Visual Competitiveness Bar */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase">
                                            <span>Nivel de Cotización vs Máximo Nacional</span>
                                            <span>{percentOfMax.toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    percentOfMax >= 90 ? 'bg-emerald-600' : percentOfMax >= 75 ? 'bg-amber-500' : 'bg-slate-400'
                                                }`} 
                                                style={{ width: `${percentOfMax}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal de Tablero Oficial Tableau MAG */}
            {showTableauModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-6xl h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between px-6 py-4 bg-[#1E3F20] text-white">
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-white">
                                    <BarChart3 size={18} className="text-white" /> Tablero Oficial de Precios a Productor MAG - SIPA (Tableau TBL_PP)
                                </h4>
                                <p className="text-[10px] font-bold text-slate-200 uppercase">
                                    Plataforma de Inteligencia Agropecuaria del Ministerio de Agricultura y Ganadería del Ecuador
                                </p>
                            </div>
                            <button
                                onClick={() => setShowTableauModal(false)}
                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black uppercase transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                        <div className="flex-1 w-full bg-slate-100 relative">
                            <iframe
                                src="https://servicios.mag.gob.ec/tableros/P_P/TBL_PP"
                                title="Tablero Oficial MAG TBL_PP"
                                className="w-full h-full border-0"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
