import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth/AuthProvider';
import { Search, Brain, TrendingUp, Info, Lightbulb, ChevronRight, BarChart3, Globe, Zap, ArrowRight, Target, Sparkles } from 'lucide-react';

export const CropDiscovery = () => {
    const { user } = useAuth();
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchRecommendations();
    }, [user]);

    const fetchRecommendations = async () => {
        setLoading(true);
        try {
            const { data } = await supabase
                .from('crop_recommendations')
                .select(`
                    *,
                    parcels (
                        active_crop
                    )
                `)
                .order('created_at', { ascending: false });
            
            setRecommendations(data || []);
        } catch (error) {
            console.error("Error fetching crop recommendations", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="p-20 text-center flex flex-col items-center gap-6">
            <div className="relative">
                <div className="w-24 h-24 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
                <Brain className="absolute inset-0 m-auto text-[#1E3F20] animate-pulse" size={32} />
            </div>
            <div className="space-y-2">
                <p className="text-[#0A0A0A] font-black text-xl tracking-tight">Procesando Inteligencia Predictiva</p>
                <p className="text-slate-500 font-medium animate-pulse">Analizando ciclos fenológicos históricos con Gemini Flash...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Premium Header Header */}
            <div className="relative overflow-hidden bg-white border border-[#0A0A0A]/10 rounded-[2.5rem] p-10 group shadow-2xl">
                {/* Decorative background effects */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#1E3F20]/5 blur-[120px] rounded-full group-hover:bg-[#1E3F20]/10 transition-colors duration-700"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#C5A059]/10 blur-[100px] rounded-full"></div>
                
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
                    <div className="max-w-2xl text-center lg:text-left">
                        <div className="flex items-center gap-3 mb-6 bg-[#1E3F20]/5 w-fit px-4 py-2 rounded-2xl border border-[#1E3F20]/20 backdrop-blur-xl mx-auto lg:mx-0">
                            <Sparkles size={16} className="text-[#1E3F20]" />
                            <span className="text-[10px] font-black text-[#1E3F20] uppercase tracking-[0.3em]">Discovery Engine v3.0</span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-[#0A0A0A] leading-tight mb-4 tracking-tight">
                            Predicción de <span className="text-[#1E3F20]">Reconversión</span> Agrícola
                        </h2>
                        <p className="text-[#57534E] text-lg font-medium leading-relaxed">
                            Nuestro motor neuronal analiza barridos satelitales multiespectrales para identificar inconsistencias y proponer cultivos de alta rentabilidad.
                        </p>
                    </div>
                    <div className="shrink-0">
                        <div className="bg-[#FAF9F7] p-6 rounded-[2rem] border border-[#0A0A0A]/10 shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent"></div>
                            <Globe size={120} className="text-[#1E3F20]/20 animate-[spin_20s_linear_infinite]" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {recommendations.map((rec) => (
                    <div key={rec.id} className="group glass-card overflow-hidden transition-all duration-500 hover:border-[#1E3F20]/20">
                        <div className="flex flex-col lg:flex-row">
                            
                            {/* Analysis Comparison Panel */}
                            <div className="lg:w-80 bg-[#FAF9F7]/50 p-8 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-[#0A0A0A]/10">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cultivo Declarado</label>
                                        <div className="p-4 bg-white border border-[#0A0A0A]/10 rounded-2xl">
                                            <p className="font-black text-[#57534E] uppercase truncate">{rec.parcels?.active_crop}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-center">
                                        <div className="bg-[#1E3F20]/5 p-2 rounded-full border border-[#1E3F20]/20 animate-pulse">
                                            <ChevronRight className="rotate-90 lg:rotate-0 text-[#1E3F20]" size={24} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#1E3F20] uppercase tracking-widest ml-1">Detección IA (Gemini)</label>
                                        <div className="p-5 bg-[#1E3F20] text-slate-950 rounded-2xl shadow-xl shadow-emerald-500/10 border border-emerald-400">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[9px] font-black uppercase tracking-tighter">Confianza</span>
                                                <span className="text-[9px] font-black italic">{(rec.confidence_score * 100).toFixed(0)}%</span>
                                            </div>
                                            <p className="font-black text-xl uppercase leading-none tracking-tight">{rec.detected_crop}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Insight & Opportunity Panel */}
                            <div className="flex-1 p-10">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-[#1E3F20]/10 p-3 rounded-2xl text-[#1E3F20] border border-[#1E3F20]/20">
                                            <Lightbulb className="animate-pulse" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-[#0A0A0A] tracking-tight">Oportunidad Estratégica</h3>
                                            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Sugerencia basada en Microclima</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="bg-white/90 px-6 py-3 rounded-2xl border border-[#0A0A0A]/10 text-center min-w-[120px]">
                                            <div className="text-[10px] font-black text-[#1E3F20] uppercase tracking-widest mb-1">Plus Rentabilidad</div>
                                            <div className="text-xl font-black text-[#0A0A0A]">+{rec.estimated_yield_increase}%</div>
                                        </div>
                                        <div className="bg-white/90 px-6 py-3 rounded-2xl border border-[#0A0A0A]/10 text-center min-w-[120px]">
                                            <div className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest mb-1">Indice Aptitud</div>
                                            <div className="text-xl font-black text-[#0A0A0A]">{rec.suitability_index}/100</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Target className="text-[#1E3F20]" size={20} />
                                        <h4 className="text-3xl font-black text-[#0A0A0A] uppercase tracking-tight">{rec.suggested_crop}</h4>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1E3F20]/30 rounded-full"></div>
                                        <p className="pl-6 text-lg text-[#57534E] font-medium leading-relaxed italic">
                                            "{rec.reasoning}"
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-[#0A0A0A]/10">
                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500 bg-[#FAF9F7]/50 px-4 py-2 rounded-xl border border-[#0A0A0A]/10">
                                        <BarChart3 size={16} className="text-[#1E3F20]" /> 
                                        <span>Procesamiento de {(rec.analysis_data?.length || 0)} series temporales CDSE</span>
                                    </div>
                                    <button className="flex items-center gap-3 bg-[#1E3F20] hover:bg-[#1E3F20] text-[#FAF9F7] px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-[#0A0A0A]/10 active:scale-95">
                                        Ejecutar Plan Proyectado <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                ))}

                {recommendations.length === 0 && (
                    <div className="py-24 border-2 border-dashed border-[#0A0A0A]/10 rounded-[3rem] text-center bg-white/20">
                        <div className="bg-[#FAF9F7] w-24 h-24 rounded-[2rem] border border-[#0A0A0A]/10 flex items-center justify-center mx-auto mb-8 shadow-2xl">
                            <Search size={40} className="text-slate-800" />
                        </div>
                        <h3 className="text-2xl font-black text-[#0A0A0A] mb-2 tracking-tight">Discovery IA está analizando tus parcelas</h3>
                        <p className="text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
                            Estamos recolectando datos históricos de Sentinel-2. Necesitamos 3 ciclos de sobrevuelo para generar tu primera recomendación de reconversión.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
