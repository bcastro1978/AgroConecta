import { useState } from 'react';
import { supabase } from '../../lib/supabase';
// import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ShieldCheck, Sparkles, Activity } from 'lucide-react';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (loginError) throw loginError;
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF9F7] tech-grid flex items-center justify-center p-4 relative overflow-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1E3F20]/5 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#C5A059]/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="w-full max-w-[440px] relative z-10 animate-in fade-in zoom-in-95 duration-700">
                
                {/* Brand Header */}
                <div className="text-center mb-10">
                    <img src="/logo_final.png" alt="AgroConecta" className="h-16 w-auto mb-6  " style={{ transform: "scale(2.5)" }} />
                    <div className="flex items-center justify-center gap-3 mt-4">
                        <div className="h-px w-8 bg-white/10"></div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Precision Ecosystem</p>
                        <div className="h-px w-8 bg-white/10"></div>
                    </div>
                </div>

                <div className="glass-card p-10 relative group">
                    {/* Corner Decoration */}
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-20 transition-opacity">
                        <ShieldCheck size={60} className="text-[#1E3F20]" />
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-[#0A0A0A] uppercase tracking-tight leading-none">Acceso Terminal</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2">Introduce tus credenciales de seguridad</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                            <Activity size={18} className="text-red-500" />
                            <p className="text-[11px] font-black text-red-400 uppercase tracking-tight">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Correo Institucional</label>
                            <div className="relative group/input">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-[#1E3F20] transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    autoComplete="username"
                                    className="w-full bg-[#FAF9F7]/50 border border-[#0A0A0A]/10 rounded-2xl pl-14 pr-6 py-4 text-[#0A0A0A] font-bold outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-800"
                                    placeholder="usuario@agroconecta.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Clave de Enlace</label>
                            <div className="relative group/input">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-[#1E3F20] transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    className="w-full bg-[#FAF9F7]/50 border border-[#0A0A0A]/10 rounded-2xl pl-14 pr-6 py-4 text-[#0A0A0A] font-bold outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-800"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-5 bg-[#1E3F20] hover:bg-emerald-400 disabled:bg-[#FAF9F7] disabled:text-slate-600 text-slate-950 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <><div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div> PROCESANDO...</>
                            ) : (
                                <><LogIn size={20} /> INICIAR CONEXIÓN</>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-[#0A0A0A]/10 text-center">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                            ¿NUEVO OPERADOR?{' '}
                            <button 
                                onClick={() => navigate('/register')}
                                className="text-[#1E3F20] hover:text-[#1E3F20] font-black transition-colors"
                            >
                                CREAR REGISTRO AQUÍ
                            </button>
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-6 opacity-30">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-[#57534E]" />
                        <span className="text-[9px] font-black text-[#57534E] uppercase tracking-widest">Secure Link</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-[#57534E]" />
                        <span className="text-[9px] font-black text-[#57534E] uppercase tracking-widest">AI Core Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
