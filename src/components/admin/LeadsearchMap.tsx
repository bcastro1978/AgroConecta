import React from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLngExpression } from 'leaflet';

interface Parcel {
    id: string;
    coordinates: LatLngExpression[][];
    needType?: string;
    description?: string;
    status: string;
    suggestedProducts?: string[];
}

interface LeadsearchMapProps {
    parcels: Parcel[];
    center: LatLngExpression;
    zoom: number;
}

// Componente utilitario para recentrar el mapa solo cuando cambian explícitamente las coordenadas
function ChangeView({ center, zoom }: { center: LatLngExpression; zoom: number }) {
    const map = useMap();
    const lat = Array.isArray(center) ? center[0] : (center as any).lat;
    const lng = Array.isArray(center) ? center[1] : (center as any).lng;

    React.useEffect(() => {
        map.setView([lat, lng], zoom);
    }, [map, lat, lng, zoom]);
    
    return null;
}

export const LeadsearchMap: React.FC<LeadsearchMapProps> = ({ parcels, center, zoom }) => {
    // Determinar el color del polígono según la necesidad detectada
    const getPolygonColor = (needType?: string) => {
        switch (needType?.toLowerCase()) {
            case 'fertilizante': return '#f59e0b'; // amber
            case 'pesticida': return '#ef4444'; // red
            case 'riego': return '#3b82f6'; // blue
            case 'mejoramiento': return '#10b981'; // emerald
            default: return '#94a3b8'; // slate (sin análisis aún)
        }
    };

    return (
        <div className="h-[500px] w-full rounded-xl overflow-hidden border border-[#0A0A0A]/10 shadow-lg relative z-0">
            <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <ChangeView center={center} zoom={zoom} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {parcels.map((parcel) => (
                    <Polygon 
                        key={parcel.id}
                        positions={parcel.coordinates}
                        pathOptions={{ 
                            color: getPolygonColor(parcel.needType),
                            fillColor: getPolygonColor(parcel.needType),
                            fillOpacity: 0.4,
                            weight: 2
                        }}
                    >
                        <Popup className="bg-white text-slate-100 rounded border-[#0A0A0A]/10">
                            <div className="p-2 max-w-xs">
                                <h3 className="font-bold text-lg mb-1">{parcel.needType || 'Sin necesidad detectada'}</h3>
                                <p className="text-sm text-[#57534E] mb-2">{parcel.description || 'La parcela aún no ha sido analizada o no presenta necesidades críticas.'}</p>
                                
                                {parcel.suggestedProducts && parcel.suggestedProducts.length > 0 && (
                                    <div className="mt-2">
                                        <h4 className="font-semibold text-xs text-[#57534E] uppercase tracking-wide">Productos Sugeridos</h4>
                                        <ul className="list-disc pl-4 mt-1 text-sm">
                                            {parcel.suggestedProducts.map((prod, idx) => (
                                                <li key={idx} className="text-[#1E3F20]">{prod}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                <div className="mt-3 pt-3 border-t border-[#0A0A0A]/10 flex justify-between items-center">
                                    <span className="text-xs text-[#57534E]">Estado: {parcel.status}</span>
                                    {parcel.needType && parcel.status === 'Pendiente' && (
                                        <button className="bg-[#1E3F20] hover:bg-[#1E3F20] text-[#FAF9F7] text-xs px-3 py-1 rounded">
                                            Contactar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Popup>
                    </Polygon>
                ))}
            </MapContainer>
        </div>
    );
};
