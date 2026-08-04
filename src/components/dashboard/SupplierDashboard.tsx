import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { B2BListingForm } from '../market/B2BListingForm';
import { QuoteManager } from '../market/QuoteManager';
import { HeatmapDemand } from './copernicus/HeatmapDemand';
import { B2BLeadsMap } from '../../pages/B2BLeadsMap';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import { LogOut, Truck, PlusCircle, Inbox, Satellite, Map as MapIcon, Activity, Sparkles, BrainCircuit } from 'lucide-react';
import { BranchManager } from './ProviderBranchManager';

export const SupplierDashboard = () => {
    const { profile } = useAuth();
    const [activeTab, setActiveTab] = useState<'publish' | 'quotes' | 'intelligence' | 'locations'>('intelligence');

    return (
        <div className="min-h-screen bg-[#FAF9F7] tech-grid">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                
                {/* Modern Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#C5A059]/10 p-3 rounded-2xl border border-[#C5A059]/20 text-[#C5A059] cyan-glow">
                                <Truck className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-[#0A0A0A] tracking-tight uppercase">
                                    Supplier <span className="text-[#C5A059]">Terminal</span>
                                </h1>
                                <p className="text-[#57534E] font-medium">Panel de Control de Suministros • v2.5</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white/90 p-2 rounded-2xl border border-[#0A0A0A]/10 backdrop-blur-md">
                        <div className="px-4 py-2 text-right">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Proveedor Verificado</p>
                            <p className="text-sm font-black text-[#0A0A0A]">{profile?.full_name}</p>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => supabase.auth.signOut()}
                            className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-[#0A0A0A] rounded-xl transition-all"
                        >
                            <LogOut className="w-4 h-4 mr-2" /> Salir
                        </Button>
                    </div>
                </div>

                {profile?.verification_status === 'Pending' && (
                    <div className="mb-8 p-4 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 flex items-center gap-3 backdrop-blur-sm animate-in fade-in slide-in-from-top-4">
                        <Activity className="animate-pulse" size={20} />
                        <span className="text-sm font-bold uppercase tracking-tight">Estatus de Verificación: Pendiente • Visibilidad de Ofertas Limitada</span>
                    </div>
                )}

                {/* Navigation Tabs - Cyan/Tech Style */}
                <div className="flex flex-wrap gap-2 mb-10 bg-white/90 p-2 rounded-[2.5rem] border border-[#0A0A0A]/10 w-fit backdrop-blur-md">
                    {[
                        { id: 'intelligence', label: 'Inteligencia', icon: Satellite },
                        { id: 'publish', label: 'Ofertar', icon: PlusCircle },
                        { id: 'quotes', label: 'Solicitudes', icon: Inbox },
                        { id: 'locations', label: 'Sucursales', icon: MapIcon },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 py-3 px-8 text-sm font-black rounded-full transition-all duration-500 uppercase tracking-tight ${activeTab === tab.id
                                ? 'bg-cyan-500 text-slate-950 shadow-2xl shadow-cyan-500/30 scale-105'
                                : 'text-slate-500 hover:text-[#FAF9F7] hover:bg-[#0A0A0A]/5'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col lg:flex-row gap-10">
                    <div className="flex-1 min-w-0">
                        <div className="glass-card p-10 min-h-[600px] relative overflow-hidden">
                            {/* Decorative background glow */}
                            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C5A059]/10 blur-[120px] rounded-full pointer-events-none"></div>
                            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#1E3F20]/[0.03] blur-[120px] rounded-full pointer-events-none"></div>

                            {activeTab === 'intelligence' ? (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-16">
                                    <div>
                                        <div className="mb-10">
                                            <h2 className="text-3xl font-black text-[#0A0A0A] uppercase tracking-tighter">Inteligencia de Mercado</h2>
                                            <p className="text-[#57534E] text-sm font-medium mt-2">Visualiza puntos calientes de demanda y oportunidades predictivas.</p>
                                        </div>
                                        <div className="bg-[#FAF9F7]/50 rounded-[2.5rem] border border-[#0A0A0A]/10 p-2">
                                            <HeatmapDemand />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="mb-10">
                                            <h2 className="text-3xl font-black text-[#0A0A0A] uppercase tracking-tighter">Leads Inteligentes Georeferenciados</h2>
                                            <p className="text-[#57534E] text-sm font-medium mt-2">Navega por el mapa para descubrir productores con necesidades críticas detectadas por análisis satelital masivo.</p>
                                        </div>
                                        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-[#0A0A0A]/10">
                                            <B2BLeadsMap />
                                        </div>
                                    </div>
                                </div>
                            ) : activeTab === 'publish' ? (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="mb-10">
                                        <h2 className="text-3xl font-black text-[#0A0A0A] uppercase tracking-tighter">Publicar Catálogo</h2>
                                        <p className="text-[#57534E] text-sm font-medium mt-2">Ofrece insumos, maquinaria o servicios especializados al ecosistema.</p>
                                    </div>
                                    <B2BListingForm onListingCreated={() => setActiveTab('quotes')} />
                                </div>
                            ) : activeTab === 'quotes' ? (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="mb-10">
                                        <h2 className="text-3xl font-black text-[#0A0A0A] uppercase tracking-tighter">Gestor de Cotizaciones</h2>
                                        <p className="text-[#57534E] text-sm font-medium mt-2">Negocia precios y condiciones logísticas con productores interesados.</p>
                                    </div>
                                    <QuoteManager />
                                </div>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="mb-10">
                                        <h2 className="text-3xl font-black text-[#0A0A0A] uppercase tracking-tighter">Red de Distribución</h2>
                                        <p className="text-[#57534E] text-sm font-medium mt-2">Gestiona tus puntos de despacho y áreas de cobertura regional.</p>
                                    </div>
                                    <BranchManager />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:w-96 shrink-0 animate-in fade-in slide-in-from-right-8 duration-700">
                        <div className="sticky top-8 space-y-8">
                            {/* Insight Card */}
                            <div className="bg-cyan-600 text-[#0A0A0A] p-8 rounded-[2.5rem] shadow-2xl shadow-cyan-900/40 border border-cyan-400/20 relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                    <BrainCircuit size={120} />
                                </div>
                                <h4 className="text-sm font-black flex items-center gap-3 uppercase tracking-[0.2em] relative z-10">
                                    <Sparkles className="w-5 h-5 text-cyan-200" />
                                    Smart Insight
                                </h4>
                                <p className="text-sm mt-4 font-bold leading-relaxed relative z-10 opacity-90">
                                    La demanda de fertilizantes nitrogenados ha subido un 15% en la zona de Quevedo. Optimiza tus rutas de despacho esta semana.
                                </p>
                            </div>

                            {/* Verification Info */}
                            <div className="bg-white/90 p-8 rounded-[2.5rem] border border-[#0A0A0A]/10 backdrop-blur-md">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Activity className="w-3 h-3" /> Estado de Operación
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-[#57534E]">Verificación</span>
                                        <span className={profile?.verification_status === 'Verified' ? 'text-[#1E3F20]' : 'text-amber-400'}>
                                            {profile?.verification_status === 'Verified' ? 'ACTIVA' : 'PENDIENTE'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-[#57534E]">Reputación B2B</span>
                                        <span className="text-[#C5A059]">98% POSITIVA</span>
                                    </div>
                                    <div className="h-px bg-white/5 my-4"></div>
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                                        * La verificación completa permite publicar ofertas con prioridad en el feed de productores.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
