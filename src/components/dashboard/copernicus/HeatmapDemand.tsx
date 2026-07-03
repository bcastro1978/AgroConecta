import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Flame, Info } from 'lucide-react';

export const HeatmapDemand = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            // Fetch alerts with severity Red or Yellow to show hotspots
            const { data } = await supabase
                .from('alerts_events')
                .select('severity, anomaly_type, notification_date, parcels(id, geometry, active_crop)')
                .order('notification_date', { ascending: false })
                .limit(50);
            
            if (data) {
                // Approximate coordinates from polygon to point for the heatmap
                const mapEvents = data.map(item => {
                    let lat = -1.8312; // default
                    let lng = -78.1834;
                    try {
                        // Very naive center calculation: takes the first coordinate of the first polygon
                        const p = item.parcels?.geometry;
                        if (p && p.coordinates && p.coordinates[0] && p.coordinates[0][0]) {
                            const coord = p.coordinates[0][0];
                            lng = coord[0];
                            lat = coord[1];
                        }
                    } catch (e) {}

                    return { ...item, lat, lng };
                });
                setEvents(mapEvents);
            }
        } catch (error) {
            console.error("Error fetching alerts", error);
        } finally {
            setLoading(false);
        }
    };

    const getMarkerColor = (severity: string) => {
        return severity === 'Alta' ? '#dc2626' : '#d97706'; // Red or Amber
    };

    if (loading) return <div className="p-8 text-center animate-pulse text-gray-500">Cargando datos espaciales...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
                    <Flame size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Mapa de Calor y Oportunidades B2B</h2>
                    <p className="text-sm text-gray-500">Detección satelital de anomalías agronómicas para ofertar insumos proactivamente.</p>
                </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 text-blue-800 text-sm p-4 rounded-xl flex items-start gap-2">
                <Info className="shrink-0 mt-0.5" size={18} />
                <p>
                    <strong>Nota de Privacidad:</strong> Los marcadores en el mapa están difuminados e indican zonas generales de necesidad.
                    Los datos personales del agricultor se revelan únicamente al existir un <em>Match B2B</em> o cotización aceptada.
                </p>
            </div>

            <div className="h-96 rounded-xl border border-gray-200 overflow-hidden shadow-inner relative z-0">
                <MapContainer center={[-1.4, -78.5]} zoom={6} className="h-full w-full z-0 font-sans">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {events.map((ev, i) => (
                        <CircleMarker 
                            key={i} 
                            center={[ev.lat, ev.lng]} 
                            radius={ev.severity === 'Alta' ? 18 : 12}
                            pathOptions={{
                                color: getMarkerColor(ev.severity),
                                fillColor: getMarkerColor(ev.severity),
                                fillOpacity: 0.5,
                                weight: 0
                            }}
                        >
                            <Popup>
                                <div className="font-sans text-sm">
                                    <h4 className="font-bold text-gray-800">{ev.anomaly_type}</h4>
                                    <p className="text-gray-600 mb-2">Afectación detectada en cultivo de {ev.parcels?.active_crop}</p>
                                    <div className="bg-gray-100 px-2 py-1 rounded text-xs">Severidad Satelital: <span className="font-bold">{ev.severity}</span></div>
                                    <button className="mt-3 w-full bg-blue-600 text-[#0A0A0A] py-1.5 rounded text-xs font-semibold hover:bg-blue-700 transition">
                                        Enviar Oferta B2B Inteligente
                                    </button>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};
