import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { MapPin, User, Mail, Lock, Briefcase, Navigation, MousePointer2, ShieldCheck, Activity, CheckCircle2, ChevronLeft, Phone } from 'lucide-react';
import type { UserRole } from '../../types';
import { ECUADOR_LOCATIONS } from '../../lib/locationData';
import { MapSelector } from '../ui/MapSelector';

export const RegisterPage = () => {
    const [step, setStep] = useState<'register' | 'verify'>('register');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<UserRole>('Productor');
    const [provinciaId, setProvinciaId] = useState('');
    const [cantonId, setCantonId] = useState('');
    const [parroquiaId, setParroquiaId] = useState('');
    const [address, setAddress] = useState('');
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [error, setError] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const navigate = useNavigate();

    const handleGetLocation = () => {
        setLocating(true);
        setError('');
        if (!navigator.geolocation) {
            setError('Geolocalización no soportada en este navegador');
            setLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLocating(false);
            },
            (err) => {
                setError('Error al obtener ubicación: ' + err.message);
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!location) {
            setError('Por favor georeferencia tu ubicación antes de registrarte');
            setLoading(false);
            return;
        }

        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role,
                        phone_number: phoneNumber,
                        address: address,
                        provincia: ECUADOR_LOCATIONS.provincias.find(p => p.id === provinciaId)?.name,
                        canton: ECUADOR_LOCATIONS.cantones.find(c => c.id === cantonId)?.name,
                        parroquia: ECUADOR_LOCATIONS.parroquias.find(p => p.id === parroquiaId)?.name,
                        location_ref_lat: location.lat,
                        location_ref_lng: location.lng
                    },
                },
            });

            if (signUpError) throw signUpError;

            const { error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (!loginError) {
                navigate('/dashboard');
                return;
            }

            setStep('verify');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF9F7] tech-grid flex items-center justify-center p-4 py-12 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#1E3F20]/5 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#C5A059]/10 blur-[120px] rounded-full"></div>

            <div className="w-full max-w-2xl relative z-10 animate-in fade-in zoom-in-95 duration-700">
                
                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="mb-6 cursor-pointer" onClick={() => navigate('/')}>
                        <img src="/logo_final.png" alt="AgroConecta" className="h-16 w-auto" style={{ transform: "scale(2)" }} />
                    </div>
                    <h1 className="text-4xl font-black text-[#0A0A0A] tracking-tighter uppercase text-center mt-4">
                        {step === 'register' ? <>Únete a la <span className="text-[#1E3F20]">Red B2B</span></> : 'Verificación de Enlace'}
                    </h1>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mt-3">Siguiente Generación Agrotech</p>
                </div>

                <div className="glass-card p-10">
                    {error && (
                        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                            <Activity size={18} className="text-red-500" />
                            <p className="text-[11px] font-black text-red-400 uppercase tracking-tight">{error}</p>
                        </div>
                    )}

                    {step === 'register' ? (
                        <form onSubmit={handleRegister} className="space-y-10">
                            
                            {/* Section: Identidad */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-[#0A0A0A]/10 pb-4">
                                    <div className="w-2 h-2 bg-[#1E3F20] rounded-full"></div>
                                    <h3 className="text-xs font-black text-[#0A0A0A] uppercase tracking-widest">01. Perfil del Operador</h3>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                                        <div className="relative group/input">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-[#1E3F20] transition-colors w-4 h-4" />
                                            <input
                                                type="text"
                                                required
                                                className="w-full bg-[#FAF9F7]/50 border border-[#0A0A0A]/10 rounded-2xl pl-12 pr-4 py-4 text-[#0A0A0A] font-bold outline-none focus:border-emerald-500/50 transition-all text-sm"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Correo Institucional</label>
                                        <div className="relative group/input">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-[#1E3F20] transition-colors w-4 h-4" />
                                            <input
                                                type="email"
                                                required
                                                className="w-full bg-[#FAF9F7]/50 border border-[#0A0A0A]/10 rounded-2xl pl-12 pr-4 py-4 text-[#0A0A0A] font-bold outline-none focus:border-emerald-500/50 transition-all text-sm"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Número de Contacto</label>
                                        <div className="relative group/input">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-[#1E3F20] transition-colors w-4 h-4" />
                                            <input
                                                type="tel"
                                                required
                                                placeholder="Ej. +593987654321"
                                                className="w-full bg-[#FAF9F7]/50 border border-[#0A0A0A]/10 rounded-2xl pl-12 pr-4 py-4 text-[#0A0A0A] font-bold outline-none focus:border-emerald-500/50 transition-all text-sm"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Clave de Acceso</label>
                                        <div className="relative group/input">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-[#1E3F20] transition-colors w-4 h-4" />
                                            <input
                                                type="password"
                                                required
                                                className="w-full bg-[#FAF9F7]/50 border border-[#0A0A0A]/10 rounded-2xl pl-12 pr-4 py-4 text-[#0A0A0A] font-bold outline-none focus:border-emerald-500/50 transition-all text-sm"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Rol en el Ecosistema</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4 pointer-events-none" />
                                            <select
                                                className="w-full bg-[#FAF9F7]/50 border border-[#0A0A0A]/10 rounded-2xl pl-12 pr-4 py-4 text-[#0A0A0A] font-bold outline-none focus:border-emerald-500/50 transition-all text-sm appearance-none cursor-pointer"
                                                value={role}
                                                onChange={(e) => setRole(e.target.value as UserRole)}
                                            >
                                                <option value="Productor">Productor (Vendedor)</option>
                                                <option value="Comprador">Comprador Industrial</option>
                                                <option value="Proveedor">Proveedor de Servicios</option>
                                                <option value="Transportista">Logística / Transporte</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Ubicación */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-[#0A0A0A]/10 pb-4">
                                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                                    <h3 className="text-xs font-black text-[#0A0A0A] uppercase tracking-widest">02. Geo-Referenciación</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <select
                                        required
                                        className="bg-[#FAF9F7]/50 border border-[#0A0A0A]/10 rounded-2xl px-4 py-4 text-[#0A0A0A] font-bold outline-none focus:border-emerald-500/50 transition-all text-xs"
                                        value={provinciaId}
                                        onChange={(e) => {
                                            setProvinciaId(e.target.value);
                                            setCantonId('');
                                            setParroquiaId('');
                                        }}
                                    >
                                        <option value="">Provincia...</option>
                                        {ECUADOR_LOCATIONS.provincias.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    <select
                                        required
                                        disabled={!provinciaId}
                                        className="bg-[#FAF9F7]/50 border border-[#0A0A0A]/10 rounded-2xl px-4 py-4 text-[#0A0A0A] font-bold outline-none focus:border-emerald-500/50 transition-all text-xs disabled:opacity-30"
                                        value={cantonId}
                                        onChange={(e) => {
                                            setCantonId(e.target.value);
                                            setParroquiaId('');
                                        }}
                                    >
                                        <option value="">Cantón...</option>
                                        {ECUADOR_LOCATIONS.cantones
                                            .filter(c => c.id.startsWith(provinciaId) || c.provinciaId === provinciaId)
                                            .map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                    </select>
                                    <select
                                        required
                                        disabled={!cantonId}
                                        className="bg-[#FAF9F7]/50 border border-[#0A0A0A]/10 rounded-2xl px-4 py-4 text-[#0A0A0A] font-bold outline-none focus:border-emerald-500/50 transition-all text-xs disabled:opacity-30"
                                        value={parroquiaId}
                                        onChange={(e) => setParroquiaId(e.target.value)}
                                    >
                                        <option value="">Parroquia...</option>
                                        {ECUADOR_LOCATIONS.parroquias
                                            .filter(p => p.cantonId === cantonId)
                                            .map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                    </select>
                                </div>

                                <div className="relative group/input">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-[#1E3F20] transition-colors w-4 h-4" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Dirección Específica / Barrio / Referencia"
                                        className="w-full bg-[#FAF9F7]/50 border border-[#0A0A0A]/10 rounded-2xl pl-12 pr-4 py-4 text-[#0A0A0A] font-bold outline-none focus:border-emerald-500/50 transition-all text-sm placeholder:text-slate-700"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                </div>

                                <div className="bg-[#FAF9F7]/40 p-6 rounded-[2.5rem] border border-[#0A0A0A]/10">
                                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className={`flex-1 flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest h-14 rounded-full transition-all ${location && !showMap ? 'bg-[#1E3F20] text-slate-950 border-transparent' : 'bg-white/5 text-[#57534E] border-[#0A0A0A]/10 hover:bg-white/10'}`}
                                            onClick={() => {
                                                handleGetLocation();
                                                setShowMap(false);
                                            }}
                                            disabled={locating}
                                        >
                                            <Navigation className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} />
                                            {locating ? 'Triangulando...' : location ? 'GPS: Bloqueado ✓' : 'Capturar GPS'}
                                        </Button>
                                        
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className={`flex-1 flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest h-14 rounded-full transition-all ${showMap ? 'bg-cyan-500 text-slate-950 border-transparent' : 'bg-white/5 text-[#57534E] border-[#0A0A0A]/10 hover:bg-white/10'}`}
                                            onClick={() => setShowMap(!showMap)}
                                        >
                                            <MousePointer2 className="w-4 h-4" />
                                            {showMap ? 'Confirmar Punto' : 'Ajuste Manual'}
                                        </Button>
                                    </div>

                                    {showMap && (
                                        <div className="animate-in fade-in zoom-in-95 duration-500 rounded-[2rem] overflow-hidden border border-[#0A0A0A]/10 h-[300px]">
                                            <MapSelector 
                                                value={location} 
                                                onChange={(val) => setLocation(val)} 
                                                searchQuery={`${ECUADOR_LOCATIONS.parroquias.find(p => p.id === parroquiaId)?.name || ''}, ${ECUADOR_LOCATIONS.cantones.find(c => c.id === cantonId)?.name || ''}, ${ECUADOR_LOCATIONS.provincias.find(p => p.id === provinciaId)?.name || ''}`}
                                            />
                                        </div>
                                    )}

                                    {location && !showMap && (
                                        <div className="text-center py-4 bg-[#1E3F20]/5 rounded-2xl border border-emerald-500/10">
                                            <p className="text-[10px] font-black text-[#1E3F20] uppercase tracking-[0.2em]">Coordenadas Registradas</p>
                                            <p className="text-xs text-[#0A0A0A] font-mono mt-1">
                                                {location.lat.toFixed(6)} N • {location.lng.toFixed(6)} W
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-6 bg-[#1E3F20] hover:bg-emerald-400 disabled:bg-[#FAF9F7] disabled:text-slate-600 text-slate-950 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] transition-all shadow-2xl shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <><div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div> CREANDO REGISTRO...</>
                                ) : (
                                    <><CheckCircle2 size={20} /> FINALIZAR INSCRIPCIÓN</>
                                )}
                            </button>

                            <div className="text-center">
                                <button 
                                    onClick={() => navigate('/login')}
                                    className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-[#0A0A0A] transition-colors"
                                >
                                    ¿Ya tienes cuenta? <span className="text-[#1E3F20] underline underline-offset-4 ml-2">Identifícate</span>
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="inline-flex p-6 bg-[#1E3F20]/5 rounded-full text-[#1E3F20] mb-4 border border-[#1E3F20]/20 shadow-2xl shadow-[#0A0A0A]/10">
                                <Mail size={48} className="animate-bounce" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black text-[#0A0A0A] uppercase tracking-tighter italic">Verifica tu Enlace</h3>
                                <p className="text-[#57534E] font-medium">Hemos enviado un protocolo de confirmación a:</p>
                                <div className="bg-white border border-[#0A0A0A]/10 p-4 rounded-2xl inline-block mx-auto">
                                    <p className="text-[#1E3F20] font-black text-lg">{email}</p>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                                    Para activar tu acceso a la red AgroConecta, por favor haz clic en el enlace de seguridad enviado a tu buzón.
                                </p>
                            </div>

                            <div className="pt-8 border-t border-[#0A0A0A]/10">
                                <Button
                                    className="w-full h-14 bg-white/5 border-[#0A0A0A]/10 text-[#0A0A0A] hover:bg-white/10 font-black text-xs uppercase tracking-widest rounded-full"
                                    onClick={() => navigate('/login')}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" /> Volver al Inicio
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-12 flex items-center justify-center gap-8 opacity-20">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-[#57534E]" />
                        <span className="text-[10px] font-black text-[#57534E] uppercase tracking-widest">TLS 1.3 Encryption</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Activity size={16} className="text-[#57534E]" />
                        <span className="text-[10px] font-black text-[#57534E] uppercase tracking-widest">Global Node Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
