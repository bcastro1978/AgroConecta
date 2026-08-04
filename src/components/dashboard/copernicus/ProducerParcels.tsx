import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth/AuthProvider';
import { MapContainer, TileLayer, GeoJSON, useMapEvents, Polygon, CircleMarker, useMap, ImageOverlay, Polyline } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Leaf, MapPin, Undo2, Trash2, CheckCircle2, Navigation, Edit2, Eye, X, FileCheck, Info, Satellite, Layers, AlertTriangle } from 'lucide-react';
import { ECUADOR_LOCATIONS } from '../../../lib/locationData';
import { TraceabilityReport } from './TraceabilityReport';

// Componente para manejar los clics y el trazado en el mapa geoespacial
const MapDrawer = ({ 
    points, 
    setPoints, 
    isDrawing,
    onPointClick
}: { 
    points: LatLngTuple[], 
    setPoints: (p: LatLngTuple[]) => void, 
    isDrawing: boolean,
    onPointClick?: (index: number) => void
}) => {
    useMapEvents({
        click(e) {
            if (!isDrawing) return;
            setPoints([...points, [e.latlng.lat, e.latlng.lng]]);
        }
    });

    return (
        <>
            {points.length > 0 && (
                <Polygon 
                    positions={points} 
                    pathOptions={{ color: '#10b981', weight: 3, fillColor: '#10b981', fillOpacity: 0.3, dashArray: '5, 10' }} 
                />
            )}
            {points.map((p, i) => (
                <CircleMarker 
                    key={i} 
                    center={p} 
                    radius={onPointClick ? 8 : 6} 
                    pathOptions={{ color: '#10b981', fillColor: onPointClick ? '#fbbf24' : '#fff', fillOpacity: 1, weight: 3 }} 
                    eventHandlers={{
                        click: (e) => {
                            if (onPointClick) {
                                e.originalEvent.stopPropagation();
                                onPointClick(i);
                            }
                        }
                    }}
                />
            ))}
        </>
    );
};

// Componente para forzar el auto-centrado del mapa
const MapAutoCenter = ({ position, zoom }: { position: LatLngTuple | null, zoom: number }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            // Asegurar que el mapa reconozca su tamaño real antes de volar
            map.invalidateSize();
            const timer = setTimeout(() => {
                map.flyTo(position, zoom, { 
                    duration: 2,
                    easeLinearity: 0.25,
                    noMoveStart: true
                });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [position, zoom, map]);
    return null;
};

export const ProducerParcels = ({ 
    hideList = false, 
    activeEditParcel = null, 
    onCancelEdit = () => {} 
}: { 
    hideList?: boolean, 
    activeEditParcel?: any, 
    onCancelEdit?: () => void 
}) => {
    const { user } = useAuth();
    const [parcels, setParcels] = useState<any[]>([]);
    const [crop, setCrop] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Estados Espaciales
    const [isDrawing, setIsDrawing] = useState(false);
    const [points, setPoints] = useState<LatLngTuple[]>([]);
    const [editingParcelId, setEditingParcelId] = useState<string | null>(null);
    const [viewingParcel, setViewingParcel] = useState<any>(null);
    
    // Estados de Búsqueda
    const [provId, setProvId] = useState('');
    const [cantId, setCantId] = useState('');
    const [parrId, setParrId] = useState('');
    const [mapCenter, setMapCenter] = useState<LatLngTuple | null>(null);
    const [zoomLevel, setZoomLevel] = useState(6);
    const [isSearchingGps, setIsSearchingGps] = useState(false);
    
    // Estado del Mapa
    const [mapLayer, setMapLayer] = useState<'hybrid' | 'satellite' | 'street'>('satellite');
    const [reportParcel, setReportParcel] = useState<any>(null);

    // Estados para Trazado GPS
    const [isGpsWalking, setIsGpsWalking] = useState(false);
    const [gpsPoints, setGpsPoints] = useState<LatLngTuple[]>([]);
    const [watchId, setWatchId] = useState<number | null>(null);
    const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
    const [showGpsPreview, setShowGpsPreview] = useState(false);
    const [editingGpsPoint, setEditingGpsPoint] = useState<number | null>(null);

    const [producerCatalog, setProducerCatalog] = useState<any[]>([]);

    useEffect(() => {
        fetchParcels();
        fetchProducerCatalog();
    }, []);

    const fetchProducerCatalog = async () => {
        const { data, error } = await supabase.from('products_catalog').select('*').order('name');
        if (!error && data) {
            // Filtrar productos agrícolas de producción
            const producerItems = data.filter(p => {
                const cat = (p.category || '').toLowerCase();
                return cat.includes('agroexportación') || 
                       cat.includes('cereales') || 
                       cat.includes('tubérculos') || 
                       cat.includes('frutas') || 
                       cat.includes('hortalizas') || 
                       cat.includes('pecuario') ||
                       cat.includes('productor') ||
                       cat.includes('granos') ||
                       cat.includes('raíces') ||
                       cat.includes('plátano') ||
                       cat.includes('legumbres');
            });
            setProducerCatalog(producerItems.length > 0 ? producerItems : data);
        }
    };

    // Escuchar solicitudes de edición externa
    useEffect(() => {
        if (activeEditParcel) {
            editParcel(activeEditParcel);
            // Scroll suave hacia arriba para ver el mapa
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Limpiar la solicitud en el padre después de procesar
            setTimeout(() => onCancelEdit(), 1000);
        }
    }, [activeEditParcel]);

    const fetchParcels = async () => {
        if (!user) return;
        const { data, error } = await supabase.from('parcels').select(`
            *,
            sat_telemetry ( id, parcel_id, created_at, timestamp, mission, ndvi_avg, image_bounds ),
            alerts_events ( * )
        `).eq('producer_id', user.id).order('created_at', { ascending: false });
        
        if (error) {
            console.error("ERROR FETCHING PARCELS:", error);
        }

        if (data) {
            console.log("FETCHED PARCELS RAW:", data);
            const enhanced = data.map(p => {
                const sortedTelemetry = p.sat_telemetry?.sort((a:any, b:any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                const sortedAlerts = p.alerts_events?.sort((a:any, b:any) => new Date(b.notification_date).getTime() - new Date(a.notification_date).getTime());
                return {
                    ...p,
                    latest_telemetry: sortedTelemetry && sortedTelemetry.length > 0 ? sortedTelemetry[0] : null,
                    latest_alert: sortedAlerts && sortedAlerts.length > 0 ? sortedAlerts[0] : null
                };
            });
            console.log("ENHANCED PARCELS:", enhanced);
            setParcels(enhanced);
        }
    };

    // --- GPS WALKING LOGIC ---
    const startGpsWalk = () => {
        setIsGpsWalking(true);
        setGpsPoints([]);
        setShowGpsPreview(false);
        setEditingGpsPoint(null);
        setPoints([]); // Clear manual points
        
        if (!navigator.geolocation) {
            alert("Tu dispositivo no soporta Geolocalización GPS.");
            setIsGpsWalking(false);
            return;
        }

        const id = navigator.geolocation.watchPosition(
            (pos) => {
                const newPoint: LatLngTuple = [pos.coords.latitude, pos.coords.longitude];
                setGpsPoints(prev => [...prev, newPoint]);
                setGpsAccuracy(pos.coords.accuracy);
                setMapCenter(newPoint);
            },
            (err) => {
                console.error("GPS Error:", err);
                alert("Error obteniendo ubicación GPS. Asegúrate de dar permisos.");
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
        setWatchId(id);
    };

    const stopGpsWalk = () => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
        }
        setIsGpsWalking(false);
        
        // Auto-close polygon if we have at least 3 points
        if (gpsPoints.length >= 3) {
            setPoints([...gpsPoints, gpsPoints[0]]); // Close loop
            setShowGpsPreview(true);
        } else {
            alert("Necesitas al menos 3 puntos GPS para formar un lote.");
            setGpsPoints([]);
        }
    };

    const retakeGpsPoint = (index: number) => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newCoords: LatLngTuple = [pos.coords.latitude, pos.coords.longitude];
                setPoints(prev => {
                    const newPoints = [...prev];
                    newPoints[index] = newCoords;
                    if (index === 0 && newPoints.length > 3) {
                        newPoints[newPoints.length - 1] = newCoords; // update closing point
                    }
                    return newPoints;
                });
                setEditingGpsPoint(null);
                setMapCenter(newCoords);
            },
            (err) => alert("Error leyendo el GPS"),
            { enableHighAccuracy: true }
        );
    };

    const cancelGpsWalk = () => {
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
        setIsGpsWalking(false);
        setGpsPoints([]);
        setShowGpsPreview(false);
        setEditingGpsPoint(null);
        setPoints([]);
    };

    const cantonesAptos = ECUADOR_LOCATIONS.cantones.filter(c => c.provinciaId === provId);
    const parroquiasAptas = ECUADOR_LOCATIONS.parroquias.filter(p => p.cantonId === cantId);

    const locateRegionParams = async (searchText: string, targetZoom: number) => {
        setIsSearchingGps(true);
        try {
            const endpoint = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchText + ', Ecuador')}&format=json&limit=1`;
            const response = await fetch(endpoint);
            const data = await response.json();
            
            if (data && data.length > 0) {
                setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                setZoomLevel(targetZoom);
            }
        } catch (e) {
            console.error("Geocoding failed", e);
        } finally {
            setIsSearchingGps(false);
        }
    };

    const handleProvChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setProvId(val); setCantId(''); setParrId('');
        if (val) {
            const nombProv = ECUADOR_LOCATIONS.provincias.find(p => p.id === val)?.name;
            if (nombProv) locateRegionParams(nombProv, 8);
        }
    };

    const handleCantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setCantId(val); setParrId('');
        if (val) {
            const nombCant = cantonesAptos.find(c => c.id === val)?.name;
            const nombProv = ECUADOR_LOCATIONS.provincias.find(p => p.id === provId)?.name;
            if (nombCant) locateRegionParams(`${nombCant}, ${nombProv}`, 11);
        }
    };

    const handleParrChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setParrId(val);
        if (val) {
            const nombParr = parroquiasAptas.find(p => p.id === val)?.name;
            const nombCant = cantonesAptos.find(c => c.id === cantId)?.name;
            if (nombParr) locateRegionParams(`${nombParr}, ${nombCant}`, 14);
        }
    };

    const calculateArea = (latLngs: LatLngTuple[]) => {
        if (latLngs.length < 3) return 0;
        const radius = 6378137;
        let area = 0;
        const len = latLngs.length;

        for (let i = 0; i < len; i++) {
            const p1 = latLngs[i];
            const p2 = latLngs[(i + 1) % len];
            area += (p2[1] - p1[1]) * (Math.PI / 180) * (2 + Math.sin(p1[0] * (Math.PI / 180)) + Math.sin(p2[0] * (Math.PI / 180)));
        }
        area = Math.abs(area * radius * radius / 2);
        return area / 10000;
    };

    const currentArea = calculateArea(points);
    const isAreaValid = currentArea > 0 && currentArea <= 50;

    const handleUndo = () => setPoints(points.slice(0, -1));
    const handleClear = () => setPoints([]);

    const cancelEdit = () => {
        setEditingParcelId(null);
        setCrop('');
        setPoints([]);
        setIsDrawing(false);
    };

    const handleSave = async () => {
        if (!user || points.length < 3 || !crop) {
             alert("Por favor completa el nombre del cultivo y dibuja al menos 3 puntos.");
             return;
        }

        if (currentArea > 50) {
             alert(`⚠️ El área seleccionada (${currentArea.toFixed(2)} Ha) excede el límite de 50 Hectáreas permitido.`);
             return;
        }

        setLoading(true);
        try {
            const coordinates = points.map(p => [p[1], p[0]]); 
            const closedPolygon = [...coordinates, coordinates[0]];

            const geoJsonPayload = { 
                type: "Polygon", 
                coordinates: [closedPolygon],
                crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } }
            };

            let savedParcelId = editingParcelId;
            if (editingParcelId) {
                const { error } = await supabase.from('parcels').update({
                    active_crop: crop,
                    geometry: geoJsonPayload
                }).eq('id', editingParcelId);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from('parcels').insert({
                    producer_id: user.id,
                    active_crop: crop,
                    geometry: geoJsonPayload
                }).select().single();
                if (error) throw error;
                savedParcelId = data.id;
            }

            if (savedParcelId) {
                try {
                    const { syncSingleParcel } = await import('../../../lib/copernicusSync');
                    const success = await syncSingleParcel(savedParcelId);
                    if (success) {
                        alert("Parcela guardada y sincronizada exitosamente.");
                    } else {
                        alert("Parcela guardada, pero ocurrió un error al sincronizar con Sentinel Hub (ver consola).");
                    }
                } catch (e: any) {
                    console.error("Error sincronizando parcela:", e);
                    alert("Error en sincronización satelital: " + e.message);
                }
            }

            cancelEdit();
            fetchParcels();
        } catch (err: any) {
            alert('Error guardando parcela: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteParcel = async (parcelId: string, cropName: string) => {
        if (!user) return;

        try {
            // Verificar si la parcela o su cultivo asociado tiene transacciones con trato aceptado ('Accepted')
            const { data: acceptedDeals } = await supabase
                .from('negotiations')
                .select('id, status, marketplace_listings(crop_type, producer_id)')
                .eq('status', 'Accepted');

            const { data: listings } = await supabase
                .from('marketplace_listings')
                .select('id, crop_type')
                .eq('producer_id', user.id)
                .eq('crop_type', cropName);

            const listingIds = new Set(listings?.map(l => l.id) || []);
            
            const hasCompletedSale = acceptedDeals?.some((deal: any) => {
                const listing = deal.marketplace_listings;
                return (listing && listingIds.has(listing.id)) || (listing && listing.crop_type?.toLowerCase() === cropName?.toLowerCase() && listing.producer_id === user.id);
            });

            if (hasCompletedSale) {
                alert(`⛔ OPERACIÓN NO PERMITIDA\n\nLa parcela "${cropName.toUpperCase()}" no puede ser eliminada porque cuenta con transacciones de venta completadas ("Accepted") registradas para trazabilidad y cumplimiento de la norma europea EUDR.`);
                return;
            }

            if (!window.confirm(`⚠️ ELIMINAR PARCELA\n\n¿Estás seguro de eliminar la parcela de "${cropName}"?\nSe borrarán todas sus lecturas radiométricas e historial satelital.`)) {
                return;
            }

            setLoading(true);
            
            // Eliminar registros de telemetría y alertas vinculadas
            await supabase.from('sat_telemetry').delete().eq('parcel_id', parcelId);
            await supabase.from('alerts_events').delete().eq('parcel_id', parcelId);
            
            // Eliminar la parcela
            const { error: delErr } = await supabase.from('parcels').delete().eq('id', parcelId);
            if (delErr) throw delErr;

            alert(`✅ Parcela "${cropName}" eliminada correctamente.`);
            if (viewingParcel?.id === parcelId) setViewingParcel(null);
            if (editingParcelId === parcelId) cancelEdit();
            fetchParcels();
        } catch (err: any) {
            console.error("Error al eliminar parcela:", err);
            alert("Error al eliminar parcela: " + (err.message || err));
        } finally {
            setLoading(false);
        }
    };

    const viewParcelOnMap = async (p: any) => {
        setViewingParcel(p);
        
        // Lazy load the heavy base64 image if it exists and hasn't been loaded yet
        if (p.latest_telemetry && !p.latest_telemetry.image_base64) {
            const { data: imgData } = await supabase
                .from('sat_telemetry')
                .select('image_base64')
                .eq('id', p.latest_telemetry.id)
                .single();
                
            if (imgData) {
                p.latest_telemetry.image_base64 = imgData.image_base64;
                setViewingParcel({ ...p }); // force re-render with image
            }
        }

        const geom = p.geometry;
        if (geom && geom.coordinates && geom.coordinates[0] && geom.coordinates[0].length > 0) {
            const firstCoord = geom.coordinates[0][0];
            setMapCenter([firstCoord[1], firstCoord[0]]);
            setZoomLevel(17);
        }
    };

    const editParcel = (p: any) => {
        setViewingParcel(null);
        setEditingParcelId(p.id);
        setCrop(p.active_crop);
        setIsDrawing(true);
        
        const geom = p.geometry;
        if (geom && geom.coordinates && geom.coordinates[0]) {
            const rawCoords = geom.coordinates[0];
            let mappedPoints = rawCoords.map((coord: any) => [coord[1], coord[0]] as LatLngTuple);
            if (mappedPoints.length > 1) {
                const first = mappedPoints[0];
                const last = mappedPoints[mappedPoints.length - 1];
                if (first[0] === last[0] && first[1] === last[1]) {
                    mappedPoints = mappedPoints.slice(0, -1);
                }
            }
            setPoints(mappedPoints);
            if (mappedPoints.length > 0) {
                // Forzar el centrado inmediato con zoom de alta precisión
                setMapCenter(mappedPoints[0]);
                setZoomLevel(18);
            }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            
            {/* Control Panel - Glassmorphism */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white/5 border border-[#0A0A0A]/10 rounded-3xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Satellite size={80} className="text-[#1E3F20]" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-[#1E3F20]/10 p-2.5 rounded-2xl text-[#1E3F20] border border-[#1E3F20]/20">
                                <MapPin size={22} />
                            </div>
                            <h2 className="text-xl font-black text-[#0A0A0A] tracking-tight">Geometría Satelital</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-[#1E3F20] uppercase tracking-widest mb-1.5 ml-1">
                                    Cultivo de la Parcela (Catálogo de Productos)
                                </label>
                                <div className="relative">
                                    <select 
                                        className="w-full bg-[#FAF9F7] border border-[#0A0A0A]/10 rounded-2xl px-5 py-3.5 text-[#0A0A0A] font-bold focus:ring-2 focus:ring-[#1E3F20]/20 focus:border-[#1E3F20] outline-none transition-all cursor-pointer appearance-none"
                                        value={crop}
                                        onChange={(e) => setCrop(e.target.value)}
                                    >
                                        <option value="" className="bg-white">Seleccionar Cultivo del Catálogo...</option>
                                        {Object.entries(
                                            producerCatalog.reduce((acc, p) => {
                                                const cat = p.category || 'Otros Cultivos';
                                                if (!acc[cat]) acc[cat] = [];
                                                acc[cat].push(p);
                                                return acc;
                                            }, {} as Record<string, any[]>)
                                        ).map(([category, items]: [string, any]) => (
                                            <optgroup key={category} label={category} className="bg-slate-100 font-bold text-xs text-[#1E3F20] uppercase">
                                                {items.map((p: any) => (
                                                    <option key={p.id} value={p.name} className="bg-white text-[#0A0A0A] font-medium py-1">
                                                        {p.name} — ({p.unit})
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        <Leaf size={16} className="text-[#1E3F20]" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#FAF9F7]/40 border border-[#0A0A0A]/10 rounded-2xl p-4 space-y-3">
                                <div className="flex items-center gap-2 text-[#57534E] font-bold text-[10px] uppercase tracking-widest px-1">
                                    <Navigation size={14} className="text-cyan-500" /> 
                                    <span>Navegación Territorial</span>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-2">
                                    <select value={provId} onChange={handleProvChange} className="bg-white border border-[#0A0A0A]/10 rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A] font-bold outline-none focus:border-emerald-500/50">
                                        <option value="">Provincia</option>
                                        {ECUADOR_LOCATIONS.provincias.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        <select value={cantId} onChange={handleCantChange} disabled={!provId} className="bg-white border border-[#0A0A0A]/10 rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A] font-bold outline-none focus:border-emerald-500/50 disabled:opacity-30">
                                            <option value="">Cantón</option>
                                            {cantonesAptos.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        <select value={parrId} onChange={handleParrChange} disabled={!cantId} className="bg-white border border-[#0A0A0A]/10 rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A] font-bold outline-none focus:border-emerald-500/50 disabled:opacity-30">
                                            <option value="">Parroquia</option>
                                            {parroquiasAptas.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-4 rounded-2xl border transition-all ${isDrawing ? 'bg-[#1E3F20]/5 border-[#1E3F20]/20' : 'bg-white/5 border-[#0A0A0A]/10'}`}>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] font-black text-[#57534E] uppercase tracking-widest">Estado del Trazado</span>
                                    {points.length >= 3 && (
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${currentArea > 50 ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-[#1E3F20]/10 border-emerald-500/50 text-[#1E3F20]'}`}>
                                            {currentArea.toFixed(2)} HA
                                        </span>
                                    )}
                                </div>
                                
                                <div className="flex gap-2">
                                    {!isDrawing && !isGpsWalking && !showGpsPreview ? (
                                        <div className="flex flex-col gap-2 w-full">
                                            <button 
                                                onClick={() => setIsDrawing(true)}
                                                className="w-full py-3 bg-[#1E3F20] hover:bg-[#1A361C] text-[#FAF9F7] rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#0A0A0A]/10 active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <Edit2 size={16} /> Iniciar Dibujo Vectorial
                                            </button>
                                            <button 
                                                onClick={startGpsWalk}
                                                className="w-full py-3 bg-[#C5A059] hover:bg-[#B39048] text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#0A0A0A]/10 active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <MapPin size={16} /> Caminar Linderos (GPS)
                                            </button>
                                        </div>
                                    ) : isGpsWalking ? (
                                        <div className="flex flex-col gap-2 w-full">
                                            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl mb-2 flex flex-col gap-1">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping shrink-0" />
                                                    <span className="text-xs text-slate-700 font-bold">Grabando Coordenadas</span>
                                                </div>
                                                <div className="flex justify-between text-[10px] text-slate-500 font-black uppercase mt-1">
                                                    <span>Puntos: <span className="text-blue-600 text-sm">{gpsPoints.length}</span></span>
                                                    <span>Precisión: <span className="text-[#1E3F20] text-sm">{gpsAccuracy ? gpsAccuracy.toFixed(1) + 'm' : '...'}</span></span>
                                                </div>
                                            </div>
                                            <button onClick={stopGpsWalk} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#0A0A0A]/10 active:scale-95 flex items-center justify-center gap-2"><CheckCircle2 size={16}/> Finalizar Recorrido</button>
                                            <button onClick={cancelGpsWalk} className="w-full py-2 bg-[#FAF9F7] text-[#57534E] rounded-xl font-bold text-[10px] uppercase border border-[#0A0A0A]/10 hover:bg-[#e5e5e5] transition-all flex items-center justify-center gap-1"><X size={14}/> Cancelar Caminata</button>
                                        </div>
                                    ) : showGpsPreview ? (
                                        <div className="flex flex-col gap-2 w-full">
                                            <div className="text-xs text-slate-600 font-bold mb-2">Vista previa GPS. Selecciona un punto para re-tomarlo.</div>
                                            <button onClick={() => { setShowGpsPreview(false); setPoints([]); setGpsPoints([]); }} className="w-full py-2 bg-red-500/10 text-red-400 rounded-xl font-bold text-[10px] uppercase border border-red-500/20 hover:bg-red-500 hover:text-[#0A0A0A] transition-all flex items-center justify-center gap-1"><Trash2 size={12}/> Descartar Recorrido GPS</button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2 w-full">
                                            <button onClick={handleUndo} className="py-2 bg-[#FAF9F7] text-[#57534E] rounded-xl font-bold text-[10px] uppercase border border-[#0A0A0A]/10 hover:bg-[#e5e5e5] transition-all flex items-center justify-center gap-1"><Undo2 size={12}/> Deshacer</button>
                                            <button onClick={handleClear} className="py-2 bg-red-500/10 text-red-400 rounded-xl font-bold text-[10px] uppercase border border-red-500/20 hover:bg-red-500 hover:text-[#0A0A0A] transition-all flex items-center justify-center gap-1"><Trash2 size={12}/> Borrar</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button 
                                onClick={handleSave}
                                disabled={loading || points.length < 3 || !crop}
                                className="w-full py-4 bg-[#1E3F20] hover:bg-emerald-400 disabled:bg-[#FAF9F7] disabled:text-slate-600 text-slate-950 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/10 active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                {loading ? 'Sincronizando...' : <><CheckCircle2 size={20} /> Guardar Parcela</>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Satellite Viewer */}
                <div className="lg:col-span-7 relative group">
                    <div className="absolute top-4 right-4 z-[500] flex gap-2">
                        <div className="bg-[#FAF9F7]/80 backdrop-blur-xl border border-[#0A0A0A]/10 rounded-2xl p-1 flex gap-1 shadow-2xl">
                            {(['satellite', 'hybrid', 'street'] as const).map(layer => (
                                <button 
                                    key={layer}
                                    onClick={() => setMapLayer(layer)}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mapLayer === layer ? 'bg-[#1E3F20] text-slate-950' : 'text-[#57534E] hover:text-[#0A0A0A]'}`}
                                >
                                    {layer === 'satellite' ? <Satellite size={14} /> : layer === 'hybrid' ? <Layers size={14} /> : <Navigation size={14} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={`h-[450px] rounded-3xl overflow-hidden border-8 transition-all duration-500 relative z-0 ${
                            isDrawing 
                                ? 'border-[#1E3F20]/20 ring-4 ring-emerald-500/10 cursor-crosshair'
                                : 'border-slate-900'
                        }`}>
                        
                        {/* Glass Overlay Info */}
                        {viewingParcel && !isDrawing && (
                            <div className="absolute top-4 left-4 z-[1000] w-72 bg-[#FAF9F7]/80 backdrop-blur-2xl border border-[#0A0A0A]/10 rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-left duration-300">
                                <button onClick={() => setViewingParcel(null)} className="absolute top-4 right-4 p-1.5 bg-white/5 rounded-full text-[#57534E] hover:text-[#0A0A0A] transition-colors"><X size={16}/></button>
                                
                                <div className="space-y-5">
                                    <div>
                                        <p className="text-[10px] font-black text-[#1E3F20] uppercase tracking-[0.2em] mb-1">Análisis Activo</p>
                                        <h4 className="font-black text-[#0A0A0A] text-xl uppercase leading-tight">{viewingParcel.active_crop}</h4>
                                    </div>
                                    
                                    {viewingParcel.latest_telemetry ? (
                                        <div className="space-y-4">
                                            <div className="bg-white/5 rounded-2xl p-4 border border-[#0A0A0A]/10">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-[10px] font-bold text-[#57534E] uppercase tracking-widest">Vigor Vegetal (NDVI)</span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${viewingParcel.latest_telemetry.ndvi_avg >= 0.6 ? 'bg-[#1E3F20]/10 text-[#1E3F20]' : 'bg-amber-500/20 text-amber-400'}`}>
                                                        {viewingParcel.latest_telemetry.ndvi_avg.toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-[#FAF9F7] h-1.5 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-1000 ${viewingParcel.latest_telemetry.ndvi_avg >= 0.6 ? 'bg-[#1E3F20]' : 'bg-amber-500'}`} style={{ width: `${viewingParcel.latest_telemetry.ndvi_avg * 100}%` }}></div>
                                                </div>
                                            </div>

                                            {viewingParcel.latest_alert && (
                                                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 flex items-start gap-3">
                                                    <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Alerta Fenológica</p>
                                                        <p className="text-xs text-[#57534E] font-bold leading-relaxed mb-2">{viewingParcel.latest_alert.anomaly_type}</p>
                                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5">
                                                            <p className="text-[8px] font-black text-red-400 uppercase tracking-widest mb-1">Acción IA Sugerida</p>
                                                            <p className="text-[10px] text-[#57534E]/90 italic leading-tight">{viewingParcel.latest_alert.action_suggested}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-white/90 rounded-2xl p-6 text-center border border-[#0A0A0A]/10 border-dashed">
                                            <Info size={24} className="text-slate-600 mx-auto mb-2" />
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Sincronizando con Sentinel Hub...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        <MapContainer center={[-1.4, -78.5]} zoom={6} className="h-full w-full z-0 grayscale-[0.2] contrast-[1.1]">
                            {mapLayer === 'street' && <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />}
                            {mapLayer === 'satellite' && (
                                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri" maxZoom={19} />
                            )}
                            {mapLayer === 'hybrid' && (
                                <>
                                    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" maxZoom={19} />
                                    <TileLayer url="http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}" maxZoom={20} attribution="Google" />
                                </>
                            )}

                            {viewingParcel?.latest_telemetry?.image_base64 && viewingParcel?.latest_telemetry?.image_bounds && (
                                <ImageOverlay 
                                    url={viewingParcel.latest_telemetry.image_base64} 
                                    bounds={viewingParcel.latest_telemetry.image_bounds as [[number, number], [number, number]]} 
                                    opacity={0.9}
                                    zIndex={100}
                                />
                            )}
                            
                            <MapAutoCenter position={mapCenter} zoom={zoomLevel} />
                            <MapDrawer 
                                points={points} 
                                setPoints={setPoints} 
                                isDrawing={isDrawing} 
                                onPointClick={showGpsPreview ? retakeGpsPoint : undefined}
                            />

                            {isGpsWalking && gpsPoints.length > 0 && (
                                <>
                                    <Polyline positions={gpsPoints} pathOptions={{ color: '#3b82f6', weight: 4, dashArray: '10, 10' }} />
                                    <CircleMarker center={gpsPoints[gpsPoints.length - 1]} radius={8} pathOptions={{ color: '#3b82f6', fillColor: '#fff', fillOpacity: 1, weight: 3 }} />
                                </>
                            )}

                            {parcels.map(p => {
                                if (editingParcelId === p.id) return null;
                                let polyColor = '#10b981';
                                if (p.latest_telemetry) {
                                    const ndvi = p.latest_telemetry.ndvi_avg;
                                    if (ndvi < 0.4) polyColor = '#ef4444';
                                    else if (ndvi < 0.6) polyColor = '#f59e0b';
                                }
                                const isSelected = viewingParcel?.id === p.id;
                                return (
                                    <GeoJSON 
                                        key={p.id} 
                                        data={p.geometry} 
                                        style={{ 
                                            color: isSelected ? '#fff' : polyColor, 
                                            weight: isSelected ? 4 : 2, 
                                            fillColor: polyColor, 
                                            fillOpacity: isSelected ? 0.6 : 0.3,
                                            dashArray: isSelected ? '0' : '5, 5'
                                        }} 
                                        eventHandlers={{ click: () => !isDrawing && viewParcelOnMap(p) }}
                                    />
                                );
                            })}
                        </MapContainer>
                    </div>
                </div>
            </div>

            {/* Registered Parcels - Premium Grid */}
            {!hideList && (
                <div className={`space-y-6 pt-10 border-t border-[#0A0A0A]/10 transition-all ${editingParcelId ? 'opacity-20 blur-sm grayscale' : ''}`}>
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-[#0A0A0A] tracking-tight flex items-center gap-3">
                        <Layers size={22} className="text-[#1E3F20]" /> 
                        Centro de Monitoreo <span className="text-slate-500 font-medium">({parcels.length})</span>
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {parcels.map(p => (
                        <div key={p.id} className="group relative bg-white/90 border border-[#0A0A0A]/10 rounded-3xl p-5 hover:border-emerald-500/50 hover:bg-white transition-all duration-500 overflow-hidden shadow-xl">
                            {/* Card Decorative background */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1E3F20]/5 blur-[50px] rounded-full group-hover:bg-[#1E3F20]/5 transition-colors"></div>
                            
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-[10px] font-black text-[#1E3F20] uppercase tracking-widest mb-1">Activo</p>
                                        <h4 className="font-black text-[#0A0A0A] text-lg uppercase tracking-tight">{p.active_crop}</h4>
                                    </div>
                                    <div className="bg-[#FAF9F7] p-2 rounded-xl border border-[#0A0A0A]/10 text-slate-500 group-hover:text-[#1E3F20] transition-colors">
                                        <Leaf size={18} />
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4 mb-6">
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span className="text-slate-500">Última Telemetría</span>
                                        <span className="text-[#57534E]">{p.latest_telemetry ? new Date(p.latest_telemetry.created_at).toLocaleDateString() : 'Pendiente'}</span>
                                    </div>
                                    {p.latest_telemetry && (
                                        <div className="bg-[#FAF9F7]/50 rounded-2xl p-3 border border-[#0A0A0A]/10 flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vigor Promedio</span>
                                            <span className="font-black text-[#1E3F20] text-sm">{(p.latest_telemetry.ndvi_avg * 100).toFixed(0)}%</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="space-y-2 mt-auto">
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => viewParcelOnMap(p)} className="py-2.5 bg-slate-100 hover:bg-slate-200 text-[#0A0A0A] rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#0A0A0A]/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"><Eye size={14}/> Visor</button>
                                        <button onClick={() => editParcel(p)} className="py-2.5 bg-[#C5A059]/10 hover:bg-[#C5A059]/20 text-[#C5A059] rounded-xl text-[10px] font-black uppercase tracking-widest border border-[#C5A059]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"><Edit2 size={14}/> Editar</button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button 
                                            onClick={() => setReportParcel(p)}
                                            className="py-2.5 bg-[#1E3F20]/10 hover:bg-[#1E3F20] text-[#1E3F20] hover:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border border-[#1E3F20]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <FileCheck size={14}/> Trazabilidad
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteParcel(p.id, p.active_crop)}
                                            className="py-2.5 bg-rose-500/10 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                            title="Eliminar Parcela"
                                        >
                                            <Trash2 size={14}/> Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {parcels.length === 0 && (
                        <div className="col-span-full py-20 bg-white/30 border-2 border-dashed border-[#0A0A0A]/10 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4">
                            <div className="bg-white p-6 rounded-full border border-[#0A0A0A]/10 text-slate-700">
                                <Satellite size={48} />
                            </div>
                            <div>
                                <h4 className="text-[#0A0A0A] font-black text-lg">No hay parcelas registradas</h4>
                                <p className="text-slate-500 text-sm max-w-xs mx-auto">Comienza dibujando tu primer terreno en el mapa satelital para activar el monitoreo IA.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            )}

            {reportParcel && (
                <TraceabilityReport 
                    parcel={reportParcel} 
                    onClose={() => setReportParcel(null)} 
                />
            )}
        </div>
    );
};
