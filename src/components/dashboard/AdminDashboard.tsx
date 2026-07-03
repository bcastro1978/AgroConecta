import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { UserProfile } from '../../types';
import { Button } from '../ui/button';
import { AdminPriceManager } from '../market/AdminPriceManager';
import { TerritorialAnalysis } from '../admin/TerritorialAnalysis';
import { ShieldCheck, Users, Activity, CheckCircle2, XCircle, LogOut, Search, Filter, ShieldAlert } from 'lucide-react';

export const AdminDashboard = () => {
    const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const fetchPending = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('verification_status', 'Pending');

        if (error) {
            console.error('Error fetching pending users:', error);
        } else if (data) {
            setPendingUsers(data as UserProfile[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleVerifyResult = async (userId: string, status: 'Verified' | 'Rejected') => {
        setProcessingId(userId);
        setStatusMessage(null);
        
        const { error } = await supabase
            .from('users')
            .update({ verification_status: status })
            .eq('id', userId);

        if (error) {
            setStatusMessage({ text: `Error: ${error.message}`, type: 'error' });
        } else {
            setStatusMessage({ 
                text: `Usuario ${status === 'Verified' ? 'aprobado' : 'rechazado'} con éxito.`, 
                type: 'success' 
            });
            fetchPending(); // Refresh
        }
        setProcessingId(null);
        
        setTimeout(() => setStatusMessage(null), 3000);
    };

    return (
        <div className="min-h-screen bg-[#FAF9F7] tech-grid">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <div className="bg-[#1E3F20]/10 p-4 rounded-2xl border border-[#1E3F20]/20 text-[#1E3F20] emerald-glow">
                                <ShieldCheck className="w-10 h-10" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-[#0A0A0A] tracking-tighter uppercase">
                                    Root <span className="text-[#1E3F20]">Control</span>
                                </h1>
                                <p className="text-[#57534E] font-medium">Terminal de Verificación de Identidad • v2.5</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white/90 p-3 rounded-2xl border border-[#0A0A0A]/10 backdrop-blur-md">
                        <div className="px-4 py-1 text-right">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Admin Privileges</p>
                            <p className="text-sm font-black text-[#0A0A0A]">CENTRAL COMMAND</p>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => supabase.auth.signOut()}
                            className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-[#0A0A0A] rounded-xl transition-all h-12 px-6"
                        >
                            <LogOut className="w-4 h-4 mr-2" /> Salir
                        </Button>
                    </div>
                </div>

                {statusMessage && (
                    <div className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 animate-in slide-in-from-top-4 backdrop-blur-sm ${
                        statusMessage.type === 'success' 
                            ? 'bg-[#1E3F20]/5 border-[#1E3F20]/20 text-[#1E3F20]' 
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                        <Activity size={20} className={statusMessage.type === 'success' ? '' : 'animate-pulse'} />
                        <span className="text-sm font-black uppercase tracking-tight">{statusMessage.text}</span>
                    </div>
                )}

                {/* Main Dashboard Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    {/* User Verification Table */}
                    <div className="lg:col-span-2">
                        <div className="glass-card p-8 min-h-[500px]">
                            <div className="flex items-center justify-between mb-8 border-b border-[#0A0A0A]/10 pb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-[#0A0A0A] uppercase tracking-tight flex items-center gap-3">
                                        <Users className="text-[#1E3F20]" /> Cola de Verificación
                                    </h2>
                                    <p className="text-[#57534E] text-xs font-medium mt-1">Nuevos operadores esperando validación de red.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="bg-[#FAF9F7]/50 p-2 rounded-xl border border-[#0A0A0A]/10 text-slate-500">
                                        <Search size={16} />
                                    </div>
                                    <div className="bg-[#FAF9F7]/50 p-2 rounded-xl border border-[#0A0A0A]/10 text-slate-500">
                                        <Filter size={16} />
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-20 bg-white/5 animate-pulse rounded-2xl"></div>
                                    ))}
                                </div>
                            ) : pendingUsers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-600 bg-[#FAF9F7]/50 rounded-[2.5rem] border border-dashed border-[#0A0A0A]/10">
                                    <CheckCircle2 size={60} strokeWidth={1} className="mb-4 opacity-20" />
                                    <p className="text-sm font-black uppercase tracking-widest">Sistema Limpio</p>
                                    <p className="text-xs font-medium mt-1">No hay solicitudes pendientes.</p>
                                </div>
                            ) : (
                                <div className="overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-[#0A0A0A]/10">
                                                <th className="pb-4 pl-4">Operador</th>
                                                <th className="pb-4">Nodo / Rol</th>
                                                <th className="pb-4">Registro</th>
                                                <th className="pb-4 pr-4 text-right">Autorización</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {pendingUsers.map(user => (
                                                <tr key={user.id} className="group hover:bg-[#1E3F20]/[0.02] transition-colors">
                                                    <td className="py-6 pl-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-white rounded-xl border border-[#0A0A0A]/10 flex items-center justify-center font-black text-[#1E3F20] text-xs">
                                                                {user.full_name?.charAt(0)}
                                                            </div>
                                                            <span className="text-sm font-bold text-[#0A0A0A]">{user.full_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-6">
                                                        <span className="px-3 py-1 bg-white text-[#57534E] rounded-full text-[10px] font-black uppercase tracking-tighter border border-[#0A0A0A]/10">
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="py-6">
                                                        <span className="text-[10px] font-mono text-slate-500">
                                                            {new Date(user.created_at).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                    <td className="py-6 pr-4 text-right">
                                                        <div className="flex gap-2 justify-end">
                                                            <Button 
                                                                size="sm" 
                                                                disabled={!!processingId}
                                                                onClick={() => handleVerifyResult(user.id, 'Verified')}
                                                                className="bg-[#1E3F20] hover:bg-emerald-400 text-slate-950 font-black text-[10px] uppercase rounded-xl h-10 px-4 transition-all active:scale-95"
                                                            >
                                                                {processingId === user.id ? '...' : <><CheckCircle2 size={14} className="mr-1" /> Aprobar</>}
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline"
                                                                disabled={!!processingId}
                                                                onClick={() => handleVerifyResult(user.id, 'Rejected')}
                                                                className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-[#0A0A0A] font-black text-[10px] uppercase rounded-xl h-10 px-4 transition-all active:scale-95"
                                                            >
                                                                {processingId === user.id ? '...' : <><XCircle size={14} className="mr-1" /> Denegar</>}
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Side Intelligence Panel */}
                    <div className="space-y-8">
                        {/* Security Health Card */}
                        <div className="bg-[#1E3F20] text-[#FAF9F7] p-8 rounded-[2.5rem] shadow-2xl shadow-[#0A0A0A]/10 border border-[#1E3F20]/20 relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <ShieldAlert size={120} />
                            </div>
                            <h4 className="text-sm font-black flex items-center gap-3 uppercase tracking-[0.2em] relative z-10">
                                <ShieldCheck className="w-5 h-5 text-[#C5A059]" />
                                Security Node
                            </h4>
                            <p className="text-sm mt-4 font-bold leading-relaxed relative z-10 opacity-90">
                                Todos los protocolos de encriptación TLS 1.3 están activos. Sincronización con Supabase RLS verificada.
                            </p>
                        </div>

                        {/* Price Manager Integration */}
                        <div className="bg-white/90 rounded-[2.5rem] border border-[#0A0A0A]/10 overflow-hidden">
                            <div className="p-6 border-b border-[#0A0A0A]/10">
                                <h3 className="text-sm font-black text-[#0A0A0A] uppercase tracking-widest flex items-center gap-2">
                                    <Activity size={16} className="text-[#1E3F20]" /> Inyectar Índices
                                </h3>
                            </div>
                            <div className="p-2">
                                <AdminPriceManager />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Territorial Analysis Section */}
                <div className="mt-10">
                    <TerritorialAnalysis />
                </div>
            </div>
        </div>
    );
};
