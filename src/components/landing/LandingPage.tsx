import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { 
    ArrowRight, 
    Terminal, 
    Compass, 
    Globe, 
    Sliders, 
    Check, 
    Truck, 
    Briefcase,
    ShieldAlert
} from 'lucide-react';

export const LandingPage = () => {
    const navigate = useNavigate();
    
    // Scanner Simulator States
    const [scanCoord, setScanCoord] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanLogs, setScanLogs] = useState<string[]>([]);
    const [scanResult, setScanResult] = useState<any>(null);

    const handleSimulateScan = (e: React.FormEvent) => {
        e.preventDefault();
        if (!scanCoord) return;
        
        setIsScanning(true);
        setScanResult(null);
        setScanLogs(["[SYSTEM] Inicializando conexión con satélites Copernicus Sentinel-1/2..."]);

        const logQueue = [
            "[OK] Enlace satelital activo (Órbita de referencia WGS84)",
            "[INFO] Descargando imagen radar SAR (Synthetic Aperture Radar) del 2026-07-01",
            "[PROCESS] Analizando topología y cerrando geometrías vectoriales...",
            "[PROCESS] Calculando solapamientos con límites prediales vecinos...",
            "[PROCESS] Verificando historial de deforestación contra Baseline de Diciembre 2020...",
            "[SYSTEM] Estructurando archivo de salida compatible con TRACES NT (GeoJSON)..."
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i < logQueue.length) {
                setScanLogs(prev => [...prev, logQueue[i]]);
                i++;
            } else {
                clearInterval(interval);
                setIsScanning(false);
                const isFailed = scanCoord.includes('0.8') || scanCoord.includes('79.');
                if (isFailed) {
                    setScanResult({
                        success: false,
                        crop: "Cacao (Theobroma cacao)",
                        deforestationFree: false,
                        area: "14.85 Hectáreas",
                        details: "Fallo: Pérdida forestal detectada en Q3 2022 (Afectación: 14.8%). Lote bloqueado para exportación UE."
                    });
                } else {
                    setScanResult({
                        success: true,
                        crop: "Café de Altura (Coffea arabica)",
                        deforestationFree: true,
                        area: "8.34 Hectáreas",
                        details: "Aprobado: 100% libre de deforestación histórica y reciente. Archivo TRACES NT GeoJSON generado correctamente."
                    });
                }
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-[#FAF9F7] text-[#0A0A0A] selection:bg-[#C5A059] selection:text-white font-sans antialiased">
            
            {/* Header / Navigation */}
            <header className="h-20 border-b border-[#0A0A0A]/10 bg-[#FAF9F7]/95 backdrop-blur-md px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                    <img src="/logo_final.png" alt="AgroConecta" className="h-12 w-auto" style={{ transform: "scale(2.5)" }} />
                </div>

                <nav className="hidden md:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.2em] text-[#57534E]">
                    <a href="#tecnologia" className="hover:text-black transition-colors">Tecnología Especializada</a>
                    <a href="#servicios" className="hover:text-black transition-colors">Ecosistema B2B / B2C</a>
                    <a href="#escaner" className="hover:text-black transition-colors">Verificación Live</a>
                </nav>

                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/login')}
                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#57534E] hover:text-black transition-colors py-2"
                    >
                        Acceso
                    </button>
                    <button 
                        onClick={() => navigate('/register')}
                        className="h-10 px-6 rounded-none bg-[#0A0A0A] hover:bg-[#2D2D2D] text-[#FAF9F7] text-[10px] font-bold uppercase tracking-[0.2em] transition-all active:scale-95"
                    >
                        Registro
                    </button>
                </div>
            </header>

            {/* HERO SECTION */}
            <section className="relative w-full border-b border-[#0A0A0A]/10 py-20 md:py-32 overflow-hidden bg-[#FAF9F7]">
                
                {/* Background Video */}
                <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="absolute inset-0 w-full h-full object-cover z-0 opacity-100"
                >
                    <source src="/bg-hero.mp4" type="video/mp4" />
                </video>
                
                {/* Overlay for contrast (Light theme) */}
                <div className="absolute inset-0 bg-[#FAF9F7]/75 z-10 backdrop-blur-[2px]"></div>

                <div className="container px-6 md:px-12 mx-auto relative z-20">
                    <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr] items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 bg-[#FAF9F7] border border-[#C5A059]/30 px-3 py-1 rounded-none text-[9px] font-bold text-[#C5A059] uppercase tracking-[0.25em]">
                                Normativa EUDR • Satélites de Observación Terrestre
                            </div>
                            <h1 
                                className="text-4xl md:text-6xl font-normal tracking-tight text-[#0A0A0A] uppercase leading-[1.05]"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                Trazabilidad satelital corporativa para agroexportadores.
                            </h1>
                            <p className="text-[#57534E] text-sm md:text-base max-w-xl leading-relaxed">
                                Facilitamos la debida diligencia para cadenas de valor libres de deforestación utilizando fusión multiespectral e imágenes de radar SAR. Empoderamos a los actores de la cadena agroexportadora para cumplir con el Reglamento **EU 2023/1115 (EUDR)**.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <button 
                                    onClick={() => navigate('/register')}
                                    className="h-14 px-8 rounded-none bg-[#0A0A0A] hover:bg-[#2D2D2D] text-[#FAF9F7] font-bold text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Registrar mi Cuenta <ArrowRight size={14} className="text-[#C5A059]" />
                                </button>
                                <a 
                                    href="#escaner" 
                                    className="h-14 px-8 rounded-none border border-[#0A0A0A]/20 bg-transparent hover:bg-[#FAF9F7] text-[#0A0A0A] font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center"
                                >
                                    Probar Escáner Live
                                </a>
                            </div>
                        </div>

                        {/* Interactive NATIVE SVG Satellite Orbit Visualization */}
                        <div className="relative w-full max-w-[400px] aspect-square mx-auto bg-[#FAF9F7] rounded-none p-6 border border-[#0A0A0A]/10 shadow-sm flex flex-col justify-between overflow-hidden">
                            <div className="flex justify-between items-center relative z-10 border-b border-[#0A0A0A]/10 pb-3">
                                <span className="text-[9px] font-mono text-[#0A0A0A]/60 font-bold uppercase tracking-widest">ORBITAL_SCAN_ECUADOR</span>
                                <span className="w-2 h-2 rounded-none bg-[#1E3F20]"></span>
                            </div>

                            {/* Rotating radar graphic in pure CSS/SVG */}
                            <div className="w-full flex items-center justify-center relative py-6">
                                <svg viewBox="0 0 200 200" className="w-40 h-40 text-[#C5A059]">
                                    <circle cx="100" cy="100" r="90" stroke="#0a0a0a" strokeWidth="0.5" strokeOpacity="0.15" fill="none" />
                                    <circle cx="100" cy="100" r="60" stroke="#0a0a0a" strokeWidth="0.5" strokeOpacity="0.15" fill="none" />
                                    <circle cx="100" cy="100" r="30" stroke="#0a0a0a" strokeWidth="0.5" strokeOpacity="0.15" fill="none" />
                                    <line x1="100" y1="10" x2="100" y2="190" stroke="#0a0a0a" strokeWidth="0.5" strokeOpacity="0.15" />
                                    <line x1="10" y1="100" x2="190" y2="100" stroke="#0a0a0a" strokeWidth="0.5" strokeOpacity="0.15" />
                                    
                                    {/* Scanning sweep */}
                                    <path d="M100,100 L163,37 A90,90 0 0,0 100,10 Z" fill="url(#sweepGrad)" className="origin-center animate-[spin_6s_linear_infinite]" />
                                    <defs>
                                        <radialGradient id="sweepGrad" cx="50%" cy="50%" r="50%">
                                            <stop offset="0%" stopColor="#C5A059" stopOpacity="0.25" />
                                            <stop offset="100%" stopColor="#C5A059" stopOpacity="0" />
                                        </radialGradient>
                                    </defs>
                                </svg>
                            </div>

                            <div className="border border-[#0A0A0A]/10 bg-white p-4 rounded-none relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="border border-[#1E3F20]/20 p-2 rounded-none text-[#1E3F20] bg-[#1E3F20]/5">
                                        <Check className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] text-[#57534E] font-bold uppercase tracking-widest">Cumplimiento UE</p>
                                        <p className="text-xs font-bold text-[#1E3F20] uppercase tracking-wider">Predio Certificado EUDR</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>



            {/* INTELIGENCIA SATELITAL COPERNICUS */}
            <section id="tecnologia" className="py-24 border-b border-[#0A0A0A]/10 bg-white">
                <div className="container px-6 md:px-12 mx-auto">
                    <div className="grid gap-16 lg:grid-cols-2 items-center">
                        <div className="space-y-6">
                            <span className="text-[9px] font-bold text-[#C5A059] uppercase tracking-[0.2em]">Inteligencia Satelital (Copernicus)</span>
                            <h2 
                                className="text-3xl md:text-5xl font-normal tracking-tight text-[#0A0A0A] uppercase leading-none"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                Monitoreo Agronómico y Trazabilidad EUDR
                            </h2>
                            <p className="text-[#57534E] text-sm leading-relaxed">
                                **Para Exportadores y Asociaciones:** Automatiza tu análisis de riesgo sin costosas visitas a ciegas al campo. Evalúa miles de hectáreas en segundos, obteniendo coordenadas precisas y reportes de debida diligencia EUDR listos para exportar.
                            </p>
                            
                            <div className="grid gap-6 pt-4 text-xs md:grid-cols-2">
                                <div className="p-6 border border-[#0A0A0A]/10 bg-[#FAF9F7] rounded-none">
                                    <h4 className="font-bold text-[#0A0A0A] uppercase mb-2">Reducción de Costos</h4>
                                    <p className="text-[#57534E] leading-relaxed">Elimina las visitas físicas innecesarias; usa sensores ópticos y radar para conocer el estado de las parcelas desde tu oficina.</p>
                                </div>
                                <div className="p-6 border border-[#0A0A0A]/10 bg-[#FAF9F7] rounded-none">
                                    <h4 className="font-bold text-[#0A0A0A] uppercase mb-2">Exportaciones Seguras</h4>
                                    <p className="text-[#57534E] leading-relaxed">Genera la evidencia inmutable de cero deforestación (Baseline 2020) que exigen los mercados europeos.</p>
                                </div>
                            </div>
                        </div>

                        {/* AI Generated Image */}
                        <div className="relative border border-[#0A0A0A]/10 shadow-lg bg-[#FAF9F7] p-2">
                            <img 
                                src="/img_satelite.png" 
                                alt="Ilustración IA Satélite Copernicus"
                                className="w-full h-auto object-cover grayscale-[30%] contrast-[1.1] hover:grayscale-0 transition-all duration-700" 
                            />
                            <div className="absolute top-6 right-6 border border-[#0A0A0A]/10 bg-white/90 backdrop-blur-sm px-3 py-1">
                                <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-[#C5A059]">COPERNICUS_ORBIT</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ECOSISTEMA B2B & SMART LEADS */}
            <section id="servicios" className="py-24 border-b border-[#0A0A0A]/10 bg-[#FAF9F7]">
                <div className="container px-6 md:px-12 mx-auto">
                    <div className="grid gap-16 lg:grid-cols-2 items-center lg:flex-row-reverse">
                        
                        {/* AI Generated Image (Left side) */}
                        <div className="relative border border-[#0A0A0A]/10 shadow-lg bg-white p-2 order-last lg:order-first">
                            <img 
                                src="/img_b2b.png" 
                                alt="Ilustración IA Mercado B2B"
                                className="w-full h-auto object-cover grayscale-[30%] contrast-[1.1] hover:grayscale-0 transition-all duration-700" 
                            />
                            <div className="absolute top-6 left-6 border border-[#0A0A0A]/10 bg-white/90 backdrop-blur-sm px-3 py-1">
                                <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-[#C5A059]">AGRO_MARKET_NODE</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <span className="text-[9px] font-bold text-[#C5A059] uppercase tracking-[0.2em]">Mercado y Asociaciones</span>
                            <h2 
                                className="text-3xl md:text-5xl font-normal tracking-tight text-[#0A0A0A] uppercase leading-none"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                Ecosistema B2B y Prospección
                            </h2>
                            <p className="text-[#57534E] text-sm leading-relaxed">
                                **Para Productores y Compradores:** Una conexión comercial sin fricciones. Los productores obtienen acceso a nuevos mercados publicando su oferta verificada, mientras los compradores localizan la materia prima exacta que necesitan.
                            </p>

                            <div className="pt-4 space-y-4">
                                <div className="p-5 border border-[#0A0A0A]/10 bg-white shadow-sm flex items-start gap-4">
                                    <div className="p-2 bg-[#FAF9F7] text-[#C5A059] border border-[#0A0A0A]/5">
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#0A0A0A] text-xs uppercase mb-1">Mejores Precios (Productor)</h4>
                                        <p className="text-[#57534E] text-xs leading-relaxed">Accede a cotizaciones directas de compradores internacionales, eliminando intermediarios y maximizando tus márgenes.</p>
                                    </div>
                                </div>

                                <div className="p-5 border border-[#0A0A0A]/10 bg-white shadow-sm flex items-start gap-4">
                                    <div className="p-2 bg-[#FAF9F7] text-[#C5A059] border border-[#0A0A0A]/5">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#0A0A0A] text-xs uppercase mb-1">Abastecimiento (Comprador)</h4>
                                        <p className="text-[#57534E] text-xs leading-relaxed">Usa mapas de calor para encontrar asociaciones estratégicas y lanzar ofertas a lotes que ya cumplen la norma EUDR.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => navigate('/register')}
                                className="mt-4 h-12 px-8 border border-[#0A0A0A] hover:bg-[#0A0A0A] text-[#0A0A0A] hover:text-[#FAF9F7] font-bold text-xs uppercase tracking-widest rounded-none transition-all"
                            >
                                Explorar Mercado B2B
                            </button>
                        </div>

                    </div>
                </div>
            </section>

            {/* LIVE COMMAND TERMINAL / SCANNER */}
            <section id="escaner" className="py-24 bg-white relative border-b border-[#0A0A0A]/10">
                <div className="container px-6 md:px-12 mx-auto">
                    <div className="grid gap-12 lg:grid-cols-2 items-center">
                        <div className="space-y-6">
                            <span className="text-[9px] font-bold text-[#C5A059] uppercase tracking-[0.2em]">Consola de Verificación</span>
                            <h2 
                                className="text-3xl md:text-5xl font-normal tracking-tight text-[#0A0A0A] uppercase leading-none"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                Auditor de Fincas Live
                            </h2>
                            <p className="text-[#57534E] text-sm leading-relaxed">
                                Ingrese las coordenadas geográficas reales en formato WGS84 para simular un proceso de auditoría y validación automática del reglamento europeo:
                            </p>
                            
                            <div className="p-5 border border-[#0A0A0A]/10 bg-[#FAF9F7] rounded-none font-mono text-xs text-slate-500 space-y-2">
                                <p className="text-[#C5A059]">// Coordenadas de prueba en Ecuador:</p>
                                <p className="cursor-pointer hover:text-[#0A0A0A]" onClick={() => setScanCoord("-78.500001, 1.400001")}>
                                    • Loja (Café, Libre de Deforestación): <span className="underline text-slate-900">-78.500001, 1.400001</span>
                                </p>
                                <p className="cursor-pointer hover:text-[#0A0A0A]" onClick={() => setScanCoord("-79.450001, 0.850001")}>
                                    • Esmeraldas (Cacao, Con Deforestación Histórica): <span className="underline text-slate-900">-79.450001, 0.850001</span>
                                </p>
                            </div>
                        </div>

                        {/* Terminal Emulator (Vintage Ledger UI) */}
                        <div className="border border-[#0A0A0A]/10 bg-[#FAF9F7] rounded-none overflow-hidden font-mono shadow-sm">
                            {/* Terminal Header */}
                            <div className="h-11 bg-white px-4 flex items-center justify-between border-b border-[#0A0A0A]/10">
                                <div className="flex items-center gap-2">
                                    <Terminal size={12} className="text-[#C5A059]" />
                                    <span className="text-xs text-[#57534E] font-bold">bitacora-satelital@agroconecta</span>
                                </div>
                            </div>
                            
                            {/* Terminal Body */}
                            <div className="p-6 space-y-4">
                                <form onSubmit={handleSimulateScan} className="flex gap-3">
                                    <span className="text-[#C5A059]">&gt;</span>
                                    <input 
                                        type="text" 
                                        placeholder="Coordenadas Lat, Lon..."
                                        className="bg-transparent border-none outline-none text-[#0A0A0A] w-full text-xs placeholder:text-slate-300 font-mono"
                                        value={scanCoord}
                                        onChange={(e) => setScanCoord(e.target.value)}
                                        disabled={isScanning}
                                    />
                                    <button 
                                        type="submit" 
                                        className="text-xs text-[#0A0A0A] hover:text-[#C5A059] font-bold"
                                        disabled={isScanning}
                                    >
                                        [AUDITAR]
                                    </button>
                                </form>

                                {/* System Logs */}
                                <div className="space-y-1.5 pt-2 border-t border-[#0A0A0A]/10 text-[11px] text-[#57534E] max-h-[180px] overflow-y-auto">
                                    {scanLogs.map((log, idx) => (
                                        <p key={idx}>{log}</p>
                                    ))}
                                </div>

                                {/* Results display */}
                                {scanResult && (
                                    <div className="mt-4 p-4 border border-[#0A0A0A]/10 bg-white rounded-none space-y-2 text-xs">
                                        <div className="flex justify-between items-center border-b border-[#0A0A0A]/10 pb-2 mb-2">
                                            <span className="font-bold text-[#0A0A0A] uppercase">[RESULTADO]</span>
                                            <span className={`font-bold uppercase ${scanResult.success ? 'text-[#1E3F20]' : 'text-red-700'}`}>
                                                {scanResult.success ? "APROBADO" : "BLOQUEADO"}
                                            </span>
                                        </div>
                                        <p className="text-[#57534E]">Especie: <span className="text-[#0A0A0A] font-bold">{scanResult.crop}</span></p>
                                        <p className="text-[#57534E]">Área: <span className="text-[#0A0A0A] font-bold">{scanResult.area}</span></p>
                                        <p className="text-[#57534E] leading-relaxed">{scanResult.details}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-16 bg-[#FAF9F7] text-xs text-[#57534E]">
                <div className="container px-6 md:px-12 mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                          <div className="flex items-center mb-6">
                              <img src="/logo_final.png" alt="AgroConecta" className="h-10 w-auto  " style={{ transform: "scale(2.5)" }} />
                          </div>
                    <p className="text-center md:text-left">
                        © 2026 AgroConecta. Red B2B y Monitoreo Satelital de Deforestación en Ecuador. Todos los derechos reservados.
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-black transition-colors">Privacidad</a>
                        <a href="#" className="hover:text-black transition-colors">Términos</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
