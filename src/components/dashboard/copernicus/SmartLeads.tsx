import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth/AuthProvider';
import { Sparkles, Target, Calendar, MapPin, ArrowRight, MessageSquare, ExternalLink, BadgeAlert, TrendingUp } from 'lucide-react';

export const SmartLeads = () => {
    const { user } = useAuth();
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [providerId, setProviderId] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchProviderAndLeads();
        }
    }, [user]);

    const fetchProviderAndLeads = async () => {
        setLoading(true);
        try {
            // 1. Obtener el ID de proveedor del usuario actual
            const { data: providerData } = await supabase
                .from('b2b_providers')
                .select('id')
                .eq('user_id', user!.id)
                .single();
            
            if (providerData) {
                setProviderId(providerData.id);
                
                // 2. Obtener los leads inteligentes vinculados a este proveedor
                const { data: leadsData } = await supabase
                    .from('b2b_smart_leads')
                    .select(`
                        *,
                        parcels (
                            id,
                            active_crop,
                            geometry
                        ),
                        alerts_events (
                            id,
                            severity,
                            anomaly_type,
                            action_suggested
                        )
                    `)
                    .eq('provider_id', providerData.id)
                    .order('created_at', { ascending: false });
                
                setLeads(leadsData || []);
            }
        } catch (error) {
            console.error("Error fetching smart leads", error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-red-600 bg-red-50 border-red-100';
        if (score >= 70) return 'text-orange-600 bg-orange-50 border-orange-100';
        return 'text-blue-600 bg-blue-50 border-blue-100';
    };

    if (loading) return <div className="p-8 text-center animate-pulse text-indigo-600 font-bold italic">Buscando oportunidades en la red satelital...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shadow-sm">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Smart Leads IA</h2>
                        <p className="text-sm text-gray-500 font-medium">Oportunidades de venta detectadas por telemetría Copernicus</p>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                    <TrendingUp size={16} className="text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">{leads.length} Oportunidades</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {leads.map((lead) => (
                    <div key={lead.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                        <div className="flex flex-col md:flex-row">
                            {/* Score & Category Column */}
                            <div className={`md:w-32 flex flex-col items-center justify-center p-4 border-r border-gray-50 ${getScoreColor(lead.pre_score)}`}>
                                <div className="text-2xl font-black">{lead.pre_score}%</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">Match Score</div>
                                <div className="mt-2 px-2 py-0.5 bg-white/50 rounded text-[9px] font-extrabold uppercase border border-current">
                                    {lead.category_match}
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <BadgeAlert size={16} className="text-orange-500" />
                                            <h3 className="font-bold text-gray-900 leading-tight">
                                                {lead.alerts_events?.anomaly_type || 'Anomalía detectada'}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                                            <span className="flex items-center gap-1"><Target size={12} /> Cultivo: {lead.parcels?.active_crop}</span>
                                            <span className="flex items-center gap-1"><Calendar size={12} /> Detectado: {new Date(lead.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md flex items-center gap-1">
                                        ID: {lead.id.split('-')[0]}
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                                    "{lead.alerts_events?.action_suggested}"
                                </p>
                            </div>

                            {/* CTA Column */}
                            <div className="md:w-48 bg-gray-50/50 p-5 border-l border-gray-100 flex flex-col justify-center gap-2">
                                <button className="w-full bg-indigo-600 text-[#0A0A0A] py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm flex items-center justify-center gap-2 transition-all">
                                    Enviar Cotización <ArrowRight size={14} />
                                </button>
                                <button className="w-full bg-white text-gray-600 py-2 rounded-xl text-[11px] font-bold border hover:bg-gray-50 flex items-center justify-center gap-2 transition-all">
                                    Ver en Mapa <MapPin size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {leads.length === 0 && (
                    <div className="p-12 border-2 border-dashed rounded-3xl text-center flex flex-col items-center justify-center gap-4 bg-gray-50/50">
                        <div className="p-4 bg-white rounded-2xl shadow-sm">
                            <Target size={48} className="text-gray-200" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-700 text-lg tracking-tight">Sin Smart Leads vigentes</h3>
                            <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                Nuestro satélite no ha detectado anomalías críticas que requieran tus suministros en las zonas monitoreadas.
                            </p>
                        </div>
                        <button className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline">
                            Ver Mapa de Calor <ExternalLink size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
