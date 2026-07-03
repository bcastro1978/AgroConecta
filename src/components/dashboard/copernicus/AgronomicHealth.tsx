import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth/AuthProvider';
import { 
    Activity, AlertTriangle, CheckCircle, Droplets, Map, Sprout, Wind, 
    ArrowRight, X, Eye, Sparkles, BrainCircuit, Waves, Target, Clock, Satellite,
    MapPin, FileCheck
} from 'lucide-react';
import { TraceabilityReport } from './TraceabilityReport';

export const AgronomicHealth = ({ onEditParcel = () => {} }: { onEditParcel?: (p: any) => void }) => {
    const { user } = useAuth();
    const [groupedData, setGroupedData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedParcel, setSelectedParcel] = useState<any>(null);
    const [selectedParcelHistory, setSelectedParcelHistory] = useState<any>(null);
    const [reportParcel, setReportParcel] = useState<any>(null);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: parcels } = await supabase.from('parcels').select('id, active_crop, geometry').eq('producer_id', user!.id);
            if (!parcels || parcels.length === 0) return;
            
            const parcelIds = parcels.map(p => p.id);

            // OPTIMIZACIÓN: No traemos las imágenes Base64 pesadas en el listado inicial
            const { data: telemetryData } = await supabase
                .from('sat_telemetry')
                .select('id, parcel_id, timestamp, mission, ndvi_avg, ndmi_avg, bsi_avg, vv_avg, vh_avg, cloud_cover')
                .in('parcel_id', parcelIds)
                .order('timestamp', { ascending: false });
            
            const { data: alertsData } = await supabase
                .from('alerts_events')
                .select('*')
                .in('parcel_id', parcelIds)
                .order('notification_date', { ascending: false });

            // Agrupar por parcelas
            const parsedData = parcels.map(p => {
                const pTelList = telemetryData?.filter(t => t.parcel_id === p.id) || [];
                const pAlerts = alertsData?.filter(a => a.parcel_id === p.id) || [];
                return {
                    parcel: p,
                    latest_telemetry: pTelList[0] || null,
                    latest_alert: pAlerts[0] || null,
                    all_telemetry: pTelList,
                    all_alerts: pAlerts
                };
            });

            setGroupedData(parsedData);
        } catch (error) {
            console.error("Error fetching agronomic health", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFullImage = async (telemetryId: string) => {
        const { data, error } = await supabase
            .from('sat_telemetry')
            .select('image_base64, image_rgb_base64')
            .eq('id', telemetryId)
            .single();
        
        if (error) {
            console.error("Error fetching full image", error);
            return null;
        }
        return data;
    };

    const getStatusGlow = (ndvi: number) => {
        if (!ndvi) return 'border-[#0A0A0A]/10 bg-white/90';
        if (ndvi > 0.65) return 'border-[#1E3F20]/20 bg-white shadow-[0_0_40px_-15px_rgba(16,185,129,0.2)]';
        if (ndvi >= 0.40) return 'border-amber-500/20 bg-white shadow-[0_0_40px_-15px_rgba(245,158,11,0.2)]';
        return 'border-red-500/20 bg-white shadow-[0_0_40px_-15px_rgba(239,68,68,0.2)]';
    };

    const getStatusText = (ndvi: number) => {
        if (!ndvi) return { label: 'Sin Datos', color: 'text-slate-500', bg: 'bg-slate-500/10' };
        if (ndvi > 0.65) return { label: 'Vigor Óptimo', color: 'text-[#1E3F20]', bg: 'bg-[#1E3F20]/5' };
        if (ndvi >= 0.40) return { label: 'Estrés Moderado', color: 'text-amber-400', bg: 'bg-amber-500/10' };
        return { label: 'Estrés Crítico', color: 'text-red-400', bg: 'bg-red-500/10' };
    };

    if (loading) return (
        <div className="p-20 text-center flex flex-col items-center gap-6">
            <div className="relative">
                <div className="w-20 h-20 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
                <Activity className="absolute inset-0 m-auto text-[#1E3F20] animate-pulse" size={28} />
            </div>
            <p className="text-slate-500 font-black text-sm uppercase tracking-[0.3em] animate-pulse">Sincronizando Diagnóstico CDSE...</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            
            {/* Command Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#0A0A0A]/10">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-[#1E3F20]/5 text-[#1E3F20] rounded-2xl border border-[#1E3F20]/20 shadow-lg shadow-[#0A0A0A]/10">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-[#0A0A0A] tracking-tight uppercase">Diagnóstico Radiométrico</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-1.5 h-1.5 bg-[#1E3F20] rounded-full animate-pulse"></span>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Multi-Spectral Analysis Live Feed</p>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={fetchData}
                    className="p-3 bg-white hover:bg-[#FAF9F7] text-[#57534E] hover:text-[#1E3F20] border border-[#0A0A0A]/10 rounded-xl transition-all active:scale-95 group"
                    title="Actualizar Datos"
                >
                    <Clock size={20} className="group-hover:rotate-12 transition-transform" />
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {groupedData.map((d, index) => {
                    const t = d.latest_telemetry;
                    const a = d.latest_alert;
                    
                    if (!t) {
                        return (
                            <div key={index} className="group relative overflow-hidden rounded-3xl border border-[#0A0A0A]/10 bg-[#FAF9F7]/40 p-6 flex flex-col items-center justify-center text-center min-h-[220px] transition-all duration-700">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-[#1E3F20]/10 blur-2xl rounded-full animate-pulse"></div>
                                    <div className="relative bg-white p-4 rounded-2xl border border-[#0A0A0A]/10 text-[#1E3F20] shadow-2xl">
                                        <Satellite size={28} className="animate-bounce" />
                                    </div>
                                </div>
                                <div className="mt-4 relative z-10">
                                    <h4 className="font-black text-[#0A0A0A] text-base uppercase tracking-tight">{d.parcel.active_crop}</h4>
                                    <div className="flex items-center justify-center gap-2 mt-2">
                                        <div className="w-1 h-1 bg-[#1E3F20] rounded-full animate-ping"></div>
                                        <p className="text-[9px] font-black text-[#1E3F20] uppercase tracking-[0.2em]">Sincronizando CDSE</p>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    const status = getStatusText(t.ndvi_avg);
                    let StatusIcon = t.ndvi_avg > 0.65 ? CheckCircle : AlertTriangle;

                    return (
                        <div key={index} className={`group relative overflow-hidden rounded-3xl border transition-all duration-500 ${getStatusGlow(t.ndvi_avg)}`}>
                            <div className="flex flex-col">
                                
                                {/* Info Panel */}
                                <div className="p-5 lg:p-6 relative z-10 border-b border-[#0A0A0A]/10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`px-3 py-1 rounded-full ${status.bg} ${status.color} text-[9px] font-black uppercase tracking-widest border border-current/20`}>
                                                    {status.label}
                                                </div>
                                                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Sentinel-2 Mission</span>
                                            </div>
                                            <h3 className="font-black text-2xl lg:text-3xl text-[#0A0A0A] uppercase tracking-tighter leading-none mb-2">{d.parcel.active_crop}</h3>
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Clock size={10} className="text-slate-700" />
                                                Escaneo: {new Date(t.timestamp).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <StatusIcon size={32} className={`${status.color} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <div className="bg-[#FAF9F7]/50 rounded-2xl p-3 border border-[#0A0A0A]/10 group/metric transition-colors hover:border-[#1E3F20]/20">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">NDVI (Vigor)</p>
                                                <span className={`text-[7px] font-black px-1 rounded ${t.ndvi_avg > 0.6 ? 'text-[#1E3F20] bg-emerald-400/10' : t.ndvi_avg > 0.3 ? 'text-amber-400 bg-amber-400/10' : 'text-red-400 bg-red-400/10'}`}>
                                                    {t.ndvi_avg > 0.6 ? 'ÓPTIMO' : t.ndvi_avg > 0.3 ? 'MEDIO' : 'BAJO'}
                                                </span>
                                            </div>
                                            <p className="text-lg font-black text-[#0A0A0A]">{t.mission?.includes('SAR') ? (t.vh_avg || 0).toFixed(3) : t.ndvi_avg?.toFixed(3) || '--'}</p>
                                        </div>
                                        <div className="bg-[#FAF9F7]/50 rounded-2xl p-3 border border-[#0A0A0A]/10 group/metric transition-colors hover:border-[#C5A059]/20">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">NDMI (Agua)</p>
                                                <span className={`text-[7px] font-black px-1 rounded ${t.ndmi_avg > 0.4 ? 'text-[#C5A059] bg-cyan-400/10' : t.ndmi_avg > 0.1 ? 'text-blue-400 bg-blue-400/10' : 'text-orange-400 bg-orange-400/10'}`}>
                                                    {t.ndmi_avg > 0.4 ? 'HIDRATADO' : t.ndmi_avg > 0.1 ? 'NORMAL' : 'SECO'}
                                                </span>
                                            </div>
                                            <p className="text-lg font-black text-[#0A0A0A]">{t.mission?.includes('SAR') ? (t.vv_avg || 0).toFixed(3) : t.ndmi_avg?.toFixed(3) || '--'}</p>
                                        </div>
                                        <div className="bg-[#FAF9F7]/50 rounded-2xl p-3 border border-[#0A0A0A]/10 group/metric transition-colors hover:border-amber-500/30">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">BSI (Suelo)</p>
                                            </div>
                                            <p className="text-lg font-black text-[#0A0A0A]">{t.bsi_avg?.toFixed(3) || '--'}</p>
                                        </div>
                                    </div>

                                    {a && (
                                        <div className="bg-[#1E3F20]/5 border border-emerald-500/10 rounded-2xl p-4 flex items-start gap-3 relative overflow-hidden group/diag">
                                            <div className="absolute top-0 right-0 p-2 opacity-5">
                                                <BrainCircuit size={40} className="text-[#1E3F20]" />
                                            </div>
                                            <div className="bg-[#1E3F20]/10 p-2 rounded-xl text-[#1E3F20]">
                                                <Activity size={16} />
                                            </div>
                                            <div className="relative z-10 flex-1">
                                                <p className="text-[11px] leading-relaxed text-[#57534E] font-medium whitespace-normal mb-2">
                                                    {a.anomaly_type}
                                                </p>
                                                <div className="bg-[#1E3F20]/5 border border-[#1E3F20]/20 rounded-xl p-3">
                                                    <p className="text-[8px] font-black text-[#1E3F20] uppercase tracking-widest mb-1">Hoja de Ruta Sugerida</p>
                                                    <p className="text-[10px] text-emerald-100/80 leading-relaxed italic">
                                                        {a.action_suggested}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                    {/* Action Buttons */}
                                    <div className="mt-4 flex flex-col gap-2">
                                        <button 
                                            className="w-full bg-[#FAF9F7]/50 hover:bg-[#1E3F20]/5 border border-[#0A0A0A]/10 hover:border-[#1E3F20]/20 rounded-2xl p-3 flex items-center justify-between group/btn transition-all active:scale-[0.98]"
                                            onClick={async () => {
                                                if (d.images) {
                                                    setSelectedParcel({ ...d, images: d.images });
                                                } else {
                                                    const images = await fetchFullImage(t.id);
                                                    setSelectedParcel({ ...d, images });
                                                }
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-lg text-slate-500 group-hover/btn:text-[#1E3F20] transition-colors">
                                                    <Map size={14} />
                                                </div>
                                                <div className="flex flex-col items-start">
                                                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Análisis Multiespectral</span>
                                                    <span className="text-[10px] font-black text-[#0A0A0A] uppercase group-hover/btn:text-[#1E3F20] transition-colors">Visualización Satelital</span>
                                                </div>
                                            </div>
                                            <div className="bg-[#1E3F20]/5 p-1.5 rounded-lg border border-[#1E3F20]/20 opacity-40 group-hover/btn:opacity-100 transition-all">
                                                <Target size={12} className="text-[#1E3F20] animate-pulse" />
                                            </div>
                                        </button>

                                        <button 
                                            onClick={() => onEditParcel(d.parcel)}
                                            className="w-full bg-white/90 hover:bg-[#C5A059]/10 border border-[#0A0A0A]/10 hover:border-[#C5A059]/20 rounded-2xl p-3 flex items-center justify-between group/edit transition-all active:scale-[0.98]"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-[#FAF9F7] rounded-lg text-slate-500 group-hover/edit:text-[#C5A059] transition-colors">
                                                    <ArrowRight size={14} className="rotate-[-45deg]" />
                                                </div>
                                                <div className="flex flex-col items-start">
                                                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Geometría de Parcela</span>
                                                    <span className="text-[10px] font-black text-[#0A0A0A] uppercase group-hover/edit:text-[#C5A059] transition-colors">Ajustar Dimensiones</span>
                                                </div>
                                            </div>
                                            <div className="bg-[#C5A059]/10 p-1.5 rounded-lg border border-cyan-500/20 opacity-40 group-hover/edit:opacity-100 transition-all">
                                                <MapPin size={12} className="text-cyan-500" />
                                            </div>
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                            <button 
                                                onClick={() => setSelectedParcelHistory(d)}
                                                className="w-full bg-[#1E3F20]/5 hover:bg-[#1E3F20]/10 border border-[#1E3F20]/20 rounded-2xl p-3 flex items-center justify-between group/history transition-all active:scale-[0.98]"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-[#1E3F20]/10 rounded-lg text-[#1E3F20] group-hover/history:scale-110 transition-transform">
                                                        <BrainCircuit size={14} />
                                                    </div>
                                                    <div className="flex flex-col items-start">
                                                        <span className="text-[7px] font-black text-[#1E3F20] uppercase tracking-widest">Dashboard</span>
                                                        <span className="text-[10px] font-black text-[#0A0A0A] uppercase">Agrónomo IA</span>
                                                    </div>
                                                </div>
                                                <ArrowRight size={14} className="text-[#1E3F20]" />
                                            </button>

                                            <button 
                                                onClick={() => setReportParcel({ ...d.parcel, sat_telemetry: d.all_telemetry })}
                                                className="w-full bg-[#0A0A0A] hover:bg-[#1A1A1A] border border-[#0A0A0A]/20 rounded-2xl p-3 flex items-center justify-between group/report transition-all active:scale-[0.98]"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-white/10 rounded-lg text-white group-hover/report:scale-110 transition-transform">
                                                        <FileCheck size={14} />
                                                    </div>
                                                    <div className="flex flex-col items-start">
                                                        <span className="text-[7px] font-black text-white/50 uppercase tracking-widest">Reporte</span>
                                                        <span className="text-[10px] font-black text-white uppercase">Trazabilidad EUDR</span>
                                                    </div>
                                                </div>
                                                <ArrowRight size={14} className="text-white/50" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    );
                })}

                {groupedData.filter(d => d.latest_telemetry).length === 0 && (
                    <div className="py-24 border-2 border-dashed border-[#0A0A0A]/10 rounded-[3rem] text-center bg-white/20">
                        <div className="bg-[#FAF9F7] w-24 h-24 rounded-[2rem] border border-[#0A0A0A]/10 flex items-center justify-center mx-auto mb-8 shadow-2xl">
                            <Map size={40} className="text-slate-800" />
                        </div>
                        <h3 className="text-2xl font-black text-[#0A0A0A] mb-2 tracking-tight">Centro de Datos Vacío</h3>
                        <p className="text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
                            No se han detectado firmas radiométricas para tus parcelas. Inicia una extracción de datos satelitales en el módulo de mapas.
                        </p>
                    </div>
                )}
            </div>

            {/* Comparison Modal - Deep Tech */}
            {selectedParcel && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
                    <div className="absolute inset-0 bg-[#FAF9F7]/95 backdrop-blur-xl" onClick={() => setSelectedParcel(null)}></div>
                    
                    <div className="relative bg-white w-full max-w-[95vw] max-h-[95vh] rounded-[2.5rem] border border-[#0A0A0A]/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="p-6 lg:px-10 border-b border-[#0A0A0A]/10 flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-20">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="px-2 py-0.5 bg-[#1E3F20]/5 text-[#1E3F20] text-[9px] font-black uppercase tracking-widest rounded-full border border-[#1E3F20]/20">Análisis Multiespectral</span>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sentinel-2 • 10m/px</span>
                                </div>
                                <h2 className="text-2xl lg:text-3xl font-black text-[#0A0A0A] uppercase tracking-tighter">
                                    {selectedParcel.parcel.active_crop} <span className="text-slate-700">|</span> <span className="text-[#57534E]">Radiometría CDSE</span>
                                </h2>
                            </div>
                            <button 
                                onClick={() => setSelectedParcel(null)}
                                className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl transition-colors text-[#0A0A0A]"
                            >
                                <X size={24} />
                            </button>
                        </div>

                            {/* Educational Legend for Producers */}
                            <div className="flex gap-4 items-center bg-white/90 p-2 px-4 rounded-xl border border-[#0A0A0A]/10">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest text-center">Vigor (NDVI)</span>
                                    <div className="flex h-1.5 w-24 rounded-full overflow-hidden border border-[#0A0A0A]/10">
                                        <div className="h-full w-1/3 bg-red-500"></div>
                                        <div className="h-full w-1/3 bg-amber-500"></div>
                                        <div className="h-full w-1/3 bg-[#1E3F20]"></div>
                                    </div>
                                    <div className="flex justify-between text-[6px] font-bold text-[#57534E]">
                                        <span>ESTRÉS</span>
                                        <span>SANO</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest text-center">Agua (NDMI)</span>
                                    <div className="flex h-1.5 w-24 rounded-full overflow-hidden border border-[#0A0A0A]/10">
                                        <div className="h-full w-1/3 bg-orange-500"></div>
                                        <div className="h-full w-1/3 bg-blue-500"></div>
                                        <div className="h-full w-1/3 bg-cyan-500"></div>
                                    </div>
                                    <div className="flex justify-between text-[6px] font-bold text-[#57534E]">
                                        <span>SECO</span>
                                        <span>ÓPTIMO</span>
                                    </div>
                                </div>
                            </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 bg-[#FAF9F7]">
                            {/* Color Real */}
                            <div className="relative group overflow-hidden border-r border-[#0A0A0A]/10 flex items-center justify-center bg-black">
                                <img 
                                    src={selectedParcel.images?.image_rgb_base64 && selectedParcel.images?.image_rgb_base64.trim() !== "" 
                                        ? selectedParcel.images.image_rgb_base64 
                                        : 'https://via.placeholder.com/600x600?text=Cargando+Imagen...'} 
                                    className="w-full max-h-[400px] object-contain" 
                                    alt="True Color"
                                />
                                <div className="absolute top-4 left-4 bg-[#FAF9F7]/80 backdrop-blur-xl border border-[#0A0A0A]/10 text-[#0A0A0A] px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-2xl">
                                    {selectedParcel.latest_telemetry.mission?.includes('SAR') ? '📡 Sensor Radar SAR' : '📷 Óptico: Color Real'}
                                </div>
                            </div>

                            {/* Analytics Overlay */}
                            <div className="relative group overflow-hidden flex items-center justify-center bg-black">
                                <img 
                                    src={selectedParcel.images?.image_base64} 
                                    className="w-full max-h-[400px] object-contain" 
                                    alt="False Color"
                                />
                                <div className="absolute top-4 left-4 bg-[#1E3F20] text-slate-950 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/20">
                                    {selectedParcel.latest_telemetry.mission?.includes('SAR') ? '🔍 Analítica Estructural' : '🔥 Vigor Vegetativo (NDVI)'}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 lg:p-6 bg-[#FAF9F7]/80 border-t border-[#0A0A0A]/10">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-4 rounded-2xl border border-[#0A0A0A]/10 relative overflow-hidden group/mini shadow-2xl">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent"></div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 relative z-10">
                                        {selectedParcel.latest_telemetry.mission?.includes('SAR') ? 'Reflectancia (VH)' : 'Promedio NDVI'}
                                    </p>
                                    <p className="text-2xl font-black text-[#1E3F20] relative z-10 leading-none">
                                        {selectedParcel.latest_telemetry.mission?.includes('SAR') 
                                            ? (selectedParcel.latest_telemetry.vh_avg || selectedParcel.latest_telemetry.bsi_avg || 0).toFixed(4)
                                            : (selectedParcel.latest_telemetry.ndvi_avg * 100).toFixed(1) + '%'
                                        }
                                    </p>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-[#0A0A0A]/10 relative overflow-hidden group/mini shadow-2xl">
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent"></div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 relative z-10">
                                        {selectedParcel.latest_telemetry.mission?.includes('SAR') ? 'Reflectancia (VV)' : 'Estrés Hídrico'}
                                    </p>
                                    <p className="text-2xl font-black text-[#C5A059] relative z-10 leading-none">
                                        {selectedParcel.latest_telemetry.mission?.includes('SAR') 
                                            ? (selectedParcel.latest_telemetry.vv_avg || selectedParcel.latest_telemetry.ndmi_avg || 0).toFixed(4)
                                            : (selectedParcel.latest_telemetry.ndmi_avg * 100).toFixed(1) + '%'
                                        }
                                    </p>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-[#0A0A0A]/10 relative overflow-hidden group/mini shadow-2xl">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 relative z-10">Agencia Espacial</p>
                                    <p className="text-base font-black text-[#0A0A0A] relative z-10 uppercase mt-0.5 leading-none">{selectedParcel.latest_telemetry.mission || 'Sentinel-2 CDSE'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Historical AI Dashboard Modal */}
            {selectedParcelHistory && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
                    <div className="absolute inset-0 bg-[#FAF9F7]/95 backdrop-blur-xl" onClick={() => setSelectedParcelHistory(null)}></div>
                    
                    <div className="relative bg-white w-full max-w-5xl max-h-[95vh] rounded-[2.5rem] border border-[#0A0A0A]/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
                        <div className="p-6 lg:px-10 border-b border-[#0A0A0A]/10 flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-20">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="px-2 py-0.5 bg-[#1E3F20]/5 text-[#1E3F20] text-[9px] font-black uppercase tracking-widest rounded-full border border-[#1E3F20]/20">Dashboard Histórico</span>
                                </div>
                                <h2 className="text-2xl lg:text-3xl font-black text-[#0A0A0A] uppercase tracking-tighter">
                                    {selectedParcelHistory.parcel.active_crop} <span className="text-slate-700">|</span> <span className="text-[#57534E]">Evolución Agronómica IA</span>
                                </h2>
                            </div>
                            <button 
                                onClick={() => setSelectedParcelHistory(null)}
                                className="bg-white/5 hover:bg-slate-100 p-3 rounded-2xl transition-colors text-[#0A0A0A]"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto p-6 lg:p-10 bg-[#FAF9F7]/50 flex-1">
                            <div className="space-y-8">
                                {selectedParcelHistory.all_telemetry.map((tel: any, i: number) => {
                                    // Find matching AI diagnosis in alerts
                                    const diagnosis = selectedParcelHistory.all_alerts.find((a: any) => 
                                        a.anomaly_type.includes('Diagnóstico IA:') && 
                                        new Date(a.notification_date).toDateString() === new Date(tel.created_at).toDateString()
                                    );

                                    return (
                                        <div key={tel.id} className="bg-white p-6 rounded-[2rem] border border-[#0A0A0A]/10 shadow-xl relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-2 h-full bg-[#1E3F20]/20 group-hover:bg-[#1E3F20] transition-colors"></div>
                                            
                                            <div className="flex flex-col lg:flex-row gap-8 pl-4">
                                                {/* KPI Column */}
                                                <div className="lg:w-1/3 space-y-4">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Clock size={16} className="text-slate-400" />
                                                        <p className="font-bold text-slate-600">{new Date(tel.timestamp).toLocaleDateString()}</p>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="bg-[#FAF9F7] p-4 rounded-xl border border-[#0A0A0A]/5">
                                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">NDVI (Salud)</p>
                                                            <p className="text-xl font-black text-[#1E3F20]">{tel.ndvi_avg ? (tel.ndvi_avg * 100).toFixed(1) + '%' : '--'}</p>
                                                        </div>
                                                        <div className="bg-[#FAF9F7] p-4 rounded-xl border border-[#0A0A0A]/5">
                                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">NDMI (Agua)</p>
                                                            <p className="text-xl font-black text-[#C5A059]">{tel.ndmi_avg ? (tel.ndmi_avg * 100).toFixed(1) + '%' : '--'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* AI Analysis Column */}
                                                <div className="flex-1">
                                                    {diagnosis ? (
                                                        <div className="h-full bg-[#1E3F20]/5 rounded-2xl p-6 border border-[#1E3F20]/20 flex flex-col justify-center">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <BrainCircuit className="text-[#1E3F20]" size={20} />
                                                                <h4 className="font-black text-[#0A0A0A] uppercase tracking-tight">{diagnosis.anomaly_type.replace('Diagnóstico IA:', '')}</h4>
                                                                <span className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded-full ${diagnosis.severity === 'Alta' ? 'bg-red-100 text-red-700' : diagnosis.severity === 'Media' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                                    Prioridad: {diagnosis.severity}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-[#57534E] leading-relaxed">
                                                                {diagnosis.action_suggested}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="h-full bg-slate-50 rounded-2xl p-6 border border-slate-200 flex items-center justify-center text-center">
                                                            <p className="text-sm text-slate-400 font-medium">No se encontró análisis de IA para esta fecha. (Puede ser un registro antiguo o generado sin Gemini).</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {selectedParcelHistory.all_telemetry.length === 0 && (
                                    <div className="text-center py-12 text-slate-500">No hay historial disponible.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Traceability Report EUDR Modal */}
            {reportParcel && (
                <div className="fixed inset-0 z-[150]">
                    <TraceabilityReport 
                        parcel={reportParcel} 
                        onClose={() => setReportParcel(null)} 
                    />
                </div>
            )}
        </div>
    );
};
