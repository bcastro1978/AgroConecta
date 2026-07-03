import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

// Fix for default marker icon in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapSelectorProps {
    value: { lat: number, lng: number } | null;
    onChange: (val: { lat: number, lng: number }) => void;
    searchQuery?: string;
}

function LocationPicker({ onChange }: { onChange: (val: { lat: number, lng: number }) => void }) {
    useMapEvents({
        click(e) {
            onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return null;
}

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMapEvents({});
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

export const MapSelector = ({ value, onChange, searchQuery }: MapSelectorProps) => {
    const [mapCenter, setMapCenter] = useState<[number, number]>([-1.831239, -78.183406]);
    const [mapZoom, setMapZoom] = useState(6);

    useEffect(() => {
        if (value) {
            setMapCenter([value.lat, value.lng]);
            setMapZoom(15);
            return;
        }

        if (searchQuery) {
            // Geocoding with Nominatim (OpenStreetMap)
            const fetchCoords = async () => {
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Ecuador')}&limit=1`
                    );
                    const data = await response.json();
                    if (data && data.length > 0) {
                        setMapCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                        setMapZoom(13); // Zoom slightly out for zones
                    }
                } catch (error) {
                    console.error('Error fetching coordinates:', error);
                }
            };
            fetchCoords();
        }
    }, [searchQuery, value]);

    return (
        <div className="h-64 mt-2 rounded-lg overflow-hidden border border-gray-300 relative z-0">
            <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                scrollWheelZoom={false}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {value && (
                    <Marker position={[value.lat, value.lng]} />
                )}
                <MapUpdater center={mapCenter} zoom={mapZoom} />
                <LocationPicker onChange={onChange} />
            </MapContainer>
            <p className="text-[10px] text-gray-500 bg-white/80 absolute bottom-0 right-0 p-1 px-2 pointer-events-none z-[1000]">
                Haz clic en el mapa para seleccionar tu ubicación exacta
            </p>
        </div>
    );
};
