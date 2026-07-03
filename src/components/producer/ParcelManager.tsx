import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Button } from '../ui/button';
import { MapPin, Check, RefreshCcw, Save, Trash2, ShieldAlert } from 'lucide-react';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para el icono por defecto de Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import L from 'leaflet';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Componente hook para capturar clicks
const LocationPicker = ({ onLocationClick }: { onLocationClick: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onLocationClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Componente hook para re-centrar el mapa al cargar
const MapRecenter = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        if (center[0] !== 0) {
            map.setView(center, 15);
        }
    }, [center, map]);
    return null;
};

export const ParcelManager = () => {
    const { profile } = useAuth();
    const [points, setPoints] = useState<[number, number][]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Default a Ecuador
    const [center, setCenter] = useState<[number, number]>([-1.8312, -78.1834]);

    useEffect(() => {
        if (profile?.id) {
            loadParcelData();
        }
    }, [profile]);

    const loadParcelData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('location_ref_lat, location_ref_lng, parcel_boundaries')
                .eq('id', profile?.id)
                .single();

            if (data) {
                // Centrar en su casa si tiene coord, o dejar por defecto
                if (data.location_ref_lat) {
                    setCenter([data.location_ref_lat, data.location_ref_lng]);
                }
                
                // Cargar polígono si existe
                if (data.parcel_boundaries && Array.isArray(data.parcel_boundaries)) {
                    setPoints(data.parcel_boundaries);
                    if (data.parcel_boundaries.length > 0) {
                        // Centrar en el polígono
                        setCenter(data.parcel_boundaries[0]);
                    }
                }
            }
        } catch (err) {
            console.error('Error cargando parcela', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMapClick = (lat: number, lng: number) => {
        // Limitar a máximo 20 puntos para evitar polígonos locos
        if (points.length < 20) {
            setPoints(prev => [...prev, [lat, lng]]);
        }
    };

    const clearPoints = () => {
        setPoints([]);
    };

    const undoLastPoint = () => {
        setPoints(prev => prev.slice(0, -1));
    };

    const saveParcel = async () => {
        if (points.length < 3) {
            alert("Se requieren al menos 3 puntos para trazar un terreno.");
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({ parcel_boundaries: points })
                .eq('id', profile?.id);

            if (error) throw error;
            alert("Parcela georreferenciada guardada exitosamente.");
        } catch (err: any) {
            alert("Error al guardar: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 flex items-start gap-4 text-[#0A0A0A]">
                <div className="bg-white/20 p-3 rounded-lg p-3">
                    <MapPin className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Demarcación Satelital de Finca</h2>
                    <p className="text-blue-100 mt-1 max-w-2xl">
                        Traza los linderos exactos de tu parcela. Esto permite al servicio Copernicus de la Unión Europea
                        monitorizar el índice de salud hídrica y foliar (NDVI) de tu cultivo, otorgándote una certificación 
                        automática de calidad frente a compradores.
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-0">
                <div className="lg:col-span-2 relative h-[500px]">
                    <MapContainer 
                        center={center} 
                        zoom={6} 
                        scrollWheelZoom={true} 
                        className="w-full h-full"
                    >
                        <MapRecenter center={center} />
                        {/* Usamos el tile satelital de ESRI o un mapa cartográfico. Aquí uno standard híbrido libre */}
                        <TileLayer
                            attribution='&copy; <a href="https://server.arcgisonline.com">ESRI World Imagery</a>'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                        <LocationPicker onLocationClick={handleMapClick} />
                        
                        {/* Dibujar puntos base si son pocos, y el polígono si hay >= 3 */}
                        {points.map((pos, idx) => (
                            <Marker key={idx} position={pos} />
                        ))}
                        
                        {points.length >= 3 && (
                            <Polygon 
                                positions={points as LatLngExpression[]} 
                                color="#22c55e" 
                                fillColor="#22c55e" 
                                fillOpacity={0.4}
                                weight={3}
                            />
                        )}
                    </MapContainer>

                    {/* Controles sobre el mapa */}
                    <div className="absolute top-4 right-4 z-[400] bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2">
                        <Button variant="outline" size="sm" onClick={undoLastPoint} disabled={points.length === 0} className="w-full justify-start">
                            <RefreshCcw className="w-4 h-4 mr-2" /> Deshacer Puntos
                        </Button>
                        <Button variant="outline" size="sm" onClick={clearPoints} disabled={points.length === 0} className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 justify-start">
                            <Trash2 className="w-4 h-4 mr-2" /> Borrar Linderos
                        </Button>
                    </div>
                </div>

                <div className="p-6 border-l border-gray-100 bg-gray-50 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-yellow-600" />
                            Instrucciones
                        </h3>
                        <ol className="list-decimal pl-5 space-y-3 text-sm text-gray-600 font-medium">
                            <li>Navega por el mapa hasta encontrar tu zona de cultivo (puedes alejar o acercar el zoom).</li>
                            <li>Haz <b>clic sobre las esquinas</b> de tu terreno de manera secuencial (en sentido del reloj).</li>
                            <li>Trazando al menos 3 puntos, se cerrará el polígono.</li>
                            <li>Ajusta si es necesario y guarda.</li>
                        </ol>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="flex justify-between items-center text-sm mb-4">
                            <span className="text-gray-500 font-bold">Estado del Trazado:</span>
                            {points.length < 3 ? (
                                <span className="text-orange-500 font-bold">Incompleto</span>
                            ) : (
                                <span className="text-green-600 font-bold flex items-center gap-1"><Check className="w-4 h-4"/> Listo</span>
                            )}
                        </div>
                        <Button 
                            className="w-full bg-blue-700 hover:bg-blue-800 h-14 text-lg" 
                            disabled={points.length < 3 || saving}
                            onClick={saveParcel}
                        >
                            {saving ? 'Guardando...' : (
                                <span className="flex items-center gap-2">
                                    <Save className="w-5 h-5" /> Guardar Geometría (GPS)
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
