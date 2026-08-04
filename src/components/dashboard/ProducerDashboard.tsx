import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { B2BListingForm } from '../market/B2BListingForm';
import { QuoteManager } from '../market/QuoteManager';
import { MarketPricesView } from '../market/MarketPricesView';
import { NearbyDemands } from '../market/NearbyDemands';
import { AssociationInbox } from '../market/AssociationInbox';
import { ProducerParcels } from './copernicus/ProducerParcels';
import { AgronomicHealth } from './copernicus/AgronomicHealth';
import { CropDiscovery } from './copernicus/CropDiscovery';
import { NationalMarketAnalytics } from '../market/NationalMarketAnalytics';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import { LogOut, PlusCircle, Inbox, TrendingUp, Target, Users, Map, Activity, BrainCircuit, Sparkles, BarChart3 } from 'lucide-react';

export const ProducerDashboard = () => {
    const { profile } = useAuth();
    const [activeTab, setActiveTab] = useState<'publish' | 'quotes' | 'opportunities' | 'associations' | 'map' | 'discovery' | 'analytics'>('publish');
    const [parcelToEdit, setParcelToEdit] = useState<any>(null);

    return (
        <div className="min-h-screen bg-[#FAF9F7] tech-grid">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                
                {/* Modern Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <img src="/logo_final.png" alt="AgroConecta" className="h-20 w-auto object-contain drop-shadow-sm" />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white/90 p-2 rounded-2xl border border-[#0A0A0A]/10 backdrop-blur-md">
                        <div className="px-4 py-2 text-right">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Usuario Activo</p>
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
                        <span className="text-sm font-bold uppercase tracking-tight">Cuenta en proceso de verificación administrativa • Acceso de solo lectura</span>
                    </div>
                )}

                {/* Navigation Tabs - Emerald Style */}
                <div className="flex flex-wrap gap-2 mb-6 bg-white/90 p-2 rounded-[2.5rem] border border-[#0A0A0A]/10 w-fit backdrop-blur-md">
                    {[
                        { id: 'publish', label: 'Publicar', icon: PlusCircle },
                        { id: 'quotes', label: 'Cotizaciones', icon: Inbox },
                        { id: 'opportunities', label: 'Mercado', icon: Target },
                        { id: 'analytics', label: 'Análisis Nacional', icon: BarChart3 },
                        { id: 'associations', label: 'Asociaciones', icon: Users },
                        { id: 'map', label: 'Mapeo Parcelas', icon: Map },
                        { id: 'discovery', label: 'Discovery IA', icon: BrainCircuit },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 py-3 px-8 text-sm font-black rounded-full transition-all duration-500 uppercase tracking-tight ${activeTab === tab.id
                                ? 'bg-[#1E3F20] text-white shadow-2xl shadow-[#1E3F20]/20 scale-105'
                                : 'text-slate-500 hover:text-[#0A0A0A] hover:bg-[#0A0A0A]/5'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 min-w-0">
                        <div className="glass-card p-6 lg:p-8 min-h-[400px] relative overflow-hidden">
                            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#1E3F20]/[0.03] blur-[120px] rounded-full pointer-events-none"></div>
                            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#C5A059]/10 blur-[120px] rounded-full pointer-events-none"></div>

                            {activeTab === 'publish' ? (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="mb-10">
                                        <h2 className="text-3xl font-black text-[#0A0A0A] uppercase tracking-tighter">Publicar Oferta B2B</h2>
                                        <p className="text-[#57534E] text-sm font-medium mt-2">Configura volúmenes, precios base y escalas de descuento por volumen.</p>
                                    </div>
                                    <B2BListingForm onListingCreated={() => setActiveTab('quotes')} />
                                </div>
                            ) : activeTab === 'quotes' ? (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="mb-10">
                                        <h2 className="text-3xl font-black text-[#0A0A0A] uppercase tracking-tighter">Gestor de Negociaciones</h2>
                                        <p className="text-[#57534E] text-sm font-medium mt-2">Monitorea y responde a propuestas de compra en tiempo real.</p>
                                    </div>
                                    <QuoteManager />
                                </div>
                            ) : activeTab === 'opportunities' ? (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="mb-10">
                                        <h2 className="text-3xl font-black text-[#0A0A0A] uppercase tracking-tighter">Oportunidades de Mercado</h2>
                                        <p className="text-[#57534E] text-sm font-medium mt-2">Identifica demandas masivas y coordina logística regional.</p>
                                    </div>
                                    <NearbyDemands />
                                </div>
                            ) : activeTab === 'associations' ? (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="mb-10">
                                        <h2 className="text-3xl font-black text-[#0A0A0A] uppercase tracking-tighter">Asociatividad Estratégica</h2>
                                        <p className="text-[#57534E] text-sm font-medium mt-2">Gestiona alianzas locales para cumplir contratos de gran escala.</p>
                                    </div>
                                    <AssociationInbox />
                                </div>
                            ) : activeTab === 'analytics' ? (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <NationalMarketAnalytics />
                                </div>
                            ) : activeTab === 'discovery' ? (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <CropDiscovery />
                                </div>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
                                    <ProducerParcels 
                                        hideList={true} 
                                        activeEditParcel={parcelToEdit}
                                        onCancelEdit={() => setParcelToEdit(null)}
                                    />
                                    
                                    <div className="pt-6 border-t border-[#0A0A0A]/10">
                                        <div className="mb-6">
                                            <h2 className="text-2xl font-black text-[#0A0A0A] uppercase tracking-tighter">Análisis Satelital Copernicus</h2>
                                            <p className="text-[#57534E] text-[10px] font-medium mt-1 uppercase tracking-widest">Diagnóstico de precisión multiespectral</p>
                                        </div>
                                        <AgronomicHealth onEditParcel={(p: any) => setParcelToEdit(p)} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {activeTab === 'publish' && (
                        <div className="lg:w-96 shrink-0 animate-in fade-in slide-in-from-right-8 duration-700">
                            <div className="sticky top-8 space-y-8">
                                <div className="bg-[#1E3F20] text-[#FAF9F7] p-8 rounded-[2.5rem] shadow-2xl shadow-[#0A0A0A]/10 border border-[#1E3F20]/20 relative overflow-hidden group">
                                    <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                        <TrendingUp size={120} />
                                    </div>
                                    <h4 className="text-sm font-black flex items-center gap-3 uppercase tracking-[0.2em] relative z-10">
                                        <Sparkles className="w-5 h-5 text-[#C5A059]" />
                                        Tip de Venta
                                    </h4>
                                    <p className="text-sm mt-4 font-bold leading-relaxed relative z-10 opacity-90">
                                        Establece un precio base competitivo comparando con los índices de mercado a continuación para acelerar la rotación de tu cosecha.
                                    </p>
                                </div>
                                <MarketPricesView />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
