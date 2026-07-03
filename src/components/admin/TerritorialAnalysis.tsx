import { useState, useEffect } from 'react';
// import { supabase } from '../../lib/supabase';
import { LeadsearchMap } from './LeadsearchMap';
import { AnalysisResults } from './AnalysisResults';
import { getProvincias, getCantones, getParroquias } from '@lobo.cyber.ec/ecuador-geo';
import { Loader2, Search, Map as MapIcon, Sprout } from 'lucide-react';
import type { LatLngExpression } from 'leaflet';

export const TerritorialAnalysis = () => {
    const [province, setProvince] = useState('');
    const [canton, setCanton] = useState('');
    const [parish, setParish] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isResultsOpen, setIsResultsOpen] = useState(false);
    const [resultsData, setResultsData] = useState<any>(null);
    
    // Derived state for dynamic dropdowns
    const provincias = getProvincias();
    const cantones = province ? getCantones(province) : [];
    const parroquias = canton ? getParroquias(province, canton) : [];

    // Reset dependents when parent changes
    useEffect(() => { setCanton(''); setParish(''); }, [province]);
    useEffect(() => { setParish(''); }, [canton]);

    // Parche para corregir errores de coordenadas en la librería offline (Ej: Bolívar en Carchi)
    const getCorrectedCoordinates = (codigo: string, defaultLat: number, defaultLng: number) => {
        if (codigo === '0402') {
            return { lat: 0.50, lng: -77.93 }; // Coordenadas reales de Bolívar, Carchi
        }
        return { lat: defaultLat, lng: defaultLng };
    };

    // Estado mockeado de parcelas
    const initialMockParcels = [
        {
            id: '1',
            coordinates: [[-1.25, -78.5], [-1.25, -78.48], [-1.27, -78.48], [-1.27, -78.5]],
            needType: 'Fertilizante',
            description: 'NDVI bajo detectado. Cultivo probable: Maíz. Se necesita nitrógeno.',
            status: 'Pendiente',
            suggestedProducts: ['Urea Agrícola 46%', 'Biofertilizante Orgánico']
        },
        {
            id: '2',
            coordinates: [[-1.28, -78.45], [-1.28, -78.42], [-1.30, -78.42], [-1.30, -78.45]],
            needType: 'Riego',
            description: 'Estrés hídrico detectado en imágenes térmicas recientes.',
            status: 'Contactado',
            suggestedProducts: ['Sistema de Riego por Goteo', 'Sensores de Humedad de Suelo']
        },
        {
            id: '3',
            coordinates: [[-1.22, -78.52], [-1.22, -78.50], [-1.24, -78.50], [-1.24, -78.52]],
            needType: 'Mejoramiento',
            description: 'Cultivo sano, pero con potencial para mejorar rendimiento.',
            status: 'Pendiente',
            suggestedProducts: ['Asesoría Agronómica', 'Abono Foliar']
        }
    ];

    const [parcels, setParcels] = useState<any[]>(initialMockParcels);
    const [mapCenter, setMapCenter] = useState<LatLngExpression>([-1.8312, -78.1834]); 
    const [mapZoom, setMapZoom] = useState(6);

    // Dynamic map centering based on selection
    useEffect(() => {
        if (parish) {
            // Parroquias from this package don't include lat/lng directly in the basic list. 
            // We zoom in further based on the Canton's center.
            const selectedCanton = cantones.find((c: any) => c.codigo === canton);
            if (selectedCanton?.lat && selectedCanton?.lng) {
                const coords = getCorrectedCoordinates(canton, selectedCanton.lat, selectedCanton.lng);
                setMapCenter([coords.lat, coords.lng]);
                setMapZoom(13); // Closer zoom for Parroquia
            }
        } else if (canton) {
            const selectedCanton = cantones.find((c: any) => c.codigo === canton);
            if (selectedCanton?.lat && selectedCanton?.lng) {
                const coords = getCorrectedCoordinates(canton, selectedCanton.lat, selectedCanton.lng);
                setMapCenter([coords.lat, coords.lng]);
                setMapZoom(11); // Medium zoom for Canton
            }
        } else if (province) {
            const selectedProv = provincias.find((p: any) => p.codigo === province);
            if (selectedProv?.lat && selectedProv?.lng) {
                setMapCenter([selectedProv.lat, selectedProv.lng]);
                setMapZoom(8); // Broad zoom for Province
            }
        } else {
            setMapCenter([-1.8312, -78.1834]);
            setMapZoom(6);
        }
    }, [province, canton, parish, provincias, cantones]);

    const handleStartAnalysis = async () => {
        if (!province || !canton) {
            alert('Por favor selecciona al menos la Provincia y el Cantón para analizar.');
            return;
        }

        setIsAnalyzing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2500));

            // Para asegurar que los polígonos mockeados se vean en cualquier cantón seleccionado,
            // calculamos la diferencia entre el centro base de los mocks y el cantón actual y trasladamos los polígonos.
            const selectedCanton = cantones.find((c: any) => c.codigo === canton);
            if (selectedCanton?.lat && selectedCanton?.lng) {
                const coords = getCorrectedCoordinates(canton, selectedCanton.lat, selectedCanton.lng);
                const baseLat = -1.26;
                const baseLng = -78.48;
                const dLat = coords.lat - baseLat;
                const dLng = coords.lng - baseLng;

                const shiftedParcels = initialMockParcels.map(parcel => ({
                    ...parcel,
                    coordinates: parcel.coordinates.map(coord => [
                        coord[0] + dLat,
                        coord[1] + dLng
                    ])
                }));

                setParcels(shiftedParcels);
                setMapCenter([coords.lat, coords.lng]);
                setMapZoom(11);
            } else {
                setParcels(initialMockParcels);
            }

            // Establecer resultados y abrir panel
            setResultsData({ totalParcels: 3, leadsCount: 3 });
            setIsResultsOpen(true);

        } catch (error) {
            console.error('Error starting analysis:', error);
            alert('Hubo un error al iniciar el análisis territorial.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="glass-card p-8 relative">
            <div className="flex items-center gap-3 mb-8 border-b border-[#0A0A0A]/10 pb-6">
                <div className="bg-[#1E3F20]/10 p-3 rounded-xl border border-[#1E3F20]/20">
                    <MapIcon className="w-6 h-6 text-[#1E3F20]" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-[#0A0A0A] uppercase tracking-tight">Análisis Territorial y Leadsearch</h2>
                    <p className="text-[#57534E] text-xs font-medium mt-1">Exploración satelital y detección de leads agrícolas mediante IA.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-[#57534E] mb-2">Provincia</label>
                    <select 
                        value={province} 
                        onChange={(e) => setProvince(e.target.value)}
                        className="w-full bg-[#FAF9F7] border border-[#0A0A0A]/10 rounded-lg px-4 py-2.5 text-[#0A0A0A] focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                        <option value="">Seleccionar...</option>
                        {provincias.map((prov: any) => (
                            <option key={prov.codigo} value={prov.codigo}>{prov.nombre}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#57534E] mb-2">Cantón</label>
                    <select 
                        value={canton} 
                        onChange={(e) => setCanton(e.target.value)}
                        disabled={!province}
                        className="w-full bg-[#FAF9F7] border border-[#0A0A0A]/10 rounded-lg px-4 py-2.5 text-[#0A0A0A] focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
                    >
                        <option value="">Seleccionar...</option>
                        {cantones.map((cant: any) => (
                            <option key={cant.codigo} value={cant.codigo}>{cant.nombre}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#57534E] mb-2">Parroquia (Opcional)</label>
                    <select 
                        value={parish} 
                        onChange={(e) => setParish(e.target.value)}
                        disabled={!canton}
                        className="w-full bg-[#FAF9F7] border border-[#0A0A0A]/10 rounded-lg px-4 py-2.5 text-[#0A0A0A] focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
                    >
                        <option value="">Todas</option>
                        {parroquias.map((par: any) => (
                            <option key={par.codigo} value={par.codigo}>{par.nombre}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <button
                        onClick={handleStartAnalysis}
                        disabled={isAnalyzing || !province || !canton}
                        className="w-full bg-[#1E3F20] hover:bg-[#1E3F20] disabled:bg-[#e5e5e5] disabled:cursor-not-allowed text-[#FAF9F7] font-medium px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                        {isAnalyzing ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Analizando...</>
                        ) : (
                            <><Search className="w-5 h-5" /> Extraer y Analizar</>
                        )}
                    </button>
                </div>
            </div>
            
            <div className="mt-6 p-4 bg-[#1E3F20]/5 border border-[#1E3F20]/20 rounded-xl flex items-start gap-3 backdrop-blur-sm">
                <Sprout className="w-5 h-5 text-[#1E3F20] mt-0.5 shrink-0" />
                <p className="text-sm text-[#57534E] font-medium">
                    Al ejecutar el análisis, el <strong>Agente Trazador</strong> generará los polígonos de las parcelas. Luego, el <strong>Agente Satelital</strong> extraerá imágenes de Copernicus del último mes, y el <strong>Analista de Negocios</strong> deducirá las necesidades (leads) para proteger, mejorar o reducir pérdidas en los cultivos.
                </p>
            </div>

            <div className="mt-8 border border-[#0A0A0A]/10 rounded-2xl overflow-hidden shadow-2xl relative">
                <LeadsearchMap 
                    parcels={parcels} 
                    center={mapCenter} 
                    zoom={mapZoom} 
                />
            </div>

            {/* Analysis Results Slide-over Panel */}
            <AnalysisResults 
                isOpen={isResultsOpen} 
                onClose={() => setIsResultsOpen(false)} 
                results={resultsData} 
            />
        </div>
    );
};
