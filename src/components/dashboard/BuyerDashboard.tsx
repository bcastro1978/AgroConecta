import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import { MarketplaceBrowser } from '../market/MarketplaceBrowser';
import { QuoteManager } from '../market/QuoteManager';
import { MarketPricesView } from '../market/MarketPricesView';
import { DemandForm } from '../market/DemandForm';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import { Building2, Search, Inbox, MapPin, ClipboardList, LogOut, TrendingUp, Sparkles, Target, Activity } from 'lucide-react';

export const BuyerDashboard = () => {
    const { profile } = useAuth();
    const [activeTab, setActiveTab] = React.useState<'browse' | 'quotes' | 'demands'>('browse');

    return (
        <div className="min-h-screen bg-[#FAF9F7] tech-grid">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                
                {/* Modern Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#C5A059]/10 p-3 rounded-2xl border border-[#C5A059]/20 text-[#C5A059] cyan-glow">
                                <Building2 className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-[#0A0A0A] tracking-tight uppercase">
                                    Procurement <span className="text-[#C5A059]">Terminal</span>
                                </h1>
                                <p className="text-[#57534E] font-medium">Panel de Adquisiciones B2B • v2.5</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white/90 p-2 rounded-2xl border border-[#0A0A0A]/10 backdrop-blur-md">
                        <div className="px-4 py-2 text-right">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Comprador Industrial</p>
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

                {/* Navigation Tabs - Cyan/Tech Style */}
                <div className="flex flex-wrap gap-2 mb-10 bg-white/90 p-2 rounded-[2.5rem] border border-[#0A0A0A]/10 w-fit backdrop-blur-md">
                    {[
                        { id: 'browse', label: 'Explorar', icon: Search },
                        { id: 'quotes', label: 'Cotizaciones', icon: Inbox },
                        { id: 'demands', label: 'Mis Demandas', icon: ClipboardList },
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
                <div className="flex flex-col xl:flex-row gap-10">
                    <div className="flex-1 min-w-0">
                        <div className="glass-card p-10 min-h-[600px] relative overflow-hidden">
                            {/* Decorative background glow */}
                            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C5A059]/10 blur-[120px] rounded-full pointer-events-none"></div>
                            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#1E3F20]/[0.03] blur-[120px] rounded-full pointer-events-none"></div>

                            {activeTab === 'browse' ? (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="mb-10">
                                        <h2 className="text-3xl font-black text-[#0A0A0A] uppercase tracking-tighter">Catálogo de Productores</h2>
                                        <p className="text-[#57534E] text-sm font-medium mt-2">Navega por las ofertas disponibles y solicita cotizaciones directas.</p>
                                    </div>
                                    <MarketplaceBrowser />
                                </div>
                            ) : activeTab === 'quotes' ? (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="mb-10">
                                        <h2 className="text-3xl font-black text-[#0A0A0A] uppercase tracking-tighter">Estado de Negociaciones</h2>
                                        <p className="text-[#57534E] text-sm font-medium mt-2">Rastrea y finaliza las propuestas comerciales enviadas.</p>
                                    </div>
                                    <QuoteManager />
                                </div>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="mb-10">
                                        <h2 className="text-3xl font-black text-[#0A0A0A] uppercase tracking-tighter">Mis Requerimientos</h2>
                                        <p className="text-[#57534E] text-sm font-medium mt-2">Publica demandas masivas para que la red de productores se organice.</p>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        <DemandForm onDemandCreated={() => setActiveTab('demands')} />
                                        <div className="bg-[#FAF9F7]/50 p-10 rounded-[2.5rem] border border-dashed border-[#0A0A0A]/10 flex flex-col items-center justify-center text-center">
                                            <div className="bg-[#C5A059]/10 p-6 rounded-full mb-6 border border-cyan-500/20">
                                                <Target className="w-10 h-10 text-[#C5A059] animate-pulse" />
                                            </div>
                                            <h4 className="text-lg font-black text-[#0A0A0A] uppercase tracking-tight">Matchmaking Inteligente</h4>
                                            <p className="text-xs text-slate-500 mt-4 leading-relaxed font-medium max-w-xs">
                                                Próximamente verás aquí las asociaciones automáticas de productores locales para cubrir tus grandes pedidos.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {activeTab !== 'demands' && (
                        <div className="xl:w-96 shrink-0 animate-in fade-in slide-in-from-right-8 duration-700">
                            <div className="sticky top-8 space-y-8">
                                <MarketPricesView />
                                
                                <div className="bg-cyan-600 text-[#0A0A0A] p-8 rounded-[2.5rem] shadow-2xl shadow-cyan-900/40 border border-cyan-400/20 relative overflow-hidden group">
                                    <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                        <TrendingUp size={120} />
                                    </div>
                                    <h4 className="text-sm font-black flex items-center gap-3 uppercase tracking-[0.2em] relative z-10">
                                        <Sparkles className="w-5 h-5 text-cyan-200" />
                                        Estrategia B2B
                                    </h4>
                                    <p className="text-sm mt-4 font-bold leading-relaxed relative z-10 opacity-90">
                                        Compara las ofertas directas con los índices MCP de arriba para asegurar el mejor margen operativo en tu cadena de suministro.
                                    </p>
                                </div>

                                <div className="bg-white/90 p-8 rounded-[2.5rem] border border-[#0A0A0A]/10 backdrop-blur-md">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Activity className="w-3 h-3" /> Logística Regional
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-xs font-bold">
                                            <span className="text-[#57534E]">Hubs Cercanos</span>
                                            <span className="text-[#0A0A0A]">4 ACTIVOS</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-bold">
                                            <span className="text-[#57534E]">Tiempo de Respuesta</span>
                                            <span className="text-[#C5A059]">~2.4 HORAS</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
